const pool = require('../../config/database');

// GET /api/iptv-server/config - Buscar configuração
exports.getConfig = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM iptv_server_config LIMIT 1');
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ xtream_url: '', xtream_username: '', xtream_password: '' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/iptv-server/config - Salvar configuração
exports.saveConfig = async (req, res) => {
  const { xtream_url, xtream_username, xtream_password } = req.body;

  try {
    await pool.query(
      `INSERT INTO iptv_server_config (id, xtream_url, xtream_username, xtream_password, updated_at)
       VALUES (1, $1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE SET
       xtream_url = $1,
       xtream_username = $2,
       xtream_password = $3,
       updated_at = NOW()`,
      [xtream_url, xtream_username, xtream_password]
    );
    
    res.json({ success: true, message: 'Configuração salva com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/iptv-server/test - Testar conexão
exports.testConnection = async (req, res) => {
  const { xtream_url, xtream_username, xtream_password } = req.body;

  try {
    const testUrl = `${xtream_url}/player_api.php?username=${xtream_username}&password=${xtream_password}`;
    const response = await fetch(testUrl);
    
    if (response.ok) {
      const data = await response.json();
      res.json({ 
        success: true, 
        message: 'Conexão bem-sucedida',
        channels: data.user_info?.active_cons || 0
      });
    } else {
      res.status(400).json({ success: false, message: 'Falha na autenticação' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao conectar: ' + error.message });
  }
};

module.exports = exports;
