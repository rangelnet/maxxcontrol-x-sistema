# Estrutura do Projeto

## Organização Raiz

```
maxxcontrol-x-sistema/
├── config/              # Configurações de banco de dados
├── database/            # Schemas, migrations, seeds
├── middlewares/         # Middlewares Express (auth, deviceAuth)
├── modules/             # Módulos de funcionalidades (feature-based)
├── scripts/             # Scripts utilitários
├── services/            # Serviços externos (TMDB)
├── websocket/           # WebSocket server
├── web/                 # Frontend React (SPA)
├── public/              # Arquivos estáticos (banners gerados)
├── server.js            # Entry point do backend
├── package.json         # Dependências backend
├── .env                 # Variáveis de ambiente
└── render.yaml          # Configuração de deploy
```

## Backend - Estrutura de Módulos

Cada módulo segue o padrão:
```
modules/{feature}/
├── {feature}Controller.js    # Lógica de negócio
└── {feature}Routes.js         # Definição de rotas Express
```

### `/modules/auth`
Autenticação de administradores
- `authController.js` - Login, registro, validação JWT
- `authRoutes.js` - POST /api/auth/login, /register, GET /validate-token

### `/modules/mac` (Device Management)
Gerenciamento de dispositivos via MAC address
- `macController.js` - Registro, verificação, bloqueio de dispositivos
- `macRoutes.js` - POST /api/device/register, /check, /block, /unblock, GET /list-all, DELETE /delete/:id

### `/modules/apps`
Gerenciamento de apps instalados nos dispositivos
- `appsController.js` - Listar, instalar, desinstalar apps
- `appsRoutes.js` - GET /api/apps/device/:id, POST /api/apps/register, /send-apk, /uninstall

### `/modules/iptv-server`
Configuração de servidores IPTV (Xtream Codes)
- `iptvServerController.js` - Config global e por dispositivo
- `iptvServerRoutes.js` - GET/POST /api/iptv-server/config, /config/:mac, /device/:id

### `/modules/branding`
Branding dinâmico (logos, cores)
- `brandingController.js` - CRUD de branding, templates
- `brandingRoutes.js` - GET /api/branding/current, /templates, PUT /api/branding/:id

### `/modules/api-config`
Configuração de URLs do app Android
- `apiConfigController.js` - URLs de APIs, versão mínima
- `apiConfigRoutes.js` - GET/PUT /api/api-config/config, GET /history

### `/modules/logs`
Logs de atividade dos dispositivos
- `logsController.js` - Criar, listar, filtrar logs
- `logsRoutes.js` - POST /api/log/create, GET /api/log

### `/modules/bugs`
Relatórios de crash e bugs
- `bugsController.js` - Reportar, listar, resolver bugs
- `bugsRoutes.js` - POST /api/bug/report, GET /api/bug, POST /resolve

### `/modules/monitoring`
Monitoramento de performance
- `monitoringController.js` - Receber e processar métricas
- `monitoringRoutes.js` - POST /api/monitor/performance, GET /reports

### `/modules/content`
Integração com TMDB
- `contentController.js` - Importar filmes/séries, pesquisar
- `contentRoutes.js` - POST /api/content/importar-filme/:id, GET /pesquisar

### `/modules/banners`
Geração de banners promocionais
- `bannerController.js` - Gerar banners em múltiplos tamanhos
- `bannerRoutes.js` - POST /api/banners/generate

### `/modules/api-monitor`
Monitoramento de APIs externas
- `apiMonitorController.js` - Health checks de APIs
- `apiMonitorRoutes.js` - GET /api/api-monitor/status

### `/modules/updates`
Controle de versões do app
- `updatesController.js` - Verificar versão, forçar atualização
- `updatesRoutes.js` - POST /api/app/check-version, GET /versions

## Frontend - Estrutura React

```
web/
├── src/
│   ├── pages/              # Páginas principais
│   │   ├── Login.jsx       # Autenticação admin
│   │   ├── Dashboard.jsx   # Visão geral e estatísticas
│   │   ├── Devices.jsx     # Gerenciar dispositivos
│   │   ├── IptvServer.jsx  # Config servidor IPTV
│   │   ├── Branding.jsx    # Branding dinâmico
│   │   ├── APIConfig.jsx   # Config URLs do app
│   │   ├── Logs.jsx        # Logs de atividade
│   │   ├── Bugs.jsx        # Relatórios de bugs
│   │   ├── Versions.jsx    # Controle de versões
│   │   ├── APIMonitor.jsx  # Status de APIs
│   │   └── BannerGenerator.jsx  # Galeria e gerador
│   │
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Layout.jsx      # Layout com sidebar
│   │   ├── Sidebar.jsx     # Menu lateral
│   │   └── TestApiModal.jsx # Modal de teste de API
│   │
│   ├── services/           # Serviços HTTP
│   │   └── api.js          # Cliente Axios configurado
│   │
│   ├── App.jsx             # Rotas e configuração
│   └── main.jsx            # Entry point
│
├── public/                 # Assets estáticos
├── index.html              # HTML base
├── vite.config.js          # Configuração Vite
├── tailwind.config.js      # Configuração Tailwind
└── package.json            # Dependências frontend
```

## Banco de Dados

### Tabelas Principais

#### `devices`
Dispositivos registrados
- id, mac_address (UNIQUE), modelo, android_version, app_version
- ip, status (ativo/bloqueado), connection_status (online/offline)
- current_iptv_server_url, current_iptv_username, test_api_url
- ultimo_acesso, created_at, updated_at

