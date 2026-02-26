const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'maxxcontrol_x',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function createTestUser() {
  try {
    const email = 'admin@maxxcontrol.com';
    const senha = 'Admin@123';
    const nome = 'Administrador';

    // Verificar se usuário já existe
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (userExists.rows.length > 0) {
      console.log('⚠️  Usuário já existe!');
      console.log('📧 Email:', email);
      console.log('🔑 Senha:', senha);
      return;
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    await pool.query(
      'INSERT INTO users (nome, email, senha_hash, plano, status) VALUES ($1, $2, $3, $4, $5)',
      [nome, email, senha_hash, 'premium', 'ativo']
    );

    console.log('✅ Usuário criado com sucesso!');
    console.log('');
    console.log('═══════════════════════════════════');
    console.log('🔐 CREDENCIAIS DE ACESSO');
    console.log('═══════════════════════════════════');
    console.log('📧 Email: admin@maxxcontrol.com');
    console.log('🔑 Senha: Admin@123');
    console.log('═══════════════════════════════════');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUser();
