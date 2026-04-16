const express = require('express');
const router = express.Router();
const settingsController = require('./settingsController');
// const { authMiddleware } = require('../auth/authMiddleware'); // Pode habilitar se necessário proteção estrita

router.get('/', settingsController.getSettings);
router.post('/:key', settingsController.updateSetting);

module.exports = router;
