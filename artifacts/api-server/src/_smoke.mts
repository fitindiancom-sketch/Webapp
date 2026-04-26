console.log("STEP 1: starting");
async function main() {
  const { pool } = await import("@workspace/db");
  console.log("STEP 2: imported db");
  const c = await pool.connect();
  console.log("STEP 3: connected to supabase");
  const r = await c.query("SELECT 1 as ok");
  console.log("STEP 4:", r.rows);
  c.release();
  await pool.end();
}
main().catch(e => { console.error("ERR:", e); process.exit(1); });
