-- ============================================
-- CRIAR DISPOSITIVO MANUALMENTE NO SUPABASE
-- Execute no SQL Editor
-- ============================================

-- 1. VER SE JÁ TEM DISPOSITIVOS
SELECT 
  id,
  mac_address,
  modelo,
  status,
  connection_status,
  user_id,
  criado_em
FROM devices
ORDER BY criado_em DESC;

-- ============================================
-- SE NÃO APARECER NADA, EXECUTE ABAIXO:
-- ============================================

-- 2. CRIAR DISPOSITIVO MANUALMENTE
INSERT INTO devices (
  mac_address,
  modelo,
  android_version,
  app_version,
  ip,
  status,
  connection_status,
  user_id,
  ultimo_acesso
) VALUES (
  '3C:E5:B4:18:FB:1C',
  'Android TV Box',
  '11.0',
  '1.0.0',
  '192.168.1.100',
  'ativo',
  'offline',
  NULL,
  CURRENT_TIMESTAMP
)
ON CONFLICT (mac_address) DO UPDATE
SET 
  ultimo_acesso = CURRENT_TIMESTAMP,
  status = 'ativo',
  connection_status = 'offline';

-- 3. VERIFICAR SE FOI CRIADO
SELECT 
  id,
  mac_address,
  modelo,
  android_version,
  status,
  connection_status,
  ultimo_acesso
FROM devices
WHERE mac_address = '3C:E5:B4:18:FB:1C';

-- ============================================
-- RESULTADO ESPERADO:
-- Deve aparecer 1 linha com:
-- - mac_address: 3C:E5:B4:18:FB:1C
-- - status: ativo
-- - connection_status: offline
-- ============================================

-- 4. VER TODOS OS DISPOSITIVOS
SELECT COUNT(*) as total_dispositivos FROM devices;

-- ============================================
-- PRONTO! Agora acesse o painel:
-- https://maxxcontrol-frontend.onrender.com/devices
-- 
-- Faça login com:
-- Email: admin@maxxcontrol.com
-- Senha: Admin@123
-- 
-- O dispositivo deve aparecer na tabela!
-- ============================================
