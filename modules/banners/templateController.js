const pool = require('../../config/database');

// GET /api/banners/templates - Listar todos os templates
exports.listTemplates = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM banner_templates ORDER BY created_at DESC'
    );
    res.json({ templates: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/banners/templates - Criar novo template
exports.createTemplate = async (req, res) => {
  const { name, type, bg_url, overlay_url, config } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO banner_templates (name, type, bg_url, overlay_url, config, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [name, type || 'movie', bg_url, overlay_url, JSON.stringify(config || {})]
    );
    
    res.json({ success: true, template: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/banners/templates/:id - Atualizar template
exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, type, bg_url, overlay_url, config } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE banner_templates 
       SET name = $1, type = $2, bg_url = $3, overlay_url = $4, config = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, type, bg_url, overlay_url, JSON.stringify(config), id]
    );
    
    if (result.rows.length > 0) {
      res.json({ success: true, template: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Template não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/banners/templates/:id - Deletar template
exports.deleteTemplate = async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM banner_templates WHERE id = $1', [id]);
    res.json({ success: true, message: 'Template deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
