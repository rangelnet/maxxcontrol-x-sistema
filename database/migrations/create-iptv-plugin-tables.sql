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

-- Índices para performance
CREATE INDEX idx_iptv_servers_status ON iptv_servers(status);
CREATE INDEX idx_iptv_servers_type ON iptv_servers(server_type);
CREATE INDEX idx_iptv_playlists_server ON iptv_playlists(server_id);
CREATE INDEX idx_iptv_playlists_status ON iptv_playlists(status);
CREATE INDEX idx_device_iptv_sync_device ON device_iptv_sync(device_id);
CREATE INDEX idx_device_iptv_sync_server ON device_iptv_sync(server_id);
CREATE INDEX idx_device_iptv_sync_status ON device_iptv_sync(sync_status);
