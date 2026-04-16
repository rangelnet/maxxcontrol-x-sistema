# 🔑 RESETAR SENHA DO BANCO - PASSO A PASSO

## ⚠️ PROBLEMA ATUAL
```
❌ Erro ao conectar no banco de dados: Tenant or user not found
```

**A senha `Maxx@146390` NÃO está funcionando!**

---

## 📋 SOLUÇÃO EM 4 PASSOS

### PASSO 1: Abrir Configurações do Banco no Supabase

1. **Clique neste link**: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database

2. **Faça login** se necessário

3. **Role a página** até encontrar a seção **"Database password"**

---

### PASSO 2: Resetar a Senha

1. **Clique** no botão **"Reset database password"**

2. **IMPORTANTE**: Uma nova senha será gerada automaticamente

3. **COPIE** a senha que aparece na tela (ela só aparece UMA VEZ!)

4. **Cole** a senha em um bloco de notas temporário

---

### PASSO 3: Copiar Connection String Completa

1. Na mesma página, **role até** a seção **"Connection string"**

2. **Selecione** a aba **"URI"**

3. **Copie** a connection string completa

Ela será algo como:
```
postgresql://postgres.mmfbirjrhrhobbnzfffe:[SUA-NOVA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**OU**

```
postgresql://postgres:[SUA-NOVA-SENHA]@db.mmfbirjrhrhobbnzfffe.supabase.co:5432/postgres
```

**IMPORTANTE**: A senha já vem codificada corretamente na string!

---

### PASSO 4: Configurar no Render

1. **Abra**: https://dashboard.render.com

2. **Clique** no serviço: **maxxcontrol-x-sistema**

3. **Clique** em **"Environment"** no menu lateral esquerdo

4. **Procure** a variável **DATABASE_URL**

5. **Clique** em **"Edit"** (ícone de lápis)

6. **Cole** a connection string que você copiou do Supabase

7. **Clique** em **"Save Changes"**

---

## ⏳ AGUARDAR REDEPLOY

O Render vai fazer redeploy automaticamente (2-3 minutos)

Você verá nos logs:
```
==> Deploying...
==> Running 'node server.js'
🐘 Usando PostgreSQL como banco de dados
```

---

## ✅ VERIFICAR SE DEU CERTO

Nos logs do Render, deve aparecer:

```
✅ Banco de dados PostgreSQL conectado: 2026-02-28 ...
```

**SEM** o erro:
```
❌ Erro ao conectar no banco de dados: Tenant or user not found
```

---

## 🎯 DEPOIS QUE CONECTAR

1. **Acesse**: https://maxxcontrol-frontend.onrender.com/login

2. **Faça login**:
   - Email: `admin@maxxcontrol.com`
   - Senha: `Admin@123`

3. **Vá em**: Dispositivos

4. **Verifique** se o dispositivo `3C:E5:B4:18:FB:1C` aparece na lista

---

## 🆘 SE NÃO FUNCIONAR

Me envie:
1. A connection string que você copiou do Supabase (pode ocultar a senha)
2. Os últimos logs do Render após o redeploy

---

**COMECE AGORA PELO PASSO 1!** 🚀
