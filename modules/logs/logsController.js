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
  const userId = req.userId;
  const { limit = 100, tipo } = req.query;

  try {
    let query = 'SELECT l.*, d.mac_address, d.modelo FROM logs l LEFT JOIN devices d ON l.device_id = d.id WHERE l.user_id = $1';
    const params = [userId];

    if (tipo) {
      query += ' AND l.tipo = $2';
      params.push(tipo);
    }

    query += ' ORDER BY l.data DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);
    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
};
