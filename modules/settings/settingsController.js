const pool = require('../../config/database');

exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM global_settings');
    const settings = {};
    result.rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações globais:', error);
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
