const pool = require('../../config/database');

// Obter usuários online (últimos 5 minutos)
exports.getOnlineUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM devices 
       WHERE ultimo_acesso > NOW() - INTERVAL '5 minutes' 
       AND status = 'ativo'
       AND (modelo != 'Web Browser' OR modelo IS NULL)`
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
    let usersCount, devicesCount, bugsCount, logsCount, receitaMes = 0, crescimento = 0;

    try {
      const [mpTotalRes, revTotalRes, mpPastRes, revPastRes] = await Promise.all([
        pool.query(`SELECT SUM(amount) as total FROM mp_transactions WHERE status IN ('approved', 'pago', 'completed') AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)`),
        pool.query(`SELECT SUM(amount) as total FROM revenue_logs WHERE status IN ('approved', 'pago', 'completed') AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)`),
        pool.query(`SELECT SUM(amount) as total FROM mp_transactions WHERE status IN ('approved', 'pago', 'completed') AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')`),
        pool.query(`SELECT SUM(amount) as total FROM revenue_logs WHERE status IN ('approved', 'pago', 'completed') AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')`)
      ]);
      const mpTotal = parseFloat(mpTotalRes.rows[0].total) || 0;
      const revTotal = parseFloat(revTotalRes.rows[0].total) || 0;
      receitaMes = mpTotal + revTotal;

      const mpPast = parseFloat(mpPastRes.rows[0].total) || 0;
      const revPast = parseFloat(revPastRes.rows[0].total) || 0;
      const receitaMesPassado = mpPast + revPast;

      if (receitaMesPassado > 0) {
        crescimento = ((receitaMes - receitaMesPassado) / receitaMesPassado) * 100;
      } else if (receitaMes > 0) {
        crescimento = 100;
      }
    } catch (e) {
      console.error('Erro ao somar receita:', e);
    }

    if (req.userTipo === 'revendedor') {
      // Revendedor só vê estatísticas dos seus próprios dispositivos/clientes
      const [devices, bugs, logs] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM devices WHERE user_id = $1 AND status = $2 AND (modelo != $3 OR modelo IS NULL)', [req.userId, 'ativo', 'Web Browser']),
        pool.query('SELECT COUNT(*) as count FROM bugs WHERE user_id = $1 AND resolvido = FALSE', [req.userId]),
        pool.query(`SELECT COUNT(*) as count FROM logs WHERE user_id = $1 AND data > NOW() - INTERVAL '24 hours'`, [req.userId])
      ]);
      usersCount = 0; // Revendedor não vê total de usuários do sistema
      devicesCount = parseInt(devices.rows[0].count);
      bugsCount = parseInt(bugs.rows[0].count);
      logsCount = parseInt(logs.rows[0].count);
    } else {
      // Admin/Master vê tudo
      const [users, devices, bugs, logs] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM users WHERE status = $1', ['ativo']),
        pool.query('SELECT COUNT(*) as count FROM devices WHERE status = $1 AND (modelo != $2 OR modelo IS NULL)', ['ativo', 'Web Browser']),
        pool.query('SELECT COUNT(*) as count FROM bugs WHERE resolvido = FALSE'),
        pool.query(`SELECT COUNT(*) as count FROM logs WHERE data > NOW() - INTERVAL '24 hours'`)
      ]);
      usersCount = parseInt(users.rows[0].count);
      devicesCount = parseInt(devices.rows[0].count);
      bugsCount = parseInt(bugs.rows[0].count);
      logsCount = parseInt(logs.rows[0].count);
    }

    res.json({
      usuarios_ativos: usersCount,
      dispositivos_ativos: devicesCount,
      bugs_pendentes: bugsCount,
      logs_24h: logsCount,
      receita_mes: receitaMes,
      crescimento: crescimento
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
