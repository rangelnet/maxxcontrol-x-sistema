# 🔗 PEGAR CONNECTION STRING DO SUPABASE

## ERRO ATUAL
```
❌ Erro ao conectar no banco de dados: Tenant or user not found
```

**Causa**: Senha do banco de dados está incorreta

---

## SOLUÇÃO: Pegar Connection String Correta

### PASSO 1: Acessar Configurações do Supabase
```
https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
```

### PASSO 2: Rolar até "Connection string"

Você verá algo assim:
```
Connection string
URI
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@[HOST]:5432/postgres
```

### PASSO 3: Copiar a Connection String

Clique em **"Copy"** ou selecione e copie a string completa.

Ela deve ser algo como:
```
postgresql://postgres.mmfbirjrhrhobbnzfffe:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**IMPORTANTE**: A senha está entre `:[` e `]@`

---

## PASSO 4: Configurar no Render

### 4.1 - Acessar Render
```
https://dashboard.render.com
```

### 4.2 - Selecionar Serviço
Clique em: **maxxcontrol-x-sistema**

### 4.3 - Ir para Environment
Menu lateral → **Environment**

### 4.4 - Editar DATABASE_URL

Procure a variável `DATABASE_URL` e clique em **Edit**

Cole a connection string que você copiou do Supabase.

### 4.5 - Salvar
Clique em **Save Changes**

---

## PASSO 5: Aguardar Redeploy

O Render vai fazer redeploy automaticamente (2-3 minutos)

---

## VERIFICAR SE DEU CERTO

Nos logs do Render, deve aparecer:

```
🐘 Usando PostgreSQL como banco de dados
✅ Banco de dados PostgreSQL conectado: 2026-02-28 ...
```

Em vez de:

```
❌ Erro ao conectar no banco de dados: Tenant or user not found
```

---

## ALTERNATIVA: Usar Variáveis Separadas

Se preferir, pode usar variáveis separadas no Render:

```
USE_SQLITE=false

DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.mmfbirjrhrhobbnzfffe
DB_PASSWORD=[COLE_A_SENHA_AQUI]
```

Para pegar a senha:
1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
2. Em "Database password", clique em "Reset database password"
3. Copie a nova senha
4. Cole no Render em `DB_PASSWORD`

---

## RESUMO

1. ✅ Acesse Supabase → Settings → Database
2. ✅ Copie Connection String
3. ✅ Cole no Render → Environment → DATABASE_URL
4. ✅ Salve e aguarde redeploy
5. ✅ Verifique logs

---

**EXECUTE AGORA!** 🚀
