# 🚀 COPIAR E COLAR NO RENDER - PRONTO!

## ✅ TODAS AS VARIÁVEIS PRONTAS

Abaixo estão TODAS as variáveis de ambiente com as chaves corretas do Supabase.

---

## 📋 PASSO 1: ACESSAR ENVIRONMENT NO RENDER

1. Abra: https://dashboard.render.com
2. Clique no serviço **`sistema.maxxcontrol-x`**
3. Clique em **"Environment"** no menu lateral esquerdo

---

## 📋 PASSO 2: ADICIONAR VARIÁVEIS

Clique em **"Add Environment Variable"** e adicione CADA UMA abaixo:

### ⚠️ COPIE E COLE UMA POR VEZ:

**NODE_ENV**
```
production
```

**PORT**
```
10000
```

**USE_SQLITE**
```
false
```

**DATABASE_URL**
```
postgresql://postgres.mmfbirjrhrhobbnzfffe:Maxx%40146390@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

**SUPABASE_URL**
```
https://mmfbirjrhrhobbnzfffe.supabase.co
```

**SUPABASE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg1NDcsImV4cCI6MjA4NzY5NDU0N30.-UF_TVSxI_voNwntuLBtgZD4EyQz0xOUtCvCH8rdoys
```

**SUPABASE_SERVICE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExODU0NywiZXhwIjoyMDg3Njk0NTQ3fQ.5iLWAJ5sFIF1Q8U0vNEk9FKTDgGMS9YpRTXaX6vCZRo
```

**TMDB_API_KEY**
```
7bc56e27708a9d2069fc999d44a6be0a
```

**JWT_SECRET**
```
maxxcontrol_x_super_secret_key_2024_change_in_production
```

**JWT_EXPIRES_IN**
```
7d
```

**DEVICE_API_TOKEN**
```
tvmaxx_device_api_token_2024_secure_key
```

**WS_PORT**
```
10000
```

---

## 📋 PASSO 3: SALVAR

Clique em **"Save Changes"** (botão azul no topo)

O Render vai reiniciar automaticamente.

✅ **ME AVISE QUANDO SALVAR!**

---

## 📋 PASSO 4: VERIFICAR BUILD & DEPLOY SETTINGS

Clique em **"Settings"** no menu lateral e verifique:

**Root Directory:**
```
maxxcontrol-x-sistema
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Environment:**
```
Node
```

Se algo estiver diferente, corrija e clique em **"Save Changes"**

---

## 📋 PASSO 5: FAZER DEPLOY MANUAL

1. Volte para a página principal do serviço
2. Clique em **"Manual Deploy"** (botão azul no topo)
3. Selecione **"Deploy latest commit"**
4. Aguarde 3-5 minutos
5. Acompanhe os logs

**Você deve ver nos logs:**
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

## 📋 PASSO 6: TESTAR O BACKEND

Quando o status ficar **"Live"** (verde):

1. Abra o console do navegador (F12)
2. Cole e execute:

```javascript
fetch('https://sistema.maxxcontrol-x.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Deve aparecer:**
```json
{
  "status": "online",
  "timestamp": "2024-...",
  "service": "MaxxControl X API"
}
```

✅ **ME DIGA O RESULTADO!**

---

## 📋 PASSO 7: TESTAR O PAINEL

1. Abra: https://sistema.maxxcontrol-x.onrender.com
2. Faça login com suas credenciais
3. Vá em **"Dispositivos"**
4. Verifique se os botões **"Bloquear"** e **"Desbloquear"** aparecem corretamente
5. Pressione **Ctrl+Shift+R** para limpar o cache

---

## 🎉 PRONTO!

Agora o backend está rodando com todas as configurações corretas!

---

## 🚀 COMECE AGORA PELO PASSO 1!

Me avise quando completar cada passo ou se tiver qualquer dúvida!
