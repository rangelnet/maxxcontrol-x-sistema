# 🔑 CONFIGURAR SENHA CORRETA NO RENDER

## SENHA DO SUPABASE
```
Maxx@146390
```

---

## CONNECTION STRING COMPLETA
```
postgresql://postgres.mmfbirjrhrhobbnzfffe:Maxx@146390@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## CONFIGURAR NO RENDER AGORA

### 1. Acessar Render
```
https://dashboard.render.com
```

### 2. Selecionar Serviço
Clique em: **maxxcontrol-x-sistema**

### 3. Ir para Environment
Menu lateral → **Environment**

### 4. Editar DATABASE_URL
Procure `DATABASE_URL` e clique em **Edit**

Cole esta string:
```
postgresql://postgres.mmfbirjrhrhobbnzfffe:Maxx@146390@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 5. Ou Configurar Variáveis Separadas

Se preferir, delete `DATABASE_URL` e adicione estas:

```
USE_SQLITE=false

DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.mmfbirjrhrhobbnzfffe
DB_PASSWORD=Maxx@146390
```

### 6. Salvar
Clique em **Save Changes**

---

## AGUARDAR REDEPLOY

O Render vai fazer redeploy automaticamente (2-3 minutos)

---

## VERIFICAR LOGS

Deve aparecer:
```
🐘 Usando PostgreSQL como banco de dados
✅ Banco de dados PostgreSQL conectado: 2026-02-28 ...
```

---

## TESTAR

1. Acesse: https://maxxcontrol-frontend.onrender.com/login
2. Login: admin@maxxcontrol.com
3. Senha: Admin@123
4. Vá em Dispositivos
5. Dispositivo deve aparecer!

---

**CONFIGURE AGORA NO RENDER!** 🚀
