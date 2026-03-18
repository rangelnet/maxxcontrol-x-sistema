const pool = require('../../config/database');

// Obter estatísticas do dashboard do revendedor
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar dados do revendedor
    const userResult = await pool.query(
      'SELECT creditos, plano_revenda, tipo FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    // Se for admin, retornar créditos ilimitados
    if (user.tipo === 'admin') {
      return res.json({
        creditos: 'ilimitado',
        creditosUsados: 0,
        usuariosAtivos: 0,
        usuariosTotal: 0,
        plano: 'admin'
      });
    }

    // Créditos usados
    const usadosResult = await pool.query(
      `SELECT COALESCE(SUM(quantidade), 0) as total 
       FROM creditos_historico 
       WHERE revendedor_id = $1 AND tipo = 'usado'`,
      [userId]
    );

    // Usuários ativos criados por este revendedor
    const usuariosResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos
       FROM users 
       WHERE revendedor_id = $1`,
      [userId]
    );

    res.json({
      creditos: user.creditos,
      creditosUsados: parseInt(usadosResult.rows[0].total),
      usuariosAtivos: parseInt(usuariosResult.rows[0].ativos),
      usuariosTotal: parseInt(usuariosResult.rows[0].total),
      plano: user.plano_revenda
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};

// Listar todos os revendedores (apenas admin)
exports.listResellers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, nome, email, creditos, plano_revenda, preco_credito, status, criado_em
       FROM users 
       WHERE tipo = 'revendedor'
       ORDER BY nome ASC`
    );

    res.json({ revendedores: result.rows });
  } catch (error) {
    console.error('Erro ao listar revendedores:', error);
    res.status(500).json({ error: 'Erro ao listar revendedores' });
  }
};

// Enviar créditos para revendedor (apenas admin)
exports.sendCredits = async (req, res) => {
  try {
    const { revendedor_id, quantidade } = req.body;
    const adminId = req.user.id;

    // Validações
    if (!revendedor_id || !quantidade) {
      return res.status(400).json({ error: 'Revendedor e quantidade são obrigatórios' });
    }

    if (quantidade < 20) {
      return res.status(400).json({ error: 'Quantidade mínima é 20 créditos' });
    }

    // Verificar se o revendedor existe
    const revendedorResult = await pool.query(
      'SELECT id, nome, creditos FROM users WHERE id = $1 AND tipo = $2',
      [revendedor_id, 'revendedor']
    );

    if (revendedorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Revendedor não encontrado' });
    }

    const revendedor = revendedorResult.rows[0];

    // Atualizar créditos do revendedor
    await pool.query(
      'UPDATE users SET creditos = creditos + $1 WHERE id = $2',
      [quantidade, revendedor_id]
    );

    // Registrar transação
    await pool.query(
      'INSERT INTO creditos_transacoes (admin_id, revendedor_id, quantidade) VALUES ($1, $2, $3)',
      [adminId, revendedor_id, quantidade]
    );

    // Registrar no histórico
    await pool.query(
      `INSERT INTO creditos_historico (revendedor_id, quantidade, tipo, descricao) 
       VALUES ($1, $2, $3, $4)`,
      [revendedor_id, quantidade, 'recebido', `Créditos recebidos do administrador`]
    );

    // Registrar log
    await pool.query(
      `INSERT INTO revenda_logs (user_id, acao, detalhes) 
       VALUES ($1, $2, $3)`,
      [adminId, 'envio_creditos', JSON.stringify({ revendedor_id, quantidade, revendedor_nome: revendedor.nome })]
    );

    res.json({ 
      success: true, 
      message: `${quantidade} créditos enviados para ${revendedor.nome}`,
      novo_saldo: revendedor.creditos + quantidade
    });
  } catch (error) {
    console.error('Erro ao enviar créditos:', error);
    res.status(500).json({ error: 'Erro ao enviar créditos' });
  }
};

// Histórico de transações (admin vê todas, revendedor vê apenas as suas)
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo;

    let query;
    let params;

    if (userType === 'admin') {
      query = `
        SELECT 
          ct.id, ct.quantidade, ct.created_at,
          u.nome as revendedor_nome, u.email as revendedor_email
        FROM creditos_transacoes ct
        JOIN users u ON ct.revendedor_id = u.id
        ORDER BY ct.created_at DESC
        LIMIT 100
      `;
      params = [];
    } else {
      query = `
        SELECT 
          ct.id, ct.quantidade, ct.created_at,
          'Administrador' as admin_nome
        FROM creditos_transacoes ct
        WHERE ct.revendedor_id = $1
        ORDER BY ct.created_at DESC
        LIMIT 100
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);

    res.json({ transacoes: result.rows });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};

// Definir preço de crédito para revendedor (admin)
exports.setCreditPrice = async (req, res) => {
  try {
    const { revendedor_id, preco } = req.body;

    if (!revendedor_id || preco === undefined) {
      return res.status(400).json({ error: 'Revendedor e preço são obrigatórios' });
    }

    if (preco < 0) {
      return res.status(400).json({ error: 'Preço não pode ser negativo' });
    }

    await pool.query(
      'UPDATE users SET preco_credito = $1 WHERE id = $2 AND tipo = $3',
      [preco, revendedor_id, 'revendedor']
    );

    // Registrar log
    await pool.query(
      `INSERT INTO revenda_logs (user_id, acao, detalhes) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'definir_preco', JSON.stringify({ revendedor_id, preco })]
    );

    res.json({ success: true, message: 'Preço atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao definir preço:', error);
    res.status(500).json({ error: 'Erro ao definir preço' });
  }
};

