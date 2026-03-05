# 🔍 VERIFICAR LOGS DO RENDER

## ✅ VOCÊ JÁ FEZ

- ✅ Configurou DATABASE_URL no Render
- ✅ Connection string do Supabase está correta

---

## 📋 AGORA FAÇA

### PASSO 1: Ver Logs do Render

1. **Abra**: https://dashboard.render.com

2. **Clique** no serviço: **maxxcontrol-x-sistema**

3. **Clique** em **"Logs"** (menu lateral)

4. **Procure** por estas mensagens:

---

## ✅ SE DEU CERTO, VOCÊ VERÁ:

```
==> Deploying...
==> Running 'node server.js'
🐘 Usando PostgreSQL como banco de dados
🚀 WebSocket Server iniciado
🚀 MaxxControl X API rodando na porta 3001
🌐 http://localhost:3001
✅ Banco de dados PostgreSQL conectado: 2026-02-28 ...
==> Your service is live 🎉
```

**IMPORTANTE**: Deve ter a linha:
```
✅ Banco de dados PostgreSQL conectado
```

---

## ❌ SE AINDA DER ERRO:

Se aparecer:
```
❌ Erro ao conectar no banco de dados: Tenant or user not found
```

**SOLUÇÃO**: A senha ainda está incorreta. Você precisa:

1. Ir no Supabase: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database

2. Clicar em **"Reset database password"** novamente

3. Copiar a **NOVA** connection string (aba URI)

4. Atualizar no Render → Environment → DATABASE_URL

---

## 🎯 DEPOIS QUE CONECTAR

1. **Acesse**: https://maxxcontrol-frontend.onrender.com/login

2. **Login**:
   - Email: `admin@maxxcontrol.com`
   - Senha: `Admin@123`

3. **Vá em**: Dispositivos

4. **Verifique** se o MAC `3C:E5:B4:18:FB:1C` aparece

---

## 📸 ME ENVIE

Se ainda não funcionar, me envie:
1. **Print dos logs** do Render (últimas 20 linhas)
2. **Print da tela** de Dispositivos no painel

---

**VERIFIQUE OS LOGS AGORA!** 🚀
