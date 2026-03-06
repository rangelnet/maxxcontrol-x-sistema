-- Criar tabela system_logs para logs do sistema (sem user_id)
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  modelo VARCHAR(100),
  app_version VARCHAR(20),
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_system_logs_tipo ON system_logs(tipo);
CREATE INDEX IF NOT EXISTS idx_system_logs_data ON system_logs(data DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_device_id ON system_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_severity ON system_logs(severity);
