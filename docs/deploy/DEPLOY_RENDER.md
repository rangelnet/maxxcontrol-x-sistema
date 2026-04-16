# 🚀 Deploy no Render - MaxxControl X

## Repositório GitHub
https://github.com/rangelnet/maxxcontrol-x

---

## 1️⃣ DEPLOY DO BACKEND (API)

### Passo 1: Criar Web Service

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Clique em **"Connect a repository"**
4. Autorize o GitHub se necessário
5. Selecione: **rangelnet/maxxcontrol-x**

### Passo 2: Configurar

```
Name: maxxcontrol-x-api
Region: Oregon (US West)
Branch: main
Root Directory: (deixe vazio)
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### Passo 3: Variáveis de Ambiente

Clique em **"Advanced"** e adicione:

```
NODE_ENV = production
PORT = 10000
USE_SQLITE = false
DB_HOST = db.mmfbirjrhrhobbnzfffe.supabase.co
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = LJFr8ZGGsix92572
SUPABASE_URL = https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY = sb_publishable_oUowKSGxGtxiy96we_bSvA_KZ-9aSROB
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder
TMDB_API_KEY = c1869e578c74a007f3521d9609a56285
JWT_SECRET = maxxcontrol_x_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN = 7d
WS_PORT = 10000
```

### Passo 4: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde 5-10 minutos
3. Anote a URL (ex: `https://maxxcontrol-x-api.onrender.com`)

---

## 2️⃣ DEPLOY DO FRONTEND (PAINEL WEB)

### Passo 1: Criar Static Site

1. No Render, clique em **"New +"** → **"Static Site"**
2. Selecione: **rangelnet/maxxcontrol-x**

### Passo 2: Configurar

```
Name: maxxcontrol-x-web
Branch: main
Root Directory: web
Build Command: npm install && npm run build
Publish Directory: dist
```

### Passo 3: Variável de Ambiente

Clique em **"Advanced"** e adicione:

```
VITE_API_URL = https://maxxcontrol-x-api.onrender.com
```

⚠️ **IMPORTANTE:** Use a URL real do seu backend!

### Passo 4: Deploy

1. Clique em **"Create Static Site"**
2. Aguarde 3-5 minutos
3. Anote a URL (ex: `https://maxxcontrol-x-web.onrender.com`)

---

## 3️⃣ TESTAR O SISTEMA

### Testar API
```
https://maxxcontrol-x-api.onrender.com/health
```

Deve retornar:
```json
{
  "status": "online",
  "timestamp": "...",
  "service": "MaxxControl X API"
}
```

### Testar Painel
```
https://maxxcontrol-x-web.onrender.com
```

**Login:**
- Email: `admin@maxxcontrol.com`
- Senha: `Admin@123`

---

## 4️⃣ CONFIGURAR CORS (se necessário)

Se o frontend não conectar na API, o CORS já está configurado para aceitar qualquer origem em desenvolvimento.

Para produção, edite `server.js` e adicione sua URL:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://maxxcontrol-x-web.onrender.com'
  ],
  credentials: true
}));
```

Depois:
```bash
git add .
git commit -m "Configurar CORS para produção"
git push
```

O Render fará deploy automático!

---

## 5️⃣ URLs FINAIS

Após o deploy:

```
🌐 Painel Web: https://maxxcontrol-x-web.onrender.com
📡 API Backend: https://maxxcontrol-x-api.onrender.com
🏥 Health Check: https://maxxcontrol-x-api.onrender.com/health
```

---

## 6️⃣ ATUALIZAR APP ANDROID

No seu app Android, atualize:

```kotlin
// NetworkConstants.kt
const val BASE_URL = "https://maxxcontrol-x-api.onrender.com"
```

### Endpoints para o App:

```kotlin
// Verificar dispositivo
POST https://maxxcontrol-x-api.onrender.com/api/device/check
Body: { "mac_address": "AA:BB:CC:DD:EE:FF" }

// Obter versão
GET https://maxxcontrol-x-api.onrender.com/api/app/version

// Obter branding (cores, logo, etc)
GET https://maxxcontrol-x-api.onrender.com/api/branding/current

// Reportar bug
POST https://maxxcontrol-x-api.onrender.com/api/bug

// Enviar log
POST https://maxxcontrol-x-api.onrender.com/api/log
```

---

## ⚠️ IMPORTANTE - Plano Grátis

- ✅ 750 horas/mês grátis
- ⚠️ Dorme após 15 minutos sem uso
- ⏱️ Leva ~30 segundos para acordar
- 💡 Primeira requisição pode ser lenta

### Solução: Manter Acordado

Use **UptimeRobot** (grátis):
1. https://uptimerobot.com
2. Adicione monitor HTTP(s)
3. URL: `https://maxxcontrol-x-api.onrender.com/health`
4. Intervalo: 5 minutos
5. Pronto! Seu serviço ficará sempre acordado

---

## 🔄 ATUALIZAÇÕES FUTURAS

Sempre que fizer mudanças:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

O Render detecta automaticamente e faz deploy! 🚀

---

## 🆘 PROBLEMAS COMUNS

### Backend não inicia
- Veja os logs no Render Dashboard
- Verifique as variáveis de ambiente

### Frontend não conecta
- Confirme `VITE_API_URL` correto
- Verifique CORS

### Banco não conecta
- Confirme credenciais do Supabase
- Verifique se permite conexões externas

---

## 📊 MONITORAMENTO

No Render Dashboard você pode ver:
- Logs em tempo real
- Uso de recursos
- Histórico de deploys
- Métricas de performance

---

**Pronto! Seu sistema está online!** 🎉👑

Repositório: https://github.com/rangelnet/maxxcontrol-x
