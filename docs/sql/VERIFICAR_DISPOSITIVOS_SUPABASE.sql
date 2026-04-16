-- ============================================
-- EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================

-- 1. Verificar dispositivos e seus status
SELECT 
  id,
  mac_address,
  modelo,
  status,
  connection_status,
  ultimo_acesso
FROM devices
ORDER BY id;

-- 2. Contar dispositivos por status
SELECT 
  status,
  COUNT(*) as total
FROM devices
GROUP BY status;

-- 3. Verificar se a coluna connection_status existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'devices'
ORDER BY ordinal_position;
