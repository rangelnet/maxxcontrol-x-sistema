const pool = require('../config/database');

async function check() {
  try {
    const r = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'app_activation_packages'");
    console.log('📊 Colunas da tabela app_activation_packages:');
    console.table(r.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
