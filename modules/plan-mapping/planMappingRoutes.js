const express = require('express');
const router = express.Router();
const pool = require('../../config/database');

// Buscar todos os mapeamentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plan_mappings');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar mapeamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar ou atualizar um mapeamento
router.post('/', async (req, res) => {
  const { plan_id, config } = req.body;
  
  if (!plan_id) {
    return res.status(400).json({ error: 'plan_id é obrigatório' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO plan_mappings (plan_id, config, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (plan_id) 
       DO UPDATE SET config = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [plan_id, JSON.stringify(config)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar mapeamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
