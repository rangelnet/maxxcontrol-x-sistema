const pool = require('../config/database');

async function check() {
  try {
    const r = await pool.query("SELECT * FROM global_settings WHERE key = 'player_app_url'");
    console.log('🔗 URL do App no Banco:', r.rows);
    
    const pkgs = await pool.query("SELECT * FROM app_activation_packages");
    console.log('📦 Pacotes no Banco:', pkgs.rows.length);
    console.table(pkgs.rows);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
