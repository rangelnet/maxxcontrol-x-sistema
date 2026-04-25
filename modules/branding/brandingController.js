const pool = require('../../config/database');
const path = require('path');
const fs = require('fs');

// Obter branding ativo
exports.obterBrandingAtivo = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM branding_settings WHERE ativo = true ORDER BY id DESC LIMIT 1'
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
  const { app_name, logo_url, logo_dark_url, primary_color, secondary_color, background_color, text_color, accent_color, splash_screen_url, hero_banner_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE branding_settings 
       SET app_name = $1, 
           logo_url = $2, 
           logo_dark_url = $3,
           primary_color = $4,
           secondary_color = $5,
           background_color = $6,
           text_color = $7,
           accent_color = $8,
           splash_screen_url = $9,
           hero_banner_url = $10,
           atualizado_em = NOW()
       WHERE id = $11`,
      [app_name, logo_url, logo_dark_url, primary_color, secondary_color, background_color, text_color, accent_color, splash_screen_url, hero_banner_url, id]
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
        primary_color: '#F63012',
        secondary_color: '#FF0000',
        background_color: '#000000',
        text_color: '#FFFFFF',
        accent_color: '#FFA500'
      },
      {
        id: 2,
        nome: 'Claro',
        descricao: 'Template com tema claro',
        primary_color: '#2196F3',
        secondary_color: '#1976D2',
        background_color: '#FFFFFF',
        text_color: '#000000',
        accent_color: '#FF9800'
      },
      {
        id: 3,
        nome: 'Azul Premium',
        descricao: 'Template premium com tons de azul',
        primary_color: '#00D4FF',
        secondary_color: '#0099CC',
        background_color: '#001F3F',
        text_color: '#FFFFFF',
        accent_color: '#00FFFF'
      }
    ];

    res.json(templates);
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({ error: 'Erro ao listar templates' });
  }
};

// Servir logos do projeto Android
exports.getAppLogo = async (req, res) => {
  const { type } = req.params;

  // Mapeamento de tipos para arquivos
  const logoMap = {
    'logo': 'logo_move.png',
    'logo_dark': 'logo_move.png', // Mesma logo para dark mode
    'ic_launcher': 'ic_launcher.png',
    'banner': 'ic_banner.png'
  };

  const filename = logoMap[type];
  
  if (!filename) {
    return res.status(400).json({ error: 'Tipo de logo inválido. Use: logo, logo_dark, ic_launcher, banner' });
  }

  try {
    // Caminho relativo do backend para o projeto Android
    // Backend: r:\Users\Usuario\Documents\painel\maxxcontrol-x-sistema
    // Android: r:\Users\Usuario\Documents\tv-maxx\TV-MAXX-PRO-Android
    const androidResPath = path.resolve(__dirname, '../../..', 'tv-maxx', 'TV-MAXX-PRO-Android', 'app', 'src', 'main', 'res', 'drawable', filename);

    // Verificar se o arquivo existe
    if (!fs.existsSync(androidResPath)) {
      return res.status(404).json({ error: 'Logo não encontrada no projeto Android' });
    }

    // Determinar content-type baseado na extensão
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp'
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Enviar arquivo
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
    
    const fileStream = fs.createReadStream(androidResPath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Erro ao ler arquivo:', error);
      res.status(500).json({ error: 'Erro ao ler arquivo de logo' });
    });
  } catch (error) {
    console.error('Erro ao servir logo:', error);
    res.status(500).json({ error: 'Erro ao servir logo do app' });
  }
};
// Criar novo branding
exports.criarBranding = async (req, res) => {
  const { app_name, logo_url, logo_dark_url, primary_color, secondary_color, background_color, text_color, accent_color, splash_screen_url, hero_banner_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO branding_settings 
       (app_name, logo_url, logo_dark_url, primary_color, secondary_color, background_color, text_color, accent_color, splash_screen_url, hero_banner_url, ativo, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, NOW())
       RETURNING id`,
      [app_name || 'Novo Tema', logo_url, logo_dark_url, primary_color, secondary_color, background_color, text_color, accent_color, splash_screen_url, hero_banner_url]
    );

    res.status(201).json({ 
      message: 'Novo tema criado com sucesso!', 
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Erro ao criar branding:', error);
    res.status(500).json({ error: 'Erro ao criar tema' });
  }
};

// Ativar um branding específico
exports.ativarBranding = async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Desativar todos
    await client.query('UPDATE branding_settings SET ativo = false');

    // Ativar o selecionado
    const result = await client.query(
      'UPDATE branding_settings SET ativo = true, atualizado_em = NOW() WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tema não encontrado' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Tema ativado com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao ativar branding:', error);
    res.status(500).json({ error: 'Erro ao ativar tema' });
  } finally {
    client.release();
  }
};

// Excluir um branding
exports.excluirBranding = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se é o ativo
    const check = await pool.query('SELECT ativo FROM branding_settings WHERE id = $1', [id]);
    
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Tema não encontrado' });
    }

    if (check.rows[0].ativo) {
      return res.status(400).json({ error: 'Não é possível excluir o tema que está ativo no momento.' });
    }

    await pool.query('DELETE FROM branding_settings WHERE id = $1', [id]);
    res.json({ message: 'Tema excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir branding:', error);
    res.status(500).json({ error: 'Erro ao excluir tema' });
  }
};
