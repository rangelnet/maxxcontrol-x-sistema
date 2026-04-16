# 🚀 FAÇA AGORA

## 1️⃣ AGUARDAR REDEPLOY (2-3 minutos)

O Render está fazendo redeploy automaticamente após você salvar o `DATABASE_URL`.

**Acompanhe em**: https://dashboard.render.com/web/srv-xxxxx/deploys

---

## 2️⃣ VERIFICAR LOGS

**Abra**: https://dashboard.render.com

**Clique** em: **maxxcontrol-x-sistema** → **Logs**

**Procure por**:
```
✅ Banco de dados PostgreSQL conectado: 2026-02-28 ...
```

---

## 3️⃣ TESTAR API

**Abra no navegador**:
```
https://maxxcontrol-x-sistema.onrender.com/health
```

**Deve retornar**:
```json
{"status": "online", "timestamp": "...", "service": "MaxxControl X API"}
```

---

## 4️⃣ ACESSAR PAINEL

**Abra**: https://maxxcontrol-frontend.onrender.com/login

**Login**:
- Email: `admin@maxxcontrol.com`
- Senha: `Admin@123`

---

## 5️⃣ VER DISPOSITIVOS

**Clique** em: **Dispositivos** (menu lateral)

**Deve aparecer**:
- MAC: `3C:E5:B4:18:FB:1C`
- Status: **ATIVO**
- Conexão: **OFFLINE** (normal até fazer login no app)

---

## ✅ SE TUDO FUNCIONAR

O dispositivo está registrado e pronto para uso!

Quando você fizer login no app com esse dispositivo, o status mudará para **ONLINE**.

---

## ❌ SE DER ERRO NOS LOGS

Se aparecer:
```
❌ Erro ao conectar no banco de dados: Tenant or user not found
```

**Significa**: A senha do banco ainda está incorreta

**Solução**:
1. Ir no Supabase: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
2. Clicar em "Reset database password" NOVAMENTE
3. Copiar a NOVA connection string (aba URI)
4. Atualizar no Render → Environment → DATABASE_URL
5. Salvar e aguardar novo redeploy

---

## 📸 ME ENVIE

Se não funcionar, me envie:
1. **Print dos logs** do Render (últimas 20 linhas)
2. **Print da tela** de Dispositivos no painel
3. **Mensagem de erro** se houver

---

**COMECE PELO PASSO 1!** ⏳
