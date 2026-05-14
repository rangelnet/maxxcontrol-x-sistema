-- ============================================================
-- TV MAXX PRO — Profile Backgrounds (Controle via Painel)
-- Permite que o admin gerencie fundos da tela de Perfis
-- ============================================================

-- Tabela de imagens de fundo
CREATE TABLE IF NOT EXISTS profile_backgrounds (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  title VARCHAR(255) DEFAULT '',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Configuração global do slideshow de perfis (1 registro)
CREATE TABLE IF NOT EXISTS profile_screen_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  slide_interval_ms INTEGER DEFAULT 5000,
  use_tmdb BOOLEAN DEFAULT TRUE,
  tmdb_position VARCHAR(20) DEFAULT 'mixed',
  max_backgrounds INTEGER DEFAULT 20,
  atualizado_em TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_profile_config CHECK (id = 1)
);

-- Seed da configuração padrão
INSERT INTO profile_screen_config (id, slide_interval_ms, use_tmdb, tmdb_position, max_backgrounds)
VALUES (1, 5000, TRUE, 'mixed', 20)
ON CONFLICT (id) DO NOTHING;
