# 🚀 CONFIGURAR RENDER - GUIA FINAL

## ⚠️ VOCÊ PRECISA DA SENHA DO BANCO

A connection string que você me enviou tem `[YOUR-PASSWORD]`.

Você precisa substituir isso pela senha real do banco de dados Supabase.

---

## 📋 ONDE ENCONTRAR A SENHA

1. Abra: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
2. Role até **"Connection string"**
3. Clique na aba **"URI"**
4. A string completa deve estar assim:

```
postgresql://postgres.mmfbirjrhrhobbnzfffe:[SENHA-AQUI]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**OU pode estar assim:**

```
postgresql://postgres:[SENHA-AQUI]@db.mmfbirjrhrhobbnzfffe.supabase.co:5432/postgres
```

5. **Copie a string COMPLETA** (com a senha já preenchida)
6. **Me envie aqui** para eu validar

---

## 🔑 ALTERNATIVA: RESETAR SENHA DO BANCO

Se você não sabe a senha:

1. Abra: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
2. Role até **"Database password"**
3. Clique em **"Reset database password"**
4. Copie a nova senha
5. Substitua `[YOUR-PASSWORD]` pela nova senha
6. Me envie a connection string completa

---

## 📝 DEPOIS QUE VOCÊ ME ENVIAR A DATABASE_URL

Vou criar um script para você copiar e colar direto no Render com TODAS as variáveis de ambiente prontas.

---

## 🚀 ME ENVIE AGORA

Cole aqui a connection string completa do Supabase (com a senha).

Exemplo do que eu preciso:
```
postgresql://postgres.mmfbirjrhrhobbnzfffe:SUA_SENHA_AQUI@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Ou:
```
postgresql://postgres:SUA_SENHA_AQUI@db.mmfbirjrhrhobbnzfffe.supabase.co:5432/postgres
```
