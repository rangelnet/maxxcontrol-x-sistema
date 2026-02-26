# MaxxControl X - Painel Web

Painel de controle web para o MaxxControl X.

## 🚀 Instalação

```bash
cd web
npm install
```

## 🔧 Configuração

O painel está configurado para conectar na API em `http://localhost:3000`.

Para alterar, edite:
- `web/src/services/api.js` - URL da API REST
- `web/src/services/websocket.js` - URL do WebSocket

## 🎨 Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/`

## 🎯 Funcionalidades

- Dashboard com estatísticas em tempo real
- Gerenciamento de dispositivos
- Visualização e resolução de bugs
- Controle de versões do app
- Sistema de logs
- Autenticação JWT
- WebSocket para atualizações em tempo real

## 🎨 Design

- Tema escuro (fundo preto)
- Cor primária: Laranja (#ff6b00)
- Mobile First
- Responsivo
