-- Tabela para configuração de APIs
CREATE TABLE IF NOT EXISTS api_configs (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  url VARCHAR(500) NOT NULL,
  categoria VARCHAR(50),
  critica BOOLEAN DEFAULT FALSE,
  ativa BOOLEAN DEFAULT TRUE,
  metodo VARCHAR(10) DEFAULT 'GET',
  headers JSONB,
  timeout INTEGER DEFAULT 5000,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para histórico de status das APIs
CREATE TABLE IF NOT EXISTS api_status_history (
  id SERIAL PRIMARY KEY,
  api_config_id INTEGER REFERENCES api_configs(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  status_code INTEGER,
  latencia INTEGER,
  erro TEXT,
  verificado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_configs_ativa ON api_configs(ativa);
CREATE INDEX IF NOT EXISTS idx_api_configs_categoria ON api_configs(categoria);
CREATE INDEX IF NOT EXISTS idx_api_status_history_api ON api_status_history(api_config_id);
CREATE INDEX IF NOT EXISTS idx_api_status_history_data ON api_status_history(verificado_em);

-- Inserir APIs padrão do TV-MAXX
INSERT INTO api_configs (nome, descricao, url, categoria, critica) VALUES
('Auth API', 'API de autenticação principal', 'https://auth.novomundo.live/v1/', 'autenticacao', true),
('Painel API', 'API do painel de controle', 'https://painel.tvmaxx.pro/api/', 'painel', true),
('Cache API', 'API de cache e CDN', 'https://api1.novomundo.live/cache/', 'cache', true),
('TMDB API', 'The Movie Database - Filmes e Séries', 'https://api.themoviedb.org/3/', 'conteudo', false),
('SportsData MMA', 'API de dados de MMA', 'https://api.sportsdata.io/v3/mma/', 'esportes', false),
('SportsData Soccer', 'API de dados de Futebol', 'https://api.sportsdata.io/v3/soccer/', 'esportes', false),
('Meteoblue', 'API de previsão do tempo', 'https://my.meteoblue.com/packages/', 'clima', false),
('Chatbot API', 'API do chatbot de suporte', 'https://painel.masterbins.com/api/chatbot/bOxLAQLZ7a/ANKWPKDPRq', 'suporte', false)
ON CONFLICT DO NOTHING;
