# 🚀 MaxxControl X

Sistema profissional de controle e monitoramento de aplicativos Android em tempo real.

## 🔥 Funcionalidades

- ✅ Autenticação JWT
- ✅ Controle de dispositivos via MAC Address
- ✅ Monitoramento em tempo real (WebSocket)
- ✅ Sistema de logs automático
- ✅ Relatório de bugs
- ✅ Controle de versões do app
- ✅ Dashboard com estatísticas
- ✅ API RESTful completa

## 🛠️ Tecnologias

- Node.js + Express
- PostgreSQL
- WebSocket (ws)
- JWT Authentication
- bcryptjs

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Criar banco de dados
psql -U postgres -c "CREATE DATABASE maxxcontrol_x;"

# Executar schema
psql -U postgres -d maxxcontrol_x -f database/schema.sql

# Iniciar servidor
npm start

# Modo desenvolvimento
npm run dev
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/validate-token` - Validar token

### Dispositivos (MAC)
- `POST /api/device/register` - Registrar dispositivo
- `POST /api/device/check` - Verificar dispositivo
- `POST /api/device/block` - Bloquear dispositivo
- `GET /api/device/list` - Listar dispositivos

### Logs
- `POST /api/log` - Criar log
- `GET /api/log` - Listar logs

### Bugs
- `POST /api/bug` - Reportar bug
- `GET /api/bug` - Listar bugs
- `POST /api/bug/resolve` - Resolver bug

### Atualizações
- `GET /api/app/version` - Obter versão atual
- `POST /api/app/version` - Criar nova versão
- `GET /api/app/versions` - Listar versões

### Monitoramento
- `GET /api/monitor/online` - Usuários online
- `GET /api/monitor/dashboard` - Estatísticas do dashboard

## 🔌 WebSocket

Conecte-se ao WebSocket para receber atualizações em tempo real:

```javascript
const ws = new WebSocket('ws://localhost:3000');

// Autenticar
ws.send(JSON.stringify({
  type: 'auth',
  token: 'seu_token_jwt'
}));
```

## 🎨 Próximos Passos

1. Criar painel web (React + Tailwind)
2. Implementar notificações push
3. Sistema de alertas em tempo real
4. Modo manutenção global

## 📄 Licença

ISC
