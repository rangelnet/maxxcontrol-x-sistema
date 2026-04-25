const express = require('express');
const router = express.Router();
const sportsController = require('./sportsController');

// Rota para buscar partidas
router.get('/matches', sportsController.getMatches);

module.exports = router;
