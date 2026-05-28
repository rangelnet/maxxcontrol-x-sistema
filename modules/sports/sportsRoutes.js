const express = require('express');
const router = express.Router();
const sportsController = require('./sportsController');

// Rota para buscar partidas
router.get('/matches', sportsController.getMatches);

// Rotas para gerenciar os 6 Cards de Esportes do App/Web
router.get('/config', sportsController.getSportsConfig);
router.post('/config', sportsController.updateSportsConfig);

module.exports = router;
