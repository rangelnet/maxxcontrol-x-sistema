const pool = require('../config/database');

async function checkUser() {
  try {
    const email = 'admin@maxxcontrol.com';
    const res = await pool.query('SELECT id, email, tfa_enabled, telegram_chat_id, status FROM users WHERE email = $1', [email]);
    
    if (res.rows.length === 0) {
      console.log('Usuário não encontrado:', email);
    } else {
      console.log('--- STATUS DO USUÁRIO ---');
      console.table(res.rows);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Erro ao acessar o banco:', err);
    process.exit(1);
  }
}

checkUser();
