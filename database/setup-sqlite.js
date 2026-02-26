const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'maxxcontrol.db');
const db = new sqlite3.Database(dbPath);

async function setup() {
  console.log('🔧 Configurando banco de dados SQLite...\n');

  db.serialize(async () => {
    // Criar tabelas
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      plano TEXT DEFAULT 'free',
      status TEXT DEFAULT 'ativo',
      expira_em TEXT,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      mac_address TEXT UNIQUE NOT NULL,
      modelo TEXT,
      android_version TEXT,
      app_version TEXT,
      ip TEXT,
      ultimo_acesso TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'ativo',
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      device_id INTEGER,
      tipo TEXT NOT NULL,
      descricao TEXT,
      data TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bugs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      device_id INTEGER,
      stack_trace TEXT,
      modelo TEXT,
      app_version TEXT,
      resolvido INTEGER DEFAULT 0,
      data TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS app_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      versao TEXT UNIQUE NOT NULL,
      obrigatoria INTEGER DEFAULT 0,
      link_download TEXT,
      mensagem TEXT,
      ativa INTEGER DEFAULT 1,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )`, async (err) => {
      if (err) {
        console.error('❌ Erro ao criar tabelas:', err);
        return;
      }

      console.log('✅ Tabelas criadas com sucesso!\n');

      // Criar usuário admin
      const email = 'admin@maxxcontrol.com';
      const senha = 'Admin@123';
      const senha_hash = await bcrypt.hash(senha, 10);

      db.run(
        'INSERT OR IGNORE INTO users (nome, email, senha_hash, plano, status) VALUES (?, ?, ?, ?, ?)',
        ['Administrador', email, senha_hash, 'premium', 'ativo'],
        function(err) {
          if (err) {
            console.error('❌ Erro ao criar usuário:', err);
          } else {
            console.log('✅ Usuário criado com sucesso!\n');
            console.log('═══════════════════════════════════');
            console.log('🔐 CREDENCIAIS DE ACESSO');
            console.log('═══════════════════════════════════');
            console.log('📧 Email: admin@maxxcontrol.com');
            console.log('🔑 Senha: Admin@123');
            console.log('═══════════════════════════════════\n');
            console.log('🚀 Agora execute: npm start');
            console.log('🌐 Acesse: http://localhost:5173\n');
          }
          db.close();
        }
      );
    });
  });
}

setup();
