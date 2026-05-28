# 📚 Documentação Maxxcontrol X

> Sistema de Controle e Monitoramento de Apps Android — Painel de Gestão IPTV

## Índice

| Documento | Descrição |
|---|---|
| [Arquitetura](./architecture.md) | Visão geral do sistema |
| [API Reference](./api-reference.md) | Todos os endpoints REST |
| [Database Schema](./database-schema.md) | Tabelas e relações |
| [Integrações](./integrations.md) | APIs externas |
| [Deploy](./deployment.md) | Infraestrutura e deploy |
| [Guia Dev](./dev-guide.md) | Como rodar e contribuir |

## Quick Start

```bash
# Clonar e instalar
git clone <repo>
cd Painel-Maxxcontrol-x-sistema
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Rodar em desenvolvimento
npm run dev

# Build do frontend
npm run build
```

## Tech Stack

| Camada | Tecnologia |
|---|---|
| **Backend** | Node.js 18, Express 4.18 |
| **Frontend** | React (Vite), TailwindCSS |
| **Banco de Dados** | PostgreSQL (Supabase) / SQLite (local) |
| **Tempo Real** | WebSocket (ws) + Socket.IO |
| **WhatsApp** | Baileys (WhiskeySockets) |
| **Telegram** | node-telegram-bot-api |
| **Auth** | JWT + bcryptjs + 2FA Telegram |
| **Deploy** | Render.com |
| **APIs** | TMDB, SportsData.io, Google OAuth2, Mercado Pago |
