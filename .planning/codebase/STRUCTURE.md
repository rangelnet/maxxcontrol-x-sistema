# 📁 STRUCTURE.md — Estrutura de Diretórios MaxxControl

> Mapeado em: 2026-05-05

---

## 1. Raiz do Projeto

```
Painel Maxxcontrol-x-sistema/
├── .env                          # Variáveis de ambiente (secrets)
├── .env.example                  # Template de env vars
├── .git/                         # Repositório Git
├── .github/                      # GitHub configs
├── .planning/                    # GSD planning docs (este diretório)
├── server.js                     # ★ ENTRY POINT — Express + migrações + rotas
├── package.json                  # Deps backend (express, baileys, pg, etc.)
├── render.yaml                   # Config de deploy Render.com
├── nodemon.json                  # Config hot-reload dev
├── maxxcontrol.db                # SQLite local (fallback)
│
├── config/                       # Configuração de infraestrutura
│   ├── database.js               # ★ Selector PostgreSQL/SQLite
│   ├── database-sqlite.js        # Wrapper SQLite com Promises
│   └── supabase.js               # Client Supabase
│
├── middlewares/                   # Middlewares Express
│   ├── auth.js                   # JWT auth (admin)
│   └── deviceAuth.js             # Token auth (dispositivos Android)
│
├── modules/                      # ★ MÓDULOS DE NEGÓCIO (30 domínios)
│   ├── auth/                     # Login, registro, JWT
│   ├── mac/                      # Dispositivos (MAC address, heartbeat)
│   ├── apps/                     # APKs instalados
│   ├── updates/                  # Versionamento OTA
│   ├── logs/                     # Logs do sistema
│   ├── bugs/                     # Crash reports
│   ├── monitoring/               # Monitoramento de dispositivos
│   ├── api-monitor/              # Monitoramento de APIs externas
│   ├── api-config/               # Configuração de APIs
│   ├── content/                  # Conteúdo TMDB
│   ├── branding/                 # Logos e cores dinâmicas
│   ├── banners/                  # Gerador de banners + templates
│   ├── iptv-server/              # Config servidor IPTV principal
│   ├── iptv-servers/             # Multi-servidor + plugin unificado
│   ├── iptv-credentials/         # Credenciais IPTV
│   ├── iptv-monitoring/          # Monitoramento IPTV
│   ├── iptv-tree/                # Árvore de categorias IPTV
│   ├── playlist-manager/         # Gerenciador M3U/Xtream
│   ├── resale/                   # Sistema de revenda
│   ├── finance/                  # Planos financeiros
│   ├── payments/                 # PIX / Mercado Pago
│   ├── settings/                 # Configurações globais
│   ├── whatsapp/                 # WhatsApp Baileys + MaxxChat
│   ├── telegram/                 # Bot Telegram (2FA)
│   ├── notifications/            # Sistema de notificações
│   ├── sports/                   # Dados esportivos
│   ├── integrations/             # Google OAuth2
│   ├── maintenance/              # Sentinela Maxx
│   ├── ai-agent/                 # Agente IA (MCP)
│   └── mcp/                      # Model Context Protocol
│
├── services/                     # Serviços compartilhados
│   ├── tmdbService.js            # API TMDB (filmes/séries)
│   ├── sportsService.js          # API-Football + TheSportsDB
│   └── googleService.js          # Google Drive/Contatos
│
├── database/                     # Schema e migrações SQL
│   ├── schema.sql                # Schema base (users, devices, logs, bugs)
│   ├── api-config-schema.sql     # Schema de configs de API
│   ├── content-branding-schema.sql # Schema de conteúdo
│   ├── migrations/               # Migrações incrementais
│   ├── setup-sqlite.js           # Setup SQLite
│   ├── setup-supabase.js         # Setup Supabase
│   └── seed.js                   # Dados iniciais
│
├── websocket/                    # Real-time
│   └── wsServer.js               # Servidor WebSocket (ws)
│
├── chrome-plugin-mxx/            # Extensão Chrome (Relay)
│   ├── manifest.json             # Manifest V3
│   ├── background.js             # Service Worker (polling)
│   └── content.js                # Content script (scraping)
│
├── web/                          # ★ FRONTEND SPA
│   ├── package.json              # Deps frontend (React, Vite, Tailwind)
│   ├── index.html                # HTML template
│   ├── vite.config.js            # Config Vite
│   ├── tailwind.config.js        # Config Tailwind
│   ├── postcss.config.js         # Config PostCSS
│   ├── dist/                     # Build de produção
│   └── src/                      # Código-fonte React
│       ├── main.jsx              # React DOM entry
│       ├── App.jsx               # Router principal (20+ rotas)
│       ├── index.css             # Estilos globais
│       ├── context/              # React Context
│       │   ├── AuthContext.jsx
│       │   └── WhatsAppContext.jsx
│       ├── components/           # Componentes reutilizáveis
│       │   ├── Layout.jsx        # Layout admin (sidebar + topbar)
│       │   ├── Logo.jsx
│       │   ├── PrivateRoute.jsx
│       │   ├── PasswordInput.jsx
│       │   ├── TestApiModal.jsx
│       │   └── MovieBannerElite.jsx
│       ├── pages/                # 34 páginas
│       │   ├── Dashboard.jsx     # Home admin
│       │   ├── Devices.jsx       # Gestão dispositivos (121KB!)
│       │   ├── Landing.jsx       # Landing page pública (95KB)
│       │   ├── BannerGenerator.jsx # Gerador banners (88KB)
│       │   ├── WhatsAppAuto.jsx  # MaxxChat (97KB)
│       │   ├── Resale.jsx        # Revenda (77KB)
│       │   ├── FinancePlans.jsx  # Planos financeiros (77KB)
│       │   ├── Settings.jsx      # Configurações (58KB)
│       │   ├── LiveChat.jsx      # Chat ao vivo (40KB)
│       │   ├── Branding.jsx      # Marca/logo (43KB)
│       │   ├── Login.jsx         # Login (14KB)
│       │   ├── IptvPanel.jsx     # Painel IPTV
│       │   └── ... (21 mais)
│       ├── services/             # API client
│       │   ├── api.js            # Axios instance
│       │   └── websocket.js      # WS client
│       └── data/                 # Dados estáticos
│
├── scripts/                      # Utilitários
│   ├── extract-apis.js           # Extração de endpoints
│   ├── gerar-hash-senha.js       # Gerador de hash bcrypt
│   ├── popular-conteudos-automatico.js # Auto-populate TMDB
│   ├── populate-tmdb-content.js  # Seed TMDB
│   └── seed_fire_master.js       # Seed master
│
├── public/                       # Arquivos estáticos
│   ├── banners/                  # Banners gerados
│   └── media/                    # Mídias WhatsApp
│
└── scratch/                      # Temporários/debug
```

