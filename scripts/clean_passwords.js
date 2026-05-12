const pool = require('../config/database');

async function clean() {
  try {
    const res = await pool.query("UPDATE qpanel_accounts SET password = '' WHERE password = '******'");
    console.log(`✅ Limpeza concluída: ${res.rowCount} registros corrigidos.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na limpeza:', err);
    process.exit(1);
  }
}

clean();
