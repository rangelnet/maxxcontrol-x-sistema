require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
async function run() {
  const res = await pool.query("SELECT * FROM users WHERE email = 'admin@maxxcontrol.com'");
  console.log(res.rows[0]);
  process.exit(0);
}
run();
