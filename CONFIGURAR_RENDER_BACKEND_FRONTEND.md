# 🚀 Configurar Render: Backend + Frontend Juntos

## ❌ PROBLEMA IDENTIFICADO

O backend (Node.js/Express) NÃO está rodando no Render. Apenas os arquivos estáticos do frontend foram enviados.

## ✅ SOLUÇÃO

Configurar o Render para rodar o backend Node.js que também serve o frontend.

---

## 📋 PASSO A PASSO

### 1. Acessar o Dashboard do Render

Acesse: https://dashboard.render.com

### 2. Encontrar o Serviço

Procure pelo serviço `maxxcontrol-frontend` (ou similar)

### 3. Configurar o Serviço

Clique no serviço e vá em **Settings**

### 4. Configurar Build & Deploy

Na seção **Build & Deploy**, configure:

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

### 5. Adicionar Variáveis de Ambiente

Na seção **Environment**, adicione:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=[sua URL do Supabase]
JWT_SECRET=[seu secret]
DEVICE_AUTH_TOKEN=[seu token]
```

**IMPORTANTE:** Copie as variáveis do seu `.env` local!

### 6. Salvar e Fazer Redeploy

1. Clique em **Save Changes**
2. Clique em **Manual Deploy** → **Deploy latest commit**
3. Aguarde 3-5 minutos

---

## 🧪 TESTAR APÓS DEPLOY

### Teste 1: Health Check

Cole no console do navegador (F12):

```javascript
fetch('https://maxxcontrol-frontend.onrender.com/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend:', data))
  .catch(err => console.log('❌ Erro:', err));
```

**Resultado esperado:**
```json
{
  "status": "online",
  "timestamp": "2026-03-02T...",
  "service": "MaxxControl X API"
}
```

### Teste 2: Listar Dispositivos

```javascript
fetch('https://maxxcontrol-frontend.onrender.com/api/device/list-all', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(data => {
  console.log('📱 Dispositivos:', data.devices.length);
  data.devices.forEach(d => {
    console.log(`${d.mac_address} | Status: ${d.status}`);
  });
});
```

---

## 📊 LOGS DO RENDER

Para ver se o backend está rodando:

1. No dashboard do Render, clique no serviço
2. Vá na aba **Logs**
3. Procure por:

```
🚀 MaxxControl X API rodando na porta 10000
✅ Banco de dados PostgreSQL conectado
```

Se ver essas mensagens, o backend está funcionando!

---

## ⚠️ SE DER ERRO NO BUILD

Se o build falhar com erro no frontend, adicione esta variável:

```
VITE_API_URL=/
```

Isso faz o frontend usar o mesmo domínio para a API (já que estão juntos agora).

---

## 🎯 RESULTADO FINAL

Depois do deploy:
- Frontend: `https://maxxcontrol-frontend.onrender.com`
- Backend API: `https://maxxcontrol-frontend.onrender.com/api/*`
- Health Check: `https://maxxcontrol-frontend.onrender.com/health`

Tudo no mesmo serviço!

---

**EXECUTE ESSES PASSOS E ME DIGA O RESULTADO!**
