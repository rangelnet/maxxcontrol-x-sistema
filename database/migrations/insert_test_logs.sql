-- Inserir logs de teste para verificar funcionamento do painel
INSERT INTO system_logs (tipo, descricao, severity, modelo, app_version) VALUES 
('AppSync', '✅ Teste de sincronização de apps', 'info', 'Test Device', '1.0.0'),
('AppSync', '✅ Sincronização concluída: 25 apps', 'info', 'Samsung TV', '1.0.0'),
('AppSync', '⚠️ Sincronização parcial: 15 apps', 'warning', 'Xiaomi Box', '1.0.0'),
('crash', '❌ Erro ao carregar player', 'error', 'LG TV', '1.0.0'),
('navigation', '🧭 Navegação para tela de configurações', 'info', 'Sony TV', '1.0.0'),
('api', '🔌 Erro ao conectar com API', 'error', 'Philips TV', '1.0.0');
