# 🏗️ Arquitetura — Maxxcontrol X

## Visão Geral

```
┌──────────────────────────────────────────────────────────────┐
│                    MAXXCONTROL X SYSTEM                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ React SPA   │  │ Android App │  │ Chrome Plugin       │  │
│  │ (Vite)      │  │ MAXX PLAYER │  │ (IPTV Relay)        │  │
│  │ TailwindCSS │  │ Kotlin      │  │ QPanel Integration  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│  ═══════╪════════════════╪═════════════════════╪═══════════  │
│         │         REST API (Express)           │             │
│  ═══════╪════════════════╪═════════════════════╪═══════════  │
│         │                │                     │             │
│  ┌──────┴──────────────────────────────────────┴──────────┐  │
│  │                   EXPRESS SERVER                        │  │
│  │  server.js (porta 3000)                                │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐    │  │
│  │  │          32 MÓDULOS DE ROTAS                    │    │  │
│  │  │                                                │    │  │
│  │  │  auth · mac · apps · logs · bugs · updates     │    │  │
│  │  │  monitor · api-monitor · api-config · content  │    │  │
│  │  │  branding · iptv-server · iptv-tree · banners  │    │  │
│  │  │  resale · settings · payments · whatsapp       │    │  │
│  │  │  integrations/google · plan-mapping · sports   │    │  │
│  │  │  iptv-credentials · iptv-servers               │    │  │
│  │  │  iptv-monitoring · playlist-manager            │    │  │
│  │  │  iptv-plugin · finance · tv-manager            │    │  │
│  │  │  telegram · notifications · ai-agent · mcp     │    │  │
│  │  │  maintenance(sentinela)                        │    │  │
│  │  └────────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │  │
│  │  │WebSocket │  │Socket.IO │  │ Sentinela Agent  │     │  │
│  │  │(ws)      │  │(MaxxChat)│  │ (Auto-maint.)    │     │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘     │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴───────────────────────────────┐  │
│  │              BANCO DE DADOS                             │  │
│  │  PostgreSQL (Supabase) ←──── Produção                  │  │
│  │  SQLite                ←──── Desenvolvimento local     │  │
│  │                                                        │  │
│  │  25+ tabelas: users, devices, logs, bugs, banners,     │  │
│  │  conteudos, iptv_servers, qpanel_panels, whatsapp_*,   │  │
│  │  mp_transactions, device_keys, device_playlists, etc.  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           INTEGRAÇÕES EXTERNAS                          │  │
│  │  TMDB API · SportsData.io · Google OAuth2              │  │
│  │  WhatsApp (Baileys) · Telegram Bot · Mercado Pago      │  │
│  │  Xtream API (IPTV) · QPanel (Relay Plugin)             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados Principal

```
Dispositivo Android → WebSocket → server.js → PostgreSQL
                    → REST API  →           → Response JSON

Painel Web (React) → REST API → server.js → PostgreSQL
                   → Socket.IO →          → Real-time updates

WhatsApp → Baileys → whatsappRoutes → PostgreSQL
                   → Socket.IO     → LiveChat (Painel)

