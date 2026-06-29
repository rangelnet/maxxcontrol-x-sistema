const express = require('express');
const router = express.Router();
const aiAgentController = require('./aiAgentController');

// Proteção - opcional adicionar middleware de auth caso precise:
// const authMiddleware = require('../../middlewares/auth');
// router.use(authMiddleware);

// Rota para iniciar as tabelas e o cron quando o módulo for carregado
aiAgentController.initAI();

router.get('/config', aiAgentController.getConfig);
router.post('/config', aiAgentController.updateConfig);
router.get('/logs', aiAgentController.getLogs);
router.delete('/logs', aiAgentController.clearLogs);
router.post('/scan-now', aiAgentController.scanNow);
router.get('/vod/top', aiAgentController.getTopVod);
router.get('/vod/search', aiAgentController.getSearchVod);
router.get('/vod/categories', aiAgentController.getCategories);

// TMDB Dirty Words Scanner
router.get('/dirty-words', aiAgentController.getDirtyWords);
router.post('/dirty-words/approve-all', aiAgentController.approveAllDirtyWords);
router.post('/dirty-words/:id/status', aiAgentController.updateDirtyWordStatus);

module.exports = router;

