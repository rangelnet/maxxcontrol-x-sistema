const express = require('express');
const router = express.Router();
const appsController = require('./appsController');
const authMiddleware = require('../../middlewares/auth');
const deviceAuthMiddleware = require('../../middlewares/deviceAuth');

// Listar apps instalados (autenticado)
router.get('/device/:device_id', authMiddleware, appsController.listInstalledApps);

// Registrar app instalado (do app Android)
router.post('/register', deviceAuthMiddleware, appsController.registerInstalledApp);

// Desinstalar app (autenticado)
router.post('/uninstall', authMiddleware, appsController.uninstallApp);

// Enviar APK (autenticado)
router.post('/send-apk', authMiddleware, appsController.sendApk);

// Comandos pendentes (do app Android)
router.get('/commands/:device_id', deviceAuthMiddleware, appsController.getPendingCommands);

// Atualizar status do comando (do app Android)
router.post('/commands/status', deviceAuthMiddleware, appsController.updateCommandStatus);

// ========== ROTAS ALTERNATIVAS QUE ACEITAM MAC ADDRESS ==========

// Listar apps por MAC (para o app Android)
router.get('/device/mac/:mac_address', authMiddleware, appsController.listInstalledAppsByMac);

// Desinstalar app por MAC (para o app Android)
router.post('/uninstall-by-mac', authMiddleware, appsController.uninstallAppByMac);

// Enviar APK por MAC (para o app Android)
router.post('/send-apk-by-mac', authMiddleware, appsController.sendApkByMac);

// Comandos pendentes por MAC (para o app Android)
router.get('/commands/mac/:mac_address', deviceAuthMiddleware, appsController.getPendingCommandsByMac);

// Sincronizar lista completa de apps (do app Android)
router.post('/sync', deviceAuthMiddleware, appsController.syncInstalledApps);

module.exports = router;
