# 🔌 INTEGRATIONS.md — Integrações Externas MaxxControl

> Mapeado em: 2026-05-05

---

## 1. APIs Externas

### 🎬 TMDB (The Movie Database)
- **Serviço:** `services/tmdbService.js`
- **Base URL:** `https://api.themoviedb.org/3`
- **Autenticação:** API Key via query param `api_key`
- **Endpoints usados:**
  - `GET /movie/{id}` — Detalhes de filme (com credits, videos, images)
  - `GET /tv/{id}` — Detalhes de série
  - `GET /movie/popular` — Filmes populares (paginados)
  - `GET /tv/popular` — Séries populares (paginadas)
  - `GET /search/multi` — Pesquisa universal
- **Uso:** Metadados de conteúdo (posters, backdrops, elenco, sinopses) para banners e catálogo
- **Idioma:** `pt-BR` fixo
- **Imagens:** `https://image.tmdb.org/t/p/{size}{path}`

### ⚽ API-Football (api-sports.io) v3
- **Serviço:** `services/sportsService.js`
- **Base URL:** `https://v3.football.api-sports.io`
- **Autenticação:** Header `x-apisports-key`
- **Endpoints usados:**
  - `GET /fixtures?date={YYYY-MM-DD}` — Jogos do dia
- **Cache:** Memória local — 60s para hoje, 1h para outros dias
- **Ordenação:** Brasil primeiro, depois jogos ao vivo, depois alfabético

### 🥊 TheSportsDB (Fallback)
- **Base URL:** `https://www.thesportsdb.com/api/v1/json/3`
- **Uso:** MMA/Fighting e Basketball (fallback gratuito)
- **Endpoints:**
  - `GET /eventsday.php?d={date}&s=Fighting` — Eventos de luta
  - `GET /eventsday.php?d={date}&s=Basketball` — Jogos de basquete

### 📺 Xtream Codes API (IPTV)
- **Protocolo:** REST via `player_api.php`
- **Endpoints típicos:**
  - `GET /player_api.php?username=X&password=Y` — Autenticação e lista de canais
  - Categorias, VOD, Séries, EPG
- **Uso:** Gerenciamento de servidores IPTV, criação de contas, sincronização de playlists
- **Módulos:** `modules/iptv-server/`, `modules/iptv-servers/`, `modules/iptv-credentials/`

---

## 2. Databases & Storage

### 🐘 PostgreSQL (Supabase)
- **Host:** `aws-1-us-east-1.pooler.supabase.com:5432`
- **Database:** `postgres`
- **Pooling:** max 20 conexões, idle 30s
- **SSL:** Habilitado (rejectUnauthorized: false)
- **Tabelas principais:** ~25+ tabelas (users, devices, logs, bugs, iptv_servers, qpanel_panels, whatsapp_conversations, mp_transactions, etc.)

### 📦 SQLite (Fallback Local)
- **Arquivo:** `maxxcontrol.db`
- **Wrapper:** `config/database-sqlite.js` com Promise wrapper

### ☁️ Supabase (BaaS)
- **Serviços:** Database (PostgreSQL), Auth (não usado diretamente), Storage
- **Client:** `@supabase/supabase-js` para acesso direto quando necessário

---

## 3. Provedores de Autenticação

### 🔐 JWT (Principal)
- **Biblioteca:** `jsonwebtoken`
- **Middleware:** `middlewares/auth.js` — Protege rotas admin
- **Expiração:** 7 dias (`JWT_EXPIRES_IN=7d`)
- **Secret:** Variável de ambiente `JWT_SECRET`

### 📱 Device Auth
- **Middleware:** `middlewares/deviceAuth.js`
- **Método:** Token fixo (`DEVICE_API_TOKEN`) para registro de dispositivos Android
- **MAC Address:** Identificação primária do dispositivo

### 🛡️ 2FA via Telegram
- **Bot:** `node-telegram-bot-api`
- **Fluxo:** Código temporário enviado via Telegram, validado no login
- **Colunas:** `users.telegram_chat_id`, `users.tfa_enabled`, `users.tfa_code`

### 🔗 Google OAuth2
- **Biblioteca:** `google-auth-library` + `googleapis`
- **Scopes:** Google Drive, Google Contacts
- **Callback:** `/api/integrations/google/callback`
- **Tabela:** `google_configs` (tokens por usuário)

