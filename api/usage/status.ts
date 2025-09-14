import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export default async function handler(req:any,res:any){
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();

  const { user_id, tool_id } = req.query;
  if(!user_id || !tool_id) return res.status(400).json({error:'missing params'});

  const r = await pool.query(
    `select used, credit_limit, blocked
       from usage_ledger
      where user_id=$1 and tool_id=$2
        and month_key = to_char(now() at time zone 'UTC','YYYYMM')`,
    [user_id, tool_id]
  );

  const used = r.rows[0]?.used ?? 0;
  const limit = r.rows[0]?.credit_limit ?? (await pool.query('select limit_monthly from tools where id=$1',[tool_id])).rows[0]?.limit_monthly ?? 500;
  const blocked = r.rows[0]?.blocked ?? false;

  res.json({ used, credit_limit: limit, remaining: Math.max(0, limit-used), blocked });
}
