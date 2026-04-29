const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log('Tables:', res.rows.map(r => r.tablename));
    
    const servers = await pool.query("SELECT * FROM iptv_servers");
    console.log('IPTV Servers:', servers.rows);
    
    const legacyServers = await pool.query("SELECT * FROM servers").catch(() => ({ rows: [] }));
    console.log('Legacy Servers:', legacyServers.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
