const pool = require('../../config/database');

// Reportar bug
exports.reportBug = async (req, res) => {
  const { stack_trace, modelo, app_version, device_id } = req.body;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'INSERT INTO bugs (user_id, device_id, stack_trace, modelo, app_version) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, device_id, stack_trace, modelo, app_version]
    );

    res.status(201).json({ bug: result.rows[0], message: 'Bug reportado' });
  } catch (error) {
    console.error('Erro ao reportar bug:', error);
    res.status(500).json({ error: 'Erro ao reportar bug' });
  }
};

// Listar bugs
exports.getBugs = async (req, res) => {
  const { resolvido } = req.query;

  try {
    let query = 'SELECT b.*, u.nome, u.email FROM bugs b JOIN users u ON b.user_id = u.id';
    const params = [];

    if (resolvido !== undefined) {
      query += ' WHERE b.resolvido = $1';
      params.push(resolvido === 'true');
    }

    query += ' ORDER BY b.data DESC';

    const result = await pool.query(query, params);
    res.json({ bugs: result.rows });
  } catch (error) {
    console.error('Erro ao buscar bugs:', error);
    res.status(500).json({ error: 'Erro ao buscar bugs' });
  }
};

// Marcar bug como resolvido
exports.resolveBug = async (req, res) => {
  const { bug_id } = req.body;

  try {
    await pool.query('UPDATE bugs SET resolvido = TRUE WHERE id = $1', [bug_id]);
    res.json({ message: 'Bug marcado como resolvido' });
  } catch (error) {
    console.error('Erro ao resolver bug:', error);
    res.status(500).json({ error: 'Erro ao resolver bug' });
  }
};
