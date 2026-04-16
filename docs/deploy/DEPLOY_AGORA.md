# 🚀 Deploy AGORA - Render.com

## 1️⃣ Subir para o GitHub

```bash
# Inicializar Git (se ainda não fez)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "MaxxControl X - Sistema completo"

# Criar branch main
git branch -M main

# Adicionar repositório remoto (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/maxxcontrol-x.git

# Fazer push
git push -u origin main
```

---

## 2️⃣ Deploy do Backend (API)

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Clique em **"Connect a repository"**
4. Selecione seu repositório **maxxcontrol-x**
5. Configure:

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

6. Clique em **"Advanced"** e adicione as **Environment Variables**:

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
TMDB_API_KEY = c1869e578c74a007f3521d9609a56285
JWT_SECRET = maxxcontrol_x_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN = 7d
WS_PORT = 10000
```

7. Clique em **"Create Web Service"**

8. Aguarde o deploy (5-10 minutos)

9. Anote a URL gerada (ex: `https://maxxcontrol-x-api.onrender.com`)

---

## 3️⃣ Deploy do Frontend (Painel Web)

1. No Render, clique em **"New +"** → **"Static Site"**
2. Selecione o mesmo repositório **maxxcontrol-x**
3. Configure:

```
Name: maxxcontrol-x-web
Branch: main
Root Directory: web
Build Command: npm install && npm run build
Publish Directory: dist
```

4. Clique em **"Advanced"** e adicione a **Environment Variable**:

```
VITE_API_URL = https://maxxcontrol-x-api.onrender.com
```

⚠️ **IMPORTANTE:** Substitua pela URL real do seu backend!

5. Clique em **"Create Static Site"**

6. Aguarde o deploy (3-5 minutos)

7. Anote a URL gerada (ex: `https://maxxcontrol-x-web.onrender.com`)

---

## 4️⃣ Testar o Sistema

1. Acesse a URL do frontend: `https://maxxcontrol-x-web.onrender.com`

2. Faça login:
```
Email: admin@maxxcontrol.com
Senha: Admin@123
```

3. Teste a API diretamente:
```
https://maxxcontrol-x-api.onrender.com/health
```

---

## 5️⃣ Configurar CORS (se necessário)

Se o frontend não conectar na API, adicione no backend (`server.js`):

```javascript
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://maxxcontrol-x-web.onrender.com'
  ],
  credentials: true
}));
```

Depois faça commit e push:
```bash
git add .
git commit -m "Configurar CORS para produção"
git push
```

O Render fará deploy automático!

---

## 6️⃣ URLs Finais

Após o deploy, você terá:

```
🌐 Painel Web: https://maxxcontrol-x-web.onrender.com
📡 API Backend: https://maxxcontrol-x-api.onrender.com
🏥 Health Check: https://maxxcontrol-x-api.onrender.com/health
```

---

## 7️⃣ Atualizar App Android

No seu app Android, atualize a URL base:

```kotlin
// NetworkConstants.kt ou similar
const val BASE_URL = "https://maxxcontrol-x-api.onrender.com"
```

---

## 🎯 Endpoints para o App Usar

```kotlin
// Verificar dispositivo
POST https://maxxcontrol-x-api.onrender.com/api/device/check

// Obter versão
GET https://maxxcontrol-x-api.onrender.com/api/app/version

// Obter branding
GET https://maxxcontrol-x-api.onrender.com/api/branding/current

// Reportar bug
POST https://maxxcontrol-x-api.onrender.com/api/bug

// Enviar log
POST https://maxxcontrol-x-api.onrender.com/api/log
```

---

## ⚠️ IMPORTANTE - Plano Grátis

O plano grátis do Render:
- ✅ 750 horas/mês
- ⚠️ Dorme após 15 minutos de inatividade
- ⏱️ Leva ~30 segundos para acordar
- 💡 Primeira requisição pode ser lenta

**Solução:** Use um serviço de ping como:
- https://uptimerobot.com (grátis)
- Faz ping a cada 5 minutos
- Mantém o serviço acordado

---

## 🔄 Atualizações Futuras

Sempre que fizer mudanças:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

O Render fará deploy automático! 🚀

---

## 🆘 Problemas Comuns

### Backend não inicia
- Verifique os logs no Render Dashboard
- Confirme que todas as variáveis de ambiente estão corretas

### Frontend não conecta na API
- Verifique se `VITE_API_URL` está correto
- Confirme que o CORS está configurado

### Banco de dados não conecta
- Verifique se o Supabase permite conexões externas
- Confirme as credenciais do banco

---

**Pronto! Seu sistema está online!** 🎉👑
