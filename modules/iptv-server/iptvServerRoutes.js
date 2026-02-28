const express = require('express');
const router = express.Router();
const controller = require('./iptvServerController');

// Rotas globais
router.get('/config', controller.getConfig);
router.post('/config', controller.saveConfig);
router.post('/test', controller.testConnection);

// Rotas por dispositivo
router.get('/config/:mac', controller.getConfigByMac);
router.get('/device/:deviceId', controller.getDeviceConfig);
router.post('/device/:deviceId', controller.saveDeviceConfig);
router.delete('/device/:deviceId', controller.deleteDeviceConfig);

module.exports = router;
