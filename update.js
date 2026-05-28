require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
async function run() {
  await pool.query("UPDATE users SET tipo = 'admin' WHERE email = 'admin@maxxcontrol.com'");
  console.log('User admin@maxxcontrol.com updated to tipo = admin');
  process.exit(0);
}
run();
