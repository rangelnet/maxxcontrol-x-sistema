const express = require('express');
const router = express.Router();
const controller = require('./iptvTreeController');
const authMiddleware = require('../../middlewares/auth');

// Todas as rotas requerem autenticação
router.get('/categories/:type', authMiddleware, controller.getCategories);
router.get('/streams/:type/:categoryId', authMiddleware, controller.getStreams);
router.get('/series/:categoryId', authMiddleware, controller.getSeries);
router.get('/series-info/:seriesId', authMiddleware, controller.getSeriesInfo);
router.post('/clear-cache', authMiddleware, controller.clearCache);

module.exports = router;
