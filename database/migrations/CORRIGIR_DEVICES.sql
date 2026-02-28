-- ============================================
-- CORRIGIR TABELA DEVICES - EXECUTE NO SUPABASE
-- ============================================

-- 1. Adicionar coluna connection_status (se não existir)
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS connection_status VARCHAR(20) DEFAULT 'offline';

-- 2. Atualizar dispositivos existentes para offline
UPDATE devices 
SET connection_status = 'offline' 
WHERE connection_status IS NULL;

-- 3. Verificar estrutura da tabela
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'devices'
ORDER BY ordinal_position;

-- 4. Ver dispositivos registrados
SELECT 
  id,
  mac_address,
  modelo,
  status,
  connection_status,
  ultimo_acesso,
  criado_em
FROM devices
ORDER BY criado_em DESC;

-- ============================================
-- RESULTADO ESPERADO:
-- - Coluna connection_status deve existir
-- - Todos os devices devem ter connection_status = 'offline'
-- ============================================
