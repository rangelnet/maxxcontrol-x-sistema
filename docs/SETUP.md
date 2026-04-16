# 🚀 Setup Completo - MaxxControl X

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn

## 🗄️ Passo 1: Configurar PostgreSQL

### Instalar PostgreSQL (se não tiver)

**Windows:**
- Baixe em: https://www.postgresql.org/download/windows/
- Instale e anote a senha do usuário `postgres`

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

### Criar o Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco
CREATE DATABASE maxxcontrol_x;

# Sair
\q
```

Ou em uma linha:
```bash
psql -U postgres -c "CREATE DATABASE maxxcontrol_x;"
```

## ⚙️ Passo 2: Configurar o Backend

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` e ajuste a senha do PostgreSQL:
```env
DB_PASSWORD=sua_senha_do_postgres
```

### 3. Criar as tabelas do banco
```bash
psql -U postgres -d maxxcontrol_x -f database/schema.sql
```

### 4. Criar usuário de teste
```bash
node database/seed.js
```

### 5. Iniciar o servidor
```bash
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 🎨 Passo 3: Configurar o Frontend

```bash
cd web
npm install
npm run dev
```

O painel estará rodando em: `http://localhost:5173`

## 🔐 Credenciais de Acesso

```
📧 Email: admin@maxxcontrol.com
🔑 Senha: Admin@123
```

## ✅ Verificar se está funcionando

1. Backend: Acesse `http://localhost:3000/health`
2. Frontend: Acesse `http://localhost:5173`
3. Faça login com as credenciais acima

## 🐛 Problemas Comuns

### Erro de conexão com o banco
- Verifique se o PostgreSQL está rodando
- Confirme a senha no arquivo `.env`
- Teste a conexão: `psql -U postgres -d maxxcontrol_x`

### Porta já em uso
- Backend: Altere `PORT` no `.env`
- Frontend: Altere `port` no `web/vite.config.js`

### Erro ao criar usuário
- Certifique-se de que as tabelas foram criadas
- Execute: `psql -U postgres -d maxxcontrol_x -f database/schema.sql`

## 📱 Próximos Passos

Após o login, você terá acesso a:
- Dashboard com estatísticas
- Gerenciamento de dispositivos
- Relatório de bugs
- Controle de versões
- Visualização de logs

## 🔒 Segurança

⚠️ **IMPORTANTE:** 
- Altere o `JWT_SECRET` no `.env` para produção
- Use senhas fortes
- Configure HTTPS em produção
- Não exponha o `.env` no repositório
