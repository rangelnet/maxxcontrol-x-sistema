const pool = require('../../config/database');

// Obter versão atual do app
exports.getVersion = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM app_versions WHERE ativa = TRUE ORDER BY criado_em DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhuma versão ativa encontrada' });
    }

    res.json({ version: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar versão:', error);
    res.status(500).json({ error: 'Erro ao buscar versão' });
  }
};

// Criar nova versão
exports.createVersion = async (req, res) => {
  const { versao, obrigatoria, link_download, mensagem } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO app_versions (versao, obrigatoria, link_download, mensagem) VALUES ($1, $2, $3, $4) RETURNING *',
      [versao, obrigatoria, link_download, mensagem]
    );

    res.status(201).json({ version: result.rows[0], message: 'Versão criada' });
  } catch (error) {
    console.error('Erro ao criar versão:', error);
    res.status(500).json({ error: 'Erro ao criar versão' });
  }
};

// Listar versões
exports.listVersions = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM app_versions ORDER BY criado_em DESC');
    res.json({ versions: result.rows });
  } catch (error) {
    console.error('Erro ao listar versões:', error);
    res.status(500).json({ error: 'Erro ao listar versões' });
  }
};
