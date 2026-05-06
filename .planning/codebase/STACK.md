# 🛠️ STACK.md — Stack Tecnológico MaxxControl

> Mapeado em: 2026-05-05
> Escopo: Repositório `Painel Maxxcontrol-x-sistema` + `CEREBRO MAXXCONTROL`

---

## 1. Linguagens & Runtime

| Componente | Linguagem | Runtime |
|:-----------|:----------|:--------|
| Backend API | JavaScript (CommonJS) | Node.js 18.x |
| Frontend SPA | JavaScript (ESM) / JSX | Browser (Vite dev server) |
| Chrome Plugin | JavaScript (Manifest V3) | Chromium Service Worker |
| Scripts Utilitários | JavaScript / PowerShell / Python | Node.js / pwsh |
| Base de Conhecimento | Markdown | Obsidian |

---

## 2. Frameworks & Bibliotecas Principais

### Backend (`package.json` raiz)
- **Express** `^4.18.2` — Servidor HTTP e roteamento REST
- **Socket.IO** `^4.8.3` — Comunicação real-time (MaxxChat Live Chat)
- **ws** `^8.14.2` — WebSocket nativo para monitoramento de dispositivos
- **helmet** `^7.1.0` — Headers de segurança HTTP
- **cors** `^2.8.5` — Cross-Origin Resource Sharing
- **express-rate-limit** `^7.1.5` — Rate limiting por rota
- **jsonwebtoken** `^9.0.2` — Autenticação JWT
- **bcryptjs** `^2.4.3` — Hash de senhas
- **axios** `^1.15.0` — Cliente HTTP para APIs externas
- **zod** `^3.22.4` — Validação de schemas
- **dotenv** `^16.6.1` — Variáveis de ambiente
- **@whiskeysockets/baileys** `^7.0.0-rc.9` — WhatsApp Web API (não-oficial)
- **node-telegram-bot-api** `^0.67.0` — Bot Telegram para 2FA
- **googleapis** `^171.4.0` — Google Drive / Contatos OAuth2
- **google-auth-library** `^10.6.2` — Autenticação Google
- **@modelcontextprotocol/sdk** `^1.6.0` — MCP para agentes IA
- **html2canvas** `^1.4.1` — Captura de screenshots para banners
- **qrcode** `^1.5.4` — Geração de QR Code (PIX)
- **libsodium-wrappers** `^0.8.2` — Criptografia

### Frontend (`web/package.json`)
- **React** `^18.2.0` — UI Library
- **React Router DOM** `^6.20.0` — Roteamento SPA
- **Axios** `^1.6.2` — Cliente HTTP
- **Lucide React** `^0.294.0` — Ícones vetoriais
- **TailwindCSS** `^3.3.6` — Utility-first CSS
- **Vite** `^5.0.8` — Build tool e dev server
- **PostCSS** `^8.4.32` + **Autoprefixer** `^10.4.16` — Processamento CSS
- **html2canvas** `^1.4.1` — Geração de imagens client-side

### Dev Dependencies
- **nodemon** `^3.0.2` — Hot reload no backend
- **tweetnacl** `^1.0.3` + **tweetnacl-util** — Criptografia (dev)

---

## 3. Banco de Dados

| Tipo | Engine | Uso |
|:-----|:-------|:----|
| **Produção** | PostgreSQL (via Supabase) | Deploy no Render |
| **Fallback/Dev** | SQLite3 (`maxxcontrol.db`) | Desenvolvimento local |

- **Driver PostgreSQL:** `pg` `^8.11.3` com connection pooling (max 20, idle 30s, timeout 5s)
- **Driver SQLite:** `sqlite3` `^5.1.7` com wrapper Promise customizado
- **Supabase Client:** `@supabase/supabase-js` `^2.98.0`
- **Seleção dinâmica:** `config/database.js` escolhe engine via `USE_SQLITE` env var
- **Migrações:** Inline no `server.js` (runPendingMigrations) — sem framework de migration dedicado

---

## 4. Build & Deploy

| Aspecto | Configuração |
|:--------|:-------------|
| **Build Tool** | Vite 5 (frontend) |
| **Bundling** | `vite build` com `--emptyOutDir` |
| **Deploy** | Render.com (Web Service, plano free) |
| **Build Command (Render)** | `rm -rf web/dist && npm install && cd web && npm install && npx vite build --emptyOutDir` |
| **Start Command** | `npm start` → `node server.js` |
| **Health Check** | `/health` endpoint |
| **Banco Render** | PostgreSQL free tier |
| **SSL** | `rejectUnauthorized: false` no pool PG |

### Render.yaml
- Rewrites: `/api/*`, `/banners/*`, `/media/*` → backend; `/*` → `/index.html` (SPA fallback)
- Env vars via grupo `maxxcontrol-secrets`

---

## 5. Configuração & Env Vars

Arquivo: `.env` (e `.env.example`)

| Variável | Propósito |
|:---------|:----------|
| `PORT` | Porta do servidor (3001 local) |
| `NODE_ENV` | Ambiente (development/production) |
| `DATABASE_URL` | Connection string PostgreSQL |
| `USE_SQLITE` | Flag para usar SQLite |
| `SUPABASE_URL` / `SUPABASE_KEY` / `SUPABASE_SERVICE_KEY` | Credenciais Supabase |
| `TMDB_API_KEY` | API TMDB para metadados de filmes/séries |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Autenticação JWT |
| `DEVICE_API_TOKEN` | Token fixo para registro de dispositivos Android |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | OAuth2 Google |
| `API_FOOTBALL_KEY` | Dados esportivos (api-sports.io) |

---

## 6. Chrome Extension (Plugin Relay)

- **Manifest Version:** 3
- **Permissões:** `storage`, `alarms`, `activeTab`, `scripting`
- **Host Permissions:** `*://*/*` (acesso universal)
- **Arquivos:** `background.js` (service worker), `content.js` (injeção em páginas)
- **Função:** Extração automatizada de dados de painéis Sigma/qPanel IPTV

---

## 7. Base de Conhecimento (CEREBRO)

- **Plataforma:** Obsidian (vault de notas Markdown)
- **Localização:** `r:\Users\Usuario\Meu Drive\CEREBRO MAXXCONTROL`
- **Estrutura:** Agents (23 agentes IA), Docs (6 docs), Rules (5 regras), Tasks
- **Função:** Documentação viva, memória técnica de agentes, regras de design/backend
