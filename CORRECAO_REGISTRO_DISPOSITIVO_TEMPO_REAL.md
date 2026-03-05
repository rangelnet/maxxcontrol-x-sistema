# Correção: Registro de Dispositivo em Tempo Real

## Problema
Quando você instalava o APK em um novo TV Box, o dispositivo **não aparecia no painel** até recarregar a página manualmente.

## Causas Identificadas

### 1. Painel não atualizava em tempo real
- O frontend carregava a lista de dispositivos apenas uma vez ao abrir a página
- Não havia atualização automática

### 2. Endpoints com nomes diferentes
- O app Android chamava `/api/mac/register-device`
- O backend tinha `/api/device/register-device`
- Isso causava erro 404 silencioso

## Soluções Implementadas

### 1. ✅ Atualização Automática no Painel (Frontend)
**Arquivo**: `MaxxControl/maxxcontrol-x-sistema/web/src/pages/Devices.jsx`

- Adicionado `setInterval` que atualiza a lista a cada **5 segundos**
- Adicionado botão "Atualizar" manual no topo da página
- Agora novos dispositivos aparecem em tempo real

```javascript
useEffect(() => {
  loadDevices()
  
  // Atualizar dispositivos a cada 5 segundos
  const interval = setInterval(() => {
    loadDevices()
  }, 5000)

  return () => clearInterval(interval)
}, [])
```

### 2. ✅ Alias de Rotas no Backend
**Arquivo**: `MaxxControl/maxxcontrol-x-sistema/server.js`

- Adicionado alias `/api/mac` que aponta para as mesmas rotas de `/api/device`
- Garante compatibilidade com o app Android

```javascript
app.use('/api/device', require('./modules/mac/macRoutes'));
app.use('/api/mac', require('./modules/mac/macRoutes')); // Alias para compatibilidade
```

### 3. ✅ Endpoints Corretos no Android
**Arquivo**: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/network/api/MaxxControlApiService.kt`

- Corrigido para usar `/api/device/register-device` (endpoint correto)
- Endpoints atualizados:
  - `POST /api/device/register-device` - Registrar dispositivo
  - `POST /api/device/connection-status` - Atualizar status online/offline
  - `POST /api/device/register-public` - Registro público

## Fluxo de Registro Agora

1. **App inicia** → `MainActivity.onCreate()`
2. **Chama** `registerDevice()` → Envia MAC, modelo, versão Android/App
3. **Backend recebe** em `/api/device/register-device` (ou `/api/mac/register-device`)
4. **Valida token** `X-Device-Token: tvmaxx_device_api_token_2024_secure_key`
5. **Registra no banco** com `status: 'ativo'` e `connection_status: 'offline'`
6. **Painel atualiza** a cada 5 segundos e mostra o novo dispositivo

## Como Testar

1. Instale o APK em um novo TV Box
2. Abra o painel em `https://maxxcontrol-frontend.onrender.com`
3. Vá para a página "Dispositivos"
4. **Novo dispositivo aparece em até 5 segundos** (ou clique "Atualizar")

## Commits

- Backend: `Add /api/mac alias for device registration endpoints`
- Frontend: `Add real-time device list updates - auto-refresh every 5 seconds`

## Status

✅ **RESOLVIDO** - Dispositivos agora aparecem em tempo real no painel
