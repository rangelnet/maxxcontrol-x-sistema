-- Migration: Criar tabela de banners
-- Data: 2025-03-02
-- Descrição: Cria a tabela banners para armazenar banners gerados pelo sistema

-- Criar tabela banners se não existir
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  template VARCHAR(50),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_banners_type ON banners(type);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at DESC);

-- Comentários nas colunas
COMMENT ON TABLE banners IS 'Armazena banners gerados pelo sistema';
COMMENT ON COLUMN banners.type IS 'Tipo do banner (movie, series, football, etc)';
COMMENT ON COLUMN banners.title IS 'Título do banner';
COMMENT ON COLUMN banners.data IS 'Dados do banner em formato JSON';
COMMENT ON COLUMN banners.template IS 'Template usado para gerar o banner';
COMMENT ON COLUMN banners.image_url IS 'URL da imagem gerada';
