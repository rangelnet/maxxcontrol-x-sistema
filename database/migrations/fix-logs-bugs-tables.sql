-- Migration: Fix Logs & Bugs Tables
-- Cria tabela system_logs e adiciona colunas faltantes em bugs

-- Criar tabela system_logs para logs do sistema (sem user_id obrigatório)
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  modelo VARCHAR(100),
  app_version VARCHAR(20),
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhorar performance de system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_tipo ON system_logs(tipo);
CREATE INDEX IF NOT EXISTS idx_system_logs_data ON system_logs(data DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_device_id ON system_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_severity ON system_logs(severity);

-- Adicionar colunas faltantes na tabela bugs
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'error';
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'crash';
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}';
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';

-- Criar índices para as novas colunas de bugs
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_type ON bugs(type);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
