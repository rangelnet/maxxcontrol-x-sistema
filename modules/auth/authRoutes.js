const express = require('express');
const router = express.Router();
const authController = require('./authController');
const authMiddleware = require('../../middlewares/auth');

const rateLimit = require('express-rate-limit');

// Trava de Segurança Mxxcontrol: Limite de 7 tentativas por IP a cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 7, // 7 tentativas
  message: { error: 'Muitas tentativas de acesso. Por segurança, você foi bloqueado. Tente novamente em 15 minutos ou entre em contato com seu revendedor.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/verify-2fa', authController.verify2FA);
router.get('/validate-token', authMiddleware, authController.validateToken);
router.get('/devices', authMiddleware, authController.getDevices);
router.delete('/devices/:id', authMiddleware, authController.deleteDevice);
router.put('/toggle-tfa', authMiddleware, authController.toggleTFA);
router.delete('/logout', authMiddleware, authController.logout);

module.exports = router;
