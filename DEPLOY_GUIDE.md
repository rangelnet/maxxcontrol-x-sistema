# 🚀 Guia de Deploy - MaxxControl X

## 📋 Pré-requisitos

1. Conta no GitHub
2. Código no repositório GitHub
3. Conta no Render.com (grátis)

---

## 🟢 OPÇÃO 1: Deploy no Render.com (RECOMENDADO)

### Passo 1: Preparar o Código

1. Crie um repositório no GitHub
2. Faça push do código:

```bash
git init
git add .
git commit -m "Initial commit - MaxxControl X"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/maxxcontrol-x.git
git push -u origin main
```

### Passo 2: Deploy do Backend

1. Acesse: https://render.com
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:

```
Name: maxxcontrol-x-api
Environment: Node
Build Command: npm install
Start Command: npm start
```

5. Adicione as variáveis de ambiente:

```
NODE_ENV=production
PORT=3001
USE_SQLITE=false
DB_HOST=db.mmfbirjrhrhobbnzfffe.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=LJFr8ZGGsix92572
SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY=sb_publishable_oUowKSGxGtxiy96we_bSvA_KZ-9aSROB
TMDB_API_KEY=c1869e578c74a007f3521d9609a56285
JWT_SECRET=maxxcontrol_x_super_secret_key_2024_change_in_production
```

6. Clique em "Create Web Service"

### Passo 3: Deploy do Frontend

1. No Render, clique em "New +" → "Static Site"
2. Conecte o mesmo repositório
3. Configure:

```
Name: maxxcontrol-x-web
Build Command: cd web && npm install && npm run build
Publish Directory: web/dist
```

4. Adicione variável de ambiente:

```
VITE_API_URL=https://maxxcontrol-x-api.onrender.com
```

5. Clique em "Create Static Site"

### Passo 4: Atualizar Frontend para usar API em produção

Edite `web/src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Passo 5: URLs Finais

Após o deploy, você terá:

```
Backend API: https://maxxcontrol-x-api.onrender.com
Frontend Web: https://maxxcontrol-x-web.onrender.com
```

---

## 🔵 OPÇÃO 2: Deploy no Vercel + Render

### Backend no Render (igual acima)

### Frontend no Vercel

1. Acesse: https://vercel.com
2. Clique em "Add New" → "Project"
3. Importe do GitHub
4. Configure:

```
Framework Preset: Vite
Root Directory: web
Build Command: npm run build
Output Directory: dist
```

5. Adicione variável de ambiente:

```
VITE_API_URL=https://maxxcontrol-x-api.onrender.com
```

6. Deploy!

**URL Final:** `https://seu-projeto.vercel.app`

---

## 🟣 OPÇÃO 3: Deploy no Railway.app

1. Acesse: https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Conecte seu repositório
5. Railway detecta automaticamente Node.js
6. Adicione as variáveis de ambiente
7. Deploy automático!

---

## 🟠 OPÇÃO 4: Deploy no Fly.io

### Instalar Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Ou baixe em: https://fly.io/docs/hands-on/install-flyctl/
```

### Deploy

```bash
# Login
fly auth login

# Criar app
fly launch

# Deploy
fly deploy
```

---

## 📱 Atualizar App Android

Após o deploy, atualize a URL no app Android:

```kotlin
// NetworkConstants.kt
const val BASE_URL = "https://maxxcontrol-x-api.onrender.com"
```

---

## 🔒 Segurança em Produção

1. **Altere o JWT_SECRET** para algo único
2. **Use HTTPS** (automático no Render/Vercel)
3. **Configure CORS** para aceitar apenas seu domínio
4. **Ative rate limiting** (já está configurado)

---

## 💰 Custos

### Render.com (Plano Grátis)
- ✅ Backend: 750h/mês grátis
- ✅ Frontend: Ilimitado grátis
- ✅ SSL: Grátis
- ⚠️ Dorme após 15min inativo (acorda em ~30s)

### Vercel (Plano Grátis)
- ✅ Frontend: Ilimitado grátis
- ✅ 100GB bandwidth/mês
- ✅ SSL: Grátis
- ✅ CDN global

### Railway (Plano Grátis)
- ✅ $5 crédito/mês
- ✅ ~500h de uso
- ✅ SSL: Grátis

### Fly.io (Plano Grátis)
- ✅ 3 VMs grátis
- ✅ 160GB tráfego/mês
- ✅ SSL: Grátis

---

## 🎯 Recomendação Final

**Para começar:**
→ **Render.com** (tudo em um lugar, fácil)

**Para melhor performance:**
→ **Vercel (frontend) + Render (backend)**

**Para mais controle:**
→ **Fly.io** ou **Railway**

---

## 🆘 Problemas Comuns

### Backend não conecta no banco
- Verifique as variáveis de ambiente
- Confirme que o Supabase permite conexões externas

### Frontend não conecta na API
- Verifique a variável `VITE_API_URL`
- Configure CORS no backend

### App dorme no Render
- Plano grátis dorme após 15min
- Upgrade para $7/mês para manter ativo
- Ou use um serviço de ping (UptimeRobot)

---

**Pronto para deploy!** 🚀
