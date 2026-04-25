const express = require('express');
const router = express.Router();
const brandingController = require('./brandingController');
const authMiddleware = require('../../middlewares/auth');

// Branding
router.get('/', brandingController.obterBranding);
router.get('/current', brandingController.obterBrandingAtivo);
router.post('/', authMiddleware, brandingController.criarBranding);
router.put('/:id', authMiddleware, brandingController.atualizarBranding);
router.post('/:id/activate', authMiddleware, brandingController.ativarBranding);
router.delete('/:id', authMiddleware, brandingController.excluirBranding);

// Templates
router.get('/templates', authMiddleware, brandingController.listarTemplates);

// Logos do App Android
router.get('/app-logos/:type', brandingController.getAppLogo);

module.exports = router;
