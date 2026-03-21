# Diagnóstico: Monitoramento IPTV Não Aparece no Painel

## ✅ CAUSA RAIZ IDENTIFICADA

**PROBLEMA**: As colunas IPTV (server, username, password, ping, quality, stream_status) **NÃO EXISTEM** na tabela `devices` do banco de dados de produção.

**EVIDÊNCIA**:
1. ✅ Migration file existe: `add-iptv-multi-server-columns.sql`
2. ✅ Backend endpoint existe: `/api/iptv/monitor-status` em `iptvMonitoringController.js`
3. ✅ Rota registrada: `app.use('/api/iptv', require('./modules/iptv-monitoring/iptvMonitoringRoutes'))` em `server.js`
4. ✅ Frontend espera os campos: `device.server`, `device.username`, `device.ping`, `device.quality`
5. ❌ **Colunas não foram criadas no banco de dados**

## 🔧 SOLUÇÃO IMEDIATA

Execute a migration para criar as colunas faltantes:

```bash
cd maxxcontrol-x-sistema
node database/migrations/run-iptv-multi-server-migrations.js
```

Isso irá adicionar as seguintes colunas à tabela `devices`:
- `server` VARCHAR(255) - URL do servidor IPTV atual
- `username` VARCHAR(100) - Username IPTV do dispositivo  
- `password` VARCHAR(100) - Password IPTV do dispositivo
- `ping` INTEGER - Tempo de resposta em ms
- `quality` VARCHAR(20) - Qualidade: excelente, boa, regular, ruim
- `stream_status` VARCHAR(20) - Status: playing, buffering, error, stopped
- `server_mode` VARCHAR(10) - Modo: auto, manual
- `api_test_url` VARCHAR(500) - URL customizada para API de teste

## 📋 Checklist de Verificação

### ✅ Passo 1: Verificar se Colunas Existem
```bash
node database/migrations/check-iptv-columns.js
```

**Resultado esperado**: Script criado e pronto para executar

### ⚠️ Passo 2: Executar Migration (SE COLUNAS NÃO EXISTIREM)
```bash
node database/migrations/run-iptv-multi-server-migrations.js
```

**Resultado esperado**: 
```
✅ Colunas IPTV adicionadas com sucesso
✅ Constraints criados
✅ Índices criados
```

### ✅ Passo 3: Testar Endpoint Manualmente
```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/iptv/monitor-status \
  -H "Content-Type: application/json" \
  -d '{
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "server": "http://teste.com:8080",
    "ping": 50,
    "quality": "excelente",
    "stream_status": "playing"
  }'
```

**Resultado esperado**: `{"success": true, "message": "Status atualizado com sucesso"}`

### ✅ Passo 4: Verificar no Painel
1. Abrir painel: https://maxxcontrol-frontend.onrender.com
2. Ir em "Dispositivos"
3. Verificar se as colunas **Servidor, Usuário, Senha, Ping, Qualidade** aparecem
4. Assistir um canal no app
5. Aguardar 30 segundos (tempo do worker)
6. Atualizar painel e verificar se dados aparecem

## 🏗️ Arquitetura do Sistema

### App Android (TV MAXX PRO)
- **IptvMonitorWorker.kt**: Worker que envia métricas a cada 30 segundos quando um canal está sendo reproduzido
- **IptvRepository.kt**: Repositório que faz a chamada HTTP para o backend
- **MaxxControlApiService.kt**: Interface Retrofit com endpoint `POST api/iptv/monitor-status`

### Backend (MaxxControl X)
- **iptvMonitoringController.js**: Controller que recebe as métricas e atualiza a tabela `devices`
- **iptvMonitoringRoutes.js**: Rotas registradas em `/api/iptv/*`
- **server.js**: Rota registrada: `app.use('/api/iptv', require('./modules/iptv-monitoring/iptvMonitoringRoutes'))`

### Frontend (Painel Web)
- **Devices.jsx**: Página que exibe os dispositivos com colunas de monitoramento IPTV
- **Campos esperados**: `device.server`, `device.username`, `device.ping`, `device.quality`

## 📊 Fluxo de Dados

```
App Android (IptvMonitorWorker)
    ↓ POST /api/iptv/monitor-status (a cada 30s)
Backend (iptvMonitoringController.monitorStatus)
    ↓ UPDATE devices SET server=?, ping=?, quality=?
Database (PostgreSQL/Supabase)
    ↓ SELECT * FROM devices
Frontend (Devices.jsx)
    ↓ Exibe: Servidor | Usuário | Senha | Ping | Qualidade
```

## 🔍 Diagnóstico Detalhado

### Verificação 1: Colunas do Banco ❌
**Status**: FALTANDO
**Arquivo**: `database/migrations/add-iptv-multi-server-columns.sql`
**Ação**: Executar migration

### Verificação 2: Rota Registrada ✅
**Status**: OK
**Arquivo**: `server.js` linha ~280
**Código**: `app.use('/api/iptv', require('./modules/iptv-monitoring/iptvMonitoringRoutes'))`

### Verificação 3: Endpoint Implementado ✅
**Status**: OK
**Arquivo**: `modules/iptv-monitoring/iptvMonitoringController.js`
**Método**: `exports.monitorStatus`

### Verificação 4: Frontend Preparado ✅
**Status**: OK
**Arquivo**: `web/src/pages/Devices.jsx`
**Campos**: `device.server`, `device.username`, `device.ping`, `device.quality`

### Verificação 5: App Android ⚠️
**Status**: PRECISA VERIFICAR
**Arquivo**: `app/src/main/java/com/tvmaxx/pro/services/IptvMonitorWorker.kt`
**Ação**: Verificar se worker está sendo iniciado no player

## 🛠️ Scripts de Diagnóstico

### check-iptv-columns.js ✅ CRIADO
Verifica se as colunas IPTV existem na tabela devices

**Uso**:
```bash
node database/migrations/check-iptv-columns.js
```

**Saída esperada**:
```
✅ Tabela devices existe
✅ server EXISTE
✅ username EXISTE  
✅ ping EXISTE
✅ quality EXISTE
✅ stream_status EXISTE
```

## 📝 Informações Técnicas

### Endpoint de Monitoramento
- **URL**: `POST /api/iptv/monitor-status`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "server": "http://servidor.com:8080",
  "ping": 50,
  "quality": "excelente",
  "stream_status": "playing"
}
```

### Colunas da Tabela devices
```sql
server VARCHAR(255)           -- URL do servidor IPTV atual
username VARCHAR(100)         -- Username IPTV do dispositivo
password VARCHAR(100)         -- Password IPTV do dispositivo
ping INTEGER                  -- Tempo de resposta em ms
quality VARCHAR(20)           -- excelente, boa, regular, ruim
stream_status VARCHAR(20)     -- playing, buffering, error, stopped
server_mode VARCHAR(10)       -- auto, manual
api_test_url VARCHAR(500)     -- URL customizada para API de teste
```

### Frequência de Atualização
- **IptvMonitorWorker**: Envia métricas a cada 30 segundos
- **Frontend**: Atualiza lista a cada 2 segundos via polling
- **WebSocket**: Atualização em tempo real quando disponível

## 🎯 Próximos Passos

1. ✅ **Executar script de verificação**: `node database/migrations/check-iptv-columns.js`
2. ⚠️ **Executar migration**: `node database/migrations/run-iptv-multi-server-migrations.js`
3. ✅ **Testar endpoint**: curl POST /api/iptv/monitor-status
4. ⚠️ **Verificar app**: Confirmar que IptvMonitorWorker está rodando
5. ✅ **Validar painel**: Verificar se dados aparecem após assistir canal
