# Executar Migração no Supabase

## Problema Identificado
A coluna `test_api_url` pode não estar na tabela `devices` do seu banco de dados.

## Solução: Executar Migração

### Passo 1: Abra o Supabase
1. Vá para https://supabase.com
2. Faça login
3. Selecione seu projeto MaxxControl

### Passo 2: Abra o SQL Editor
1. No menu esquerdo, clique em **SQL Editor**
2. Clique em **New Query**

### Passo 3: Cole este SQL
```sql
-- Adicionar coluna test_api_url na tabela devices
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS test_api_url TEXT;

-- Comentário da coluna
COMMENT ON COLUMN devices.test_api_url IS 'URL da API para gerar teste grátis';
```

### Passo 4: Execute
1. Clique em **Run** (ou Ctrl+Enter)
2. Você deve ver: "Success. No rows returned."

### Passo 5: Verifique a Tabela
1. Vá para **Table Editor**
2. Selecione a tabela **devices**
3. Procure pela coluna **test_api_url** (deve estar no final)

## Depois de Executar

1. Volte para o painel: https://maxxcontrol-frontend.onrender.com
2. Faça login
3. Vá para **Dispositivos**
4. Atualize a página (F5)
5. Seu dispositivo deve aparecer agora!

## Se Ainda Não Aparecer

Execute este SQL para verificar:
```sql
SELECT 
  id,
  mac_address,
  modelo,
  user_id,
  status,
  connection_status,
  ultimo_acesso
FROM devices
ORDER BY ultimo_acesso DESC
LIMIT 10;
```

Procure pelo MAC: `3C:E5:B4:1B:FB:1C`

Se aparecer, o problema é na página React. Se não aparecer, o app não registrou o dispositivo.
