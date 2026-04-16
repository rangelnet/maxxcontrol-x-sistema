-- Verificar status de todos os dispositivos
-- Execute este SQL no Supabase SQL Editor

SELECT 
  id,
  mac_address,
  modelo,
  status,
  connection_status,
  CASE 
    WHEN status = 'ativo' THEN '🔴 Deve mostrar botão BLOQUEAR'
    ELSE '🟢 Deve mostrar botão DESBLOQUEAR'
  END as botao_esperado
FROM devices
ORDER BY id;
