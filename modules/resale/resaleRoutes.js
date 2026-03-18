const express = require('express');
const router = express.Router();
const resaleController = require('./resaleController');
const { authMiddleware } = require('../../middlewares/auth');

// Middleware para verificar se é admin
const adminOnly = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// Middleware para verificar se é revendedor ou admin
const resellerOrAdmin = (req, res, next) => {
  if (req.user.tipo !== 'revendedor' && req.user.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas revendedores ou administradores.' });
  }
  next();
};

// Rotas do dashboard (revendedor e admin)
router.get('/dashboard/stats', authMiddleware, resellerOrAdmin, resaleController.getDashboardStats);

// Rotas de administração (apenas admin)
router.get('/resellers', authMiddleware, adminOnly, resaleController.listResellers);
router.post('/credits/send', authMiddleware, adminOnly, resaleController.sendCredits);
router.post('/credits/set-price', authMiddleware, adminOnly, resaleController.setCreditPrice);
router.post('/resellers/change-plan', authMiddleware, adminOnly, resaleController.changeResellerPlan);
router.get('/profit', authMiddleware, adminOnly, resaleController.getResellerProfit);

// Rotas de transações (admin vê todas, revendedor vê apenas as suas)
router.get('/transactions', authMiddleware, resellerOrAdmin, resaleController.getTransactionHistory);

// Rotas de revendedor
router.post('/users/create', authMiddleware, resellerOrAdmin, resaleController.createUserWithCredits);
router.get('/alerts', authMiddleware, resellerOrAdmin, resaleController.checkLowCredits);
router.post('/alerts/read', authMiddleware, resellerOrAdmin, resaleController.markAlertAsRead);

module.exports = router;
