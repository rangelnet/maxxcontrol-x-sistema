const express = require('express');
const router = express.Router();
const controller = require('./templateController');
const authMiddleware = require('../../middlewares/auth');

// Rotas exclusivas de templates para o Master/Admin
router.get('/', authMiddleware, controller.listTemplates);
router.post('/', authMiddleware, controller.createTemplate);
router.put('/:id', authMiddleware, controller.updateTemplate);
router.delete('/:id', authMiddleware, controller.deleteTemplate);

module.exports = router;
