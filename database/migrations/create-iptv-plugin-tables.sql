-- ============================================
-- TABELAS PARA PLUGIN IPTV UNIFICADO
-- ============================================

-- Tabela de Servidores IPTV
CREATE TABLE IF NOT EXISTS iptv_servers (
  id SERIAL PRIMARY KEY,
  server_name VARCHAR(255) NOT NULL,
  xtream_url VARCHAR(500) NOT NULL UNIQUE,
  xtream_username VARCHAR(255),
  xtream_password VARCHAR(255),
  server_type VARCHAR(50) DEFAULT 'custom', -- 'ibopro', 'ibocast', 'vuplayer', 'custom'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'deleted'
  last_tested_at TIMESTAMP,
  test_status VARCHAR(50), -- 'online', 'offline'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Playlists
CREATE TABLE IF NOT EXISTS iptv_playlists (
  id SERIAL PRIMARY KEY,
  server_id INTEGER NOT NULL REFERENCES iptv_servers(id) ON DELETE CASCADE,
  playlist_name VARCHAR(255) NOT NULL,
  playlist_url VARCHAR(500) NOT NULL,
  playlist_type VARCHAR(50) DEFAULT 'custom', -- 'm3u', 'xtream', 'custom'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'deleted'
  channels_count INTEGER DEFAULT 0,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Sincronização de Dispositivos
CREATE TABLE IF NOT EXISTS device_iptv_sync (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  server_id INTEGER NOT NULL REFERENCES iptv_servers(id) ON DELETE CASCADE,
  playlist_id INTEGER REFERENCES iptv_playlists(id) ON DELETE SET NULL,
  sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'syncing', 'synced', 'failed'
  last_sync_at TIMESTAMP,
  sync_error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELAS PARA QPANEL INTEGRATION (Plugin 3)
-- ============================================

-- Tabela de Painéis qPanel
CREATE TABLE IF NOT EXISTS qpanel_panels (
  id SERIAL PRIMARY KEY,
  panel_name VARCHAR(255) NOT NULL,
  panel_url VARCHAR(500) NOT NULL UNIQUE,
  panel_username VARCHAR(255),
  panel_password VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'deleted'
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Servidores carregados dos painéis qPanel
CREATE TABLE IF NOT EXISTS qpanel_servers (
  id SERIAL PRIMARY KEY,
  panel_id INTEGER NOT NULL REFERENCES qpanel_panels(id) ON DELETE CASCADE,
  server_name VARCHAR(255) NOT NULL,
  server_dns VARCHAR(255) NOT NULL,
  server_data JSONB, -- Dados completos do servidor (pacotes, etc)
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(panel_id, server_name)
);

-- Tabela de Contas IPTV criadas via qPanel
CREATE TABLE IF NOT EXISTS qpanel_accounts (
  id SERIAL PRIMARY KEY,
  panel_id INTEGER NOT NULL REFERENCES qpanel_panels(id) ON DELETE CASCADE,
  server_id INTEGER NOT NULL,
  package_id INTEGER NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  device_mac VARCHAR(17) NOT NULL, -- MAC do dispositivo TV MAXX PRO
  m3u_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'suspended'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Registros DNS (substitui SmartOne)
-- Integra direto com o app TV MAXX PRO
CREATE TABLE IF NOT EXISTS smartone_registrations (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  device_mac VARCHAR(17) NOT NULL,
  server_name VARCHAR(255) NOT NULL,
  dns VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  m3u_url VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(device_mac, dns)
);

-- Índices para performance (com IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_iptv_servers_status ON iptv_servers(status);
CREATE INDEX IF NOT EXISTS idx_iptv_servers_type ON iptv_servers(server_type);
CREATE INDEX IF NOT EXISTS idx_iptv_playlists_server ON iptv_playlists(server_id);
CREATE INDEX IF NOT EXISTS idx_iptv_playlists_status ON iptv_playlists(status);
CREATE INDEX IF NOT EXISTS idx_device_iptv_sync_device ON device_iptv_sync(device_id);
CREATE INDEX IF NOT EXISTS idx_device_iptv_sync_server ON device_iptv_sync(server_id);
CREATE INDEX IF NOT EXISTS idx_device_iptv_sync_status ON device_iptv_sync(sync_status);

-- Índices para qPanel (com IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_qpanel_panels_status ON qpanel_panels(status);
CREATE INDEX IF NOT EXISTS idx_qpanel_servers_panel ON qpanel_servers(panel_id);
CREATE INDEX IF NOT EXISTS idx_qpanel_servers_status ON qpanel_servers(status);
CREATE INDEX IF NOT EXISTS idx_qpanel_accounts_panel ON qpanel_accounts(panel_id);
CREATE INDEX IF NOT EXISTS idx_qpanel_accounts_device ON qpanel_accounts(device_mac);
CREATE INDEX IF NOT EXISTS idx_smartone_registrations_device ON smartone_registrations(device_mac);
CREATE INDEX IF NOT EXISTS idx_smartone_registrations_status ON smartone_registrations(status);