---

## 4. Messaging & Real-Time

### 💬 WhatsApp (Baileys)
- **Biblioteca:** `@whiskeysockets/baileys` v7
- **Módulo:** `modules/whatsapp/`
- **Funcionalidades:**
  - MaxxChat Live Chat (CRM integrado)
  - Chatbot automatizado com fluxos customizáveis
  - Quick replies / Respostas rápidas
  - Labels para categorização de conversas
  - Notificações automáticas de criação de contas
- **Persistência:** Tabelas `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_labels`, `whatsapp_quick_replies`, `whatsapp_flows`, `whatsapp_chatbot_sessions`

### 🔌 WebSocket (ws)
- **Servidor:** `websocket/wsServer.js`
- **Biblioteca:** `ws`
- **Autenticação:** JWT via mensagem `{ type: 'auth', token: '...' }`
- **Funções:** `sendToUser(userId, data)`, `broadcast(data)`
- **Uso:** Monitoramento real-time de dispositivos

### 📡 Socket.IO
- **Servidor:** Inicializado em `server.js` (global.io)
- **CORS:** `origin: '*'`
- **Uso:** MaxxChat Live Chat — emissão de mensagens em tempo real
- **Rooms:** `chat_{jid}` por conversa

---

## 5. Pagamentos

### 💸 Mercado Pago (PIX)
- **Tabela:** `mp_transactions`
- **Tipos:** `pix` (automático) e `manual` (transferência)
- **QR Code:** Gerado via `qrcode` library
- **Campos:** `payment_id`, `reseller_id`, `credits`, `amount`, `qr_code_base64`
- **Módulo:** `modules/payments/paymentRoutes.js`

---

## 6. Chrome Extension → Backend (Relay)

### 🔄 Plugin Relay System
- **Extension:** `chrome-plugin-mxx/` (Manifest V3)
- **Background:** Service Worker (`background.js`) — polling de comandos pendentes
- **Content Script:** `content.js` — injeção e scraping em painéis Sigma/qPanel
- **Fluxo:**
  1. Backend enfileira comando em `plugin_relay_commands` (status: `pending`)
  2. Plugin faz polling via `/api/iptv-plugin/relay/poll`
  3. Plugin executa ação no painel IPTV (criar conta, extrair DNS, etc.)
  4. Plugin reporta resultado via `/api/iptv-plugin/relay/complete`
- **Tabela:** `plugin_relay_commands` (panel_id, command_type, payload, status, result)
- **TTL:** Comandos expiram em 5 minutos

---

## 7. Monitoring & Maintenance

### 🤖 Sentinela Maxx
- **Módulo:** `modules/maintenance/sentinela.js`
- **Função:** Monitoramento automático do sistema (health checks periódicos)
- **Endpoint:** `/api/sentinela/status`

### 📊 API Monitor
- **Módulo:** `modules/api-monitor/`
- **Função:** Monitoramento de APIs externas (uptime, latência)

---

## 8. Diagrama de Integrações

```
┌──────────────────────────────────────────────────────────┐
│                   MaxxControl Backend                     │
│                    (Node.js/Express)                      │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│          │          │          │          │              │
▼          ▼          ▼          ▼          ▼              ▼
TMDB    API-Football  Xtream   Google    Telegram    WhatsApp
(Movies)  (Sports)   (IPTV)   (OAuth2)   (2FA)     (Baileys)
                                                          │
┌─────────────────┐  ┌──────────────┐                     │
│ Chrome Plugin   │◄►│ Relay System  │        ┌───────────┘
│ (qPanel scraper)│  │ (DB polling)  │        ▼
└─────────────────┘  └──────────────┘   Socket.IO
                                        (MaxxChat)
┌──────────────────────┐
│   React SPA (Vite)   │◄── WebSocket ──► Device Monitor
│   TailwindCSS        │
└──────────────────────┘

┌──────────────────────┐
│   Android App        │──► /api/mac/* (heartbeat, status)
│   TV MAXX PRO        │──► /api/updates/check
└──────────────────────┘

┌──────────────────────┐
│  CEREBRO (Obsidian)  │ ── Documentação & Agentes IA
└──────────────────────┘
```
