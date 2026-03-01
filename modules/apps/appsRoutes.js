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

module.exports = router;
