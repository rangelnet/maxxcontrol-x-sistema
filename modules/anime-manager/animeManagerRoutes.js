const express = require('express');
const animeManagerController = require('./animeManagerController');

const router = express.Router();

router.get('/config', animeManagerController.getConfig);
router.post('/config', animeManagerController.updateConfig);
router.get('/catalog', animeManagerController.getCatalog);
router.get('/public', animeManagerController.getPublicCatalog);
router.post('/scan', animeManagerController.scanCatalog);
router.post('/items/:id/status', animeManagerController.updateItemStatus);
router.post('/items/:id/feature', animeManagerController.updateItemFeature);

module.exports = router;
