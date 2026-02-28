const express = require('express');
const router = express.Router();
const macController = require('./macController');
const authMiddleware = require('../../middlewares/auth');
const deviceAuthMiddleware = require('../../middlewares/deviceAuth');

// Rota com autenticação de dispositivo (token fixo) para registro
router.post('/register-device', deviceAuthMiddleware, macController.registerDevicePublic);

// Rota para atualizar status de conexão (online/offline)
router.post('/connection-status', deviceAuthMiddleware, macController.updateConnectionStatus);

// Rota pública para registro inicial de dispositivo (sem autenticação) - DEPRECATED
router.post('/register-public', macController.registerDevicePublic);

router.post('/register', authMiddleware, macController.registerDevice);
router.post('/check', macController.checkDevice);
router.post('/block', authMiddleware, macController.blockDevice);
router.get('/list', authMiddleware, macController.listDevices);
router.get('/list-all', authMiddleware, macController.listAllDevices); // Lista TODOS (admin)

// Configurar URL da API de teste grátis
router.post('/test-api-url', authMiddleware, macController.setTestApiUrl);

// Buscar URL da API de teste grátis (público - para o app)
router.get('/test-api-url/:mac_address', macController.getTestApiUrl);

module.exports = router;
