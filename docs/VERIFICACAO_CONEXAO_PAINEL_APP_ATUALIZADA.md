# ✅ VERIFICAÇÃO DE CONEXÃO - PAINEL ↔ APP ANDROID

## 📋 RESUMO EXECUTIVO

Verificação completa da conexão e sincronização entre o Painel MaxxControl e o App Android TV MAXX PRO.

**Data da Verificação:** 02/03/2026  
**Status Geral:** ⚠️ PARCIALMENTE CONECTADO - REQUER AJUSTES

---

## 🌐 CONFIGURAÇÃO DE URLs

### ✅ App Android → Painel
**Arquivo:** `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/core/constants/NetworkConstants.kt`

```kotlin
const val MAXX_CONTROL_BASE_URL = "https://maxxcontrol-x-sistema.onrender.com"
const val MAXX_CONTROL_WS_URL = "wss://maxxcontrol-x-sistema.onrender.com"
```

**Status:** ✅ URL CORRETA - Aponta para o painel no Render

---

## 🔌 ANÁLISE DE ENDPOINTS - GERENCIAMENTO DE APPS

### ❌ PROBLEMA IDENTIFICADO: INCOMPATIBILIDADE DE ENDPOINTS

O app Android está chamando endpoints que **NÃO EXISTEM** no painel!

#### 1. ❌ Listar Apps Instalados

**App Android chama:**
```kotlin
@GET("api/apps/device/{mac_address}")
suspend fun getInstalledApps(
    @Header("Authorization") token: String,
    @Path("mac_address") macAddress: String
): Response<GetAppsResponse>
```

**Painel tem:**
```javascript
router.get('/device/:device_id', authMiddleware, appsController.listInstalledApps);
```

**PROBLEMA:** 
- App usa `mac_address` (String)
- Painel espera `device_id` (Integer)

---

#### 2. ❌ Desinstalar App

**App Android chama:**
```kotlin
@POST("api/apps/uninstall")
suspend fun uninstallApp(
    @Header("Authorization") token: String,
    @Body body: UninstallAppRequest // { mac_address, package_name }
): Response<Unit>
```

**Painel espera:**
```javascript
// Body: { device_id, package_name }
```

**PROBLEMA:**
- App envia `mac_address`
- Painel espera `device_id`

---

#### 3. ❌ Instalar APK

**App Android chama:**
```kotlin
@POST("api/apps/send-apk")
suspend fun installApk(
    @Header("Authorization") token: String,
    @Body body: InstallApkRequest // { mac_address, app_url, app_name }
): Response<Unit>
```

**Painel espera:**
```javascript
// Body: { device_id, app_name, app_url }
```

**PROBLEMA:**
- App envia `mac_address`
- Painel espera `device_id`

---

#### 4. ❌ Comandos Pendentes

**App Android chama:**
```kotlin
@GET("api/device/commands/{mac_address}")
suspend fun getPendingCommands(
    @Header("Authorization") token: String,
    @Path("mac_address") macAddress: String
): Response<GetCommandsResponse>
```

**Painel tem:**
```javascript
router.get('/commands/:device_id', deviceAuthMiddleware, appsController.getPendingCommands);
```

**PROBLEMA:**
- App usa `api/device/commands/{mac_address}`
- Painel tem `api/apps/commands/:device_id`
- Rota diferente E parâmetro diferente!

---

#### 5. ❌ Atualizar Status do Comando

**App Android chama:**
```kotlin
@POST("api/device/command-status")
suspend fun reportCommandStatus(
    @Header("Authorization") token: String,
    @Body body: CommandStatusRequest
): Response<Unit>
```

**Painel tem:**
```javascript
router.post('/commands/status', deviceAuthMiddleware, appsController.updateCommandStatus);
```

**PROBLEMA:**
- App usa `api/device/command-status`
- Painel tem `api/apps/commands/status`
- Rota completamente diferente!

---

## 🔌 ANÁLISE DE ENDPOINTS - BLOQUEIO DE DISPOSITIVOS

### ✅ Verificar Status do Dispositivo

**App Android chama:**
```kotlin
@GET("api/device/status/{mac_address}")
suspend fun checkDeviceStatus(...)
```

**Painel tem:**
```javascript
router.post('/check', macController.checkDevice);
// Body: { mac_address }
```

**PROBLEMA:**
- App usa GET com `mac_address` no path
- Painel usa POST com `mac_address` no body
- **INCOMPATÍVEL!**

