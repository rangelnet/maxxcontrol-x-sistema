const express = require('express');
const router = express.Router();
const monitoringController = require('./monitoringController');
const authMiddleware = require('../../middlewares/auth');

router.get('/online', authMiddleware, monitoringController.getOnlineUsers);
router.get('/dashboard', authMiddleware, monitoringController.getDashboardStats);

module.exports = router;