#### `device_iptv_config`
Configuração IPTV por dispositivo
- id, device_id (FK), xtream_url, xtream_username, xtream_password
- updated_at

#### `iptv_server_config`
Configuração IPTV global (fallback)
- id (sempre 1), xtream_url, xtream_username, xtream_password
- updated_at

#### `device_commands`
Fila de comandos para dispositivos
- id, device_id (FK), command_type (install_app, uninstall_app, block, unblock)
- command_data (JSON), status (pending, executing, completed, failed)
- result, created_at, completed_at

#### `device_apps`
Apps instalados nos dispositivos
- id, device_id (FK), package_name, app_name
- version_code, version_name, is_system
- installed_at, updated_at

#### `branding_settings`
Configurações de branding
- id, app_name, logo_url, logo_dark_url
- primary_color, secondary_color, background_color, text_color, accent_color
- splash_screen_url, hero_banner_url, ativo
- created_at, updated_at

#### `app_config`
Configuração de URLs do app
- id (sempre 1), server_url, api_base_url, auth_url, painel_url, cache_url
- tmdb_url, tmdb_api_key, check_updates, force_update, min_version
- created_at, updated_at

#### `logs`
Logs de atividade
- id, device_id (FK), tipo, descricao, created_at

#### `bugs`
Relatórios de bugs
- id, device_id (FK), stack_trace, modelo, app_version
- status (aberto/resolvido), created_at, updated_at

#### `performance_reports`
Métricas de performance
- id, device_id (FK), report_type, metrics (JSON)
- created_at

#### `conteudos`
Conteúdo TMDB (filmes/séries)
- id, tmdb_id, tipo, titulo, descricao
- poster_path, backdrop_path, nota, ano, generos
- banner_app_url, banner_share_url

#### `users`
Usuários administradores
- id, nome, email (UNIQUE), senha_hash, plano, status
- created_at, updated_at

## Configuração

### `/config/database.js`
Conexão com PostgreSQL (Supabase) ou SQLite

### `/config/supabase.js`
Cliente Supabase configurado

## Middlewares

### `/middlewares/auth.js`
Validação de JWT para rotas protegidas do painel

### `/middlewares/deviceAuth.js`
Validação de token fixo (X-Device-Token) para dispositivos

## WebSocket

### `/websocket/wsServer.js`
Servidor WebSocket para atualizações em tempo real
- Autenticação de conexões
- Broadcast de eventos (device:iptv-updated, device:test-api-updated)
- Gerenciamento de conexões ativas

## Scripts Utilitários

### `/scripts/gerar-hash-senha.js`
Gerar hash bcrypt para senhas de admin

### `/scripts/popular-conteudos-automatico.js`
Popular banco com conteúdo do TMDB

### `/scripts/populate-tmdb-content.js`
Script alternativo de população TMDB

### `/scripts/extract-apis.js`
Extrair endpoints de código

## Database

### `/database/schema.sql`
Schema completo do banco (SQLite/PostgreSQL)

### `/database/migrations/`
Migrações SQL para adicionar features
- `create_apps_tables.sql`
- `add_connection_status.sql`
- `create_performance_tables.sql`
- `create_crash_monitoring_tables.sql`

### `/database/seed.js`
Dados iniciais (admin, branding padrão)

### `/database/setup-sqlite.js`
Setup automático SQLite local

### `/database/setup-supabase.js`
Setup automático Supabase

## Arquivos Estáticos

### `/public/banners/`
Banners gerados pelo sistema (servidos via Express)

## Convenções de Nomenclatura

### Backend
- **Controllers**: `{feature}Controller.js` (ex: `appsController.js`)
- **Routes**: `{feature}Routes.js` (ex: `appsRoutes.js`)
- **Services**: `{feature}Service.js` (ex: `tmdbService.js`)
- **Middlewares**: `{purpose}.js` (ex: `auth.js`)

### Frontend
- **Pages**: `{Feature}.jsx` (ex: `Devices.jsx`)
- **Components**: `{ComponentName}.jsx` (ex: `TestApiModal.jsx`)
- **Services**: `{service}.js` (ex: `api.js`)

### Banco de Dados
- **Tabelas**: snake_case plural (ex: `device_commands`, `branding_settings`)
- **Colunas**: snake_case (ex: `mac_address`, `created_at`)

## Padrões Arquiteturais

### Backend
- **MVC Pattern**: Routes → Controllers → Database
- **Middleware Chain**: Auth → Rate Limit → Route Handler
- **Error Handling**: Try-catch com resposta JSON padronizada
- **Dependency Injection**: Pool de conexão injetado via require

### Frontend
- **Component-Based**: Componentes React funcionais
- **Hooks**: useState, useEffect para state management
- **API Service**: Cliente Axios centralizado com interceptors
- **Protected Routes**: Verificação de token antes de renderizar

### Comunicação
- **REST API**: JSON para todas as requisições/respostas
- **WebSocket**: Eventos em tempo real (device:*, command:*)
- **Polling**: App Android faz polling a cada 30s para comandos

## Fluxo de Dados

```
Frontend (React)
    ↓ HTTP Request
Backend (Express Routes)
    ↓ Controller
Business Logic
    ↓ SQL Query
Database (PostgreSQL/SQLite)
    ↓ Response
Backend (JSON)
    ↓ HTTP Response
Frontend (Update State)
```

## Deploy

### Render.com
- **Backend**: Web Service (server.js)
- **Frontend**: Static Site (web/dist)
- **Build Command**: `npm install && cd web && npm install && npm run build`
- **Start Command**: `npm start`

### GitHub Actions
- Auto-deploy em push para main
- Build e testes automáticos
