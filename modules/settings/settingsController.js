const pool = require('../../config/database');

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

    // 2. Pegar dados do perfil do usuário logado
    const userResult = await pool.query(
      'SELECT nome as name, email, telefone as phone, telegram_username, tfa_enabled, telegram_chat_id FROM users WHERE id = $1',
      [req.userId]
    );

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
    
    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações em lote:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};

