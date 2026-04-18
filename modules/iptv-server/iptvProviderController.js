const pool = require('../../config/database');

/**
 * Gerencia os 6 slots de provedores IPTV e a curadoria de conteúdo para o banner generator.
 */

// Listar todos os provedores (os 6 slots)
exports.listProviders = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM iptv_providers ORDER BY slot_index ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar um slot de provedor específico
exports.updateProvider = async (req, res) => {
  const { id } = req.params;
  const { name, url, username, password, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE iptv_providers 
       SET name = $1, url = $2, username = $3, password = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6 OR slot_index = $6
       RETURNING *`,
      [name, url, username, password, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provedor não encontrado' });
    }

    res.json({ success: true, provider: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Adicionar item à curadoria (Banner Generator)
exports.addToCuration = async (req, res) => {
  const { type, title, external_id, tmdb_id, poster_path, backdrop_path, provider_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO iptv_curation (type, title, external_id, tmdb_id, poster_path, backdrop_path, provider_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (type, external_id, provider_id) DO UPDATE SET
       title = $2, tmdb_id = $4, poster_path = $5, backdrop_path = $6, created_at = NOW()
       RETURNING *`,
      [type, title, external_id, tmdb_id, poster_path, backdrop_path, provider_id]
    );

    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar itens da curadoria
exports.listCuration = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, p.name as provider_name 
       FROM iptv_curation c
       JOIN iptv_providers p ON p.id = c.provider_id
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remover item da curadoria
exports.removeFromCuration = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM iptv_curation WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
