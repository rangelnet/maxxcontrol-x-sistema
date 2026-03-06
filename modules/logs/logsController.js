const pool = require('../../config/database');

// Criar log
exports.createLog = async (req, res) => {
  const { tipo, descricao, device_id } = req.body;
  const userId = req.userId;

  try {
    await pool.query(
      'INSERT INTO logs (user_id, device_id, tipo, descricao) VALUES ($1, $2, $3, $4)',
      [userId, device_id, tipo, descricao]
    );

    res.status(201).json({ message: 'Log registrado' });
  } catch (error) {
    console.error('Erro ao criar log:', error);
    res.status(500).json({ error: 'Erro ao registrar log' });
  }
};

// Listar logs
exports.getLogs = async (req, res) => {
  const { limit = 100, tipo, severity } = req.query;

  try {
    let query = `
      SELECT 
        sl.id,
        sl.device_id,
        sl.tipo as type,
        sl.descricao as message,
        sl.severity,
        sl.modelo,
        sl.app_version,
        sl.data as timestamp,
        d.mac_address
      FROM system_logs sl
      LEFT JOIN devices d ON sl.device_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (tipo) {
      query += ` AND sl.tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }
    
    if (severity) {
      query += ` AND sl.severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY sl.data DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
};
