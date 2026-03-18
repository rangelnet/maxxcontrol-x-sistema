const express = require('express');
const router = express.Router();
const controller = require('./iptvCredentialsController');
const authMiddleware = require('../../middlewares/auth');

/**
 * Rotas para gerenciamento de credenciais IPTV
 * Todas as rotas são protegidas por autenticação JWT
 */

// POST /api/iptv/create-credentials
// Criar credenciais IPTV para um dispositivo
router.post('/create-credentials', authMiddleware, controller.createCredentials);

// POST /api/iptv/reset-credentials
// Resetar credenciais IPTV de um dispositivo
router.post('/reset-credentials', authMiddleware, controller.resetCredentials);

module.exports = router;
