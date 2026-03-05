# ❌ Problema: API Retorna 404

## 🔍 DIAGNÓSTICO

O erro `GET https://maxxcontrol-frontend.onrender.com/api/device/list-all 404 (Not Found)` indica que:

1. O painel está tentando acessar a API no mesmo domínio do frontend
2. Mas o backend está em um serviço separado no Render
3. A URL da API não está configurada corretamente

## 🎯 SOLUÇÃO

O problema é que o frontend e backend estão em serviços separados no Render:
- Frontend: `https://maxxcontrol-frontend.onrender.com`
- Backend: `https://maxxcontrol-backend.onrender.com` (ou similar)

### PASSO 1: Descobrir a URL do Backend

1. Acesse o dashboard do Render: https://dashboard.render.com
2. Procure pelo serviço do **backend** (API)
3. Copie a URL do serviço (algo como `https://maxxcontrol-x-sistema.onrender.com` ou `https://maxxcontrol-backend.onrender.com`)

### PASSO 2: Configurar Variável de Ambiente no Frontend

No Render, vá no serviço do **frontend** e adicione a variável de ambiente:

```
VITE_API_URL=https://[URL-DO-BACKEND-AQUI]
```

Exemplo:
```
VITE_API_URL=https://maxxcontrol-x-sistema.onrender.com
```

### PASSO 3: Fazer Redeploy do Frontend

Depois de adicionar a variável, faça um redeploy manual do frontend.

---

## 🔧 ALTERNATIVA: Backend e Frontend no Mesmo Serviço

Se você quer que tudo rode no mesmo serviço (mais simples):

### Modificar server.js para servir o frontend

Adicione estas linhas no `server.js` ANTES das rotas de API:

```javascript
const path = require('path');

// Servir arquivos estáticos do frontend (build do Vite)
app.use(express.static(path.join(__dirname, 'web/dist')));

// Rotas da API
app.use('/api/auth', require('./modules/auth/authRoutes'));
// ... resto das rotas ...

// Servir index.html para todas as outras rotas (SPA)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'web/dist/index.html'));
  }
});
```

### Modificar package.json

Adicione o script de build:

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "cd web && npm install && npm run build",
    "dev": "nodemon server.js"
  }
}
```

### Modificar render.yaml (se estiver usando)

```yaml
services:
  - type: web
    name: maxxcontrol-x-sistema
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

---

## 🚀 QUAL SOLUÇÃO USAR?

**Opção 1 (Recomendada):** Backend e Frontend no mesmo serviço
- Mais simples
- Menos configuração
- Apenas 1 serviço no Render (mais barato)

**Opção 2:** Serviços separados
- Mais escalável
- Requer configurar VITE_API_URL corretamente

---

## 📞 ME DIGA:

1. Você tem 1 ou 2 serviços no Render?
2. Qual é a URL do backend no Render?

Com essas informações eu vou te ajudar a resolver!
