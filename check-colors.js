const pool = require('./config/database');

async function check() {
  console.log('🐘 Lendo branding atual no PostgreSQL...');
  try {
    const res = await pool.query('SELECT * FROM branding_settings WHERE ativo = true LIMIT 1');
    if (res.rows.length > 0) {
      console.log('🎨 Configurações de Cores Atuais:');
      const b = res.rows[0];
      console.log(` - Tema: ${b.tema}`);
      console.log(` - Primary: ${b.primary_color}`);
      console.log(` - Accent: ${b.accent_color}`);
      console.log(` - Btn Primary: ${b.button_primary_color}`);
      console.log(` - Btn Focus: ${b.button_focus_color}`);
      console.log(` - Btn Text: ${b.button_text_color}`);
    } else {
      console.log('⚠️ Nenhum branding ativo encontrado.');
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
  process.exit(0);
}

check();
