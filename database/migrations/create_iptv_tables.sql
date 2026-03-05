-- Criar tabela de configuração global do servidor IPTV
CREATE TABLE IF NOT EXISTS iptv_server_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  xtream_url TEXT NOT NULL,
  xtream_username TEXT NOT NULL,
  xtream_password TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Criar tabela de configuração IPTV por dispositivo
CREATE TABLE IF NOT EXISTS device_iptv_config (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL UNIQUE REFERENCES devices(id) ON DELETE CASCADE,
  xtream_url TEXT NOT NULL,
  xtream_username TEXT NOT NULL,
  xtream_password TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para busca rápida por device_id
CREATE INDEX IF NOT EXISTS idx_device_iptv_config_device_id ON device_iptv_config(device_id);

-- Adicionar colunas de cache na tabela devices (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='devices' AND column_name='current_iptv_server_url') THEN
    ALTER TABLE devices ADD COLUMN current_iptv_server_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='devices' AND column_name='current_iptv_username') THEN
    ALTER TABLE devices ADD COLUMN current_iptv_username TEXT;
  END IF;
END $$;
