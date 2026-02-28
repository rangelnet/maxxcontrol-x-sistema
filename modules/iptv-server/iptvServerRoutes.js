const express = require('express');
const router = express.Router();
const controller = require('./iptvServerController');

router.get('/config', controller.getConfig);
router.post('/config', controller.saveConfig);
router.post('/test', controller.testConnection);

module.exports = router;
