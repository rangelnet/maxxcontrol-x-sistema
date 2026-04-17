const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const { initWebSocket } = require('./websocket/wsServer');
const pool = require('./config/database');
const sentinela = require('./modules/maintenance/sentinela');

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
        expire_date VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'whatsapp_flows',
      sql: `CREATE TABLE IF NOT EXISTS whatsapp_flows (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content JSONB NOT NULL,
        is_active BOOLEAN DEFAULT false,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'whatsapp_chatbot_sessions',
      sql: `CREATE TABLE IF NOT EXISTS whatsapp_chatbot_sessions (
        id SERIAL PRIMARY KEY,
        contact_id VARCHAR(100) NOT NULL,
        flow_id INTEGER REFERENCES whatsapp_flows(id) ON DELETE CASCADE,
        current_node_id VARCHAR(100),
        variables JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(contact_id)
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

  // Migração específica: Adicionar colunas necessárias na qpanel_accounts
  try {
    const columnsToSync = [
      { name: 'expire_date', type: 'VARCHAR(100)' },
      { name: 'remote_id', type: 'VARCHAR(255)' },
      { name: 'panel_url', type: 'TEXT' },
      { name: 'package_name', type: 'VARCHAR(255)' },
      { name: 'server_name', type: 'VARCHAR(255)' },
      { name: 'max_connections', type: 'INTEGER DEFAULT 1' },
      { name: 'm3u_url', type: 'TEXT' }
    ];

    for (const col of columnsToSync) {
      await pool.query(`ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
    }
    
    // Criar tabela de comandos de relay se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS relay_commands (
        id SERIAL PRIMARY KEY,
        command_type VARCHAR(50) NOT NULL,
        payload JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'pending',
        panel_url TEXT,
        result JSONB,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Migrações de colunas e tabela de relay concluídas');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.warn('⚠️ Aviso na migração de colunas qpanel_accounts:', err.message);
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

  // Migração: tabela banner_templates (Fábrica de Temas)
  console.log('🎨 Executando migration: Banner Templates...');
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS banner_templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) DEFAULT 'movie',
      bg_url VARCHAR(500),
      overlay_url VARCHAR(500),
      config JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('  ✅ Tabela banner_templates verificada/criada');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration banner_templates:', err.message);
    }
  }

  // Migração: tabela global_settings (Configurações Gerais)
  console.log('⚙️ Executando migration: Global Settings...');
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS global_settings (
      key VARCHAR(255) PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('  ✅ Tabela global_settings verificada/criada');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration global_settings:', err.message);
    }
  }

  // ── Migração: MaxxChat — Live Chat Enterprise ──────────────────────────────
  console.log('💬 Executando migration: MaxxChat Live Chat...');
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS whatsapp_conversations (
      id SERIAL PRIMARY KEY,
      jid VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255),
      phone VARCHAR(30),
      avatar_url TEXT,
      is_group BOOLEAN DEFAULT false,
      status VARCHAR(20) DEFAULT 'open',
      label_id INTEGER,
      unread_count INTEGER DEFAULT 0,
      last_message TEXT,
      last_message_at TIMESTAMP,
      assigned_to VARCHAR(100),
      bot_active BOOLEAN DEFAULT true,
      notes TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('  ✅ Tabela whatsapp_conversations OK');

    await pool.query(`CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
      jid VARCHAR(100) NOT NULL,
      message_id VARCHAR(100) UNIQUE,
      from_me BOOLEAN DEFAULT false,
      sender_name VARCHAR(255),
      content TEXT,
      media_type VARCHAR(30) DEFAULT 'text',
      media_url TEXT,
      quoted_message_id VARCHAR(100),
      status VARCHAR(20) DEFAULT 'sent',
      is_bot_reply BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('  ✅ Tabela whatsapp_messages OK');

    await pool.query(`CREATE TABLE IF NOT EXISTS whatsapp_labels (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      color VARCHAR(7) NOT NULL DEFAULT '#FFA500',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('  ✅ Tabela whatsapp_labels OK');

    // Inserir labels padrão se tabela estiver vazia
    const labelCount = await pool.query('SELECT COUNT(*) as cnt FROM whatsapp_labels');
    if (parseInt(labelCount.rows[0].cnt) === 0) {
      await pool.query(`INSERT INTO whatsapp_labels (name, color) VALUES ('Venda', '#FF6B35'), ('Renovação', '#FFB800'), ('Suporte', '#3B82F6'), ('VIP', '#A855F7'), ('Spam', '#EF4444')`);
      console.log('  ✅ Labels padrão inseridas');
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS whatsapp_quick_replies (
      id SERIAL PRIMARY KEY,
      shortcut VARCHAR(50) NOT NULL UNIQUE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('  ✅ Tabela whatsapp_quick_replies OK');

    // Inserir respostas rápidas padrão se tabela estiver vazia
    const qrCount = await pool.query('SELECT COUNT(*) as cnt FROM whatsapp_quick_replies');
    if (parseInt(qrCount.rows[0].cnt) === 0) {
      await pool.query(`INSERT INTO whatsapp_quick_replies (shortcut, content) VALUES ('/ola', 'Olá! Tudo bem? Em que posso ajudar?'), ('/preco', 'Nossos planos começam a partir de R$ XX,XX! Qual plano te interessa?'), ('/pix', 'Chave PIX: seuemail@email.com - Após o pagamento, envie o comprovante aqui!'), ('/teste', 'Claro! Vou ativar um teste gratuito de 3 horas para você agora!'), ('/mac', 'Para ativar, preciso do MAC Address do seu aparelho. Você encontra em Configurações > Sobre > MAC WiFi.')`);
      console.log('  ✅ Respostas rápidas padrão inseridas');
    }

    // Índices para performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_wa_messages_conv ON whatsapp_messages(conversation_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_wa_messages_jid ON whatsapp_messages(jid)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_wa_conversations_status ON whatsapp_conversations(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_wa_conversations_last_msg ON whatsapp_conversations(last_message_at DESC)`);

    console.log('✅ Migration MaxxChat Live Chat concluída!');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration MaxxChat:', err.message);
    }
  }

  // Migração: tabela mp_transactions (Histórico de Pix)
  console.log('💸 Executando migration: MP Transactions...');
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS mp_transactions (
      id SERIAL PRIMARY KEY,
      payment_id VARCHAR(255) UNIQUE, -- Agora opcional para transações manuais
      reseller_id INTEGER NOT NULL,
      package_id INTEGER, -- Opcional para transferências manuais
      credits INTEGER NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      type VARCHAR(20) DEFAULT 'pix', -- 'pix' ou 'manual'
      qr_code_base64 TEXT,
      qr_code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Garantir que a coluna 'type' existe caso a tabela já tenha sido criada antes
    await pool.query(`ALTER TABLE mp_transactions ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'pix'`);
    await pool.query(`ALTER TABLE mp_transactions ALTER COLUMN payment_id DROP NOT NULL`);
    await pool.query(`ALTER TABLE mp_transactions ALTER COLUMN package_id DROP NOT NULL`);
    console.log('  ✅ Tabela mp_transactions verificada/criada');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration mp_transactions:', err.message);
    }
  }

  // Migração: 2FA via Telegram
  console.log('🛡️ Executando migration: 2FA Security...');
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tfa_enabled BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tfa_code VARCHAR(10)`);
    console.log('  ✅ Colunas 2FA verificadas/criadas');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration 2FA:', err.message);
    }
  }

  // Migração: Integração Google OAuth2
  console.log('🔗 Executando migration: Google Configs...');
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS google_configs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      access_token TEXT,
      refresh_token TEXT,
      expiry_date BIGINT,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    )`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_google_configs_user ON google_configs(user_id)`);
    console.log('  ✅ Tabela google_configs verificada/criada');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration google_configs:', err.message);
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Servir arquivos estáticos do frontend (build do Vite) - Busca dinâmica de diretório
const possibleDistPaths = [
  path.join(__dirname, 'web', 'dist'),
  path.join(__dirname, '..', 'web', 'dist'),
  path.join(process.cwd(), 'web', 'dist')
];

let distPath = possibleDistPaths[0];

for (const p of possibleDistPaths) {
  if (fs.existsSync(p)) {
    distPath = p;
    console.log('✅ Frontend localizado em:', distPath);
    break;
  }
}

app.use(express.static(distPath));
console.log('📂 Servindo frontend de:', distPath);

// ============================================
// ROTAS DA API
// ============================================

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
app.use('/api/banner-templates', require('./modules/banners/templateRoutes'));
app.use('/api/resale', require('./modules/resale/resaleRoutes'));
app.use('/api/settings', require('./modules/settings/settingsRoutes'));
app.use('/api/payments',   require('./modules/payments/paymentRoutes'));
app.use('/api/whatsapp',   require('./modules/whatsapp/whatsappRoutes'));
app.use('/api/integrations/google', require('./modules/integrations/google/googleRoutes'));

// Rotas do sistema multi-servidor IPTV
app.use('/api/iptv', require('./modules/iptv-credentials/iptvCredentialsRoutes'));
app.use('/api/iptv', require('./modules/iptv-servers/iptvServersRoutes'));
app.use('/api/iptv', require('./modules/iptv-monitoring/iptvMonitoringRoutes'));

// Rotas do Playlist Manager 4-in-1
app.use('/api/playlist-manager', require('./modules/playlist-manager/playlistManagerRoutes'));

// Rotas do Plugin IPTV Unificado (integração com MaxxControl)
app.use('/api/iptv-plugin', require('./modules/iptv-servers/iptv-plugin-unified'));

// ============================================
// SISTEMA DE RELAY (Controle Remoto via Extensão)
// ============================================

// Pegar comandos pendentes (Extensão faz polling aqui)
app.get('/api/iptv-plugin/relay-pending', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM relay_commands WHERE status = 'pending' ORDER BY created_at ASC"
    );
    res.json({ commands: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar resultado de um comando (Extensão envia aqui)
app.post('/api/iptv-plugin/relay-result', async (req, res) => {
  const { command_id, status, result, error_message } = req.body;
  try {
    await pool.query(
      "UPDATE relay_commands SET status = $1, result = $2, error_message = $3, updated_at = NOW() WHERE id = $4",
      [status, result, error_message, command_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar novo comando (Painel Mxxcontrol envia aqui)
app.post('/api/iptv-plugin/relay-command', async (req, res) => {
  const { command_type, payload, panel_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO relay_commands (command_type, payload, panel_url) VALUES ($1, $2, $3) RETURNING id",
      [command_type, payload, panel_url]
    );
    res.json({ success: true, command_id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// OUTROS SERVIÇOS E FALLBACK SPA
// ============================================

// Servir arquivos estáticos (banners gerados e mídias do whatsapp)
app.use('/banners', express.static('public/banners'));
app.use('/media', express.static('public/media'));

// Rota de health check melhorada
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const result = await pool.query(process.env.USE_SQLITE === 'true' ? 'SELECT 1' : 'SELECT NOW()');
    if (result) dbStatus = 'connected';
  } catch (err) {
    console.error('❌ Health check DB error:', err.message);
  }

  const isOnline = dbStatus === 'connected';
  res.status(isOnline ? 200 : 503).json({ 
    status: isOnline ? 'online' : 'degraded', 
    database: dbStatus,
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

// Rota de Saúde do Sentinela
app.get('/api/sentinela/status', (req, res) => {
  res.json({
    status: 'online',
    agent: 'Sentinela Maxx PRO',
    last_check: new Date().toISOString()
  });
});

// Servir index.html para todas as outras rotas (SPA) - DEVE SER A ÚLTIMA ROTA
app.get('*', (req, res) => {
  // Se for uma rota de API, não servir o index.html (evitar confusão)
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint da API não encontrado' });
  }

  // Se for qualquer outra rota, servir o frontend
  // Re-verificar o caminho do index.html dinamicamente
  const possibleIndexPaths = [
    path.join(__dirname, 'web', 'dist', 'index.html'),
    path.join(__dirname, '..', 'web', 'dist', 'index.html'),
    path.join(process.cwd(), 'web', 'dist', 'index.html')
  ];

  let indexPath = possibleIndexPaths[0];
  for (const p of possibleIndexPaths) {
    if (fs.existsSync(p)) {
      indexPath = p;
      break;
    }
  }

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Erro ao servir index.html:', err.message);
      res.status(404).send(`Not Found: O frontend não foi encontrado. Tentamos em: ${JSON.stringify(possibleIndexPaths)}`);
    }
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================

// Criar HTTP server para Socket.IO + Express
const server = http.createServer(app);

// ── Socket.IO (MaxxChat Live Chat) ─────────────────────────────────────────
let io;
try {
  const { Server } = require('socket.io');
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('🔌 [Socket.IO] Cliente conectado:', socket.id);
    socket.on('join_chat', (jid) => { socket.join(`chat_${jid}`); });
    socket.on('disconnect', () => { /* silêncio */ });
  });
  // Exportar io globalmente para o whatsappClient poder emitir
  global.__maxxchat_io = io;
  console.log('🔌 [Socket.IO] MaxxChat Live Chat pronto!');
} catch (e) {
  console.warn('⚠️ socket.io não instalado. Live Chat desabilitado. Rode: npm install socket.io');
}

// Inicializar Agente Sentinela Maxx PRO
sentinela.iniciar().catch(err => console.error('❌ Falha ao iniciar Sentinela:', err));

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 MaxxControl X API rodando na porta ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});

// Iniciar WebSocket (existente)
initWebSocket(server);

// Iniciar Bot do Telegram para 2FA
const { initBot } = require('./modules/telegram/telegramBot');
initBot();

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