Chrome Plugin → REST API → plugin_relay_commands → QPanel
```

## Estrutura de Diretórios

```
Painel Maxxcontrol-x-sistema/
│
├── server.js                 # Entry point — Express + migrações automáticas
├── package.json              # Dependências (maxxcontrol-x v1.0.0)
├── render.yaml               # Config deploy Render.com
├── nodemon.json              # Config dev server
│
├── config/                   # Configuração de conexões
│   ├── database.js           # Pool PostgreSQL
│   ├── database-sqlite.js    # Fallback SQLite
│   └── supabase.js           # Cliente Supabase
│
├── middlewares/              # Middlewares Express
│   ├── auth.js               # Verificação JWT
│   └── deviceAuth.js         # Autenticação de dispositivos
│
├── modules/                  # 32 módulos de negócio (ver detalhes abaixo)
│   ├── auth/                 # Autenticação e autorização
│   ├── mac/                  # Gestão de dispositivos (MAC address)
│   ├── apps/                 # Apps instalados nos dispositivos
│   ├── iptv-server/          # Configuração IPTV global
│   ├── iptv-credentials/     # Credenciais Xtream por device
│   ├── iptv-servers/         # Multi-servidor IPTV
│   ├── iptv-monitoring/      # Health check de servidores
│   ├── iptv-tree/            # Árvore de categorias/canais
│   ├── whatsapp/             # Bot WhatsApp (Baileys)
│   ├── telegram/             # Bot Telegram (2FA)
│   ├── branding/             # White Label e temas
│   ├── banners/              # Gerador de banners TMDB
│   ├── content/              # Conteúdos (filmes/séries TMDB)
│   ├── finance/              # Planos comerciais e checkout
│   ├── payments/             # Pagamentos PIX/Mercado Pago
│   ├── resale/               # Sistema de revenda e créditos
│   ├── plan-mapping/         # Mapeamento plano → servidor IPTV
│   ├── playlist-manager/     # Gerenciador de playlists 4-in-1
│   ├── tv-manager/           # Categorias e canais TV custom
│   ├── sports/               # Dados esportivos (SportsData.io)
│   ├── monitoring/           # Monitoramento de dispositivos
│   ├── api-monitor/          # Monitor de APIs externas
│   ├── api-config/           # Configuração de APIs
│   ├── logs/                 # Sistema de logs
│   ├── bugs/                 # Rastreamento de bugs
│   ├── updates/              # Controle de versões do app
│   ├── settings/             # Configurações globais
│   ├── maintenance/          # Sentinela de manutenção automática
│   ├── integrations/         # Google OAuth2, Drive, Contatos
│   ├── mcp/                  # Model Context Protocol
│   ├── notifications/        # Sistema de notificações
│   └── ai-agent/             # Agente IA integrado
│
├── services/                 # Serviços compartilhados
│   ├── tmdbService.js        # TMDB API client
│   ├── sportsService.js      # SportsData.io client
│   └── googleService.js      # Google APIs client
│
├── database/                 # Schemas e migrações
│   ├── schema.sql            # Schema base
│   ├── migrations/           # Migrações incrementais
│   ├── setup-supabase.js     # Setup PostgreSQL
│   └── setup-sqlite.js       # Setup SQLite local
│
├── websocket/                # Comunicação tempo real
│   └── wsServer.js           # WebSocket server (dispositivos)
│
├── web/                      # Frontend React (SPA)
│   ├── src/
│   │   ├── App.jsx           # Router principal
│   │   ├── main.jsx          # Entry point React
│   │   ├── pages/            # 38 páginas
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── context/          # AuthContext
│   │   └── services/         # API clients
│   ├── vite.config.js        # Build config
│   └── tailwind.config.js    # TailwindCSS config
│
├── chrome-plugin-mxx/        # Extensão Chrome (QPanel relay)
├── public/                   # Arquivos estáticos
│   ├── media/                # Mídia WhatsApp
│   └── uploads/              # Uploads gerais
│
└── scripts/                  # Scripts utilitários
    ├── populate-tmdb-content.js
    ├── gerar-hash-senha.js
    └── extract-apis.js
