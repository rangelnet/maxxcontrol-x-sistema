const express = require('express');
const router = express.Router();
const iptvProviderController = require('./iptvProviderController');
const supabase = require('../../config/supabase');

// Rotas de Provedores (Slots)
router.get('/providers', iptvProviderController.getProviders);
router.put('/providers/:id', iptvProviderController.updateProvider);

// Rotas de Curadoria (Marketing)
router.get('/curation', iptvProviderController.getCuration);
router.post('/curation', iptvProviderController.addToCuration);
router.delete('/curation/:id', iptvProviderController.deleteCurationItem);

const iptvServerController = require('./iptvServerController');

// Rotas de Configuração Global (PostgreSQL Local)
router.get('/public-config', iptvServerController.getPublicConfig);
router.get('/config', iptvServerController.getConfig);
router.post('/config', iptvServerController.saveConfig);
router.post('/test', iptvServerController.testConnection);

// Rota para o App Android buscar configuração por MAC
router.get('/config/:mac', iptvServerController.getConfigByMac);

module.exports = router;
