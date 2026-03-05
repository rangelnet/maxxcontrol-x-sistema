-- ============================================
-- INSERIR DISPOSITIVO DE TESTE NO PAINEL
-- ============================================
-- Execute este SQL no Supabase para criar um dispositivo de teste

-- 1. Inserir dispositivo de teste
INSERT INTO devices (
  mac_address,
  modelo,
  android_version,
  app_version,
  ip,
  status,
  connection_status,
  ultimo_acesso
) VALUES (
  'AA:BB:CC:DD:EE:FF',
  'TV Box Teste',
  '11.0',
  '1.0.0',
  '192.168.1.100',
  'ativo',
  'offline',
  NOW()
);

-- 2. Verificar se foi inserido
SELECT 
  id,
  mac_address,
  modelo,
  android_version,
  app_version,
  status,
  connection_status,
  ultimo_acesso
FROM devices
ORDER BY ultimo_acesso DESC;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Você deve ver uma linha com:
-- - mac_address: AA:BB:CC:DD:EE:FF
-- - modelo: TV Box Teste
-- - status: ativo
-- - connection_status: offline
--
-- Depois de executar, recarregue o painel!
-- ============================================