```

## Banco de Dados — Tabelas Principais

### Core
| Tabela | Função |
|---|---|
| `users` | Usuários do sistema (admin, revendedor) |
| `devices` | Dispositivos Android registrados (MAC) |
| `logs` | Logs de atividade |
| `system_logs` | Logs do sistema (severity levels) |
| `bugs` | Relatórios de bugs/crashes |
| `app_versions` | Controle de versões do app |
| `global_settings` | Configurações globais (key-value JSONB) |

### IPTV
| Tabela | Função |
|---|---|
| `iptv_server_config` | Config IPTV global (single row) |
| `device_iptv_config` | Config IPTV por dispositivo |
| `iptv_servers` | Servidores IPTV cadastrados |
| `iptv_playlists` | Playlists de servidores |
| `iptv_providers` | Slots de provedores (1-6) |
| `device_iptv_sync` | Sincronização device↔servidor |
| `tv_categories` | Categorias de TV customizadas |
| `tv_channels` | Canais de TV por categoria |
| `servers` | Servidores de streaming |
| `playlist_servers` | Servidores do playlist manager |

### QPanel
| Tabela | Função |
|---|---|
| `qpanel_panels` | Painéis QPanel registrados |
| `qpanel_servers` | Servidores por painel |
| `qpanel_accounts` | Contas por painel |
| `plugin_relay_commands` | Fila de comandos Chrome↔Painel |
| `smartone_registrations` | Registros SmartONE |

### Dispositivos Avançado
| Tabela | Função |
|---|---|
| `device_keys` | Chaves de acesso por MAC |
| `device_playlists` | Playlists por dispositivo |
| `device_configs` | Configurações DNS por device |
| `device_codes` | Códigos temporários (login) |
| `device_commands` | Comandos remotos para devices |
| `device_apps` | Apps instalados por device |
| `plan_mappings` | Mapeamento plano→config IPTV |

### Comercial
| Tabela | Função |
|---|---|
| `app_activation_packages` | Pacotes de ativação (MAXX PLAYER, SmartONE, IBO) |
| `mp_transactions` | Transações PIX/Mercado Pago |

### Conteúdo
| Tabela | Função |
|---|---|
| `conteudos` | Filmes/séries (dados TMDB) |
| `banners` | Banners gerados |
| `banner_templates` | Templates de banners |
| `branding_settings` | Configurações white-label |
| `profile_backgrounds` | Backgrounds da tela de perfis |
| `profile_screen_config` | Config da tela de perfis |

### WhatsApp / Chat
| Tabela | Função |
|---|---|
| `whatsapp_conversations` | Conversas do MaxxChat |
| `whatsapp_messages` | Mensagens (histórico) |
| `whatsapp_labels` | Labels/tags de conversas |
| `whatsapp_quick_replies` | Respostas rápidas |
| `whatsapp_flows` | Fluxos do chatbot |
| `whatsapp_chatbot_sessions` | Sessões ativas do chatbot |

### Integrações
| Tabela | Função |
|---|---|
| `google_configs` | Tokens OAuth2 Google por usuário |

## API REST — Rotas Registradas

| Prefixo | Módulo | Descrição |
|---|---|---|
| `/api/auth` | auth | Login, registro, 2FA |
| `/api/device` `/api/devices` `/api/mac` | mac | CRUD de dispositivos |
| `/api/apps` | apps | Apps instalados |
| `/api/log` `/api/logs` | logs | Logs de atividade |
| `/api/bug` | bugs | Relatórios de bugs |
| `/api/app` | updates | Versões do app |
| `/api/monitor` | monitoring | Status dos dispositivos |
| `/api/api-monitor` | api-monitor | Monitor de APIs |
| `/api/api-config` | api-config | Config de APIs |
| `/api/content` | content | Conteúdos TMDB |
| `/api/branding` | branding | White label |
| `/api/iptv-server` | iptv-server | Config IPTV global |
| `/api/iptv-tree` | iptv-tree | Árvore de canais |
| `/api/banners` | banners | Banners gerados |
| `/api/banner-templates` | banners | Templates |
| `/api/resale` | resale | Revenda e créditos |
| `/api/settings` | settings | Config globais |
| `/api/payments` | payments | Pagamentos |
| `/api/whatsapp` | whatsapp | Bot WhatsApp |
| `/api/integrations/google` | integrations | Google OAuth2 |
| `/api/plan-mapping` | plan-mapping | Mapeamento de planos |
| `/api/sports` | sports | Dados esportivos |
| `/api/iptv` | iptv-* | Credenciais/servidores/monitoring |
| `/api/playlist-manager` | playlist-manager | Gerenciador playlists |
| `/api/iptv-plugin` | iptv-servers | Plugin unificado |
| `/api/finance` | finance | Planos comerciais |
| `/api/tv-manager` | tv-manager | Categorias/canais TV |
| `/health` | — | Health check |
| `/api/sentinela/status` | — | Status do agente Sentinela |
| `/api/debug/dist` | — | Debug do build frontend |

## Frontend — Páginas (38)

| Página | Arquivo | Função |
|---|---|---|
| Login | `Login.jsx` | Autenticação + 2FA |
| Dashboard | `Dashboard.jsx` | Visão geral do sistema |
| Devices | `Devices.jsx` | Gestão de dispositivos (111KB — maior página) |
| Landing | `Landing.jsx` | Landing page pública (95KB) |
| WhatsApp Auto | `WhatsAppAuto.jsx` | Automação WhatsApp (97KB) |
| Banner Generator | `BannerGenerator.jsx` | Fábrica de banners (88KB) |
| Finance Plans | `FinancePlans.jsx` | Planos e checkout (87KB) |
| Resale | `Resale.jsx` | Sistema de revenda (81KB) |
| Branding | `Branding.jsx` | White label (65KB) |
| Settings | `Settings.jsx` | Configurações (58KB) |
| TV Manager | `TvManager.jsx` | Gerenciar canais TV (52KB) |
| Live Chat | `LiveChat.jsx` | MaxxChat ao vivo (40KB) |
| Servers Management | `ServersManagement.jsx` | Multi-servidor (31KB) |
| White Label | `WhiteLabel.jsx` | Temas (27KB) |
| Playlist Manager | `PlaylistManager.jsx` | 4-in-1 playlists |
| IPTV Tree Viewer | `IptvTreeViewer.jsx` | Árvore de categorias |
| Logs | `Logs.jsx` | Visualização de logs |
| Store | `Store.jsx` | Loja de apps |
| Tickets | `Tickets.jsx` | Sistema de tickets |
| White Label Store | `WhiteLabelStore.jsx` | Loja white label |
| Profile Screen | `ProfileScreenManager.jsx` | Tela de perfis |
| API Panel | `APIPanel.jsx` | Painel de APIs |
| Game Schedule | `GameSchedule.jsx` | Agenda esportiva |
| API Config | `APIConfig.jsx` | Configuração APIs |
| Login | `Login.jsx` | Tela de login |
| API Monitor | `APIMonitor.jsx` | Monitor de APIs |
| IPTV Panel | `IptvPanel.jsx` | Painel IPTV |
| Plan Mapping | `PlanMapping.jsx` | Mapeamento planos |
| Banner Gallery | `BannerGallery.jsx` | Galeria de banners |
| Versions | `Versions.jsx` | Controle versões |
| Server Manager | `ServerManager.jsx` | Gerenciar servidores |
| IPTV Server | `IptvServer.jsx` | Config IPTV |
| Bugs | `Bugs.jsx` | Bugs reportados |
| AI Agent Tab | `AiAgentTab.jsx` | Agente IA |
| Nexus Agent | `NexusAgent.jsx` | Agente Nexus |
| IPTV Servers Manager | `IptvServersManager.jsx` | Multi IPTV |
| Branding Banners | `BrandingBanners.jsx` | Banners branding |
| Devices With Logs | `DevicesWithLogs.jsx` | Devices + logs |

## Segurança

| Recurso | Implementação |
|---|---|
| **Autenticação** | JWT (jsonwebtoken) com expiração configurável |
| **2FA** | Via Telegram Bot (código temporário) |
| **Senhas** | bcryptjs (hash + salt) |
| **Rate Limiting** | express-rate-limit (500 req/15min geral, 5000 para IPTV tree) |
| **Headers** | Helmet.js (segurança HTTP) |
| **CORS** | cors middleware |
| **Auth Devices** | MAC address + device key |

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (default: 3000) |
| `NODE_ENV` | Ambiente (development/production) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Conexão PostgreSQL |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase |
| `USE_SQLITE` | Usar SQLite local (true/false) |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Autenticação JWT |
| `WS_PORT` | Porta WebSocket |
| `IPTV_API_URL` / `IPTV_API_KEY` | API IPTV externa |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google OAuth2 |

## Deploy — Render.com

- **Tipo**: Web Service (Node.js)
- **Plano**: Free
- **Build**: `npm install && cd web && npm install && npx vite build`
- **Start**: `npm start` (node server.js)
- **Health Check**: `/health`
- **Database**: PostgreSQL (plano free)
- **Secrets**: Grupo `maxxcontrol-secrets`
