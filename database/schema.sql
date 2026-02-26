-- MaxxControl X - Database Schema

-- Tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  plano VARCHAR(50) DEFAULT 'free',
  status VARCHAR(20) DEFAULT 'ativo',
  expira_em TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de dispositivos (MAC)
CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mac_address VARCHAR(17) UNIQUE NOT NULL,
  modelo VARCHAR(100),
  android_version VARCHAR(20),
  app_version VARCHAR(20),
  ip VARCHAR(45),
  ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ativo'
);

-- Tabela de logs
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de bugs
CREATE TABLE bugs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
  stack_trace TEXT,
  modelo VARCHAR(100),
  app_version VARCHAR(20),
  resolvido BOOLEAN DEFAULT FALSE,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de versões do app
CREATE TABLE app_versions (
  id SERIAL PRIMARY KEY,
  versao VARCHAR(20) UNIQUE NOT NULL,
  obrigatoria BOOLEAN DEFAULT FALSE,
  link_download TEXT,
  mensagem TEXT,
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_devices_mac ON devices(mac_address);
CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_data ON logs(data);
CREATE INDEX idx_bugs_resolvido ON bugs(resolvido);
CREATE INDEX idx_users_email ON users(email);
