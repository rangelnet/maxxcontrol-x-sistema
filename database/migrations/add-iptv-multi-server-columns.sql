-- Migration: Add IPTV Multi-Server Management columns to devices table
-- Description: Adiciona colunas para gerenciamento multi-servidor IPTV
-- Date: 2026-03-14

-- Adicionar novas colunas à tabela devices
ALTER TABLE devices ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS password VARCHAR(100);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS server VARCHAR(255);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS server_mode VARCHAR(10) DEFAULT 'auto';
ALTER TABLE devices ADD COLUMN IF NOT EXISTS api_test_url VARCHAR(500);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS ping INTEGER;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS quality VARCHAR(20);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_status VARCHAR(20);

-- Adicionar constraints CHECK
ALTER TABLE devices DROP CONSTRAINT IF EXISTS check_server_mode;
ALTER TABLE devices ADD CONSTRAINT check_server_mode 
  CHECK (server_mode IN ('auto', 'manual'));

ALTER TABLE devices DROP CONSTRAINT IF EXISTS check_quality;
ALTER TABLE devices ADD CONSTRAINT check_quality 
  CHECK (quality IN ('excelente', 'boa', 'regular', 'ruim') OR quality IS NULL);

ALTER TABLE devices DROP CONSTRAINT IF EXISTS check_stream_status;
ALTER TABLE devices ADD CONSTRAINT check_stream_status 
  CHECK (stream_status IN ('playing', 'buffering', 'error', 'stopped') OR stream_status IS NULL);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_devices_server_mode ON devices(server_mode);
CREATE INDEX IF NOT EXISTS idx_devices_stream_status ON devices(stream_status);

-- Comentários nas colunas
COMMENT ON COLUMN devices.username IS 'Username IPTV único do dispositivo';
COMMENT ON COLUMN devices.password IS 'Password IPTV do dispositivo';
COMMENT ON COLUMN devices.server IS 'URL do servidor IPTV atual';
COMMENT ON COLUMN devices.server_mode IS 'Modo de seleção de servidor: auto ou manual';
COMMENT ON COLUMN devices.api_test_url IS 'URL customizada para API de teste grátis';
COMMENT ON COLUMN devices.ping IS 'Tempo de resposta em milissegundos';
COMMENT ON COLUMN devices.quality IS 'Qualidade da conexão: excelente, boa, regular, ruim';
COMMENT ON COLUMN devices.stream_status IS 'Status do stream: playing, buffering, error, stopped';