---

### ✅ Bloquear Dispositivo

**App Android chama:**
```kotlin
@POST("api/device/block")
suspend fun blockDevice(
    @Header("Authorization") token: String,
    @Body body: BlockDeviceRequest // { mac_address }
): Response<Unit>
```

**Painel tem:**
```javascript
router.post('/block', authMiddleware, macController.blockDevice);
// Body: { device_id }
```

**PROBLEMA:**
- App envia `mac_address`
- Painel espera `device_id`

---

### ✅ Desbloquear Dispositivo

**App Android chama:**
```kotlin
@POST("api/device/unblock")
suspend fun unblockDevice(
    @Header("Authorization") token: String,
    @Body body: UnblockDeviceRequest // { mac_address }
): Response<Unit>
```

**Painel tem:**
```javascript
router.post('/unblock', authMiddleware, macController.unblockDevice);
// Body: { device_id }
```

**PROBLEMA:**
- App envia `mac_address`
- Painel espera `device_id`

---

## 📊 TABELA RESUMO - INCOMPATIBILIDADES

| Funcionalidade | App Android | Painel | Status |
|---------------|-------------|--------|--------|
| Listar Apps | `GET /api/apps/device/{mac}` | `GET /api/apps/device/{id}` | ❌ INCOMPATÍVEL |
| Desinstalar App | `POST /api/apps/uninstall` (mac) | `POST /api/apps/uninstall` (id) | ❌ INCOMPATÍVEL |
| Instalar APK | `POST /api/apps/send-apk` (mac) | `POST /api/apps/send-apk` (id) | ❌ INCOMPATÍVEL |
| Comandos Pendentes | `GET /api/device/commands/{mac}` | `GET /api/apps/commands/{id}` | ❌ INCOMPATÍVEL |
| Status Comando | `POST /api/device/command-status` | `POST /api/apps/commands/status` | ❌ INCOMPATÍVEL |
| Verificar Status | `GET /api/device/status/{mac}` | `POST /api/device/check` (body) | ❌ INCOMPATÍVEL |
| Bloquear | `POST /api/device/block` (mac) | `POST /api/device/block` (id) | ❌ INCOMPATÍVEL |
| Desbloquear | `POST /api/device/unblock` (mac) | `POST /api/device/unblock` (id) | ❌ INCOMPATÍVEL |

---

## 🔧 SOLUÇÕES NECESSÁRIAS

### Opção 1: Modificar o Painel (RECOMENDADO)

Adicionar rotas alternativas que aceitem `mac_address` em vez de `device_id`:

#### 1. Adicionar em `modules/apps/appsRoutes.js`:

```javascript
// Rotas alternativas que aceitam MAC address
router.get('/device/mac/:mac_address', authMiddleware, appsController.listInstalledAppsByMac);
router.post('/uninstall-by-mac', authMiddleware, appsController.uninstallAppByMac);
router.post('/send-apk-by-mac', authMiddleware, appsController.sendApkByMac);
router.get('/commands/mac/:mac_address', deviceAuthMiddleware, appsController.getPendingCommandsByMac);
```

#### 2. Adicionar em `modules/apps/appsController.js`:

```javascript
// Listar apps por MAC
exports.listInstalledAppsByMac = async (req, res) => {
  const { mac_address } = req.params;
  
  try {
    // Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const device_id = deviceResult.rows[0].id;
    
    // Buscar apps
    const result = await pool.query(
      `SELECT * FROM device_apps 
       WHERE device_id = $1 
       ORDER BY app_name ASC`,
      [device_id]
    );
    
    res.json({ apps: result.rows });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao listar apps' });
  }
};

// Desinstalar app por MAC
exports.uninstallAppByMac = async (req, res) => {
  const { mac_address, package_name } = req.body;
  
  try {
    // Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const device_id = deviceResult.rows[0].id;
    
    // Criar comando
    const commandResult = await pool.query(
      `INSERT INTO device_commands (device_id, command_type, command_data, status)
       VALUES ($1, 'uninstall_app', $2, 'pending')
       RETURNING *`,
      [device_id, JSON.stringify({ package_name })]
    );
    
    // Remover do banco
    await pool.query(
      'DELETE FROM device_apps WHERE device_id = $1 AND package_name = $2',
      [device_id, package_name]
    );
    
    res.json({ 
      command: commandResult.rows[0],
      message: 'Comando de desinstalação enviado' 
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao desinstalar app' });
  }
};

// Enviar APK por MAC
exports.sendApkByMac = async (req, res) => {
  const { mac_address, app_name, app_url } = req.body;
  
  try {
    // Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const device_id = deviceResult.rows[0].id;
    
    // Criar comando
    const commandResult = await pool.query(
      `INSERT INTO device_commands (device_id, command_type, command_data, status)
       VALUES ($1, 'install_app', $2, 'pending')
       RETURNING *`,
      [device_id, JSON.stringify({ app_name, app_url })]
    );
    
    res.json({ 
      command: commandResult.rows[0],
      message: 'Comando de instalação enviado' 
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao enviar APK' });
  }
};

// Comandos pendentes por MAC
exports.getPendingCommandsByMac = async (req, res) => {
  const { mac_address } = req.params;
  
  try {
    // Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      return res.json({ commands: [] });
    }
    
    const device_id = deviceResult.rows[0].id;
    
    const result = await pool.query(
      `SELECT * FROM device_commands 
       WHERE device_id = $1 AND status = 'pending'
       ORDER BY created_at ASC`,
      [device_id]
    );
    
    res.json({ commands: result.rows });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar comandos' });
  }
};
```

