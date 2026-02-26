const pool = require('../../config/database');

// Registrar dispositivo
exports.registerDevice = async (req, res) => {
  const { mac_address, modelo, android_version, app_version, ip } = req.body;
  const userId = req.userId;

  try {
    const existing = await pool.query('SELECT * FROM devices WHERE mac_address = $1', [mac_address]);

    if (existing.rows.length > 0) {
      // Atualizar dispositivo existente
      const result = await pool.query(
        'UPDATE devices SET user_id = $1, modelo = $2, android_version = $3, app_version = $4, ip = $5, ultimo_acesso = CURRENT_TIMESTAMP WHERE mac_address = $6 RETURNING *',
        [userId, modelo, android_version, app_version, ip, mac_address]
      );
      return res.json({ device: result.rows[0], message: 'Dispositivo atualizado' });
    }

    // Criar novo dispositivo
    const result = await pool.query(
      'INSERT INTO devices (user_id, mac_address, modelo, android_version, app_version, ip) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, mac_address, modelo, android_version, app_version, ip]
    );

    res.status(201).json({ device: result.rows[0], message: 'Dispositivo registrado' });
  } catch (error) {
    console.error('Erro ao registrar dispositivo:', error);
    res.status(500).json({ error: 'Erro ao registrar dispositivo' });
  }
};

// Verificar dispositivo
exports.checkDevice = async (req, res) => {
  const { mac_address } = req.body;

  try {
    const result = await pool.query('SELECT * FROM devices WHERE mac_address = $1', [mac_address]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado', allowed: false });
    }

    const device = result.rows[0];

    if (device.status !== 'ativo') {
      return res.status(403).json({ error: 'Dispositivo bloqueado', allowed: false });
    }

    // Atualizar último acesso
    await pool.query('UPDATE devices SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = $1', [device.id]);

    res.json({ allowed: true, device });
  } catch (error) {
    console.error('Erro ao verificar dispositivo:', error);
    res.status(500).json({ error: 'Erro ao verificar dispositivo' });
  }
};

// Bloquear dispositivo
exports.blockDevice = async (req, res) => {
  const { device_id } = req.body;

  try {
    await pool.query('UPDATE devices SET status = $1 WHERE id = $2', ['bloqueado', device_id]);
    res.json({ message: 'Dispositivo bloqueado com sucesso' });
  } catch (error) {
    console.error('Erro ao bloquear dispositivo:', error);
    res.status(500).json({ error: 'Erro ao bloquear dispositivo' });
  }
};

// Listar dispositivos do usuário
exports.listDevices = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query('SELECT * FROM devices WHERE user_id = $1 ORDER BY ultimo_acesso DESC', [userId]);
    res.json({ devices: result.rows });
  } catch (error) {
    console.error('Erro ao listar dispositivos:', error);
    res.status(500).json({ error: 'Erro ao listar dispositivos' });
  }
};