// Alterar plano do revendedor (admin)
exports.changeResellerPlan = async (req, res) => {
  try {
    const { revendedor_id, plano } = req.body;

    if (!revendedor_id || !plano) {
      return res.status(400).json({ error: 'Revendedor e plano são obrigatórios' });
    }

    const planosValidos = ['bronze', 'prata', 'ouro'];
    if (!planosValidos.includes(plano)) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    await pool.query(
      'UPDATE users SET plano_revenda = $1 WHERE id = $2 AND tipo = $3',
      [plano, revendedor_id, 'revendedor']
    );

    // Registrar log
    await pool.query(
      `INSERT INTO revenda_logs (user_id, acao, detalhes) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'alterar_plano', JSON.stringify({ revendedor_id, plano })]
    );

    res.json({ success: true, message: 'Plano atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar plano:', error);
    res.status(500).json({ error: 'Erro ao alterar plano' });
  }
};

// Criar usuário usando créditos (revendedor)
exports.createUserWithCredits = async (req, res) => {
  try {
    const { nome, email, senha, plano, dias_validade } = req.body;
    const revendedorId = req.user.id;

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar créditos do revendedor
    const revendedorResult = await pool.query(
      'SELECT creditos FROM users WHERE id = $1',
      [revendedorId]
    );

    if (revendedorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Revendedor não encontrado' });
    }

    const creditosDisponiveis = revendedorResult.rows[0].creditos;

    if (creditosDisponiveis < 1) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }

    // Criar usuário
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash(senha, 10);

    const expiraEm = dias_validade 
      ? new Date(Date.now() + dias_validade * 24 * 60 * 60 * 1000)
      : null;

    const userResult = await pool.query(
      `INSERT INTO users (nome, email, senha_hash, plano, revendedor_id, expira_em, tipo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [nome, email, senhaHash, plano || 'free', revendedorId, expiraEm, 'usuario']
    );

    // Descontar crédito
    await pool.query(
      'UPDATE users SET creditos = creditos - 1 WHERE id = $1',
      [revendedorId]
    );

    // Registrar no histórico
    await pool.query(
      `INSERT INTO creditos_historico (revendedor_id, quantidade, tipo, descricao) 
       VALUES ($1, $2, $3, $4)`,
      [revendedorId, 1, 'usado', `Crédito usado para criar usuário: ${email}`]
    );

    // Registrar log
    await pool.query(
      `INSERT INTO revenda_logs (user_id, acao, detalhes) 
       VALUES ($1, $2, $3)`,
      [revendedorId, 'criar_usuario', JSON.stringify({ usuario_id: userResult.rows[0].id, email })]
    );

    res.json({ 
      success: true, 
      message: 'Usuário criado com sucesso',
      usuario_id: userResult.rows[0].id,
      creditos_restantes: creditosDisponiveis - 1
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// Verificar alertas de créditos baixos
exports.checkLowCredits = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM creditos_alertas 
       WHERE revendedor_id = $1 AND lido = false 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ alertas: result.rows });
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ error: 'Erro ao buscar alertas' });
  }
};

// Marcar alerta como lido
exports.markAlertAsRead = async (req, res) => {
  try {
    const { alerta_id } = req.body;

    await pool.query(
      'UPDATE creditos_alertas SET lido = true WHERE id = $1',
      [alerta_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar alerta:', error);
    res.status(500).json({ error: 'Erro ao marcar alerta' });
  }
};

// Obter lucro por revendedor (admin)
exports.getResellerProfit = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id, u.nome, u.email, u.preco_credito,
        COALESCE(SUM(CASE WHEN ch.tipo = 'usado' THEN ch.quantidade ELSE 0 END), 0) as creditos_usados,
        COALESCE(SUM(CASE WHEN ch.tipo = 'usado' THEN ch.quantidade ELSE 0 END), 0) * u.preco_credito as lucro_total
       FROM users u
       LEFT JOIN creditos_historico ch ON u.id = ch.revendedor_id
       WHERE u.tipo = 'revendedor'
       GROUP BY u.id, u.nome, u.email, u.preco_credito
       ORDER BY lucro_total DESC`
    );

    res.json({ revendedores: result.rows });
  } catch (error) {
    console.error('Erro ao calcular lucro:', error);
    res.status(500).json({ error: 'Erro ao calcular lucro' });
  }
};
