const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { initWebSocket } = require('./websocket/wsServer');
const pool = require('./config/database');

// Executar migrações pendentes automaticamente
async function runPendingMigrations() {
  const IGNORE_CODES = ['42P07', '42701', '42P11', '42710']; // duplicate table/column/index/object

  // Migração: tabelas IPTV Plugin (executar cada CREATE individualmente)
  // Tabelas sem dependências externas primeiro
  const iptvStatementsPhase1 = [
    {
      name: 'iptv_servers',
      sql: `CREATE TABLE IF NOT EXISTS iptv_servers (
        id SERIAL PRIMARY KEY,
        server_name VARCHAR(255) NOT NULL,
        xtream_url VARCHAR(500) NOT NULL,
        xtream_username VARCHAR(255),
        xtream_password VARCHAR(255),
        server_type VARCHAR(50) DEFAULT 'custom',
        status VARCHAR(50) DEFAULT 'active',
        last_tested_at TIMESTAMP,
        test_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'qpanel_panels',
      sql: `CREATE TABLE IF NOT EXISTS qpanel_panels (
        id SERIAL PRIMARY KEY,
        panel_name VARCHAR(255) NOT NULL,
        panel_url VARCHAR(500) NOT NULL,
        panel_username VARCHAR(255),
        panel_password VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    }
  ];

  // Tabelas com FKs (dependem das tabelas acima e de 'devices')
  const iptvStatementsPhase2 = [
    {
      name: 'iptv_playlists',
      sql: `CREATE TABLE IF NOT EXISTS iptv_playlists (
        id SERIAL PRIMARY KEY,
        server_id INTEGER NOT NULL REFERENCES iptv_servers(id) ON DELETE CASCADE,
        playlist_name VARCHAR(255) NOT NULL,
        playlist_url VARCHAR(500) NOT NULL,
        playlist_type VARCHAR(50) DEFAULT 'custom',
        status VARCHAR(50) DEFAULT 'active',
        channels_count INTEGER DEFAULT 0,
        last_synced_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'device_iptv_sync',
      sql: `CREATE TABLE IF NOT EXISTS device_iptv_sync (
        id SERIAL PRIMARY KEY,
        device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
        server_id INTEGER NOT NULL REFERENCES iptv_servers(id) ON DELETE CASCADE,
        playlist_id INTEGER REFERENCES iptv_playlists(id) ON DELETE SET NULL,
        sync_status VARCHAR(50) DEFAULT 'pending',
        last_sync_at TIMESTAMP,
        sync_error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'qpanel_servers',
      sql: `CREATE TABLE IF NOT EXISTS qpanel_servers (
        id SERIAL PRIMARY KEY,
        panel_id INTEGER NOT NULL REFERENCES qpanel_panels(id) ON DELETE CASCADE,
        server_name VARCHAR(255) NOT NULL,
        server_dns VARCHAR(255) NOT NULL,
        server_data JSONB,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'qpanel_accounts',
      sql: `CREATE TABLE IF NOT EXISTS qpanel_accounts (
        id SERIAL PRIMARY KEY,
        panel_id INTEGER NOT NULL REFERENCES qpanel_panels(id) ON DELETE CASCADE,
        server_id INTEGER NOT NULL,
        package_id INTEGER NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        device_mac VARCHAR(17) NOT NULL,
        m3u_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'smartone_registrations',
      sql: `CREATE TABLE IF NOT EXISTS smartone_registrations (
        id SERIAL PRIMARY KEY,
        device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
        device_mac VARCHAR(17) NOT NULL,
        server_name VARCHAR(255) NOT NULL,
        dns VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        m3u_url VARCHAR(500) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    }
  ];

  const iptvIndexes = [
    { name: 'idx_smartone_device_dns', sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_smartone_device_dns ON smartone_registrations(device_mac, dns)` },
    { name: 'idx_qpanel_servers_panel_name', sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_qpanel_servers_panel_name ON qpanel_servers(panel_id, server_name)` },
    { name: 'idx_iptv_servers_status', sql: `CREATE INDEX IF NOT EXISTS idx_iptv_servers_status ON iptv_servers(status)` },
    { name: 'idx_qpanel_panels_status', sql: `CREATE INDEX IF NOT EXISTS idx_qpanel_panels_status ON qpanel_panels(status)` },
    { name: 'idx_qpanel_accounts_device', sql: `CREATE INDEX IF NOT EXISTS idx_qpanel_accounts_device ON qpanel_accounts(device_mac)` }
  ];

  for (const { name, sql } of iptvStatementsPhase1) {
    try {
      await pool.query(sql);
      console.log(`  ✅ Tabela ${name} OK`);
    } catch (err) {
      if (!IGNORE_CODES.includes(err.code)) {
        console.warn(`  ⚠️ Falha ao criar ${name}:`, err.message);
      }
    }
  }

  for (const { name, sql } of iptvStatementsPhase2) {
    try {
      await pool.query(sql);
      console.log(`  ✅ Tabela ${name} OK`);
    } catch (err) {
      if (!IGNORE_CODES.includes(err.code)) {
        console.warn(`  ⚠️ Falha ao criar ${name}:`, err.message);
      }
    }
  }

  for (const { name, sql } of iptvIndexes) {
    try {
      await pool.query(sql);
    } catch (err) {
      if (!IGNORE_CODES.includes(err.code)) {
        console.warn(`  ⚠️ Falha ao criar índice ${name}:`, err.message);
      }
    }
  }

  console.log('✅ Tabelas IPTV Plugin verificadas/criadas');

  // Migração: tabela plugin_relay_commands (Relay Plugin Chrome ↔ Painel)
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS plugin_relay_commands (
      id SERIAL PRIMARY KEY,
      panel_id INTEGER REFERENCES qpanel_panels(id) ON DELETE CASCADE,
      command_type VARCHAR(50) NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}',
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      result JSONB,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '5 minutes')
    )`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_relay_commands_status ON plugin_relay_commands(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_relay_commands_panel ON plugin_relay_commands(panel_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_relay_commands_expires ON plugin_relay_commands(expires_at)`);
    console.log('✅ Tabela plugin_relay_commands verificada/criada');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.warn('⚠️ Aviso migração plugin_relay_commands:', err.message);
    }
  }

  // Migração: tabela playlist_servers (Playlist Manager)
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS playlist_servers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      dns VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✅ Tabela playlist_servers verificada/criada');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.warn('⚠️ Aviso migração playlist_servers:', err.message);
    }
  }

  // Migração: coluna test_api_urls (múltiplas URLs de API de teste)
  try {
    await pool.query(`ALTER TABLE devices ADD COLUMN IF NOT EXISTS test_api_urls TEXT`);
    console.log('✅ Coluna test_api_urls verificada/criada');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.warn('⚠️ Aviso na migração test_api_urls:', err.message);
    }
  }

  // Migração: Fix Logs & Bugs Tables (system_logs + colunas bugs)
  console.log('🔧 Executando migration: Fix Logs & Bugs Tables...');
  try {
    // Criar tabela system_logs
    await pool.query(`CREATE TABLE IF NOT EXISTS system_logs (
      id SERIAL PRIMARY KEY,
      device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
      tipo VARCHAR(50) NOT NULL,
      descricao TEXT,
      severity VARCHAR(20) DEFAULT 'info',
      modelo VARCHAR(100),
      app_version VARCHAR(20),
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('  ✅ Tabela system_logs verificada/criada');

    // Criar índices para system_logs
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_system_logs_tipo ON system_logs(tipo)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_system_logs_data ON system_logs(data DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_system_logs_device_id ON system_logs(device_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_system_logs_severity ON system_logs(severity)`);
    console.log('  ✅ Índices de system_logs verificados/criados');

    // Adicionar colunas faltantes em bugs
    await pool.query(`ALTER TABLE bugs ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'error'`);
    await pool.query(`ALTER TABLE bugs ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'crash'`);
    await pool.query(`ALTER TABLE bugs ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'`);
    await pool.query(`ALTER TABLE bugs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open'`);
    console.log('  ✅ Colunas de bugs verificadas/criadas');

    // Criar índices para novas colunas de bugs
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bugs_severity ON bugs(severity)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bugs_type ON bugs(type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status)`);
    console.log('  ✅ Índices de bugs verificados/criados');

    console.log('✅ Migration Fix Logs & Bugs Tables concluída com sucesso');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration Fix Logs & Bugs Tables:', err.message);
      console.error('Stack:', err.stack);
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (necessário para Render e outros proxies reversos)
app.set('trust proxy', 1);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting geral
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500 // aumentado para suportar uso intenso do painel
});
app.use('/api/', limiter);

// Rate limiting específico para árvore IPTV (Expandir Tudo dispara muitas requisições)
const iptvTreeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5000 // suporta expandir centenas de categorias
});
app.use('/api/iptv-tree/', iptvTreeLimiter);

// Servir arquivos estáticos do frontend (build do Vite)
app.use(express.static(path.join(__dirname, 'web/dist')));

// Rotas da API
app.use('/api/auth', require('./modules/auth/authRoutes'));
app.use('/api/device', require('./modules/mac/macRoutes'));
app.use('/api/mac', require('./modules/mac/macRoutes')); // Alias para compatibilidade com app Android
app.use('/api/apps', require('./modules/apps/appsRoutes'));
app.use('/api/log', require('./modules/logs/logsRoutes'));
app.use('/api/logs', require('./modules/logs/logsRoutes')); // Alias para compatibilidade com painel web
app.use('/api/bug', require('./modules/bugs/bugsRoutes'));
app.use('/api/app', require('./modules/updates/updatesRoutes'));
app.use('/api/monitor', require('./modules/monitoring/monitoringRoutes'));
app.use('/api/api-monitor', require('./modules/api-monitor/apiMonitorRoutes'));
app.use('/api/api-config', require('./modules/api-config/apiConfigRoutes'));
app.use('/api/content', require('./modules/content/contentRoutes'));
app.use('/api/branding', require('./modules/branding/brandingRoutes'));
app.use('/api/iptv-server', require('./modules/iptv-server/iptvServerRoutes'));
app.use('/api/iptv-tree', require('./modules/iptv-tree/iptvTreeRoutes'));
app.use('/api/banners', require('./modules/banners/bannerRoutes'));
app.use('/api/resale', require('./modules/resale/resaleRoutes'));

// Rotas do sistema multi-servidor IPTV
app.use('/api/iptv', require('./modules/iptv-credentials/iptvCredentialsRoutes'));
app.use('/api/iptv', require('./modules/iptv-servers/iptvServersRoutes'));
app.use('/api/iptv', require('./modules/iptv-monitoring/iptvMonitoringRoutes'));

// Rotas do Playlist Manager 4-in-1
app.use('/api/playlist-manager', require('./modules/playlist-manager/playlistManagerRoutes'));

// Rotas do Plugin IPTV Unificado (integração com MaxxControl)
app.use('/api/iptv-plugin', require('./modules/iptv-servers/iptv-plugin-unified'));

// Servir arquivos estáticos (banners gerados)
app.use('/banners', express.static('public/banners'));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    service: 'MaxxControl X API'
  });
});

// Rota raiz da API
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 MaxxControl X API',
    version: '1.0.0',
    status: 'running'
  });
});

// Servir index.html para todas as outras rotas (SPA)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/banners')) {
    res.sendFile(path.join(__dirname, 'web/dist/index.html'));
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 MaxxControl X API rodando na porta ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});

// Iniciar WebSocket
initWebSocket(server);

// Testar conexão com banco e executar migrações
if (process.env.USE_SQLITE === 'true') {
  pool.query('SELECT datetime("now") as now').then(res => {
    console.log('✅ Banco de dados SQLite conectado:', res.rows[0].now);
    runPendingMigrations();
  }).catch(err => {
    console.error('❌ Erro ao conectar no banco de dados:', err.message);
  });
} else {
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Erro ao conectar no banco de dados:', err);
    } else {
      console.log('✅ Banco de dados PostgreSQL conectado:', res.rows[0].now);
      runPendingMigrations();
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    pool.end();
    process.exit(0);
  });
});
