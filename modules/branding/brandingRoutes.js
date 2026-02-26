const express = require('express');
const router = express.Router();
const brandingController = require('./brandingController');
const authMiddleware = require('../../middlewares/auth');

// Branding
router.get('/', brandingController.obterBranding);
router.get('/current', brandingController.obterBrandingAtivo);
router.put('/:id', authMiddleware, brandingController.atualizarBranding);

// Templates
router.get('/templates', authMiddleware, brandingController.listarTemplates);

module.exports = router;
