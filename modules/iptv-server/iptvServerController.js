const pool = require('../../config/database');

// GET /api/iptv-server/config - Buscar configuração global
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

// GET /api/iptv-server/config/:mac - Buscar configuração por MAC (para o app)
exports.getConfigByMac = async (req, res) => {
  const { mac } = req.params;
  
  try {
    // Primeiro busca se o dispositivo tem configuração específica
    const deviceResult = await pool.query(
      `SELECT dic.* FROM device_iptv_config dic
       JOIN devices d ON d.id = dic.device_id
       WHERE d.mac_address = $1`,
      [mac]
    );
    
    if (deviceResult.rows.length > 0) {
      return res.json(deviceResult.rows[0]);
    }
    
    // Se não tiver, retorna a configuração global
    const globalResult = await pool.query('SELECT * FROM iptv_server_config LIMIT 1');
    
    if (globalResult.rows.length > 0) {
      res.json(globalResult.rows[0]);
    } else {
      res.json({ xtream_url: '', xtream_username: '', xtream_password: '' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/iptv-server/device/:deviceId - Buscar configuração de um dispositivo
exports.getDeviceConfig = async (req, res) => {
  const { deviceId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM device_iptv_config WHERE device_id = $1',
      [deviceId]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ xtream_url: '', xtream_username: '', xtream_password: '' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/iptv-server/config - Salvar configuração global
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
    
    res.json({ success: true, message: 'Configuração global salva com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/iptv-server/device/:deviceId - Salvar configuração de um dispositivo
exports.saveDeviceConfig = async (req, res) => {
  const { deviceId } = req.params;
  const { xtream_url, xtream_username, xtream_password } = req.body;

  try {
    await pool.query(
      `INSERT INTO device_iptv_config (device_id, xtream_url, xtream_username, xtream_password, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (device_id) DO UPDATE SET
       xtream_url = $2,
       xtream_username = $3,
       xtream_password = $4,
       updated_at = NOW()`,
      [deviceId, xtream_url, xtream_username, xtream_password]
    );
    
    res.json({ success: true, message: 'Configuração do dispositivo salva com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/iptv-server/device/:deviceId - Remover configuração específica (volta para global)
exports.deleteDeviceConfig = async (req, res) => {
  const { deviceId } = req.params;

  try {
    await pool.query('DELETE FROM device_iptv_config WHERE device_id = $1', [deviceId]);
    res.json({ success: true, message: 'Configuração removida. Dispositivo usará configuração global.' });
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
