# Executar Migration SQL - Sistema de Monitoramento de Crashes

## Passo 1: Executar a Migration no Banco de Dados

A migration SQL já foi criada em:
```
MaxxControl/maxxcontrol-x-sistema/database/migrations/add_bug_severity_type.sql
```

### Como Executar:

#### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de banco de dados no menu lateral)
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `add_bug_severity_type.sql`:

```sql
-- Migration: Add severity, type and context fields to bugs table
-- Date: 2024
-- Description: Extends bugs table to support crash monitoring system with severity levels, error types, and context data

-- Add new columns
ALTER TABLE bugs 
ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'error',
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'crash',
ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::jsonb;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_type ON bugs(type);
CREATE INDEX IF NOT EXISTS idx_bugs_resolvido ON bugs(resolvido);

-- Add constraints to validate values
ALTER TABLE bugs 
ADD CONSTRAINT check_severity 
CHECK (severity IN ('critical', 'error', 'warning'));

ALTER TABLE bugs 
ADD CONSTRAINT check_type 
CHECK (type IN ('crash', 'navigation', 'player', 'api', 'ui', 'network'));

-- Update existing bugs with default values
UPDATE bugs 
SET severity = 'error', type = 'crash', context = '{}'::jsonb 
WHERE severity IS NULL OR type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN bugs.severity IS 'Error severity level: critical, error, or warning';
COMMENT ON COLUMN bugs.type IS 'Error type: crash, navigation, player, api, ui, or network';
COMMENT ON COLUMN bugs.context IS 'Additional context data as JSON (screen, action, memory, etc)';
```

6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Verifique se a mensagem "Success. No rows returned" aparece

#### Opção 2: Via psql (Terminal)

Se você tem acesso direto ao PostgreSQL:

```bash
# Conectar ao banco
psql -h [SEU_HOST] -U [SEU_USUARIO] -d [SEU_DATABASE]

# Executar a migration
\i MaxxControl/maxxcontrol-x-sistema/database/migrations/add_bug_severity_type.sql
```

#### Opção 3: Via DBeaver ou outro cliente SQL

1. Conecte-se ao banco de dados PostgreSQL
2. Abra o arquivo `add_bug_severity_type.sql`
3. Execute o script completo

### Verificar se a Migration foi Executada com Sucesso

Execute esta query para verificar as novas colunas:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bugs' 
AND column_name IN ('severity', 'type', 'context');
```

Você deve ver:
```
column_name | data_type         | column_default
------------|-------------------|------------------
severity    | character varying | 'error'::character varying
type        | character varying | 'crash'::character varying
context     | jsonb             | '{}'::jsonb
```

### Verificar os Índices

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'bugs' 
AND indexname IN ('idx_bugs_severity', 'idx_bugs_type', 'idx_bugs_resolvido');
```

### Verificar as Constraints

```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'bugs'::regclass 
AND conname IN ('check_severity', 'check_type');
```

## Passo 2: Reiniciar o Backend Node.js

Após executar a migration, reinicie o servidor backend para aplicar as mudanças no bugsController:

```bash
cd MaxxControl/maxxcontrol-x-sistema
npm start
```

Ou se estiver usando PM2:
```bash
pm2 restart maxxcontrol
```

## Passo 3: Testar o Endpoint

Teste o endpoint POST /api/bug com os novos campos:

```bash
curl -X POST http://localhost:3000/api/bug \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "stack_trace": "Test error stack trace",
    "modelo": "Test Device",
    "app_version": "1.0.0",
    "device_id": "test-device-123",
    "severity": "error",
    "type": "crash",
    "context": {
      "screenName": "HomeScreen",
      "userAction": "button_click",
      "memoryUsage": "150MB",
      "cpuUsage": "25%"
    }
  }'
```

Resposta esperada:
```json
{
  "bug": {
    "id": 1,
    "severity": "error",
    "type": "crash",
    "context": {
      "screenName": "HomeScreen",
      "userAction": "button_click",
      "memoryUsage": "150MB",
      "cpuUsage": "25%"
    },
    ...
  },
  "message": "Bug reportado"
}
```

## Passo 4: Verificar no Painel Web

1. Acesse o painel: http://localhost:5173 (ou sua URL de produção)
2. Faça login
3. Vá para a página **Logs** (menu lateral)
4. Verifique se a aba **Bugs** está funcionando
5. Teste os filtros de **Severity** e **Type**

## Status da Migration

✅ Migration SQL criada
⏳ Aguardando execução no banco de dados
⏳ Aguardando reinício do backend
⏳ Aguardando testes

## Próximos Passos

Após executar a migration:
1. ✅ Compilar o app Android
2. ✅ Gerar um erro de teste no app
3. ✅ Verificar armazenamento local (Database Inspector)
4. ✅ Aguardar sincronização (15 minutos ou forçar manualmente)
5. ✅ Verificar no painel web que o erro aparece

---

**Nota**: A migration é segura e usa `IF NOT EXISTS` para evitar erros se já foi executada anteriormente.
