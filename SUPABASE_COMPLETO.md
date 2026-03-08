on# 📘 Guia Completo do Supabase - MaxxControl X

## 🎯 Visão Geral

O MaxxControl X usa **Supabase** como banco de dados PostgreSQL em produção. Este documento contém TODAS as informações sobre a configuração e uso do Supabase no projeto.

## 🔑 Credenciais do Projeto

### Informações do Projeto
- **Project ID**: `mmfbirjrhrhobbnzfffe`
- **Project URL**: `https://mmfbirjrhrhobbnzfffe.supabase.co`
- **Dashboard**: `https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe`

### Chaves de API

#### Anon Key (Pública)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg1NDcsImV4cCI6MjA4NzY5NDU0N30.-UF_TVSxI_voNwntuLBtgZD4EyQz0xOUtCvCH8rdoys
```

#### Service Role Key (Privada - Backend)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExODU0NywiZXhwIjoyMDg3Njk0NTQ3fQ.5iLWAJ5sFIF1Q8U0vNEk9FKTDgGMS9YpRTXaX6vCZRo
```

#### Access Token (Para CI/CD)
```
sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0
```

### Connection String
```
postgresql://postgres.mmfbirjrhrhobbnzfffe:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**⚠️ IMPORTANTE**: Substitua `[SUA-SENHA]` pela senha real do banco de dados.

## 📁 Arquivos de Configuração

### 1. `config/supabase.js`
Cliente Supabase configurado para uso no backend:

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

### 2. `config/database.js`
Configuração do pool de conexões PostgreSQL:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

module.exports = pool;
```

### 3. `database/setup-supabase.js`
Script para setup inicial do banco de dados no Supabase.

## 🔧 Variáveis de Ambiente

### Para Desenvolvimento Local (.env)
```bash
# Banco de Dados
USE_SQLITE=false
DATABASE_URL=postgresql://postgres.mmfbirjrhrhobbnzfffe:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Supabase
SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg1NDcsImV4cCI6MjA4NzY5NDU0N30.-UF_TVSxI_voNwntuLBtgZD4EyQz0xOUtCvCH8rdoys
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmJpcmpyaHJob2JibnpmZmZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExODU0NywiZXhwIjoyMDg3Njk0NTQ3fQ.5iLWAJ5sFIF1Q8U0vNEk9FKTDgGMS9YpRTXaX6vCZRo

# Outras variáveis...
JWT_SECRET=maxxcontrol_x_super_secret_key_2024_change_in_production
DEVICE_TOKEN=seu_token_aqui
TMDB_API_KEY=7bc56e27708a9d2069fc999d44a6be0a
```

### Para Produção (Render.com)
Configure as mesmas variáveis no dashboard do Render:
1. Acesse: https://dashboard.render.com
2. Selecione o serviço `maxxcontrol-x-sistema`
3. Vá em **Environment**
4. Adicione cada variável

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `users`
Usuários administradores do painel
- id, nome, email, senha_hash
- plano, status, expira_em, criado_em

#### `devices`
Dispositivos Android TV registrados
- id, user_id, mac_address (UNIQUE)
- modelo, android_version, app_version
- ip, ultimo_acesso, status, connection_status

#### `device_iptv_config`
Configuração IPTV por dispositivo
- id, device_id, xtream_url, xtream_username, xtream_password

#### `iptv_server_config`
Configuração IPTV global (fallback)
- id (sempre 1), xtream_url, xtream_username, xtream_password

#### `device_commands`
Fila de comandos para dispositivos
- id, device_id, command_type, command_data (JSON)
- status, result, created_at, completed_at

#### `device_apps`
Apps instalados nos dispositivos
- id, device_id, package_name, app_name
- version_code, version_name, is_system

#### `branding_settings`
Configurações de branding dinâmico
- id, app_name, logo_url, logo_dark_url
- primary_color, secondary_color, etc.

#### `app_config`
Configuração de URLs do app
- id, server_url, api_base_url, auth_url, painel_url

#### `logs`
Logs de atividade dos dispositivos
- id, device_id, tipo, descricao, created_at

#### `bugs`
Relatórios de bugs e crashes
- id, device_id, stack_trace, modelo, app_version, status

#### `performance_reports`
Métricas de performance
- id, device_id, report_type, metrics (JSON)

#### `conteudos`
Conteúdo TMDB (filmes/séries)
- id, tmdb_id, tipo, titulo, descricao
- poster_path, backdrop_path, nota, ano

#### `banners`
Banners gerados pelo sistema
- id, type, title, data (JSONB), template
- image_url, created_at, updated_at

## 🚀 Como Executar Migrations

### Opção 1: Via SQL Editor (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/sql/new
2. Cole o SQL da migration
3. Clique em **Run**

**Exemplo - Migration da tabela banners:**
```sql
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  template VARCHAR(50),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banners_type ON banners(type);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at DESC);
```

### Opção 2: Via Script Node.js

```bash
cd maxxcontrol-x-sistema
node database/migrations/run-banners-migration.js
```

### Opção 3: Via Render Shell

1. Acesse o dashboard do Render
2. Vá no serviço `maxxcontrol-x-sistema`
3. Clique em **Shell**
4. Execute: `node database/migrations/run-banners-migration.js`

## 📦 Dependências NPM

```json
{
  "@supabase/supabase-js": "2.98.0",
  "pg": "8.11.3"
}
```

## 🔍 Como Verificar se Está Funcionando

### 1. Testar Conexão
```bash
cd maxxcontrol-x-sistema
node -e "const pexões esgotado
**Solução**: Reinicie o serviço no Render ou ajuste o `max` no pool

### Erro: "SSL connection required"
**Causa**: Falta configuração SSL
**Solução**: Já está configurado em `config/database.js` com `ssl: { rejectUnauthorized: false }`

## 📚 Links Úteis

- **Dashboard**: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe
- **SQL Editor**: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/sql/new
- **Database Settings**: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database
- **API Settings**: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/api
- **Documentação**: https://supabase.com/docs

## 🎓 Comandos Úteis

### Popular Conteúdos TMDB
```bash
cd maxxcontrol-x-sistema
npm install axios @supabase/supabase-js dotenv
node scripts/popular-conteudos-automatico.js
```

### Setup Inicial
```bash
node database/setup-supabase.js
```

### Executar Migration Específica
```bash
node database/migrations/run-banners-migration.js
```

## ✅ Checklist de Configuração

- [ ] Variáveis de ambiente configuradas no .env
- [ ] DATABASE_URL com senha correta
- [ ] SUPABASE_URL configurada
- [ ] SUPABASE_KEY configurada
- [ ] SUPABASE_SERVICE_KEY configurada
- [ ] Tabelas criadas no banco
- [ ] Usuário admin criado
- [ ] Conexão testada e funcionando
- [ ] Migrations executadas
- [ ] Deploy no Render configurado

## 🔐 Segurança

**⚠️ NUNCA COMMITE:**
- Senhas do banco de dados
- Service Role Key em código público
- Connection strings com senhas
- Tokens de acesso

**✅ SEMPRE USE:**
- Variáveis de ambiente (.env)
- Secrets do GitHub para CI/CD
- Environment variables no Render
- .gitignore para .env

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no Render: https://dashboard.render.com
2. Verifique os logs no Supabase: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/logs
3. Teste a conexão localmente
4. Verifique se as variáveis de ambiente estão corretas
