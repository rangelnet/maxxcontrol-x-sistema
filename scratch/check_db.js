const pool = require('../config/database');

async function check() {
  try {
    const r = await pool.query("SELECT id, nome, email, tipo FROM users");
    console.log('📊 Todos os usuários na base:');
    console.table(r.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();


