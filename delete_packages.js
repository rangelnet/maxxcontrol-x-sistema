require('dotenv').config();
const pool = require('./config/database');

async function run() {
  try {
    const result = await pool.query("DELETE FROM app_activation_packages WHERE name IN ('MAXX PLAYER PRO', 'SMARTONE IPTV', 'IBO PLAYER')");
    console.log('Deleted rows:', result.rowCount);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
