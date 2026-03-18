-- Tabela para sistema de relay entre painel e plugins Chrome
-- O painel insere comandos, o plugin Chrome executa no qPanel e devolve o resultado

CREATE TABLE IF NOT EXISTS plugin_relay_commands (
  id SERIAL PRIMARY KEY,
  panel_id INTEGER REFERENCES qpanel_panels(id) ON DELETE CASCADE,
  command_type VARCHAR(50) NOT NULL, -- 'search_user', 'delete_user'
  payload JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, executing, done, error
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '5 minutes')
);

CREATE INDEX IF NOT EXISTS idx_relay_commands_status ON plugin_relay_commands(status);
CREATE INDEX IF NOT EXISTS idx_relay_commands_panel ON plugin_relay_commands(panel_id);
CREATE INDEX IF NOT EXISTS idx_relay_commands_expires ON plugin_relay_commands(expires_at);
