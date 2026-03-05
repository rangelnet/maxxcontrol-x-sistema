# 🔗 CONNECTION STRING CORRETA (COM SENHA CODIFICADA)

## PROBLEMA
A senha `Maxx@146390` tem o caractere `@` que precisa ser codificado na URL.

## SENHA ORIGINAL
```
Maxx@146390
```

## SENHA CODIFICADA (URL ENCODED)
```
Maxx%40146390
```

O `@` vira `%40` na URL.

---

## CONNECTION STRING CORRETA

### Opção 1: Connection String Completa (RECOMENDADO)
```
postgresql://postgres.mmfbirjrhrhobbnzfffe:Maxx%40146390@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Opção 2: Variáveis Separadas
```
USE_SQLITE=false
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.mmfbirjrhrhobbnzfffe
DB_PASSWORD=Maxx@146390
```
(Nas variáveis separadas, NÃO precisa codificar)

---

## CONFIGURAR NO RENDER

### 1. Acessar
```
https://dashboard.render.com
```

### 2. Serviço
Clique em: **maxxcontrol-x-sistema**

### 3. Environment
Menu lateral → **Environment**

### 4. Editar DATABASE_URL
Cole esta string (COM %40):
```
postgresql://postgres.mmfbirjrhrhobbnzfffe:Maxx%40146390@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 5. Salvar
**Save Changes**

---

## ALTERNATIVA: PEGAR DO SUPABASE

Se ainda não funcionar, pegue a connection string diretamente do Supabase:

1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
2. Role até "Connection string"
3. Selecione "URI"
4. Clique em "Copy"
5. Cole no Render

A string do Supabase já vem com a senha codificada corretamente.

---

## VERIFICAR

Logs devem mostrar:
```
🐘 Usando PostgreSQL como banco de dados
✅ Banco de dados PostgreSQL conectado
```

---

**USE A STRING COM %40 NO LUGAR DO @!** 🚀