---

## 2. CEREBRO MAXXCONTROL (Knowledge Base)

```
CEREBRO MAXXCONTROL/
├── Nexus_Core_Index.md           # ★ Hub central do vault
├── .obsidian/                    # Config Obsidian
├── .vscode/                      # Config VSCode
│
├── Agents/                       # 23+ agentes IA especializados
│   ├── Agents_MOC.md             # Catálogo de agentes
│   ├── Agente_Maxx_Master.md     # Master orchestrator
│   ├── Agente_IA_Master.md       # IA controller
│   ├── Agente_Seguranca.md       # Security agent
│   ├── Agente_QA.md              # QA tester
│   ├── Nexus_Painel.md           # Nexus panel operator
│   ├── Sports_Agent.md           # Sports data
│   ├── IPTV_Master/              # IPTV specialist
│   ├── WhatsApp_Master/          # WhatsApp specialist
│   ├── Branding_Master/          # Brand design
│   ├── Banner_Master/            # Banner generation
│   ├── Device_Master/            # Device management
│   ├── Resale_Master/            # Resale business
│   └── ... (10+ mais)
│
├── Docs/                         # Documentação técnica
│   ├── Documentação_Mestre.md    # Doc central do sistema
│   ├── Mapa_Modulos_Codigo.md    # Anatomia dos módulos
│   ├── Conexão_Total.md          # Status integração
│   ├── Laudo_Auditoria_Profunda.md
│   └── Ponte_Android.md          # Integração com app Android
│
├── Rules/                        # Regras obrigatórias
│   ├── Design_Rules.md           # Paleta, stack, responsividade
│   ├── Backend_Rules.md          # CommonJS, helmet, JWT
│   ├── Agent_Nexus_Painel.md     # Protocolo master agent
│   ├── Agent_Engenheiro_Web.md
│   └── Agent_Auditor_DB.md
│
├── Agentes_Memoria/              # Memória técnica
│   ├── Audit_Log_001.md
│   ├── Memoria_Tecnica_002_Antigravity.md
│   ├── Memoria_Tecnica_003_IPTV_Sync.md
│   └── Memoria_Tecnica_004_BannerGenerator_Incident.md
│
└── Tasks/                        # Backlog (vazio atualmente)
```

---

## 3. Convenções de Nomenclatura

| Tipo | Padrão | Exemplo |
|:-----|:-------|:--------|
| Módulos backend | kebab-case | `iptv-server/`, `api-config/` |
| Rotas Express | camelCase + `Routes` | `iptvServerRoutes.js` |
| Páginas React | PascalCase | `BannerGenerator.jsx` |
| Componentes React | PascalCase | `PrivateRoute.jsx` |
| Services | camelCase + `Service` | `tmdbService.js` |
| Schemas SQL | snake_case | `iptv_servers`, `qpanel_panels` |
| Config files | kebab-case | `database-sqlite.js` |
