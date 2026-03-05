# ⚡ GUIA RÁPIDO: Unificar Serviços do Render

## 🎯 O QUE VAMOS FAZER

Deletar 1 serviço e deixar apenas 1 funcionando.

---

## 🗑️ PASSO 1: DELETAR SERVIÇO ANTIGO (2 minutos)

1. Acesse: https://dashboard.render.com
2. Clique em `sistema.maxxcontrol-x` (o que está com erro)
3. Settings → Role até o final
4. Clique em **"Delete Web Service"** (vermelho)
5. Digite o nome para confirmar
6. Delete

**Pronto! Agora você tem apenas 1 serviço.**

---

## ⚙️ PASSO 2: CONFIGURAR O SERVIÇO ÚNICO (5 minutos)

1. Clique em `maxxcontrol-x-sistema-1`
2. Vá em **Settings**

### Build & Deploy

```
Build Command: npm install && npm run build
Start Command: npm start
Environment: Node
```

### Environment Variables

Adicione estas 12 variáveis (copie e cole):

```
NODE_ENV=production
PORT=10000
USE_SQLITE=false
DATABASE_URL=[PEGAR DO SUPABASE]
SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMzM2MDAsImV4cCI6MjA1MDgwOTYwMH0.oUowKSGxGtxiy96we_bSvA_KZ-9aSROB
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTIzMzYwMCwiZXhwIjoyMDUwODA5NjAwfQ.placeholder
TMDB_API_KEY=7bc56e27708a9d2069fc999d44a6be0a
JWT_SECRET=maxxcontrol_x_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d
DEVICE_API_TOKEN=tvmaxx_device_api_token_2024_secure_key
WS_PORT=10000
```

**DATABASE_URL:** Pegue em https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database → Connection string → URI

---

## 🚀 PASSO 3: FAZER DEPLOY (3-5 minutos)

1. Clique em **"Save Changes"**
2. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
3. Aguarde aparecer "Live" (verde)

---

## ✅ PASSO 4: TESTAR (1 minuto)

Abra o console (F12) e execute:

```javascript
fetch('https://maxxcontrol-x-sistema-1.onrender.com/health')
  .then(r => r.json())
  .then(console.log);
```

**Deve retornar:**
```json
{ "status": "online", ... }
```

---

## 🎉 PRONTO!

Agora você tem:
- ✅ Apenas 1 serviço
- ✅ Commits vão direto
- ✅ Sem duplicação
- ✅ Tudo funcionando

**URL do seu painel:**
```
https://maxxcontrol-x-sistema-1.onrender.com
```

**Use sempre esta URL!**

---

## 💡 RESUMO VISUAL

```
ANTES:
┌─────────────────────────┐
│ sistema.maxxcontrol-x   │ ❌ Erro
└─────────────────────────┘
┌─────────────────────────┐
│ maxxcontrol-x-sistema-1 │ ❌ Offline
└─────────────────────────┘

DEPOIS:
┌─────────────────────────┐
│ maxxcontrol-x-sistema-1 │ ✅ Funcionando
└─────────────────────────┘
```

**Tempo total: ~10 minutos**

**Me avise quando terminar!**
