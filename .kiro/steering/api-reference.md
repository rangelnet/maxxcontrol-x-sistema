# Referência de APIs

## Base URLs

### Produção
- Backend: `https://maxxcontrol-x-sistema.onrender.com`
- Frontend: `https://maxxcontrol-frontend.onrender.com`

### Desenvolvimento
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Autenticação

### Para Painel Web (Admins)
```
Header: Authorization: Bearer {jwt_token}
```

### Para App Android (Dispositivos)
```
Header: X-Device-Token: {token_fixo}
```

## Endpoints Principais

### Auth (Administradores)
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/validate-token
```

### Devices (Dispositivos)
```
POST   /api/device/register          # Registrar dispositivo (público)
POST   /api/device/check             # Verificar status
GET    /api/device/list-all          # Listar todos (protegido)
POST   /api/device/block             # Bloquear dispositivo
POST   /api/device/unblock           # Desbloquear dispositivo
DELETE /api/device/delete/:id        # Excluir dispositivo
POST   /api/device/update-connection # Atualizar status online/offline
```

### IPTV Server
```
GET    /api/iptv-server/config           # Config global
POST   /api/iptv-server/config           # Salvar config global
GET    /api/iptv-server/config/:mac      # Config por MAC (para app)
GET    /api/iptv-server/device/:id       # Config por device ID
POST   /api/iptv-server/device/:id       # Salvar config por device
DELETE /api/iptv-server/device/:id       # Remover config específica
POST   /api/iptv-server/test             # Testar conexão Xtream
```

### Apps (Gerenciamento)
```
GET  /api/apps/device/:deviceId      # Listar apps instalados
POST /api/apps/register              # Registrar app (do dispositivo)
POST /api/apps/send-apk              # Enviar APK para instalar
POST /api/apps/uninstall             # Desinstalar app
GET  /api/apps/commands/:deviceId    # Buscar comandos pendentes
POST /api/apps/commands/status       # Atualizar status de comando
```

### Branding
```
GET /api/branding/current            # Branding ativo (público)
GET /api/branding                    # Listar todos (protegido)
PUT /api/branding/:id                # Atualizar branding
GET /api/branding/templates          # Templates pré-configurados
```

### API Config
```
GET /api/api-config/config           # Config atual (público)
PUT /api/api-config/config           # Atualizar config
GET /api/api-config/history          # Histórico de mudanças
```

### Logs
```
POST /api/log/create                 # Criar log (do dispositivo)
GET  /api/log                        # Listar logs (protegido)
```

### Bugs
```
POST /api/bug/report                 # Reportar bug (do dispositivo)
GET  /api/bug                        # Listar bugs (protegido)
POST /api/bug/resolve                # Marcar como resolvido
```

### Monitoring (Performance)
```
POST /api/monitor/performance        # Enviar métricas (do dispositivo)
GET  /api/monitor/reports            # Listar relatórios (protegido)
GET  /api/monitor/dashboard          # Estatísticas gerais
```

### Content (TMDB)
```
GET  /api/content                    # Listar conteúdos
POST /api/content/importar-filme/:id # Importar filme do TMDB
POST /api/content/importar-serie/:id # Importar série do TMDB
GET  /api/content/pesquisar          # Pesquisar no TMDB
GET  /api/content/populares          # Obter populares
DELETE /api/content/:id              # Deletar conteúdo
```

### Banners
```
POST /api/banners/generate           # Gerar banner
GET  /banners/{filename}             # Servir banner gerado
```

### Updates (Versões)
```
POST /api/app/check-version          # Verificar versão (do dispositivo)
GET  /api/app/versions               # Listar versões (protegido)
POST /api/app/version                # Criar nova versão
```

### Health Check
```
GET /health                          # Status do servidor (público)
GET /api                             # Info da API (público)
```

## Exemplos de Requisições

### Registrar Dispositivo
```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/device/register \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: seu_token" \
  -d '{
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "modelo": "Samsung TV",
    "android_version": "11",
    "app_version": "1.0.0",
    "ip": "192.168.1.100"
  }'
```

### Buscar Config IPTV (App)
```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/iptv-server/config/AA:BB:CC:DD:EE:FF
```

### Buscar Branding (App)
```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current
```

### Login Admin
```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@maxxcontrol.com",
    "senha": "Admin@123"
  }'
```

### Bloquear Dispositivo
```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/device/block \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{
    "device_id": 1
  }'
```

### Enviar Comando de Instalação
```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/apps/send-apk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{
    "device_id": 1,
    "app_name": "YouTube",
    "app_url": "https://exemplo.com/youtube.apk"
  }'
```

### Buscar Comandos Pendentes (App)
```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/apps/commands/1 \
  -H "X-Device-Token: seu_token"
```

### Reportar Performance (App)
```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/monitor/performance \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: seu_token" \
  -d '{
    "device_id": 1,
    "report_type": "player",
    "metrics": {
      "buffering_time": 1200,
      "playback_errors": 0,
      "avg_bitrate": 5000
    }
  }'
```

## Respostas Padrão

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Erro de Validação (400)
```json
{
  "error": "Campos obrigatórios não fornecidos"
}
```

### Não Autorizado (401)
```json
{
  "error": "Token não fornecido"
}
```

### Proibido (403)
```json
{
  "error": "Não autorizado"
}
```

### Não Encontrado (404)
```json
{
  "error": "Recurso não encontrado"
}
```

### Erro Interno (500)
```json
{
  "error": "Erro interno do servidor"
}
```

## WebSocket Events

### Conexão
```javascript
// Cliente conecta
ws://maxxcontrol-x-sistema.onrender.com

// Autenticar
{
  "type": "auth",
  "token": "jwt_token"
}
```

### Eventos do Servidor
```javascript
// IPTV atualizado
{
  "type": "device:iptv-updated",
  "data": {
    "device_id": 1,
    "xtream_url": "http://...",
    "xtream_username": "user"
  }
}

// API de teste atualizada
{
  "type": "device:test-api-updated",
  "data": {
    "device_id": 1,
    "test_api_url": "http://..."
  }
}

// Dispositivo conectado/desconectado
{
  "type": "device:connection-changed",
  "data": {
    "device_id": 1,
    "connection_status": "online"
  }
}
```

## Rate Limiting

- **Limite**: 100 requisições por 15 minutos
- **Escopo**: Por IP
- **Rotas**: Todas em /api/*
- **Resposta ao exceder**: 429 Too Many Requests

## CORS

- **Permitido**: Todas as origens em desenvolvimento
- **Produção**: Apenas domínios autorizados
- **Métodos**: GET, POST, PUT, DELETE
- **Headers**: Content-Type, Authorization, X-Device-Token
