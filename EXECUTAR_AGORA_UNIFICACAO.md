# ⚡ EXECUTAR AGORA: Unificação dos Serviços

## 🎯 VAMOS FAZER JUNTOS

Siga exatamente estes passos. Me avise quando completar cada um!

---

## 📍 PASSO 1: DELETAR SERVIÇO ANTIGO

**FAÇA AGORA:**

1. Abra em uma nova aba: https://dashboard.render.com
2. Você verá 2 serviços na lista
3. Clique no serviço **`sistema.maxxcontrol-x`** (o que está com erro vermelho)
4. No menu lateral esquerdo, clique em **"Settings"**
5. Role até o FINAL da página
6. Você verá um botão vermelho: **"Delete Web Service"**
7. Clique nele
8. Digite o nome do serviço para confirmar: `sistema.maxxcontrol-x`
9. Clique em **"Delete"**

**✅ ME AVISE QUANDO DELETAR!**

---

## 📍 PASSO 2: CONFIGURAR O SERVIÇO ÚNICO

Agora vamos configurar o serviço que sobrou.

**FAÇA AGORA:**

1. Volte para a lista de serviços
2. Clique no serviço **`maxxcontrol-x-sistema-1`**
3. Clique em **"Settings"** (menu lateral)

### 2.1 - Configurar Build & Deploy

Role até a seção **"Build & Deploy"**

**Build Command** - Apague o que está e cole:
```
npm install && npm run build
```

**Start Command** - Apague o que está e cole:
```
npm start
```

**Environment** - Selecione:
```
Node
```

**Clique em "Save Changes"** (botão no final da seção)

**✅ ME AVISE QUANDO SALVAR!**

---

## 📍 PASSO 3: ADICIONAR VARIÁVEIS DE AMBIENTE

Ainda na página de Settings, role até a seção **"Environment Variables"**

**IMPORTANTE:** Vou te dar as variáveis uma por uma para você adicionar.

### Variável 1
Clique em **"Add Environment Variable"**

```
Key: NODE_ENV
Value: production
```

### Variável 2
```
Key: PORT
Value: 10000
```

### Variável 3
```
Key: USE_SQLITE
Value: false
```

### Variável 4 (IMPORTANTE - PEGAR DO SUPABASE)

**PARE AQUI!**

Antes de adicionar esta variável, você precisa pegar a DATABASE_URL do Supabase:

1. Abra em outra aba: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
2. Role até "Connection string"
3. Clique na aba **"URI"**
4. Copie a string completa (começa com `postgresql://`)
5. Volte para o Render

Agora adicione:
```
Key: DATABASE_URL
Value: [COLE A STRING QUE VOCÊ COPIOU DO SUPABASE]
```

### Variável 5
```
Key: SUPABASE_URL
Value: https://mmfbirjrhrhobbnzfffe.supabase.co
```

### Variável 6
```
Key: SUPABASE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMzM2MDAsImV4cCI6MjA1MDgwOTYwMH0.oUowKSGxGtxiy96we_bSvA_KZ-9aSROB
```

### Variável 7
```
Key: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTIzMzYwMCwiZXhwIjoyMDUwODA5NjAwfQ.placeholder
```

### Variável 8
```
Key: TMDB_API_KEY
Value: 7bc56e27708a9d2069fc999d44a6be0a
```

### Variável 9
```
Key: JWT_SECRET
Value: maxxcontrol_x_super_secret_key_2024_change_in_production
```

### Variável 10
```
Key: JWT_EXPIRES_IN
Value: 7d
```

### Variável 11
```
Key: DEVICE_API_TOKEN
Value: tvmaxx_device_api_token_2024_secure_key
```

### Variável 12
```
Key: WS_PORT
Value: 10000
```

**Depois de adicionar TODAS as 12 variáveis:**

Clique em **"Save Changes"** (botão no final da seção)

**✅ ME AVISE QUANDO SALVAR TODAS AS VARIÁVEIS!**

---

## 📍 PASSO 4: FAZER DEPLOY

Agora vamos fazer o deploy do serviço.

**FAÇA AGORA:**

1. No topo da página, você verá um botão azul **"Manual Deploy"**
2. Clique nele
3. Selecione **"Deploy latest commit"**
4. Aguarde (vai levar 3-5 minutos)
5. Acompanhe os logs na tela

**O que você deve ver nos logs:**
- "Building..."
- "npm install"
- "npm run build"
- "Starting service..."
- "🚀 MaxxControl X API rodando na porta 10000"
- "✅ Banco de dados PostgreSQL conectado"

**✅ ME AVISE QUANDO O DEPLOY TERMINAR!**

Se der erro, me envie a mensagem de erro que aparecer!

---

## 📍 PASSO 5: TESTAR

Depois que o deploy terminar e o status ficar **"Live"** (verde):

1. Abra o painel: https://maxxcontrol-x-sistema-1.onrender.com
2. Pressione **F12** (abrir console do navegador)
3. Cole este código no console:

```javascript
fetch('https://maxxcontrol-x-sistema-1.onrender.com/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Backend online:', data);
    alert('✅ Funcionou!');
  })
  .catch(err => {
    console.log('❌ Erro:', err);
    alert('❌ Ainda com erro');
  });
```

**✅ ME DIGA O QUE APARECEU!**

---

## 🎉 PRONTO!

Se tudo funcionou, agora você tem:
- ✅ Apenas 1 serviço no Render
- ✅ Backend funcionando
- ✅ Commits vão direto para produção
- ✅ Sem duplicação

**URL do seu painel:**
```
https://maxxcontrol-x-sistema-1.onrender.com
```

---

## 📞 COMECE AGORA!

**Comece pelo PASSO 1** e me avise quando completar cada passo!

Estou aqui para te ajudar se tiver qualquer dúvida ou erro!
