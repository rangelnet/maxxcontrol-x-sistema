const express = require('express');
const router = express.Router();
const apiMonitorController = require('./apiMonitorController');
const authMiddleware = require('../../middlewares/auth');

router.get('/check-all', authMiddleware, apiMonitorController.checkAllAPIs);
router.get('/history/:api_name', authMiddleware, apiMonitorController.getAPIHistory);
router.post('/test', authMiddleware, apiMonitorController.testEndpoint);

module.exports = router;
