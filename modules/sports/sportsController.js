const sportsService = require('../../services/sportsService');
const pool = require('../../config/database');

/**
 * Retorna os jogos filtrados por tipo
 */
exports.getMatches = async (req, res) => {
  const { type, date } = req.query;

  try {
    let data = [];
    
    if (type === 'mma') {
      data = await sportsService.getMmaMatches(date);
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

/**
 * Retorna as configurações dos Cards de Esportes
 */
exports.getSportsConfig = async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM global_settings WHERE key = 'sports_cards'");
    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0].value });
    }

    // Default configuration if not found
    let sportsCards = [
      { id: 'futebol', name: 'FUTEBOL', type: 'soccer', bgUrl: '/assets/sports/01_futebol.png', active: true },
      { id: 'basquete', name: 'BASQUETE', type: 'basketball', bgUrl: '/assets/sports/02_basquete.png', active: true },
      { id: 'lutas', name: 'LUTAS E ARTES MARCIAIS', type: 'mma', bgUrl: '/assets/sports/03_luta.png', active: true },
      { id: 'volei', name: 'VÔLEI', type: 'volleyball', bgUrl: '/assets/sports/04_volei.png', active: true },
      { id: 'nfl', name: 'FUTEBOL AMERICANO (NFL)', type: 'nfl', bgUrl: '/assets/sports/05_nfl.png', active: true },
      { id: 'esports', name: 'E-SPORTS', type: 'esports', bgUrl: '/assets/sports/06_esports.png', active: true }
    ];

    res.json({ success: true, data: sportsCards });
  } catch (error) {
    console.error('Erro ao buscar config de esportes:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar configuração' });
  }
};

/**
 * Atualiza as configurações dos Cards de Esportes
 */
exports.updateSportsConfig = async (req, res) => {
  const { cards } = req.body;
  if (!cards || !Array.isArray(cards)) {
    return res.status(400).json({ success: false, error: 'Dados inválidos' });
  }

  try {
    await pool.query(
      `INSERT INTO global_settings (key, value, updated_at) 
       VALUES ('sports_cards', $1, NOW()) 
       ON CONFLICT (key) DO UPDATE 
       SET value = $1, updated_at = NOW()`,
      [JSON.stringify(cards)]
    );
    res.json({ success: true, message: 'Configurações de esportes atualizadas!' });
  } catch (error) {
    console.error('Erro ao salvar config de esportes:', error);
    res.status(500).json({ success: false, error: 'Erro ao salvar configuração' });
  }
};
