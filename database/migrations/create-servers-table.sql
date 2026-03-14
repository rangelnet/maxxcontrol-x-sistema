-- Migration: Create servers table for IPTV Multi-Server Management
-- Description: Cria tabela para gerenciar múltiplos servidores IPTV
-- Date: 2026-03-14

-- Criar tabela servers
CREATE TABLE IF NOT EXISTS servers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(255) UNIQUE NOT NULL,
  region VARCHAR(50),
  priority INTEGER DEFAULT 100,
  status VARCHAR(20) DEFAULT 'ativo',
  users INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar constraint CHECK para status
ALTER TABLE servers DROP CONSTRAINT IF EXISTS check_server_status;
ALTER TABLE servers ADD CONSTRAINT check_server_status 
  CHECK (status IN ('ativo', 'manutenção', 'inativo'));

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_priority ON servers(priority);

-- Comentários nas colunas
COMMENT ON TABLE servers IS 'Servidores IPTV disponíveis para os dispositivos';
COMMENT ON COLUMN servers.name IS 'Nome do servidor IPTV';
COMMENT ON COLUMN servers.url IS 'URL do servidor IPTV (deve ser única)';
COMMENT ON COLUMN servers.region IS 'Região geográfica do servidor';
COMMENT ON COLUMN servers.priority IS 'Prioridade do servidor (menor = maior prioridade)';
COMMENT ON COLUMN servers.status IS 'Status do servidor: ativo, manutenção, inativo';
COMMENT ON COLUMN servers.users IS 'Contagem de dispositivos usando este servidor';
COMMENT ON COLUMN servers.created_at IS 'Data de criação do servidor';

-- Inserir dados iniciais de 3 servidores
INSERT INTO servers (name, url, region, priority, status) VALUES
  ('Servidor Brasil', 'http://servidor1.exemplo.com:8080', 'Brasil', 1, 'ativo'),
  ('Servidor EUA', 'http://servidor2.exemplo.com:8080', 'EUA', 2, 'ativo'),
  ('Servidor Europa', 'http://servidor3.exemplo.com:8080', 'Europa', 3, 'ativo')
ON CONFLICT (url) DO NOTHING;
