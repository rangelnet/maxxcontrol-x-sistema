-- Migration: Create Google Integration Configs Table
-- Date: 2026-04-14

CREATE TABLE IF NOT EXISTS google_configs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  expiry_date BIGINT,
  drive_folder_id VARCHAR(255),
  contacts_sync_at TIMESTAMP,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna source em whatsapp_conversations para identificar origem
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'whatsapp_conversations'::regclass AND attname = 'source') THEN
        ALTER TABLE whatsapp_conversations ADD COLUMN source VARCHAR(50) DEFAULT 'direct';
    END IF;
END $$;
