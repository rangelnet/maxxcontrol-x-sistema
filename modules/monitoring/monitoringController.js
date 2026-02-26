const pool = require('../../config/database');

// Obter usuários online (últimos 5 minutos)
exports.getOnlineUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM devices 
       WHERE ultimo_acesso > NOW() - INTERVAL '5 minutes' 
       AND status = 'ativo'`
    );

    res.json({ online: result.rows[0].count });
  } catch (error) {
    console.error('Erro ao buscar usuários online:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários online' });
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [users, devices, bugs, logs] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE status = $1', ['ativo']),
      pool.query('SELECT COUNT(*) as count FROM devices WHERE status = $1', ['ativo']),
      pool.query('SELECT COUNT(*) as count FROM bugs WHERE resolvido = FALSE'),
      pool.query(`SELECT COUNT(*) as count FROM logs WHERE data > NOW() - INTERVAL '24 hours'`)
    ]);

    res.json({
      usuarios_ativos: users.rows[0].count,
      dispositivos_ativos: devices.rows[0].count,
      bugs_pendentes: bugs.rows[0].count,
      logs_24h: logs.rows[0].count
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
