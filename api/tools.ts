import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export default async function handler(req:any,res:any){
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();

  const { id, slug } = req.query;

  // Beides muss übergeben werden
  if (!id || !slug) {
    return res.status(400).json({ error: 'id and slug required' });
  }

  const q = await pool.query(
    `select id, name, slug, iframe_url, limit_monthly, cost_tool, cost_chat
       from tools
      where id = $1 and slug = $2 and active = true
      limit 1`,
    [id, String(slug).toLowerCase()]
  );


  if (!q.rowCount) return res.status(404).json({ error:'not found' });
  res.json(q.rows[0]);
}
