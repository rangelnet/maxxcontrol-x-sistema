const pool = require('../../config/database');

// Listar todas as APIs configuradas
exports.listAPIs = async (req, res) => {
  const { ativa, categoria } = req.query;

  try {
    let query = 'SELECT * FROM api_configs WHERE 1=1';
    const params = [];

    if (ativa !== undefined) {
      params.push(ativa === 'true');
      query += ` AND ativa = $${params.length}`;
    }

    if (categoria) {
      params.push(categoria);
      query += ` AND categoria = $${params.length}`;
    }

    query += ' ORDER BY critica DESC, nome ASC';

    const result = await pool.query(query, params);
    res.json({ apis: result.rows });
  } catch (error) {
    console.error('Erro ao listar APIs:', error);
    res.status(500).json({ error: 'Erro ao listar APIs' });
  }
};

// Criar nova API
exports.createAPI = async (req, res) => {
  const { nome, descricao, url, categoria, critica, metodo, headers, timeout } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO api_configs (nome, descricao, url, categoria, critica, metodo, headers, timeout) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nome, descricao, url, categoria, critica || false, metodo || 'GET', headers || null, timeout || 5000]
    );

    res.status(201).json({ api: result.rows[0], message: 'API criada com sucesso' });
  } catch (error) {
    console.error('Erro ao criar API:', error);
    res.status(500).json({ error: 'Erro ao criar API' });
  }
};

// Atualizar API
exports.updateAPI = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, url, categoria, critica, ativa, metodo, headers, timeout } = req.body;

  try {
    const result = await pool.query(
      `UPDATE api_configs 
       SET nome = $1, descricao = $2, url = $3, categoria = $4, critica = $5, 
           ativa = $6, metodo = $7, headers = $8, timeout = $9, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [nome, descricao, url, categoria, critica, ativa, metodo, headers, timeout, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API não encontrada' });
    }

    res.json({ api: result.rows[0], message: 'API atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar API:', error);
    res.status(500).json({ error: 'Erro ao atualizar API' });
  }
};

// Deletar API
exports.deleteAPI = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM api_configs WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API não encontrada' });
    }

    res.json({ message: 'API deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar API:', error);
    res.status(500).json({ error: 'Erro ao deletar API' });
  }
};

// Obter histórico de status de uma API
exports.getAPIHistory = async (req, res) => {
  const { id } = req.params;
  const { limit = 100 } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM api_status_history 
       WHERE api_config_id = $1 
       ORDER BY verificado_em DESC 
       LIMIT $2`,
      [id, limit]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};

// Obter categorias disponíveis
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT categoria FROM api_configs WHERE categoria IS NOT NULL ORDER BY categoria'
    );

    const categories = result.rows.map(row => row.categoria);
    res.json({ categories });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};
