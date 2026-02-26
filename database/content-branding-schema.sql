-- Tabela de conteúdos (filmes e séries)
CREATE TABLE IF NOT EXISTS conteudos (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  titulo_original VARCHAR(255),
  descricao TEXT,
  poster_path VARCHAR(255),
  backdrop_path VARCHAR(255),
  nota NUMERIC(3,1),
  ano VARCHAR(10),
  generos TEXT[],
  duracao INTEGER,
  banner_app_url TEXT,
  banner_share_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de branding dinâmico
CREATE TABLE IF NOT EXISTS branding_settings (
  id SERIAL PRIMARY KEY,
  app_name VARCHAR(100) DEFAULT 'TV Maxx',
  logo_url TEXT,
  logo_dark_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#FF6A00',
  secondary_color VARCHAR(7) DEFAULT '#FF0000',
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#FFFFFF',
  accent_color VARCHAR(7) DEFAULT '#FFA500',
  splash_screen_url TEXT,
  hero_banner_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de templates de banner
CREATE TABLE IF NOT EXISTS banner_templates (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(20) NOT NULL,
  largura INTEGER NOT NULL,
  altura INTEGER NOT NULL,
  config JSONB,
  preview_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_conteudos_tmdb ON conteudos(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_conteudos_tipo ON conteudos(tipo);
CREATE INDEX IF NOT EXISTS idx_conteudos_ativo ON conteudos(ativo);

-- Inserir branding padrão
INSERT INTO branding_settings (
  app_name, 
  primary_color, 
  secondary_color, 
  background_color, 
  text_color,
  accent_color
) VALUES (
  'TV Maxx',
  '#FF6A00',
  '#FF0000',
  '#000000',
  '#FFFFFF',
  '#FFA500'
) ON CONFLICT DO NOTHING;

-- Inserir templates padrão
INSERT INTO banner_templates (nome, descricao, tipo, largura, altura, config) VALUES
('Banner App 16:9', 'Banner principal para o app', 'app', 1280, 720, '{"overlay": 0.6, "titleSize": 60, "ratingSize": 40}'),
('Banner Compartilhar 1:1', 'Banner quadrado para redes sociais', 'share', 1080, 1080, '{"posterSize": 480, "titleSize": 60}'),
('Banner Hero 21:9', 'Banner hero ultrawide', 'hero', 2560, 1080, '{"overlay": 0.5, "titleSize": 80}')
ON CONFLICT DO NOTHING;
