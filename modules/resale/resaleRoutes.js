const express = require('express');
const router = express.Router();
const resaleController = require('./resaleController');
const { authMiddleware } = require('../../middlewares/auth');

const adminOnly = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// CRUD de revendedores
router.get('/resellers', authMiddleware, adminOnly, resaleController.listResellers);
router.post('/resellers', authMiddleware, adminOnly, resaleController.createReseller);
router.put('/resellers/:id', authMiddleware, adminOnly, resaleController.updateReseller);
router.delete('/resellers/:id', authMiddleware, adminOnly, resaleController.deleteReseller);
router.patch('/resellers/:id/toggle-status', authMiddleware, adminOnly, resaleController.toggleStatus);

// Créditos
router.post('/credits/send', authMiddleware, adminOnly, resaleController.sendCredits);

// Dashboard
router.get('/dashboard/stats', authMiddleware, resaleController.getDashboardStats);

module.exports = router;
