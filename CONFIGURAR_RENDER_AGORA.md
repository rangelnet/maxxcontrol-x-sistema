# ⚙️ CONFIGURAR VARIÁVEIS DE AMBIENTE NO RENDER

## PROBLEMA
O Render está usando SQLite em vez de Supabase porque não lê o arquivo `.env` do repositório.

## SOLUÇÃO
Configurar variáveis de ambiente diretamente no painel do Render.

---

## PASSO A PASSO

### 1. Acessar Dashboard do Render
```
https://dashboard.render.com
```

### 2. Selecionar o Serviço
- Clique no serviço: **maxxcontrol-x-sistema** (ou maxxcontrol-x-api)

### 3. Ir para Environment
- No menu lateral, clique em **Environment**

### 4. Adicionar Variáveis de Ambiente

Clique em **Add Environment Variable** e adicione TODAS estas variáveis:

```
USE_SQLITE=false

DATABASE_URL=postgresql://postgres.mmfbirjrhrhobbnzfffe:Rangel2024@aws-0-us-east-1.pooler.supabase.com:6543/postgres

DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.mmfbirjrhrhobbnzfffe
DB_PASSWORD=Rangel2024

SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY=sb_publishable_oUowKSGxGtxiy96we_bSvA_KZ-9aSROB

TMDB_API_KEY=7bc56e27708a9d2069fc999d44a6be0a

JWT_SECRET=maxxcontrol_x_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d

DEVICE_API_TOKEN=tvmaxx_device_api_token_2024_secure_key

NODE_ENV=production
PORT=3001
```

### 5. Salvar
- Clique em **Save Changes**

### 6. Aguardar Redeploy
O Render vai fazer redeploy automaticamente (2-3 minutos)

---

## VERIFICAR SE DEU CERTO

Após o deploy, veja os logs. Deve aparecer:

```
🐘 Usando PostgreSQL como banco de dados
✅ Banco de dados PostgreSQL conectado
```

Em vez de:

```
📦 Usando SQLite como banco de dados
```

---

## TESTAR

1. Acesse: https://maxxcontrol-frontend.onrender.com/login
2. Login: admin@maxxcontrol.com
3. Senha: Admin@123
4. Vá em Dispositivos
5. Dispositivo deve aparecer!

---

**EXECUTE AGORA NO RENDER!** 🚀
