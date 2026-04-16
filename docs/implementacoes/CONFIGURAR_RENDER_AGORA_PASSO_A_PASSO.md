# 🚀 CONFIGURAR RENDER AGORA - PASSO A PASSO VISUAL

## 🎯 OBJETIVO
Fazer o backend Node.js rodar no Render (atualmente só está servindo arquivos estáticos)

---

## 📋 PASSO 1: ACESSAR O RENDER

1. Abra: https://dashboard.render.com
2. Faça login
3. Você verá a lista de serviços

---

## 📋 PASSO 2: ENCONTRAR O SERVIÇO

Procure pelo serviço chamado:
- `maxxcontrol-frontend` OU
- `maxxcontrol-x-sistema` OU
- Qualquer serviço conectado ao repositório `rangelnet/maxxcontrol-x-sistema`

**Clique no nome do serviço**

---

## 📋 PASSO 3: IR PARA SETTINGS

No menu lateral esquerdo, clique em:
```
⚙️ Settings
```

---

## 📋 PASSO 4: CONFIGURAR BUILD & DEPLOY

Role até a seção **Build & Deploy**

### Build Command
Apague o que está lá e cole:
```
npm install && npm run build
```

### Start Command
Apague o que está lá e cole:
```
npm start
```

### Environment
Selecione:
```
Node
```

**Clique em "Save Changes"** (botão no final da seção)

---

## 📋 PASSO 5: CONFIGURAR VARIÁVEIS DE AMBIENTE

Role até a seção **Environment Variables**

Clique em **"Add Environment Variable"** e adicione TODAS estas variáveis:

### Variável 1
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

### Variável 4 (IMPORTANTE - Pegar do Supabase)
```
Key: DATABASE_URL
Value: [COPIAR DO SUPABASE - VER ABAIXO]
```

**Como pegar DATABASE_URL do Supabase:**
1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
2. Role até "Connection string"
3. Selecione a aba "URI"
4. Copie a string completa (começa com `postgresql://`)
5. Cole no Value da variável DATABASE_URL

### Variável 5
```
Key: SUPABASE_URL
Value: https://mmfbirjrhrhobbnzfffe.supabase.co
```

### Variável 6
```
Key: SUPABASE_KEY
Value: sb_publishable_oUowKSGxGtxiy96we_bSvA_KZ-9aSROB
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

**Clique em "Save Changes"** após adicionar todas

---

## 📋 PASSO 6: FAZER REDEPLOY MANUAL

1. No topo da página, clique no botão azul **"Manual Deploy"**
2. Selecione **"Deploy latest commit"**
3. Aguarde 3-5 minutos (acompanhe os logs)

---

## 📋 PASSO 7: VERIFICAR LOGS

Enquanto o deploy acontece:

1. Clique na aba **"Logs"** (menu lateral)
2. Procure por estas mensagens:

```
✅ SUCESSO - Você deve ver:
🚀 MaxxControl X API rodando na porta 10000
✅ Banco de dados PostgreSQL conectado
```

```
❌ ERRO - Se ver:
npm ERR!
Error: ...
```

**Se der erro, me envie a mensagem de erro completa!**

---

## 📋 PASSO 8: TESTAR NO NAVEGADOR

Depois que o deploy terminar (status "Live"):

### Teste 1: Health Check

1. Abra o painel: https://maxxcontrol-frontend.onrender.com
2. Pressione **F12** (abrir console)
3. Cole este código:

```javascript
fetch('https://maxxcontrol-frontend.onrender.com/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Backend online:', data);
    alert('✅ Backend funcionando!');
  })
  .catch(err => {
    console.log('❌ Backend offline:', err);
    alert('❌ Backend ainda offline');
  });
```

### Teste 2: Verificar Botões

1. Faça login no painel
2. Vá em "Dispositivos"
3. Pressione **Ctrl+Shift+R** (limpar cache)
4. Verifique se os botões "Bloquear" e "Desbloquear" aparecem corretamente

---

## 🎯 RESULTADO ESPERADO

Depois de tudo configurado:

✅ Backend rodando no Render
✅ API respondendo em `/health`
✅ API respondendo em `/api/device/list-all`
✅ Botões de bloquear/desbloquear funcionando
✅ WebSocket conectado

---

## ⚠️ PROBLEMAS COMUNS

### Problema 1: Build falha com erro no frontend
**Solução:** Adicione esta variável de ambiente:
```
Key: VITE_API_URL
Value: /
```

### Problema 2: DATABASE_URL inválida
**Solução:** Verifique se copiou a string completa do Supabase (começa com `postgresql://`)

### Problema 3: Deploy demora muito
**Solução:** Normal! Primeira vez pode levar 5-10 minutos. Aguarde.

---

## 📞 PRÓXIMOS PASSOS

Depois de configurar:

1. Me envie o resultado do Teste 1 (health check)
2. Me diga se os botões aparecem corretamente
3. Se der erro, me envie a mensagem de erro dos logs

**EXECUTE AGORA E ME DIGA O RESULTADO!**
