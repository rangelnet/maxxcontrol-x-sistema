-- Migration: Criar tabela de servidores para Playlist Manager
-- Data: Março 2026
-- Descrição: Tabela para armazenar servidores IPTV usados no Playlist Manager

CREATE TABLE IF NOT EXISTS playlist_servers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dns VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca rápida por nome
CREATE INDEX IF NOT EXISTS idx_playlist_servers_name ON playlist_servers(name);

-- Índice para busca rápida por DNS
CREATE INDEX IF NOT EXISTS idx_playlist_servers_dns ON playlist_servers(dns);

-- Comentários
COMMENT ON TABLE playlist_servers IS 'Servidores IPTV para cadastro em plataformas (SmartOne, IBOCast, IBOPro, VU Player)';
COMMENT ON COLUMN playlist_servers.name IS 'Nome do servidor (ex: Meggas, UltraFlex)';
COMMENT ON COLUMN playlist_servers.dns IS 'DNS do servidor (ex: ultraflex.top)';
