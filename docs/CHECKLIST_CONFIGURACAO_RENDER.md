# ✅ CHECKLIST: Configuração do Render

## 📋 ANTES DE COMEÇAR

- [ ] Tenho acesso ao dashboard do Render (https://dashboard.render.com)
- [ ] Tenho acesso ao Supabase (https://supabase.com/dashboard)
- [ ] Sei qual é o nome do meu serviço no Render

---

## 🔧 CONFIGURAÇÃO DO SERVIÇO

### Settings → Build & Deploy

- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Environment: `Node`
- [ ] Cliquei em "Save Changes"

---

## 🔐 VARIÁVEIS DE AMBIENTE (12 no total)

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `USE_SQLITE` = `false`
- [ ] `DATABASE_URL` = `[copiado do Supabase]`
- [ ] `SUPABASE_URL` = `https://mmfbirjrhrhobbnzfffe.supabase.co`
- [ ] `SUPABASE_KEY` = `sb_publishable_oUowKSGxGtxiy96we_bSvA_KZ-9aSROB`
- [ ] `SUPABASE_SERVICE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `TMDB_API_KEY` = `7bc56e27708a9d2069fc999d44a6be0a`
- [ ] `JWT_SECRET` = `maxxcontrol_x_super_secret_key_2024_change_in_production`
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `DEVICE_API_TOKEN` = `tvmaxx_device_api_token_2024_secure_key`
- [ ] `WS_PORT` = `10000`
- [ ] Cliquei em "Save Changes"

---

## 🚀 DEPLOY

- [ ] Cliquei em "Manual Deploy"
- [ ] Selecionei "Deploy latest commit"
- [ ] Aguardei o deploy terminar (3-5 minutos)
- [ ] Status mudou para "Live" (bolinha verde)

---

## 📊 VERIFICAÇÃO DOS LOGS

- [ ] Abri a aba "Logs"
- [ ] Vi a mensagem: `🚀 MaxxControl X API rodando na porta 10000`
- [ ] Vi a mensagem: `✅ Banco de dados PostgreSQL conectado`
- [ ] Não vi erros em vermelho

---

## 🧪 TESTES NO NAVEGADOR

### Teste 1: Health Check

- [ ] Abri o console (F12)
- [ ] Executei o comando fetch do health check
- [ ] Recebi resposta: `{ status: 'online', ... }`

### Teste 2: API de Dispositivos

- [ ] Fiz login no painel
- [ ] Abri a página "Dispositivos"
- [ ] Limpei o cache (Ctrl+Shift+R)
- [ ] Vi a lista de dispositivos carregando

### Teste 3: Botões de Ação

- [ ] Vi o botão "Bloquear" nos dispositivos com status "ativo"
- [ ] Vi o botão "Desbloquear" nos dispositivos com status "bloqueado"
- [ ] Cliquei em um botão e funcionou (sem erro 404)

---

## ✅ CONCLUSÃO

Se todos os itens acima estão marcados:

**🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!**

O backend está rodando corretamente no Render e todos os botões devem funcionar.

---

## ❌ SE ALGO DEU ERRADO

Marque onde parou:

**Parei no passo:** _________________

**Erro que recebi:** _________________

**Logs do Render:** _________________

**Me envie essas informações para eu te ajudar!**
