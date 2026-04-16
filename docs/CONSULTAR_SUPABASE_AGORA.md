# 🔍 CONSULTAR DISPOSITIVO NO SUPABASE

## PASSO 1: ACESSAR SUPABASE

```
https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe
```

---

## PASSO 2: ABRIR SQL EDITOR

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

---

## PASSO 3: EXECUTAR CONSULTA

Cole e execute este SQL:

```sql
-- Ver todos os dispositivos
SELECT 
  id,
  mac_address,
  modelo,
  android_version,
  app_version,
  ip,
  status,
  connection_status,
  user_id,
  ultimo_acesso,
  criado_em
FROM devices
ORDER BY criado_em DESC;
```

---

## ✅ RESULTADO ESPERADO

Você deve ver algo assim:

| id | mac_address | modelo | status | connection_status | user_id |
|----|-------------|--------|--------|-------------------|---------|
| 1  | 3C:E5:B4:18:FB:1C | (seu modelo) | ativo | offline | NULL |

---

## ❌ SE NÃO APARECER NADA

### Significa que o app NÃO registrou o dispositivo ainda

**Solução**:
1. Abra o app no dispositivo
2. O app registra automaticamente ao abrir
3. Aguarde 5 segundos
4. Execute a consulta SQL novamente

---

## 🔧 SE APARECER MAS NÃO TEM connection_status

Execute este SQL para adicionar a coluna:

```sql
-- Adicionar coluna connection_status
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS connection_status VARCHAR(20) DEFAULT 'offline';

-- Atualizar dispositivos existentes
UPDATE devices 
SET connection_status = 'offline' 
WHERE connection_status IS NULL;
```

---

## 📊 VERIFICAR ESTRUTURA DA TABELA

Execute este SQL:

```sql
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'devices'
ORDER BY ordinal_position;
```

### ✅ Colunas Esperadas
- id
- user_id
- mac_address
- modelo
- android_version
- app_version
- ip
- status
- connection_status ← **DEVE EXISTIR**
- ultimo_acesso
- criado_em

---

## 🎯 PRÓXIMO PASSO

Depois de confirmar que o dispositivo está no banco:

1. **Faça login no painel**: https://maxxcontrol-frontend.onrender.com/login
2. **Acesse Dispositivos**: https://maxxcontrol-frontend.onrender.com/devices
3. **Dispositivo deve aparecer na tabela**

---

**EXECUTE AGORA NO SUPABASE!** 🚀