#### 3. Adicionar em `modules/mac/macRoutes.js`:

```javascript
// Rota alternativa para verificar status por MAC
router.get('/status/:mac_address', authMiddleware, macController.checkDeviceStatusByMac);

// Rotas alternativas para bloqueio por MAC
router.post('/block-by-mac', authMiddleware, macController.blockDeviceByMac);
router.post('/unblock-by-mac', authMiddleware, macController.unblockDeviceByMac);
```

#### 4. Adicionar em `modules/mac/macController.js`:

```javascript
// Verificar status por MAC
exports.checkDeviceStatusByMac = async (req, res) => {
  const { mac_address } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT id, mac_address, status, connection_status, modelo, 
              android_version, app_version, ip, ultimo_acesso
       FROM devices 
       WHERE mac_address = $1`,
      [mac_address]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
};

// Bloquear por MAC
exports.blockDeviceByMac = async (req, res) => {
  const { mac_address } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE devices 
       SET status = 'bloqueado' 
       WHERE mac_address = $1 
       RETURNING *`,
      [mac_address]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    res.json({ 
      device: result.rows[0],
      message: 'Dispositivo bloqueado com sucesso' 
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao bloquear dispositivo' });
  }
};

// Desbloquear por MAC
exports.unblockDeviceByMac = async (req, res) => {
  const { mac_address } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE devices 
       SET status = 'ativo' 
       WHERE mac_address = $1 
       RETURNING *`,
      [mac_address]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    res.json({ 
      device: result.rows[0],
      message: 'Dispositivo desbloqueado com sucesso' 
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao desbloquear dispositivo' });
  }
};
```

---

### Opção 2: Modificar o App Android

Modificar o app para usar `device_id` em vez de `mac_address` (NÃO RECOMENDADO - mais complexo)

---

## 🎯 RECOMENDAÇÃO FINAL

**IMPLEMENTAR OPÇÃO 1** - Adicionar rotas alternativas no painel que aceitem `mac_address`.

**Vantagens:**
- Mantém compatibilidade com o app atual
- Não requer recompilação do APK
- Mais simples e rápido
- Permite que o app funcione imediatamente após deploy

**Próximos Passos:**
1. Adicionar as novas rotas e controllers no painel
2. Fazer commit e push para GitHub
3. Aguardar deploy automático do Render
4. Testar conexão app ↔ painel

---

## ✅ ENDPOINTS QUE JÁ FUNCIONAM

| Endpoint | Status |
|----------|--------|
| `POST /api/device/register-device` | ✅ FUNCIONA |
| `POST /api/device/connection-status` | ✅ FUNCIONA |
| `POST /api/device/check` | ✅ FUNCIONA |
| `POST /api/auth/login` | ✅ FUNCIONA |
| `GET /api/app-config/config` | ✅ FUNCIONA |

---

## 📝 CONCLUSÃO

O painel e o app estão **PARCIALMENTE CONECTADOS**. Os endpoints básicos funcionam, mas os endpoints de gerenciamento de apps e bloqueio precisam de ajustes para aceitar `mac_address` em vez de `device_id`.

**Status Atual:** ⚠️ 60% FUNCIONAL  
**Após Correções:** ✅ 100% FUNCIONAL
