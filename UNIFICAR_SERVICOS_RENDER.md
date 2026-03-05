# 🔄 UNIFICAR SERVIÇOS DO RENDER EM 1 SÓ

## 🎯 PROBLEMA ATUAL

Você tem 2 serviços no Render:
1. `sistema.maxxcontrol-x` (com erro)
2. `maxxcontrol-x-sistema-1` (offline)

Isso causa:
- ❌ Duplicação de trabalho
- ❌ Confusão sobre qual usar
- ❌ Perda de tempo
- ❌ Erros de sincronização

## ✅ SOLUÇÃO: 1 SERVIÇO ÚNICO

Vamos manter apenas 1 serviço funcionando corretamente.

---

## 📋 PASSO A PASSO

### PASSO 1: Escolher Qual Serviço Manter

**Recomendação:** Manter `maxxcontrol-x-sistema-1` e deletar `sistema.maxxcontrol-x`

Por quê?
- Nome mais claro
- Mais recente
- Menos problemas de configuração

### PASSO 2: Deletar o Serviço Antigo

1. Acesse: https://dashboard.render.com
2. Clique no serviço `sistema.maxxcontrol-x` (o que está com erro)
3. Vá em **Settings** (menu lateral)
4. Role até o final da página
5. Clique em **"Delete Web Service"** (botão vermelho)
6. Digite o nome do serviço para confirmar
7. Clique em **"Delete"**

### PASSO 3: Configurar o Serviço Único Corretamente

Agora vamos configurar o `maxxcontrol-x-sistema-1`:

1. Clique no serviço `maxxcontrol-x-sistema-1`
2. Vá em **Settings**

#### 3.1 - Build & Deploy

Configure:

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

**Root Directory:**
```
(deixe vazio ou coloque: .)
```

#### 3.2 - Environment Variables

Adicione TODAS estas variáveis:

```
NODE_ENV=production
PORT=10000
USE_SQLITE=false
DATABASE_URL=[copiar do Supabase - ver abaixo]
SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMzM2MDAsImV4cCI6MjA1MDgwOTYwMH0.oUowKSGxGtxiy96we_bSvA_KZ-9aSROB
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTIzMzYwMCwiZXhwIjoyMDUwODA5NjAwfQ.placeholder
TMDB_API_KEY=7bc56e27708a9d2069fc999d44a6be0a
JWT_SECRET=maxxcontrol_x_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d
DEVICE_API_TOKEN=tvmaxx_device_api_token_2024_secure_key
WS_PORT=10000
```

**Como pegar DATABASE_URL:**
1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
2. Role até "Connection string"
3. Clique na aba "URI"
4. Copie a string completa (começa com `postgresql://`)
5. Cole no campo DATABASE_URL

#### 3.3 - Salvar e Fazer Deploy

1. Clique em **"Save Changes"** (no final da página)
2. Clique em **"Manual Deploy"** (botão azul no topo)
3. Selecione **"Deploy latest commit"**
4. Aguarde 3-5 minutos

---

## 🧪 TESTAR APÓS DEPLOY

### Teste 1: Verificar Logs

1. Vá na aba **"Logs"**
2. Procure por:
```
✅ Deve aparecer:
🚀 MaxxControl X API rodando na porta 10000
✅ Banco de dados PostgreSQL conectado
```

### Teste 2: Health Check

Abra o console do navegador (F12) e execute:

```javascript
fetch('https://maxxcontrol-x-sistema-1.onrender.com/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Backend online:', data);
    alert('✅ Backend funcionando!');
  })
  .catch(err => {
    console.log('❌ Erro:', err);
    alert('❌ Backend offline');
  });
```

**Resultado esperado:**
```json
{
  "status": "online",
  "timestamp": "2026-03-02T...",
  "service": "MaxxControl X API"
}
```

### Teste 3: Verificar Painel

1. Acesse: https://maxxcontrol-x-sistema-1.onrender.com
2. Faça login
3. Vá em "Dispositivos"
4. Pressione **Ctrl+Shift+R** (limpar cache)
5. Verifique se:
   - ✅ Lista de dispositivos carrega
   - ✅ Botões aparecem corretamente
   - ✅ Botão "Desbloquear" aparece para dispositivos bloqueados
   - ✅ Botão "Bloquear" aparece para dispositivos ativos

---

## 🎯 RESULTADO FINAL

Depois de tudo configurado:

**ANTES:**
```
❌ sistema.maxxcontrol-x (com erro)
❌ maxxcontrol-x-sistema-1 (offline)
= 2 serviços, nenhum funcionando
```

**DEPOIS:**
```
✅ maxxcontrol-x-sistema-1 (funcionando)
= 1 serviço único, tudo funcionando
```

**Benefícios:**
- ✅ Apenas 1 serviço para gerenciar
- ✅ Commits vão direto para produção
- ✅ Sem duplicação de trabalho
- ✅ Sem confusão
- ✅ Mais rápido e eficiente

---

## 📝 CHECKLIST DE EXECUÇÃO

- [ ] Deletei o serviço `sistema.maxxcontrol-x`
- [ ] Configurei Build Command no `maxxcontrol-x-sistema-1`
- [ ] Configurei Start Command no `maxxcontrol-x-sistema-1`
- [ ] Adicionei todas as 12 variáveis de ambiente
- [ ] Copiei DATABASE_URL do Supabase
- [ ] Salvei as mudanças
- [ ] Fiz Manual Deploy
- [ ] Aguardei 3-5 minutos
- [ ] Verifiquei os logs (mensagens de sucesso)
- [ ] Testei /health no console
- [ ] Testei o painel no navegador
- [ ] Limpei cache do navegador (Ctrl+Shift+R)
- [ ] Verifiquei se botões aparecem corretamente

---

## 🚨 SE DER ERRO NO DEPLOY

**Erro comum:** Build falha com erro no frontend

**Solução:** Adicione esta variável de ambiente:
```
VITE_API_URL=/
```

Depois faça redeploy.

---

## 💡 DICA IMPORTANTE

Depois de tudo funcionando:

**Anote a URL do seu serviço:**
```
https://maxxcontrol-x-sistema-1.onrender.com
```

**Use sempre esta URL para:**
- Acessar o painel
- Testar APIs
- Configurar no app Android

**Nunca mais vai precisar se preocupar com 2 serviços!**

---

## 📞 PRÓXIMOS PASSOS

1. **AGORA:** Delete o serviço antigo
2. **DEPOIS:** Configure o serviço único
3. **POR FIM:** Teste tudo

**Me avise quando terminar cada passo!**
