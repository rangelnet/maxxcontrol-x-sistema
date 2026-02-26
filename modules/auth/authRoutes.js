const express = require('express');
const router = express.Router();
const authController = require('./authController');
const authMiddleware = require('../../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/validate-token', authMiddleware, authController.validateToken);

module.exports = router;
