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
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS branding_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      banner_titulo TEXT DEFAULT 'TV Maxx',
      banner_subtitulo TEXT DEFAULT 'Seu Entretenimento',
      banner_cor_fundo TEXT DEFAULT '#000000',
      banner_cor_texto TEXT DEFAULT '#FF6A00',
      logo_url TEXT,
      splash_url TEXT,
      tema TEXT DEFAULT 'dark',
      ativo INTEGER DEFAULT 1,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS api_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      url TEXT NOT NULL,
      categoria TEXT,
      critica INTEGER DEFAULT 0,
      ativa INTEGER DEFAULT 1,
      metodo TEXT DEFAULT 'GET',
      headers TEXT,
      timeout INTEGER DEFAULT 5000,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS api_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_config_id INTEGER,
      status TEXT NOT NULL,
      status_code INTEGER,
      latencia INTEGER,
      erro TEXT,
      verificado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (api_config_id) REFERENCES api_configs(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS conteudos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER UNIQUE NOT NULL,
      tipo TEXT NOT NULL,
      titulo TEXT NOT NULL,
      titulo_original TEXT,
      descricao TEXT,
      poster_path TEXT,
      backdrop_path TEXT,
      nota REAL,
      ano TEXT,
      generos TEXT,
      duracao INTEGER,
      banner_app_url TEXT,
      banner_share_url TEXT,
      ativo INTEGER DEFAULT 1,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
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
          }

          // Inserir APIs padrão
          const apis = [
            ['Auth API', 'API de autenticação principal', 'https://auth.novomundo.live/v1/', 'autenticacao', 1],
            ['Painel API', 'API do painel de controle', 'https://painel.tvmaxx.pro/api/', 'painel', 1],
            ['Cache API', 'API de cache e CDN', 'https://api1.novomundo.live/cache/', 'cache', 1],
            ['TMDB API', 'The Movie Database', 'https://api.themoviedb.org/3/', 'conteudo', 0],
            ['SportsData MMA', 'API de dados de MMA', 'https://api.sportsdata.io/v3/mma/', 'esportes', 0],
            ['SportsData Soccer', 'API de dados de Futebol', 'https://api.sportsdata.io/v3/soccer/', 'esportes', 0],
            ['Meteoblue', 'API de previsão do tempo', 'https://my.meteoblue.com/packages/', 'clima', 0],
            ['Chatbot API', 'API do chatbot de suporte', 'https://painel.masterbins.com/api/chatbot/', 'suporte', 0]
          ];

          apis.forEach(api => {
            db.run(
              'INSERT OR IGNORE INTO api_configs (nome, descricao, url, categoria, critica) VALUES (?, ?, ?, ?, ?)',
              api
            );
          });

          // Inserir branding padrão
          db.run(
            `INSERT OR IGNORE INTO branding_settings (banner_titulo, banner_subtitulo, banner_cor_fundo, banner_cor_texto, tema, ativo)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ['TV Maxx', 'Seu Entretenimento', '#000000', '#FF6A00', 'dark', 1],
            function(err) {
              if (err) {
                console.error('❌ Erro ao criar branding:', err);
              } else {
                console.log('✅ Branding padrão criado!\n');
              }

              console.log('═══════════════════════════════════');
              console.log('🔐 CREDENCIAIS DE ACESSO');
              console.log('═══════════════════════════════════');
              console.log('📧 Email: admin@maxxcontrol.com');
              console.log('🔑 Senha: Admin@123');
              console.log('═══════════════════════════════════\n');
              console.log('🚀 Agora execute: npm start');
              console.log('🌐 Acesse: http://localhost:5173\n');
              db.close();
            }
          );
        }
      );
    });
  });
}

setup();
