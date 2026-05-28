// Trigger restart
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
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
        xtream_url VARCHAR(500) NOT NULL UNIQUE,
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
        panel_url VARCHAR(500) NOT NULL UNIQUE,
        panel_username VARCHAR(255),
        panel_password VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'iptv_providers',
      sql: `CREATE TABLE IF NOT EXISTS iptv_providers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slot_index INTEGER UNIQUE NOT NULL, name TEXT, url TEXT, username TEXT, password TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`
    },
    {
      name: 'banner_templates',
      sql: `CREATE TABLE IF NOT EXISTS banner_templates (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, type VARCHAR(50) DEFAULT 'movie', bg_url TEXT, overlay_url TEXT, config JSONB DEFAULT '{}', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
    },
    {
      name: 'tv_categories',
      sql: `CREATE TABLE IF NOT EXISTS tv_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon TEXT DEFAULT '📺',
        icon_type VARCHAR(20) DEFAULT 'emoji',
        keywords JSONB DEFAULT '[]',
        exclude_keywords JSONB DEFAULT '[]',
        ordem INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'tv_channels',
      sql: `CREATE TABLE IF NOT EXISTS tv_channels (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES tv_categories(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        stream_url TEXT,
        stream_id INTEGER,
        logo_url TEXT,
        epg_channel_id TEXT,
        source_category_name TEXT,
        ordem INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'servers',
      sql: `CREATE TABLE IF NOT EXISTS servers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        url VARCHAR(255) UNIQUE NOT NULL,
        region VARCHAR(50),
        priority INTEGER DEFAULT 100,
        status VARCHAR(20) DEFAULT 'ativo',
        users INTEGER DEFAULT 0,
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
        owner_id INTEGER DEFAULT 1,
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
        owner_id INTEGER DEFAULT 1,
        contact_id VARCHAR(100) NOT NULL,
        flow_id INTEGER REFERENCES whatsapp_flows(id) ON DELETE CASCADE,
        current_node_id VARCHAR(100),
        variables JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(contact_id, owner_id)
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
    },
    {
      name: 'plan_mappings',
      sql: `CREATE TABLE IF NOT EXISTS plan_mappings (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER NOT NULL UNIQUE,
        config JSONB NOT NULL DEFAULT '[]',
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
    { name: 'idx_qpanel_accounts_device', sql: `CREATE INDEX IF NOT EXISTS idx_qpanel_accounts_device ON qpanel_accounts(device_mac)` },
    { name: 'idx_qpanel_panels_url_unique', sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_qpanel_panels_url_unique ON qpanel_panels(panel_url)` },
    { name: 'idx_iptv_servers_url_unique', sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_iptv_servers_url_unique ON iptv_servers(xtream_url)` }
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
      CREATE TABLE IF NOT EXISTS plugin_relay_commands (
        id SERIAL PRIMARY KEY,
        panel_id INTEGER REFERENCES qpanel_panels(id) ON DELETE CASCADE,
        panel_url TEXT,
        command_type VARCHAR(50) NOT NULL,
        payload JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'pending',
        result JSONB,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Garantir que panel_url existe caso a tabela já exista
    await pool.query(`ALTER TABLE plugin_relay_commands ADD COLUMN IF NOT EXISTS panel_url TEXT`);

    // Adicionar suporte a WhatsApp no Branding
    await pool.query(`ALTER TABLE branding_settings ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50)`);

    console.log('✅ Migrações de colunas e tabela de relay concluídas');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.warn('⚠️ Aviso na migração de colunas qpanel_accounts:', err.message);
    }
  }

  // Garantir restrições UNIQUE necessárias para o ON CONFLICT funcionar
  try {
    // 1. qpanel_panels
    await pool.query(`
      DELETE FROM qpanel_panels a USING qpanel_panels b 
      WHERE a.id < b.id AND a.panel_url = b.panel_url
    `);
    await pool.query(`ALTER TABLE qpanel_panels ADD CONSTRAINT qpanel_panels_panel_url_key UNIQUE (panel_url)`).catch(() => {});

    // 2. iptv_servers
    await pool.query(`
      DELETE FROM iptv_servers a USING iptv_servers b 
      WHERE a.id < b.id AND a.xtream_url = b.xtream_url
    `);
    await pool.query(`ALTER TABLE iptv_servers ADD CONSTRAINT iptv_servers_xtream_url_key UNIQUE (xtream_url)`).catch(() => {});
    
    // 3. servers (adicionar updated_at se não existir)
    await pool.query(`ALTER TABLE servers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`).catch(() => {});

    console.log('✅ Restrições UNIQUE e Colunas validadas');
  } catch (err) {
    console.warn('⚠️ Nota: Algumas restrições UNIQUE já existem ou não puderam ser criadas:', err.message);
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

  // Inserir slots padrão de provedores se necessário
  try {
    await pool.query(`
      INSERT INTO iptv_providers (slot_index, name)
      VALUES (1,'Slot 1'),(2,'Slot 2'),(3,'Slot 3'),(4,'Slot 4'),(5,'Slot 5'),(6,'Slot 6')
      ON CONFLICT (slot_index) DO NOTHING
    `);
    console.log('  ✅ Slots de provedores IPTV sincronizados');
  } catch (err) {
    console.error('  ⚠️ Erro ao inserir slots padrão:', err.message);
  }

  // Inserir servidores padrão se necessário
  try {
    const serverCount = await pool.query('SELECT COUNT(*) as cnt FROM servers');
    if (parseInt(serverCount.rows[0].cnt) === 0) {
      await pool.query(`
        INSERT INTO servers (name, url, region, priority, status) VALUES
        ('Servidor Brasil 1', 'http://br1.maxxcontrol.pro:8080', 'Brasil', 1, 'ativo'),
        ('Servidor Brasil 2', 'http://br2.maxxcontrol.pro:8080', 'Brasil', 2, 'ativo'),
        ('Servidor EUA', 'http://us1.maxxcontrol.pro:8080', 'EUA', 3, 'ativo')
      `);
      console.log('  ✅ Servidores IPTV padrão inseridos');
    }
  } catch (err) {
    console.error('  ⚠️ Erro ao inserir servidores padrão:', err.message);
  }

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

  // Migração: colunas adicionais para controle de teste
  try {
    await pool.query(`ALTER TABLE devices ADD COLUMN IF NOT EXISTS test_duration INTEGER DEFAULT 2`);
    await pool.query(`ALTER TABLE devices ADD COLUMN IF NOT EXISTS test_blocked VARCHAR(10) DEFAULT '0'`);
    console.log('✅ Colunas test_duration e test_blocked verificadas/criadas');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.warn('⚠️ Aviso na migração de colunas de teste:', err.message);
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

  // Migração: Branding Settings (Menu e Banners)
  console.log('🎨 Executando migration: Branding Settings Columns...');
  try {
    await pool.query(`ALTER TABLE branding_settings ADD COLUMN IF NOT EXISTS top_menu JSONB DEFAULT '[]'::jsonb`);
    await pool.query(`ALTER TABLE branding_settings ADD COLUMN IF NOT EXISTS platform_banners JSONB DEFAULT '{}'::jsonb`);
    console.log('  ✅ Colunas top_menu e platform_banners verificadas/criadas em branding_settings');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.warn('⚠️ Aviso migração Branding Settings:', err.message);
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
    await pool.query(`ALTER TABLE global_settings ADD CONSTRAINT global_settings_key_unique UNIQUE (key)`).catch(() => {});
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
      owner_id INTEGER DEFAULT 1,
      jid VARCHAR(100) NOT NULL,
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(jid, owner_id)
    )`);
    console.log('  ✅ Tabela whatsapp_conversations OK');

    await pool.query(`CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER DEFAULT 1,
      conversation_id INTEGER REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
      jid VARCHAR(100) NOT NULL,
      message_id VARCHAR(100),
      from_me BOOLEAN DEFAULT false,
      sender_name VARCHAR(255),
      content TEXT,
      media_type VARCHAR(30) DEFAULT 'text',
      media_url TEXT,
      quoted_message_id VARCHAR(100),
      status VARCHAR(20) DEFAULT 'sent',
      is_bot_reply BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(message_id, owner_id)
    )`);
    console.log('  ✅ Tabela whatsapp_messages OK');

    await pool.query(`CREATE TABLE IF NOT EXISTS whatsapp_labels (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER DEFAULT 1,
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
      owner_id INTEGER DEFAULT 1,
      shortcut VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(shortcut, owner_id)
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

    // Altera tabelas existentes (Migrations)
    const tablesToAlter = [
      'whatsapp_flows', 'whatsapp_chatbot_sessions', 'whatsapp_conversations', 
      'whatsapp_messages', 'whatsapp_labels', 'whatsapp_quick_replies'
    ];
    for (const table of tablesToAlter) {
      try {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS owner_id INTEGER DEFAULT 1`);
      } catch(e) {}
    }
    
    // Fix existing constraints (Drop old UNIQUE and add new ones with owner_id)
    try {
      await pool.query(`ALTER TABLE whatsapp_chatbot_sessions DROP CONSTRAINT IF EXISTS whatsapp_chatbot_sessions_contact_id_key`);
      await pool.query(`ALTER TABLE whatsapp_chatbot_sessions ADD CONSTRAINT whatsapp_chatbot_sessions_contact_id_owner_id_key UNIQUE(contact_id, owner_id)`);
      
      await pool.query(`ALTER TABLE whatsapp_conversations DROP CONSTRAINT IF EXISTS whatsapp_conversations_jid_key`);
      await pool.query(`ALTER TABLE whatsapp_conversations ADD CONSTRAINT whatsapp_conversations_jid_owner_id_key UNIQUE(jid, owner_id)`);
      
      await pool.query(`ALTER TABLE whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_message_id_key`);
      await pool.query(`ALTER TABLE whatsapp_messages ADD CONSTRAINT whatsapp_messages_message_id_owner_id_key UNIQUE(message_id, owner_id)`);
      
      await pool.query(`ALTER TABLE whatsapp_quick_replies DROP CONSTRAINT IF EXISTS whatsapp_quick_replies_shortcut_key`);
      await pool.query(`ALTER TABLE whatsapp_quick_replies ADD CONSTRAINT whatsapp_quick_replies_shortcut_owner_id_key UNIQUE(shortcut, owner_id)`);
    } catch(e) {}

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
    await pool.query(`ALTER TABLE mp_transactions ADD COLUMN IF NOT EXISTS mac_address VARCHAR(100)`);
    await pool.query(`ALTER TABLE mp_transactions ADD COLUMN IF NOT EXISTS app_id INTEGER`);
    await pool.query(`ALTER TABLE mp_transactions ALTER COLUMN payment_id DROP NOT NULL`);
    await pool.query(`ALTER TABLE mp_transactions ALTER COLUMN package_id DROP NOT NULL`);
    console.log('  ✅ Tabela mp_transactions verificada/criada');

    // ── Migração: Audit Logs ──────────────────────────────────────────────────
    console.log('📝 Executando migration: Audit Logs...');
    await pool.query(`CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      ip_address VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`);
    console.log('  ✅ Tabela audit_logs OK');
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

  // Migração: Sistema de Trial e URL Oficial
  console.log('⏳ Executando migration: Trial System & Global URLs...');
  try {
    // 2. Adicionar URL de teste global na configuração de servidor
    await pool.query(`ALTER TABLE iptv_server_config ADD COLUMN IF NOT EXISTS test_api_url TEXT`);
    await pool.query(`ALTER TABLE iptv_server_config ADD COLUMN IF NOT EXISTS test_api_urls JSONB DEFAULT '[]'`);
    
    console.log('  ✅ Colunas expires_at e test_api_url/urls verificadas/criadas');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration Trial System:', err.message);
    }
  }

  // Migração: Sistema Estratégico de Playlists e Dispositivos (Vizzion Style)
  console.log('📺 Executando migration: Strategic Device Services...');
  try {
    // 1. Tabela de Chaves de Acesso (Device Key)
    await pool.query(`CREATE TABLE IF NOT EXISTS device_keys (
      mac_address VARCHAR(100) PRIMARY KEY,
      device_key VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('  ✅ Tabela device_keys OK');

    // 1.1 Tabela de Comandos para Dispositivos (MAXX PLAYER etc)
    await pool.query(`CREATE TABLE IF NOT EXISTS device_commands (
      id SERIAL PRIMARY KEY,
      device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      command_type VARCHAR(50) NOT NULL,
      command_data JSONB DEFAULT '{}',
      status VARCHAR(20) DEFAULT 'pending',
      result JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    )`);
    console.log('  ✅ Tabela device_commands OK');

    // 1.2 Tabela de Apps Instalados
    await pool.query(`CREATE TABLE IF NOT EXISTS device_apps (
      id SERIAL PRIMARY KEY,
      device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      package_name VARCHAR(255) NOT NULL,
      app_name VARCHAR(255) NOT NULL,
      version_code INTEGER,
      version_name VARCHAR(100),
      is_system BOOLEAN DEFAULT false,
      installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(device_id, package_name)
    )`);
    console.log('  ✅ Tabela device_apps OK');

    // 2. Tabela de Playlists por Dispositivo
    await pool.query(`CREATE TABLE IF NOT EXISTS device_playlists (
      id SERIAL PRIMARY KEY,
      mac_address VARCHAR(100) NOT NULL,
      name VARCHAR(100) DEFAULT 'Minha Lista',
      type VARCHAR(20) DEFAULT 'url', -- 'url', 'xtream', 'code'
      content TEXT NOT NULL, -- URL M3U ou JSON com credenciais
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. Tabela de Configurações de DNS
    await pool.query(`CREATE TABLE IF NOT EXISTS device_configs (
      mac_address VARCHAR(100) PRIMARY KEY,
      dns_url TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 4. Tabela de Códigos de Acesso Temporários (Login por Código)
    await pool.query(`CREATE TABLE IF NOT EXISTS device_codes (
      code VARCHAR(6) PRIMARY KEY,
      mac_address VARCHAR(100) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('  ✅ Tabelas de Dispositivos, Playlists e Códigos verificadas/criadas');

    // 3. Tabela de Ativação de Apps (MAXX PLAYER, etc)
    await pool.query(`CREATE TABLE IF NOT EXISTS app_activation_packages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      price DECIMAL(10, 2) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      duration_days INTEGER DEFAULT 365,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Garantir UNIQUE em name antes do INSERT para evitar erro de ON CONFLICT
    await pool.query(`ALTER TABLE app_activation_packages ADD CONSTRAINT app_activation_packages_name_key UNIQUE (name)`).catch(() => {});

    // Inserir pacotes padrão
    await pool.query(`
      INSERT INTO app_activation_packages (name, price, description)
      VALUES 
      ('MAXX PLAYER PRO', 119.00, 'Ativação oficial para TV Box e Android TV.'),
      ('SMARTONE IPTV', 149.00, 'Ativação vitalícia ou anual.'),
      ('IBO PLAYER', 189.00, 'Ativação anual premium.')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('  ✅ Tabela app_activation_packages e dados iniciais OK');

    
    // 2. Configurações padrão iniciais
    await pool.query(`
      INSERT INTO global_settings (key, value) 
      VALUES ('panel_url', '"https://maxxcontrol-x-sistema.onrender.com/"')
      ON CONFLICT (key) DO NOTHING;
    `);
    
    await pool.query(`
      INSERT INTO global_settings (key, value) 
      VALUES ('trial_hours', '24')
      ON CONFLICT (key) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO global_settings (key, value) 
      VALUES ('reseller_welcome_template', '"Olá {nome}! Bem-vindo ao MaxxControl PRO.\\n\\n🌐 Site: {url}\\n👤 Login: {login}\\n🔑 Senha: {senha}\\n⌛ Seu teste expira em: {expiracao}"')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log('  ✅ Migrações de Trial e Configurações concluídas');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration Strategic Services / Trial:', err.message);
    }
  }

  // Migração: Profile Backgrounds (Controle de Tela de Perfis via Painel)
  console.log('🖥️ Executando migration: Profile Backgrounds...');
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS profile_backgrounds (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      title VARCHAR(255) DEFAULT '',
      ordem INTEGER DEFAULT 0,
      ativo BOOLEAN DEFAULT TRUE,
      criado_em TIMESTAMP DEFAULT NOW()
    )`);
    console.log('  ✅ Tabela profile_backgrounds verificada/criada');

    await pool.query(`CREATE TABLE IF NOT EXISTS profile_screen_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      slide_interval_ms INTEGER DEFAULT 5000,
      use_tmdb BOOLEAN DEFAULT TRUE,
      tmdb_position VARCHAR(20) DEFAULT 'mixed',
      max_backgrounds INTEGER DEFAULT 20,
      atualizado_em TIMESTAMP DEFAULT NOW(),
      CONSTRAINT single_profile_config CHECK (id = 1)
    )`);
    console.log('  ✅ Tabela profile_screen_config verificada/criada');

    // Seed da configuração padrão
    await pool.query(`
      INSERT INTO profile_screen_config (id, slide_interval_ms, use_tmdb, tmdb_position, max_backgrounds)
      VALUES (1, 5000, TRUE, 'mixed', 20)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Migration Profile Backgrounds concluída!');
  } catch (err) {
    if (!IGNORE_CODES.includes(err.code)) {
      console.error('❌ Erro na migration Profile Backgrounds:', err.message);
    }
  }

  // Executar migrações dos Módulos Resale e Financeiro sequencialmente
  try {
    console.log('💸 Executando migration: Resale VIP Fields...');
    const resaleController = require('./modules/resale/resaleController');
    await resaleController.migrateResale();

    console.log('💰 Executando migration: Finance & Plans Modules...');
    const financePlans = require('./modules/finance/finance-plans');
    await financePlans.migrateFinance();
  } catch (err) {
    console.error('❌ Erro nas migrações de Revenda/Financeiro sequenciais:', err.message);
  }
}


const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (necessário para Render e outros proxies reversos)
app.set('trust proxy', 1);

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
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
const fs = require('fs');

for (const p of possibleDistPaths) {
  if (fs.existsSync(p)) {
    distPath = p;
    console.log('✅ Frontend localizado em:', distPath);
    break;
  }
}

app.use(express.static(distPath, { etag: false, lastModified: false }));
app.use('/public', express.static(path.join(__dirname, 'public')));
console.log('📂 Servindo frontend de:', distPath);
console.log('📂 Servindo uploads de:', path.join(__dirname, 'public'));

// DIAGNÓSTICO: logar qual index.html está no disco
try {
  const idxPath = path.join(distPath, 'index.html');
  if (fs.existsSync(idxPath)) {
    const idxContent = fs.readFileSync(idxPath, 'utf8');
    const jsMatch = idxContent.match(/src="\/assets\/(index-[^"]+\.js)"/);
    console.log('🔍 index.html aponta para JS:', jsMatch ? jsMatch[1] : 'NÃO ENCONTRADO');
  } else {
    console.log('❌ index.html NÃO encontrado em:', idxPath);
  }
} catch(e) { console.log('⚠️ Erro ao ler index.html:', e.message); }

// ============================================
// ROTAS DA API
// ============================================

app.use('/api/auth', require('./modules/auth/authRoutes'));
app.use('/api/device', require('./modules/mac/macRoutes'));
app.use('/api/devices', require('./modules/mac/macRoutes')); // Alias para compatibilidade
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
app.use('/api/plan-mapping', require('./modules/plan-mapping/planMappingRoutes'));

// ⚽ Placar e Dados Esportivos (SportsData.io)
app.use('/api/sports', require('./modules/sports/sportsRoutes'));

// Rotas do sistema multi-servidor IPTV
app.use('/api/iptv', require('./modules/iptv-credentials/iptvCredentialsRoutes'));
app.use('/api/iptv', require('./modules/iptv-servers/iptvServersRoutes'));
app.use('/api/iptv', require('./modules/iptv-monitoring/iptvMonitoringRoutes'));

// Rotas do Playlist Manager 4-in-1
app.use('/api/playlist-manager', require('./modules/playlist-manager/playlistManagerRoutes'));

// Rotas do Plugin IPTV Unificado (integração com MaxxControl)
app.use('/api/iptv-plugin', require('./modules/iptv-servers/iptv-plugin-unified'));

// Rotas do Módulo Financeiro e Planos Comerciais
app.use('/api/finance', require('./modules/finance/finance-plans'));

// Rotas do Gerenciador de TV
app.use('/api/tv-manager', require('./modules/tv-manager/tvManagerRoutes'));

// ============================================
// ============================================
// OUTROS SERVIÇOS E FALLBACK SPA
// ============================================

// Servir arquivos estáticos (banners gerados e mídias do whatsapp)
app.use('/banners', express.static('public/banners'));
app.use('/media', express.static('public/media'));
app.use('/uploads', express.static('public/uploads'));
app.use('/branding', express.static(path.join(__dirname, 'web', 'public', 'branding')));

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

// Rota de debug: mostra arquivos reais em web/dist/assets/
app.get('/api/debug/dist', (req, res) => {
  try {
    const assetsPath = path.join(distPath, 'assets');
    const idxPath = path.join(distPath, 'index.html');
    const files = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath) : [];
    const idxContent = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, 'utf8') : 'NOT FOUND';
    const jsMatch = idxContent.match(/src="\/assets\/(index-[^"]+\.js)"/);
    res.json({
      distPath,
      indexHtmlJsRef: jsMatch ? jsMatch[1] : 'não encontrado',
      assetsFiles: files,
      cwd: process.cwd(),
      dirname: __dirname
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
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

  // Sem cache no index.html para SPA
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
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
    // Multi-tenant: cada usuário entra na sua sala exclusiva
    socket.on('join_user', (userId) => { socket.join(`user_${userId}`); });
    // Retrocompatibilidade: join_chat por JID (agora dentro da sala do user)
    socket.on('join_chat', (jid) => { socket.join(`chat_${jid}`); });
    socket.on('disconnect', () => { /* silêncio */ });
  });
  // Exportar io globalmente para o whatsappClient poder emitir
  global.io = io;
  global.__maxxchat_io = io;
  console.log('🚀 [Socket.IO] Servidor inicializado (Multi-Tenant)');
} catch (err) {
  console.error('⚠️ [Socket.IO] Falha ao inicializar:', err.message);
}

// Iniciar servidor
server.listen(PORT, async () => {
  console.log(` Servidor rodando na porta ${PORT}`);
  
  // Executar migrações
  console.log('🔄 Verificando migrações de banco de dados...');
  await runPendingMigrations();
  
  // Iniciar Sentinela de Manutenção
  if (sentinela.iniciar) sentinela.iniciar();
});
