const sportsService = require('../../services/sportsService');

/**
 * Retorna os jogos filtrados por tipo
 */
exports.getMatches = async (req, res) => {
  const { type, date } = req.query;

  try {
    let data = [];
    
    if (type === 'mma') {
      data = await sportsService.getMmaMatches();
    } else if (type === 'basketball') {
      data = await sportsService.getBasketballMatches(date);
    } else {
      // Padrão: Soccer
      data = await sportsService.getSoccerMatches(date);
    }

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Erro no sportsController:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar placares esportivos'
    });
  }
};
