# Stack Tecnológico

## Backend

### Runtime & Framework
- **Node.js**: Runtime JavaScript
- **Express**: 4.18.2 - Framework web
- **Nodemon**: 3.0.2 - Auto-reload em desenvolvimento

### Banco de Dados
- **PostgreSQL**: Via Supabase (produção)
- **SQLite3**: 5.1.7 - Desenvolvimento local
- **pg**: 8.11.3 - Driver PostgreSQL
- **@supabase/supabase-js**: 2.98.0 - Cliente Supabase

### Autenticação & Segurança
- **jsonwebtoken**: 9.0.2 - JWT tokens
- **bcryptjs**: 2.4.3 - Hash de senhas
- **helmet**: 7.1.0 - Security headers
- **cors**: 2.8.5 - CORS middleware
- **express-rate-limit**: 7.1.5 - Rate limiting
- **libsodium-wrappers**: 0.8.2 - Criptografia

### Comunicação em Tempo Real
- **ws**: 8.14.2 - WebSocket server

### HTTP Client
- **axios**: 1.13.6 - Requisições HTTP

### Utilitários
- **dotenv**: 16.6.1 - Variáveis de ambiente
- **tweetnacl**: 1.0.3 - Criptografia adicional

## Frontend

### Core
- **React**: 18.2.0
- **React DOM**: 18.2.0
- **Vite**: 5.0.8 - Build tool e dev server

### Roteamento
- **react-router-dom**: 6.20.0

### Estilização
- **TailwindCSS**: 3.3.6
- **PostCSS**: 8.4.32
- **Autoprefixer**: 10.4.16

### HTTP Client
- **axios**: 1.6.2

### Ícones
- **lucide-react**: 0.294.0

### TypeScript (Dev)
- **@types/react**: 18.2.43
- **@types/react-dom**: 18.2.17
- **@vitejs/plugin-react**: 4.2.1

## Estrutura de Módulos Backend

### `/modules/auth`
- Autenticação JWT
- Login, registro, validação de token

### `/modules/mac` (ou `/modules/device`)
- Registro de dispositivos via MAC address
- Verificação de autorização
- Bloqueio/desbloqueio

### `/modules/apps`
- Listagem de apps instalados
- Comandos de instalação/desinstalação
- Sincronização de apps

### `/modules/iptv-server`
- Configuração global de servidor IPTV
- Configuração por dispositivo
- Teste de conexão Xtream

### `/modules/branding`
- Gerenciamento de branding dinâmico
- Templates de cores
- Logos e splash screens

### `/modules/api-config`
- Configuração de URLs do app
- Versão mínima, forçar atualização
- Histórico de configurações

### `/modules/logs`
- Registro de atividades dos dispositivos
- Filtros e busca

### `/modules/bugs`
- Relatórios de crash
- Stack traces
- Status de resolução

### `/modules/monitoring`
- Relatórios de performance
- Métricas de player, sync, imagens

### `/modules/content`
- Integração com TMDB
- Importação de filmes/séries
- Metadados

### `/modules/banners`
- Geração de banners em múltiplos tamanhos
- Templates profissionais

### `/modules/api-monitor`
- Monitoramento de APIs externas
- Health checks

### `/modules/updates`
- Controle de versões do app
- Verificação de atualizações

## Comandos Comuns

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Iniciar backend em dev (com auto-reload)
npm run dev

# Iniciar backend em produção
npm start

# Iniciar frontend em dev
cd web
npm run dev

# Build do frontend
cd web
npm run build
```

### Banco de Dados
```bash
# Setup SQLite local
node database/setup-sqlite.js

# Setup Supabase
node database/setup-supabase.js

# Executar migrações
node database/migrations/run-migration.js

# Popular dados de exemplo
node database/seed.js
```

### Scripts Utilitários
```bash
# Gerar hash de senha
node scripts/gerar-hash-senha.js

# Popular conteúdos TMDB
node scripts/popular-conteudos-automatico.js

# Testar API
node scripts/teste-rapido-console.js

# Verificar dispositivos
node check-devices-status.js
```

### Deploy
```bash
# Commit e push (GitHub Actions faz deploy automático)
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Deploy manual no Render
# Backend e frontend fazem rebuild automático
```

### Testes
```bash
# Testar endpoint
curl http://localhost:3000/health

# Testar com autenticação
curl -H "Authorization: Bearer {token}" http://localhost:3000/api/device/list-all

# Testar WebSocket
wscat -c ws://localhost:3000
```

## Configuração de Ambiente

### Variáveis (.env)
```bash
# Banco de Dados
USE_SQLITE=false
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...

# Autenticação
JWT_SECRET=...
DEVICE_TOKEN=...

# APIs Externas
TMDB_API_KEY=...

# Servidor
PORT=3000
NODE_ENV=production
```

## Estrutura de Pastas

```
maxxcontrol-x-sistema/
├── config/           # Configurações (database, supabase)
├── database/         # Schemas, migrations, seeds
├── middlewares/      # Auth, deviceAuth
├── modules/          # Módulos de funcionalidades
├── scripts/          # Scripts utilitários
├── services/         # Serviços externos (TMDB)
├── websocket/        # WebSocket server
├── web/              # Frontend React
│   ├── src/
│   │   ├── pages/    # Páginas do painel
│   │   ├── components/
│   │   └── services/
│   └── dist/         # Build de produção
├── public/           # Arquivos estáticos (banners)
├── server.js         # Entry point
└── package.json
```

## APIs Externas Integradas

- **TMDB**: Metadados de filmes/séries
- **Supabase**: Banco de dados PostgreSQL
- **Render**: Hospedagem e deploy
- **Xtream Codes**: Validação de servidores IPTV (via app)

## Portas e URLs

### Desenvolvimento
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### Produção
- Backend: https://maxxcontrol-x-sistema.onrender.com
- Frontend: https://maxxcontrol-frontend.onrender.com

## Credenciais Padrão

### Admin do Painel
- Email: admin@maxxcontrol.com
- Senha: Admin@123

### Token de Dispositivo
- Header: X-Device-Token
- Valor: Configurado em .env (DEVICE_TOKEN)
