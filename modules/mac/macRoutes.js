const express = require('express');
const router = express.Router();
const macController = require('./macController');
const authMiddleware = require('../../middlewares/auth');
const deviceAuthMiddleware = require('../../middlewares/deviceAuth');

// Rota com autenticação de dispositivo (token fixo) para registro
router.post('/register-device', deviceAuthMiddleware, macController.registerDevicePublic);

// Rota pública para registro inicial de dispositivo (sem autenticação) - DEPRECATED
router.post('/register-public', macController.registerDevicePublic);

router.post('/register', authMiddleware, macController.registerDevice);
router.post('/check', macController.checkDevice);
router.post('/block', authMiddleware, macController.blockDevice);
router.get('/list', authMiddleware, macController.listDevices);

module.exports = router;
