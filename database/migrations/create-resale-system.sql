-- Sistema de Créditos e Revenda

-- Adicionar colunas na tabela users para sistema de revenda
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'usuario';
ALTER TABLE users ADD COLUMN IF NOT EXISTS creditos INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plano_revenda VARCHAR(20) DEFAULT 'bronze';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preco_credito DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS revendedor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Tabela de histórico de créditos
CREATE TABLE IF NOT EXISTS creditos_historico (
  id SERIAL PRIMARY KEY,
  revendedor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- 'recebido', 'usado', 'devolvido'
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de transações de créditos (envios do admin para revendedores)
CREATE TABLE IF NOT EXISTS creditos_transacoes (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  revendedor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de planos de revenda
CREATE TABLE IF NOT EXISTS planos_revenda (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  desconto_percentual INTEGER DEFAULT 0,
  creditos_minimos INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de alertas de créditos
CREATE TABLE IF NOT EXISTS creditos_alertas (
  id SERIAL PRIMARY KEY,
  revendedor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'credito_baixo', 'vencimento_proximo'
  mensagem TEXT NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs do sistema de revenda
CREATE TABLE IF NOT EXISTS revenda_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  acao VARCHAR(100) NOT NULL,
  detalhes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir planos padrão
INSERT INTO planos_revenda (nome, desconto_percentual, creditos_minimos) VALUES
  ('bronze', 0, 0),
  ('prata', 10, 100),
  ('ouro', 20, 500)
ON CONFLICT (nome) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_creditos_historico_revendedor ON creditos_historico(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_creditos_transacoes_revendedor ON creditos_transacoes(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_creditos_alertas_revendedor ON creditos_alertas(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_revenda_logs_user ON revenda_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_users_tipo ON users(tipo);
CREATE INDEX IF NOT EXISTS idx_users_revendedor ON users(revendedor_id);

-- Comentários
COMMENT ON COLUMN users.tipo IS 'Tipo de usuário: admin, revendedor, usuario';
COMMENT ON COLUMN users.creditos IS 'Saldo de créditos disponíveis';
COMMENT ON COLUMN users.plano_revenda IS 'Plano do revendedor: bronze, prata, ouro';
COMMENT ON COLUMN users.preco_credito IS 'Preço personalizado por crédito para este revendedor';
