const pool = require('../../config/database');

// Reportar bug
exports.reportBug = async (req, res) => {
  const { 
    stack_trace, 
    modelo, 
    app_version, 
    device_id,
    severity = 'error',
    type = 'crash',
    context = {}
  } = req.body;
  const userId = req.userId;

  try {
    // Validate severity
    const validSeverities = ['critical', 'error', 'warning'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ 
        error: 'Invalid severity', 
        message: `Severity must be one of: ${validSeverities.join(', ')}` 
      });
    }
    
    // Validate type
    const validTypes = ['crash', 'navigation', 'player', 'api', 'ui', 'network'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type', 
        message: `Type must be one of: ${validTypes.join(', ')}` 
      });
    }
    
    // Truncate stack trace if too large (max 10KB)
    const maxStackTraceSize = 10 * 1024;
    let truncatedStackTrace = stack_trace;
    if (stack_trace && stack_trace.length > maxStackTraceSize) {
      truncatedStackTrace = stack_trace.substring(0, maxStackTraceSize) + '\n... [truncated]';
    }
    
    const result = await pool.query(
      `INSERT INTO bugs 
       (user_id, device_id, stack_trace, modelo, app_version, severity, type, context) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [userId, device_id, truncatedStackTrace, modelo, app_version, severity, type, JSON.stringify(context)]
    );

    res.status(201).json({ bug: result.rows[0], message: 'Bug reportado' });
  } catch (error) {
    console.error('Erro ao reportar bug:', error);
    res.status(500).json({ error: 'Erro ao reportar bug' });
  }
};

// Listar bugs
exports.getBugs = async (req, res) => {
  const { resolvido, severity, type } = req.query;

  try {
    let query = 'SELECT b.*, u.nome, u.email FROM bugs b JOIN users u ON b.user_id = u.id WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (resolvido !== undefined) {
      query += ' AND b.resolvido = $' + paramIndex;
      params.push(resolvido === 'true');
      paramIndex++;
    }
    
    if (severity) {
      query += ' AND b.severity = $' + paramIndex;
      params.push(severity);
      paramIndex++;
    }
    
    if (type) {
      query += ' AND b.type = $' + paramIndex;
      params.push(type);
      paramIndex++;
    }

    query += ' ORDER BY b.data DESC';

    const result = await pool.query(query, params);
    res.json({ bugs: result.rows });
  } catch (error) {
    console.error('Erro ao buscar bugs:', error);
    res.status(500).json({ error: 'Erro ao buscar bugs' });
  }
};

// Marcar bug como resolvido
exports.resolveBug = async (req, res) => {
  const { bug_id } = req.body;

  try {
    await pool.query('UPDATE bugs SET resolvido = TRUE WHERE id = $1', [bug_id]);
    res.json({ message: 'Bug marcado como resolvido' });
  } catch (error) {
    console.error('Erro ao resolver bug:', error);
    res.status(500).json({ error: 'Erro ao resolver bug' });
  }
};
