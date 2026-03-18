const express = require('express');
const router = express.Router();
const controller = require('./iptvMonitoringController');
const authMiddleware = require('../../middlewares/auth');

/**
 * Rotas de Monitoramento IPTV
 * Gerencia métricas de streaming e troca de servidores
 */

// POST /api/iptv/monitor-status - Receber métricas do dispositivo (público)
router.post('/monitor-status', controller.monitorStatus);

// POST /api/iptv/force-switch - Forçar troca de servidor (protegido)
router.post('/force-switch', authMiddleware, controller.forceSwitch);

// POST /api/iptv/server-switch - Registrar troca de servidor (público)
router.post('/server-switch', controller.logServerSwitch);

// GET /api/iptv/monitoring/stats - Estatísticas de monitoramento (protegido)
router.get('/monitoring/stats', authMiddleware, controller.getMonitoringStats);

module.exports = router;
