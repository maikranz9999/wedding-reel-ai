// /api/settings.ts  (Next Pages Router)  Node Runtime
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

export const config = { api: { bodyParser: true } }; // Node, nicht Edge

let pool: Pool | undefined;
function db() {
  if (!pool) {
    const conn = process.env.DATABASE_URL;
    if (!conn) throw new Error('DATABASE_URL missing');
    pool = new Pool({
      connectionString: conn,
      ssl: conn.includes('localhost') ? undefined : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
    });
  }
  return pool;
}

function setCORS(res: NextApiResponse) {
  const origin = process.env.ALLOWED_ORIGIN || '*'; // z. B. https://learningsuite.de
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    setCORS(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
      const tool_id = Number(req.query.tool_id);
      const user_id = String(req.query.user_id || '');
      if (!tool_id || !user_id) return res.status(400).json({ error: 'tool_id and user_id required' });

      const q = await db().query(
        `select setting_json from user_tool_settings where tool_id=$1 and user_id=$2 limit 1`,
        [tool_id, user_id]
      );
      const defaults = { tags: { job: [], problem: [], goal: [] }, ui: {}, prefs: {} };
      return res.status(200).json(q.rows[0]?.setting_json ?? defaults);
    }

    if (req.method === 'PUT') {
      const { tool_id, user_id, setting_json } = req.body || {};
      if (!tool_id || !user_id || typeof setting_json !== 'object') {
        return res.status(400).json({ error: 'tool_id, user_id, setting_json required' });
      }
      await db().query(
        `insert into user_tool_settings (tool_id, user_id, setting_json, updated_at)
         values ($1,$2,$3, now())
         on conflict (tool_id, user_id)
         do update set setting_json=excluded.setting_json, updated_at=now()`,
        [Number(tool_id), String(user_id), setting_json]
      );
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PATCH') {
      const { tool_id, user_id, path, value } = req.body || {};
      if (!tool_id || !user_id || !Array.isArray(path)) {
        return res.status(400).json({ error: 'tool_id, user_id, path[] required' });
      }
      await db().query(
        `update user_tool_settings
           set setting_json = jsonb_set(setting_json, $3::text[], to_jsonb($4::jsonb), true),
               updated_at = now()
         where tool_id=$1 and user_id=$2`,
        [Number(tool_id), String(user_id), path, value ?? null]
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e: any) {
    console.error('[settings] error:', e?.message || e);
    return res.status(500).json({ error: 'internal' });
  }
}
