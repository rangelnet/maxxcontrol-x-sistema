const express = require('express');
const router = express.Router();
const googleController = require('./googleController');
const authMiddleware = require('../../../middlewares/auth');

// Rotas protegidas que exigem que o usuário esteja logado no painel
router.get('/auth', authMiddleware, googleController.getAuthUrl);
router.get('/status', authMiddleware, googleController.getStatus);
router.delete('/disconnect', authMiddleware, googleController.disconnect);

// Rota de callback aberta (o state JWT é quem faz a identificação do usuário quando o Google redireciona de volta)
router.get('/callback', googleController.oauthCallback);

module.exports = router;
