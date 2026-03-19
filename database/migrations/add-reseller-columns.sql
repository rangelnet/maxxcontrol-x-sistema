-- Adicionar colunas extras para revendedores na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS empresa VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS limite_dispositivos INTEGER DEFAULT 10;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar coluna revendedor_id em devices se não existir
ALTER TABLE devices ADD COLUMN IF NOT EXISTS revendedor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Índice para busca por revendedor em devices
CREATE INDEX IF NOT EXISTS idx_devices_revendedor ON devices(revendedor_id);
