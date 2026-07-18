const express = require('express');
const controller = require('./adultManagerController');

const router = express.Router();

router.get('/config', controller.getConfig);
router.post('/config', controller.updateConfig);
router.get('/catalog', controller.getCatalog);
router.get('/categories', controller.getCategories);
router.get('/public', controller.getPublicCatalog);
router.post('/scan', controller.scanCatalog);
router.post('/categories/:id', controller.updateCategory);
router.post('/items/:id/status', controller.updateItemStatus);
router.post('/items/:id/feature', controller.updateItemFeature);
router.post('/items/:id/generate-image', controller.generateItemImage);

module.exports = router;
