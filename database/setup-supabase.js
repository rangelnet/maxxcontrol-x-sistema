const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setup() {
  console.log('🚀 Configurando MaxxControl X no Supabase...\n');

  try {
    // Criar tabelas
    console.log('📋 Criando tabelas...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        plano VARCHAR(50) DEFAULT 'free',
        status VARCHAR(20) DEFAULT 'ativo',
        expira_em TIMESTAMP,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        mac_address VARCHAR(17) UNIQUE NOT NULL,
        modelo VARCHAR(100),
        android_version VARCHAR(20),
        app_version VARCHAR(20),
        ip VARCHAR(45),
        ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'ativo'
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
        tipo VARCHAR(50) NOT NULL,
        descricao TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bugs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
        stack_trace TEXT,
        modelo VARCHAR(100),
        app_version VARCHAR(20),
        resolvido BOOLEAN DEFAULT FALSE,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_versions (
        id SERIAL PRIMARY KEY,
        versao VARCHAR(20) UNIQUE NOT NULL,
        obrigatoria BOOLEAN DEFAULT FALSE,
        link_download TEXT,
        mensagem TEXT,
        ativa BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabelas criadas com sucesso!\n');

    // Criar índices
    console.log('📊 Criando índices...');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_devices_mac ON devices(mac_address)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_logs_data ON logs(data)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bugs_resolvido ON bugs(resolvido)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

    console.log('✅ Índices criados com sucesso!\n');

    // Verificar se usuário admin já existe
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@maxxcontrol.com']);
    
    if (userExists.rows.length > 0) {
      console.log('⚠️  Usuário admin já existe!\n');
    } else {
      // Criar usuário admin
      console.log('👤 Criando usuário administrador...');
      
      const email = 'admin@maxxcontrol.com';
      const senha = 'Admin@123';
      const senha_hash = await bcrypt.hash(senha, 10);

      await pool.query(
        'INSERT INTO users (nome, email, senha_hash, plano, status) VALUES ($1, $2, $3, $4, $5)',
        ['Administrador', email, senha_hash, 'premium', 'ativo']
      );

      console.log('✅ Usuário criado com sucesso!\n');
    }

    console.log('═══════════════════════════════════');
    console.log('🎉 SETUP CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════');
    console.log('📧 Email: admin@maxxcontrol.com');
    console.log('🔑 Senha: Admin@123');
    console.log('═══════════════════════════════════');
    console.log('');
    console.log('🚀 Próximos passos:');
    console.log('1. Execute: npm start');
    console.log('2. Acesse: http://localhost:5174');
    console.log('3. Faça login com as credenciais acima');
    console.log('');

  } catch (error) {
    console.error('❌ Erro durante o setup:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

setup();
