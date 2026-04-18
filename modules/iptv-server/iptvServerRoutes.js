const express = require('express');
const router = express.Router();
const controller = require('./iptvServerController');
const providerController = require('./iptvProviderController');

// Rotas globais (Existentes)
router.get('/config', controller.getConfig);
router.post('/config', controller.saveConfig);
router.post('/test', controller.testConnection);

// Rotas por dispositivo (Existentes)
router.get('/config/:mac', controller.getConfigByMac);
router.get('/device/:deviceId', controller.getDeviceConfig);
router.post('/device/:deviceId', controller.saveDeviceConfig);
router.delete('/device/:deviceId', controller.deleteDeviceConfig);

// --- NOVAS ROTAS: CURADORIA & 6 PROVEDORES ---

// Gerenciamento dos 6 Slots
router.get('/providers', providerController.listProviders);
router.put('/providers/:id', providerController.updateProvider);

// Gerenciamento da Curadoria (Banner Generator)
router.get('/curation', providerController.listCuration);
router.post('/curation', providerController.addToCuration);
router.delete('/curation/:id', providerController.removeFromCuration);

module.exports = router;
