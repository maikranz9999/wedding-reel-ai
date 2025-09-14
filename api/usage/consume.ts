import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Body
  const { user_id, tool_id, kind = 'tool', payload = {}, request_id } = req.body || {};
  if (!user_id || !tool_id) return res.status(400).json({ error: 'missing body' });

  // Id für Idempotenz
  const rid: string = request_id || crypto.randomUUID();

  const client = await pool.connect();
  try {
    await client.query('begin');

    // Früh-Idempotenz: doppelten Request nicht erneut zählen
    const exists = await client.query('select 1 from usage_log where request_id = $1', [rid]);
    if (exists.rowCount) {
      const s = await client.query(
        `select used, credit_limit, blocked
           from usage_ledger
          where user_id=$1 and tool_id=$2
            and month_key = to_char(now() at time zone 'UTC','YYYYMM')`,
        [user_id, tool_id]
      );

      let used = 0, credit_limit = 500, blocked = false;
      if (s.rowCount) {
        used = s.rows[0].used ?? 0;
        credit_limit = s.rows[0].credit_limit ?? 500;
        blocked = s.rows[0].blocked ?? false;
      } else {
        const l = await client.query('select limit_monthly from tools where id=$1', [tool_id]);
        credit_limit = l.rows[0]?.limit_monthly ?? 500;
      }

      await client.query('commit');
      return res.json({
        used,
        credit_limit,
        remaining: Math.max(0, credit_limit - used),
        blocked,
        idempotent: true
      });
    }

    // Kosten je nach Aktion aus tools holen
    const t = await client.query(
      `select limit_monthly, cost_tool, cost_chat
         from tools
        where id = $1 and active = true
        limit 1`,
      [tool_id]
    );
    if (t.rowCount === 0) {
      await client.query('rollback');
      return res.status(404).json({ error: 'tool not found' });
    }
    const { cost_tool, cost_chat } = t.rows[0];
    const units = String(kind) === 'chat' ? (cost_chat ?? 1) : (cost_tool ?? 1);

    // Ledger anlegen/hochzählen um "units"
    const up = await client.query(
      `insert into usage_ledger (user_id, tool_id, month_key, used, credit_limit)
       values ($1,$2,to_char(now() at time zone 'UTC','YYYYMM'), $3,
               coalesce((select limit_monthly from tools where id=$2), 500))
       on conflict (user_id, tool_id, month_key)
       do update set used = usage_ledger.used + $3, updated_at = now()
       where usage_ledger.blocked = false
         and usage_ledger.used + $3 <= usage_ledger.credit_limit
       returning id, used, credit_limit, blocked`,
      [user_id, tool_id, units]
    );

    // Limit nicht genug
    if (up.rowCount === 0) {
      const s = await client.query(
        `select used, credit_limit, true as blocked
           from usage_ledger
          where user_id=$1 and tool_id=$2
            and month_key = to_char(now() at time zone 'UTC','YYYYMM')`,
        [user_id, tool_id]
      );
      await client.query('rollback');
      const r = s.rows[0] || { used: 0, credit_limit: 0, blocked: true };
      return res.status(403).json({ ...r, remaining: Math.max(0, r.credit_limit - r.used), needed: units });
    }

    const led = up.rows[0];

    // Log schreiben mit units
    await client.query(
      `insert into usage_log (ledger_id, user_id, tool_id, kind, payload, request_id, units)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [led.id, user_id, tool_id, kind, payload, rid, units]
    );

    await client.query('commit');

    res.json({
      used: led.used,
      credit_limit: led.credit_limit,
      remaining: Math.max(0, led.credit_limit - led.used),
      blocked: led.blocked || led.used >= led.credit_limit
    });
  } catch (e: any) {
    await client.query('rollback');
    res.status(500).json({ error: 'server', detail: String(e) });
  } finally {
    client.release();
  }
}
