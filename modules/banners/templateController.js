const pool = require('../../config/database');

/**
 * Função utilitária para mapear as colunas do banco (PT) para o formato esperado pelo Front-end (EN)
 */
const mapToFrontend = (temp) => ({
  id: temp.id,
  name: temp.nome,
  type: temp.tipo,
  bg_url: temp.preview_url || temp.config?.bg_url || '',
  overlay_url: temp.descricao?.startsWith('http') ? temp.descricao : (temp.config?.overlay_url || ''),
  config: temp.config || {},
  width: temp.largura,
  height: temp.altura,
  active: temp.ativo,
  created_at: temp.criado_em
});

// GET /api/banners/templates - Listar todos os templates
exports.listTemplates = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM banner_templates ORDER BY criado_em DESC'
    ).catch(e => ({ rows: [] }));
    
    const mapped = (result.rows || []).map(mapToFrontend);
    res.json({ templates: mapped });
  } catch (err) {
    res.json({ templates: [] });
  }
};

// POST /api/banners/templates - Criar novo template
exports.createTemplate = async (req, res) => {
  const { name, type, bg_url, overlay_url, config, width, height } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO banner_templates (nome, tipo, config, largura, altura, ativo, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        name, 
        type || 'movie', 
        JSON.stringify({ ...config, bg_url, overlay_url }), 
        width || 1080, 
        height || 1920, 
        true
      ]
    );
    
    res.json({ success: true, template: mapToFrontend(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/banners/templates/:id - Atualizar template
exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, type, bg_url, overlay_url, config, width, height } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE banner_templates 
       SET nome = $1, tipo = $2, config = $3, largura = $4, altura = $5
       WHERE id = $6
       RETURNING *`,
      [
        name, 
        type, 
        JSON.stringify({ ...config, bg_url, overlay_url }), 
        width || 1080, 
        height || 1920, 
        id
      ]
    );
    
    if (result.rows.length > 0) {
      res.json({ success: true, template: mapToFrontend(result.rows[0]) });
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
