# ⚡ Quick Start - MaxxControl X

## 🚀 Início Rápido (3 minutos)

### 1️⃣ Criar o Banco de Dados
```bash
psql -U postgres -c "CREATE DATABASE maxxcontrol_x;"
psql -U postgres -d maxxcontrol_x -f database/schema.sql
```

### 2️⃣ Configurar Backend
```bash
# Edite .env e coloque sua senha do PostgreSQL
npm install
node database/seed.js
npm start
```

### 3️⃣ Iniciar Frontend
```bash
cd web
npm install
npm run dev
```

### 4️⃣ Acessar o Painel
Abra: `http://localhost:5173`

**Login:**
- Email: `admin@maxxcontrol.com`
- Senha: `Admin@123`

---

## 🎯 Comandos Úteis

**Backend:**
```bash
npm start          # Iniciar servidor
npm run dev        # Modo desenvolvimento (nodemon)
```

**Frontend:**
```bash
cd web
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
```

**Banco de Dados:**
```bash
# Conectar ao banco
psql -U postgres -d maxxcontrol_x

# Ver tabelas
\dt

# Ver usuários
SELECT * FROM users;
```

---

## 📊 URLs Importantes

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Health Check: `http://localhost:3000/health`
- WebSocket: `ws://localhost:3000`

---

## 🔥 Pronto!

Agora você tem acesso total ao MaxxControl X! 👑
