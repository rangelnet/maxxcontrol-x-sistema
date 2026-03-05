# 🚀 DEPLOY AGORA - PASSO A PASSO COMPLETO

## 📋 SITUAÇÃO ATUAL

Você tem o código completo do MaxxControl X rodando localmente.
Agora vamos colocar ONLINE no Render.com (100% GRATUITO).

---

## 🎯 OPÇÃO 1: DEPLOY DIRETO DO GITHUB (RECOMENDADO)

### Passo 1: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `maxxcontrol-x-sistema`
3. Descrição: `MaxxControl X - Sistema de Controle e Monitoramento`
4. Deixe como **Público**
5. **NÃO** marque "Add a README file"
6. Clique em **"Create repository"**

### Passo 2: Upload dos Arquivos

**IMPORTANTE - NÃO ENVIE:**
- `.env` (senhas)
- `maxxcontrol.db` (banco local)
- `node_modules/` (backend)
- `web/node_modules/` (frontend)

**MÉTODO RÁPIDO:**

1. Na página do repositório criado, clique em **"uploading an existing file"**
2. Arraste TODA a pasta do projeto (exceto os arquivos acima)
3. Escreva: `Initial commit`
4. Clique em **"Commit changes"**

**Se der erro de "muitos arquivos", faça em 3 partes:**

**Parte 1 - Backend:**
- Arraste: `server.js`, `package.json`, `render.yaml`, `.gitignore`
- Arraste pastas: `config/`, `database/`, `middlewares/`, `modules/`, `services/`, `websocket/`, `scripts/`
- Commit: `Add backend`

**Parte 2 - Frontend:**
- Arraste pasta `web/` (SEM a pasta `web/node_modules/`)
- Commit: `Add frontend`

**Parte 3 - Documentação:**
- Arraste todos os arquivos `.md`
- Commit: `Add docs`

### Passo 3: Deploy no Render.com

**3.1 - Criar conta no Render:**
1. Acesse: https://render.com
2. Clique em **"Get Started"**
3. Faça login com GitHub
4. Autorize o Render a acessar seus repositórios

**3.2 - Deploy do BACKEND:**

1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório: `maxxcontrol-x-sistema`
3. Configure:
   - **Name:** `maxxcontrol-backend`
   - **Region:** `Oregon (US West)` (mais rápido)
   - **Branch:** `main`
   - **Root Directory:** deixe vazio
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`

4. Clique em **"Advanced"** e adicione as variáveis de ambiente:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=maxxcontrol-super-secret-key-2024
DATABASE_TYPE=supabase

SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTk5NzcsImV4cCI6MjA1MzU3NTk3N30.oUowKSGxGtxiy96we_bSvA_KZ-9aSRO
SUPABASE_DB_PASSWORD=LJFr8ZGGsix92572

TMDB_API_KEY=c1869e578c74a007f3521d9609a56285
```

5. Clique em **"Create Web Service"**
6. Aguarde o deploy (3-5 minutos)
7. Copie a URL gerada (ex: `https://maxxcontrol-backend.onrender.com`)

**3.3 - Deploy do FRONTEND:**

1. No dashboard do Render, clique em **"New +"** → **"Static Site"**
2. Selecione o mesmo repositório: `maxxcontrol-x-sistema`
3. Configure:
   - **Name:** `maxxcontrol-frontend`
   - **Branch:** `main`
   - **Root Directory:** `web`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Clique em **"Advanced"** e adicione:

```
VITE_API_URL=https://maxxcontrol-backend.onrender.com
```

(Use a URL do backend que você copiou no passo anterior)

5. Clique em **"Create Static Site"**
6. Aguarde o deploy (3-5 minutos)
7. Copie a URL gerada (ex: `https://maxxcontrol-frontend.onrender.com`)

---

## 🎯 OPÇÃO 2: DEPLOY SEM GITHUB (ALTERNATIVA)

Se não conseguir usar o GitHub, use o Render CLI:

### Passo 1: Instalar Render CLI

```bash
npm install -g render-cli
```

### Passo 2: Login

```bash
render login
```

### Passo 3: Deploy

```bash
render deploy
```

---

## ✅ VERIFICAR SE FUNCIONOU

### Testar Backend:

Abra no navegador:
```
https://maxxcontrol-backend.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Testar Frontend:

Abra no navegador:
```
https://maxxcontrol-frontend.onrender.com
```

Deve aparecer a tela de login.

### Fazer Login:

- Email: `admin@maxxcontrol.com`
- Senha: `Admin@123`

---

## 🔧 CONFIGURAR NO APP ANDROID

Depois que tudo estiver online, você vai usar esta URL no app:

```
https://maxxcontrol-backend.onrender.com
```

---

## ⚠️ IMPORTANTE - RENDER FREE TIER

O plano gratuito do Render:
- ✅ Funciona perfeitamente
- ✅ SSL/HTTPS automático
- ⚠️ Dorme após 15 minutos sem uso
- ⚠️ Primeira requisição pode demorar 30-60 segundos (wake up)

**Solução:** Use um serviço de ping (ex: UptimeRobot) para manter ativo.

---

## 🆘 PROBLEMAS COMUNS

### "Build failed"
- Verifique se não enviou `node_modules/`
- Verifique se o `package.json` está na raiz

### "Database connection failed"
- Verifique as variáveis de ambiente no Render
- Confirme que o Supabase está ativo

### "Frontend não carrega"
- Verifique se a variável `VITE_API_URL` está correta
- Confirme que o backend está rodando

### "CORS error"
- Normal! Já está configurado no código
- Se persistir, adicione a URL do frontend no `server.js`

---

## 📱 PRÓXIMOS PASSOS

Depois do deploy:

1. ✅ Testar todas as funcionalidades no painel web
2. 🔧 Configurar as APIs no painel (APIConfig)
3. 📱 Atualizar a URL no app Android
4. 🚀 Testar conexão do app com o backend
5. 📊 Monitorar logs e performance

---

## 💡 DICA PRO

Para evitar o "sleep" do Render Free:

1. Crie conta no UptimeRobot: https://uptimerobot.com
2. Adicione monitor HTTP(s)
3. URL: `https://maxxcontrol-backend.onrender.com/api/health`
4. Intervalo: 5 minutos
5. Pronto! Seu backend ficará sempre ativo

---

🚀 **Me avise quando terminar cada etapa que eu te ajudo!**
