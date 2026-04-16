# Como Executar a Migração no Supabase

## Passo a Passo

### 1. Acessar o Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **mmfbirjrhrhobbnzfffe**

### 2. Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** (Nova Consulta)

### 3. Executar o Script de Migração

Cole o seguinte SQL e clique em **RUN** (Executar):

```sql
-- Adicionar coluna connection_status na tabela devices
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS connection_status VARCHAR(20) DEFAULT 'offline';

-- Atualizar dispositivos existentes para offline
UPDATE devices 
SET connection_status = 'offline' 
WHERE connection_status IS NULL;

-- Verificar se funcionou
SELECT id, mac_address, modelo, status, connection_status 
FROM devices 
LIMIT 10;
```

### 4. Verificar o Resultado

Após executar, você deve ver:

```
✅ ALTER TABLE
✅ UPDATE X rows
✅ SELECT - Lista dos dispositivos com a nova coluna
```

### 5. Confirmar no Painel

1. Acesse: https://maxxcontrol-frontend.onrender.com/devices
2. Você deve ver a nova coluna **Conexão** na tabela
3. Todos os dispositivos devem aparecer como **OFFLINE** inicialmente

## Script Completo (Copiar e Colar)

```sql
-- ============================================
-- MIGRAÇÃO: Adicionar Status de Conexão
-- Data: 28/02/2026
-- Descrição: Adiciona coluna para rastrear 
--            se dispositivo está online/offline
-- ============================================

-- 1. Adicionar coluna
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS connection_status VARCHAR(20) DEFAULT 'offline';

-- 2. Atualizar registros existentes
UPDATE devices 
SET connection_status = 'offline' 
WHERE connection_status IS NULL;

-- 3. Criar índice para performance (opcional mas recomendado)
CREATE INDEX IF NOT EXISTS idx_devices_connection_status 
ON devices(connection_status);

-- 4. Verificar resultado
SELECT 
  COUNT(*) as total_devices,
  COUNT(CASE WHEN connection_status = 'online' THEN 1 END) as online,
  COUNT(CASE WHEN connection_status = 'offline' THEN 1 END) as offline
FROM devices;

-- 5. Listar alguns dispositivos
SELECT 
  id,
  mac_address,
  modelo,
  status,
  connection_status,
  ultimo_acesso
FROM devices 
ORDER BY ultimo_acesso DESC 
LIMIT 10;
```

## Troubleshooting

### Erro: "column already exists"

Se você já executou a migração antes, pode ignorar este erro. O `IF NOT EXISTS` previne erros de duplicação.

### Erro: "permission denied"

Certifique-se de estar usando o **service_role key** ou estar logado como admin no Supabase.

### Verificar se a coluna existe

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'devices'
AND column_name = 'connection_status';
```

Deve retornar:
```
column_name         | data_type        | column_default
--------------------+------------------+----------------
connection_status   | character varying| 'offline'::character varying
```

## Após a Migração

### Testar a API

```bash
# Testar atualização de status
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/mac/connection-status \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: tvmaxx_device_api_token_2024_secure_key" \
  -d '{
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "connection_status": "online"
  }'
```

### Verificar no Painel

1. Acesse: https://maxxcontrol-frontend.onrender.com/devices
2. Instale o app no TV Box
3. Abra o app → Deve aparecer OFFLINE
4. Faça login → Deve mudar para ONLINE
5. Feche o app → Deve voltar para OFFLINE

## Rollback (Se Necessário)

Se precisar reverter a migração:

```sql
-- Remover coluna
ALTER TABLE devices 
DROP COLUMN IF EXISTS connection_status;

-- Remover índice
DROP INDEX IF EXISTS idx_devices_connection_status;
```

## Informações do Banco

**Projeto Supabase:**
- URL: https://mmfbirjrhrhobbnzfffe.supabase.co
- Projeto ID: mmfbirjrhrhobbnzfffe

**Credenciais (do .env):**
```
SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY=sb_publishable_oUowKSGxGtxiy96we_bSvA_KZ-9aSROB
```

## Próximos Passos

Após executar a migração:

1. ✅ Migração executada no Supabase
2. ✅ Painel já está atualizado (commit 34148ed)
3. ⏳ Compilar novo APK do app
4. ⏳ Instalar no TV Box
5. ⏳ Testar fluxo completo

---

**Importante**: Execute a migração ANTES de testar o app, senão vai dar erro ao tentar atualizar o status!
