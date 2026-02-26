const pool = require('../../config/database');

// Obter branding ativo
exports.obterBrandingAtivo = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM branding_settings WHERE ativo = 1 ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Branding não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter branding:', error);
    res.status(500).json({ error: 'Erro ao obter branding' });
  }
};

// Obter todos os brandings
exports.obterBranding = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM branding_settings ORDER BY criado_em DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter branding:', error);
    res.status(500).json({ error: 'Erro ao obter branding' });
  }
};

// Atualizar branding
exports.atualizarBranding = async (req, res) => {
  const { id } = req.params;
  const { banner_titulo, banner_subtitulo, banner_cor_fundo, banner_cor_texto, logo_url, splash_url, tema } = req.body;

  try {
    const result = await pool.query(
      `UPDATE branding_settings 
       SET banner_titulo = ?, 
           banner_subtitulo = ?, 
           banner_cor_fundo = ?,
           banner_cor_texto = ?,
           logo_url = ?,
           splash_url = ?,
           tema = ?,
           atualizado_em = datetime('now')
       WHERE id = ?`,
      [banner_titulo, banner_subtitulo, banner_cor_fundo, banner_cor_texto, logo_url, splash_url, tema, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Branding não encontrado' });
    }

    res.json({ message: 'Branding atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar branding:', error);
    res.status(500).json({ error: 'Erro ao atualizar branding' });
  }
};

// Listar templates
exports.listarTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 1,
        nome: 'TV Maxx Padrão',
        descricao: 'Template padrão com cores da TV Maxx',
        banner_cor_fundo: '#000000',
        banner_cor_texto: '#FF6A00',
        tema: 'dark'
      },
      {
        id: 2,
        nome: 'Claro',
        descricao: 'Template com tema claro',
        banner_cor_fundo: '#FFFFFF',
        banner_cor_texto: '#000000',
        tema: 'light'
      },
      {
        id: 3,
        nome: 'Azul Premium',
        descricao: 'Template premium com tons de azul',
        banner_cor_fundo: '#001F3F',
        banner_cor_texto: '#00D4FF',
        tema: 'dark'
      }
    ];

    res.json(templates);
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({ error: 'Erro ao listar templates' });
  }
};
