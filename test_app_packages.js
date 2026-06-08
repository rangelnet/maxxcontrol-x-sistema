const pool = require('./config/database');

async function test() {
  try {
    const res = await pool.query('SELECT * FROM app_activation_packages');
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
test();
