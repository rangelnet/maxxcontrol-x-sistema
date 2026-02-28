-- Adicionar coluna test_api_url na tabela devices
-- Esta coluna armazena a URL da API de teste grátis específica para cada dispositivo

ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS test_api_url TEXT;

-- Comentário da coluna
COMMENT ON COLUMN devices.test_api_url IS 'URL da API para gerar teste grátis (ex: https://painel.masterbins.com/api/chatbot/...)';
