const pool = require('./config/database');

async function createDefaultConfig() {
  try {
    await pool.query(`
      INSERT INTO iptv_server_config (id, xtream_url, xtream_username, xtream_password, updated_at)
      VALUES (1, '', '', '', NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Configuração IPTV padrão criada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createDefaultConfig();