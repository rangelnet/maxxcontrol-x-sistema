const pool = require('../../config/database');

exports.getProviders = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM iptv_providers ORDER BY slot_index ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProvider = async (req, res) => {
  const { id } = req.params;
  const { name, url, username, password } = req.body;
  try {
    const resu = await pool.query('UPDATE iptv_providers SET name=$1, url=$2, username=$3, password=$4, updated_at=NOW() WHERE id=$5 RETURNING *', [name, url, username, password, id]);
    res.json(resu.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCuration = async (req, res) => {
  try {
    const resu = await pool.query('SELECT c.*, p.name as provider_name FROM iptv_curation c LEFT JOIN iptv_providers p ON c.provider_id=p.id ORDER BY created_at DESC');
    res.json(resu.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addToCuration = async (req, res) => {
  const { type, title, external_id, tmdb_id, poster_path, backdrop_path, provider_id } = req.body;
  try {
    const resu = await pool.query('INSERT INTO iptv_curation (type, title, external_id, tmdb_id, poster_path, backdrop_path, provider_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [type, title, external_id, tmdb_id, poster_path, backdrop_path, provider_id]);
    res.json(resu.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
