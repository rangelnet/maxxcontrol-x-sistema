const express = require('express');
const router = express.Router();
const updatesController = require('./updatesController');
const authMiddleware = require('../../middlewares/auth');

router.get('/version', updatesController.getVersion);
router.post('/version', authMiddleware, updatesController.createVersion);
router.get('/versions', authMiddleware, updatesController.listVersions);

module.exports = router;
