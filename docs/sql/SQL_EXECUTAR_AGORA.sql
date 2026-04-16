-- Adicionar coluna test_api_url na tabela devices
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS test_api_url TEXT;

-- Comentário da coluna
COMMENT ON COLUMN devices.test_api_url IS 'URL da API para gerar teste grátis';
