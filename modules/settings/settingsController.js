const pool = require('../../config/database');
const { uploadToSupabase } = require('../../services/supabaseStorage');

exports.getSettings = async (req, res) => {
  try {
    // 1. Pegar configurações globais
    const globalResult = await pool.query('SELECT key, value FROM global_settings');
    const settings = {};
    globalResult.rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    });

    // 2. Pegar dados do perfil do usuário logado (usamos query dinâmica ou try/catch caso colunas não existam)
    let userResult;
    try {
      userResult = await pool.query(
        'SELECT nome as name, email, telefone as phone, telegram_username, tfa_enabled, telegram_chat_id FROM users WHERE id = $1',
        [req.userId]
      );
    } catch (columnError) {
      // Se der erro de coluna (ex: telefone não existe), faz fallback para query básica
      console.warn('Fallback na busca do usuário. Algumas colunas (ex: telefone) não existem na tabela users.');
      userResult = await pool.query(
        'SELECT nome as name, email FROM users WHERE id = $1',
        [req.userId]
      );
    }

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      Object.assign(settings, user);
    }

    res.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
};

const PUBLIC_SETTING_KEYS = new Set([
  'panel_url',
  'trial_hours',
  'player_app_url',
  'whatsapp',
  'support_whatsapp',
  'logo_url',
  'mp_public_key',
  'mp_receive_pix',
  'mp_receive_boleto',
  'mp_receive_credit',
  'mp_status_active',
  'paypal_status_active',
  'sports_cards'
]);

exports.getPublicSettings = async (req, res) => {
  try {
    const globalResult = await pool.query('SELECT key, value FROM global_settings');
    const settings = {};

    globalResult.rows.forEach(row => {
      if (!PUBLIC_SETTING_KEYS.has(row.key)) return;
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações públicas:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações públicas' });
  }
};

exports.updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  try {
    // Salva o valor diretamente (objetos são stringificados, strings ficam como strings JSON)
    const jsonValue = JSON.stringify(value);

    await pool.query(
      `INSERT INTO global_settings (key, value, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      [key, jsonValue]
    );

    res.json({ message: 'Configuração atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configuração global:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
};

exports.bulkUpdateSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // Process each key-value pair in the request body
    for (const [key, value] of Object.entries(settings)) {
      const jsonValue = JSON.stringify(value);
      
      await pool.query(
        `INSERT INTO global_settings (key, value, updated_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, jsonValue]
      );
    }
    
    res.json({ message: 'Configurações updated successfully' });
  } catch (error) {
    console.error('Erro ao atualizar configurações em lote:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const logoUrl = await uploadToSupabase(req.file, 'settings');
    const jsonValue = JSON.stringify(logoUrl);

    await pool.query(
      `INSERT INTO global_settings (key, value, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      ['logo_url', jsonValue]
    );

    res.json({ logo_url: logoUrl, message: 'Logo atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro no upload da logo:', error);
    res.status(500).json({ error: 'Erro ao processar upload da logo' });
  }
};


