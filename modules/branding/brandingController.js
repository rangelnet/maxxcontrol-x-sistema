const pool = require('../../config/database');

// Obter todas as configurações de branding
exports.obterBranding = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branding_settings ORDER BY criado_em DESC');
    res.json({ branding: result.rows });
  } catch (error) {
    console.error('Erro ao obter branding:', error);
    res.status(500).json({ error: 'Erro ao obter branding' });
  }
};

// Obter branding ativo (para o app consumir)
exports.obterBrandingAtivo = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branding_settings WHERE ativo = true LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum branding ativo encontrado' });
    }

    res.json({ branding: result.rows[0] });
  } catch (error) {
    console.error('Erro ao obter branding ativo:', error);
    res.status(500).json({ error: 'Erro ao obter branding ativo' });
  }
};

// Atualizar branding
exports.atualizarBranding = async (req, res) => {
  const { id } = req.params;
  const {
    app_name,
    logo_url,
    logo_dark_url,
    primary_color,
    secondary_color,
    background_color,
    text_color,
    accent_color,
    splash_screen_url,
    hero_banner_url,
    ativo
  } = req.body;

  try {
    // Se ativo = true, desativar todos os outros
    if (ativo) {
      await pool.query('UPDATE branding_settings SET ativo = false');
    }

    const result = await pool.query(
      `UPDATE branding_settings SET
        app_name = $1,
        logo_url = $2,
        logo_dark_url = $3,
        primary_color = $4,
        secondary_color = $5,
        background_color = $6,
        text_color = $7,
        accent_color = $8,
        splash_screen_url = $9,
        hero_banner_url = $10,
        ativo = $11,
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *`,
      [
        app_name, logo_url, logo_dark_url, primary_color, secondary_color,
        background_color, text_color, accent_color, splash_screen_url,
        hero_banner_url, ativo, id
      ]
    );

    res.json({ 
      message: 'Branding atualizado com sucesso! 🎨',
      branding: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar branding:', error);
    res.status(500).json({ error: 'Erro ao atualizar branding' });
  }
};

// Listar templates de banner
exports.listarTemplates = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banner_templates WHERE ativo = true ORDER BY nome');
    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({ error: 'Erro ao listar templates' });
  }
};
