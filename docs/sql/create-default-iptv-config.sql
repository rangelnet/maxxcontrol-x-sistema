-- Criar configuração IPTV padrão
INSERT INTO iptv_server_config (id, xtream_url, xtream_username, xtream_password, updated_at)
VALUES (1, '', '', '', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar se foi criado
SELECT * FROM iptv_server_config;