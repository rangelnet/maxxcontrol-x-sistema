const pool = require('./config/database');

async function testDB() {
  console.log('Testando conexão Supabase...');
  try {
    const res = await pool.query('SELECT id, email FROM users LIMIT 1');
    console.log('DB Conectado. Usuários:', res.rows);
  } catch (err) {
    console.error('Erro ao conectar ou consultar DB:', err);
  } finally {
    if (pool.end) pool.end();
  }
}

testDB();
