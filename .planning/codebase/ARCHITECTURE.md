# 🏗️ ARCHITECTURE.md — Arquitetura do Sistema MaxxControl

> Mapeado em: 2026-05-05

---

## 1. Padrão Arquitetural

**Monolito Modular com SPA embarcada.**

O sistema é um monolito Node.js/Express que serve tanto a API REST quanto o frontend React (build Vite estático). Cada domínio de negócio é isolado em um módulo dentro de `modules/`, compartilhando processo, banco e servidor HTTP.

---

## 2. Camadas

### Camada 1: Apresentação (Frontend)
- React 18 + Vite + TailwindCSS em `web/src/`
- React Router DOM v6 com PrivateRoute
- Estado via Context API (AuthContext, WhatsAppContext)

### Camada 2: API Gateway
- Entry Point: `server.js`
- Middlewares: helmet, cors, json(50mb), rate-limit
- Auth: `middlewares/auth.js` (JWT), `middlewares/deviceAuth.js` (token fixo)

### Camada 3: Módulos de Negócio
- Cada módulo em `modules/{domínio}/` com rotas próprias
- Services compartilhados em `services/` (tmdb, sports, google)

### Camada 4: Dados
- `config/database.js` — seleção dinâmica PostgreSQL/SQLite
- Queries SQL raw (sem ORM)
- Migrações inline idempotentes no `server.js`

### Camada 5: Real-Time
- WebSocket (ws): monitoramento de dispositivos
- Socket.IO: MaxxChat live messaging

---

## 3. Fluxos Principais

### DNS Bridge (Diferencial)
```
Admin configura IPTV → Plugin extrai DNS de qPanel →
Salva em smartone_registrations →
App Android GET /api/mac/status/{mac} → Recebe DNS+credenciais
```

### Plugin Relay
```
Backend enfileira comando → Plugin faz polling →
Plugin executa no painel IPTV → Reporta resultado
```

### WhatsApp MaxxChat
```
Mensagem recebida (Baileys) → Salva DB →
Emite Socket.IO → Bot verifica fluxos → Resposta automática
```

---

## 4. Entry Points

| Entry Point | Arquivo |
|:------------|:--------|
| Servidor principal | `server.js` |
| Frontend SPA | `web/src/main.jsx` → `App.jsx` |
| Chrome Plugin | `chrome-plugin-mxx/background.js` |
| Content Script | `chrome-plugin-mxx/content.js` |
| WebSocket | `websocket/wsServer.js` |

---

## 5. Subsistemas

- **CEREBRO MAXXCONTROL**: Vault Obsidian com 23+ agentes IA, memória técnica, regras
- **Sentinela Maxx**: Health monitoring em background (`modules/maintenance/sentinela.js`)
