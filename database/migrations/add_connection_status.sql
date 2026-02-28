-- Adicionar coluna connection_status na tabela devices
-- Executar este script no banco de dados de produção

ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS connection_status VARCHAR(20) DEFAULT 'offline';

-- Atualizar dispositivos existentes para offline
UPDATE devices 
SET connection_status = 'offline' 
WHERE connection_status IS NULL;

-- Comentário: 
-- connection_status pode ser: 'offline', 'online'
-- Diferente de 'status' que é: 'ativo', 'bloqueado'
