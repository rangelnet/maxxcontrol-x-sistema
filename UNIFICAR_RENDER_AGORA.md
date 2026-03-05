# 🎯 UNIFICAR SERVIÇOS RENDER - PASSO A PASSO

## ⚠️ SITUAÇÃO ATUAL

Você tem 2 serviços no Render:
- ❌ `sistema.maxxcontrol-x` - Status: "Implantação falhou" (erro no build)
- ⚠️ `maxxcontrol-x-sistema-1` - Status: "Não" (offline)

**PROBLEMA:** Quando você faz commit, os 2 tentam fazer deploy e dá erro.

**SOLUÇÃO:** Deletar o serviço com erro e configurar apenas 1 serviço.

---

## 📋 PASSO 1: DELETAR SERVIÇO COM ERRO

1. Abra: https://dashboard.render.com
2. Você verá os 2 serviços na lista
3. Clique em **`sistema.maxxcontrol-x`** (o que está com erro vermelho)
4. No menu lateral esquerdo → **"Settings"**
5. Role ATÉ O FINAL da página
6. Botão vermelho: **"Delete Web Service"**
7. Digite para confirmar: `sistema.maxxcontrol-x`
8. Clique em **"Delete"**

✅ **ME AVISE QUANDO DELETAR!**

---

## 📋 PASSO 2: CONFIGURAR O SERVIÇO ÚNICO

1. Volte para a lista de serviços
2. Clique em **`maxxcontrol-x-sistema-1`**
3. Clique em **"Settings"** (menu lateral)

### 2A - Build & Deploy

Role até **"Build & Deploy"** e configure:

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Root Directory:**
```
maxxcontrol-x-sistema
```

**Environment:**
```
Node
```

Clique em **"Save Changes"**

✅ **ME AVISE QUANDO SALVAR!**

---

## 📋 PASSO 3: VARIÁVEIS DE AMBIENTE

Ainda em Settings, role até **"Environment Variables"**

Clique em **"Add Environment Variable"** para cada uma:

### Copie e cole TODAS de uma vez:

```
NODE_ENV=production
PORT=10000
USE_SQLITE=false
SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMzM2MDAsImV4cCI6MjA1MDgwOTYwMH0.oUowKSGxGtxiy96we_bSvA_KZ-9aSROB
TMDB_API_KEY=7bc56e27708a9d2069fc999d44a6be0a
JWT_SECRET=maxxcontrol_x_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d
DEVICE_API_TOKEN=tvmaxx_device_api_token_2024_secure_key
WS_PORT=10000
```

### ⚠️ FALTAM 2 VARIÁVEIS IMPORTANTES:

**DATABASE_URL** - Você precisa pegar do Supabase:
1. Abra: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
2. Role até "Connection string"
3. Clique na aba **"URI"**
4. Copie a string completa (começa com `postgresql://`)
5. Adicione no Render:
```
DATABASE_URL=[COLE AQUI A STRING DO SUPABASE]
```

**SUPABASE_SERVICE_KEY** - Pegar do Supabase:
1. Abra: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/api
2. Role até "Project API keys"
3. Copie a chave **"service_role"** (clique no ícone de olho para ver)
4. Adicione no Render:
```
SUPABASE_SERVICE_KEY=[COLE AQUI A SERVICE KEY]
```

Clique em **"Save Changes"**

✅ **ME AVISE QUANDO SALVAR TODAS!**

---

## 📋 PASSO 4: FAZER DEPLOY

1. No topo da página → botão azul **"Manual Deploy"**
2. Selecione **"Deploy latest commit"**
3. Aguarde 3-5 minutos
4. Acompanhe os logs

**Você deve ver:**
```
Building...
npm install
npm run build
Starting service...
🚀 MaxxControl X API rodando na porta 10000
✅ Banco de dados PostgreSQL conectado
```

✅ **ME AVISE QUANDO TERMINAR!**

Se der erro, me envie a mensagem!

---

## 📋 PASSO 5: TESTAR

Quando o status ficar **"Live"** (verde):

1. Abra: https://maxxcontrol-x-sistema-1.onrender.com
2. Pressione **F12** (console do navegador)
3. Cole e execute:

```javascript
fetch('https://maxxcontrol-x-sistema-1.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Deve aparecer:**
```json
{
  "status": "online",
  "timestamp": "...",
  "service": "MaxxControl X API"
}
```

✅ **ME DIGA O RESULTADO!**

---

## 🎉 PRONTO!

Agora você tem apenas 1 serviço configurado corretamente!

**URL do painel:**
```
https://maxxcontrol-x-sistema-1.onrender.com
```

---

## 🚀 COMECE AGORA PELO PASSO 1!

Me avise quando completar cada passo ou se tiver qualquer dúvida!
