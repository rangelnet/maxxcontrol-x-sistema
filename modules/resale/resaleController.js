const pool = require('../../config/database');
const bcrypt = require('bcryptjs');

// Listar todos os revendedores (apenas admin)
exports.listResellers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, nome, email, telefone, empresa, creditos, plano_revenda, preco_credito, 
        limite_dispositivos, status, tipo, criado_em,
        (SELECT COUNT(*) FROM devices WHERE revendedor_id = users.id) as dispositivos_ativos
       FROM users 
       WHERE tipo = 'revendedor'
       ORDER BY nome ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar revendedores:', error);
    res.status(500).json({ error: 'Erro ao listar revendedores' });
  }
};

// Criar revendedor (apenas admin)
exports.createReseller = async (req, res) => {
  try {
    const { nome, email, senha, telefone, empresa, limite_dispositivos, creditos } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO users (nome, email, senha_hash, telefone, empresa, limite_dispositivos, creditos, tipo, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'revendedor', 'ativo') 
       RETURNING id, nome, email, telefone, empresa, limite_dispositivos, creditos, tipo, status`,
      [nome, email, senhaHash, telefone || null, empresa || null, limite_dispositivos || 10, creditos || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar revendedor:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao criar revendedor' });
  }
};

// Atualizar revendedor (apenas admin)
exports.updateReseller = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, telefone, empresa, limite_dispositivos, creditos, status } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    let query, params;

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      query = `UPDATE users SET nome=$1, email=$2, senha_hash=$3, telefone=$4, empresa=$5, 
               limite_dispositivos=$6, creditos=$7, status=$8, updated_at=NOW()
               WHERE id=$9 AND tipo='revendedor' RETURNING id, nome, email, telefone, empresa, limite_dispositivos, creditos, status`;
      params = [nome, email, senhaHash, telefone || null, empresa || null, limite_dispositivos || 10, creditos || 0, status !== undefined ? (status ? 'ativo' : 'inativo') : 'ativo', id];
    } else {
      query = `UPDATE users SET nome=$1, email=$2, telefone=$3, empresa=$4, 
               limite_dispositivos=$5, creditos=$6, status=$7, updated_at=NOW()
               WHERE id=$8 AND tipo='revendedor' RETURNING id, nome, email, telefone, empresa, limite_dispositivos, creditos, status`;
      params = [nome, email, telefone || null, empresa || null, limite_dispositivos || 10, creditos || 0, status !== undefined ? (status ? 'ativo' : 'inativo') : 'ativo', id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Revendedor não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar revendedor:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao atualizar revendedor' });
  }
};

// Excluir revendedor (apenas admin)
exports.deleteReseller = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id=$1 AND tipo=$2 RETURNING id',
      [id, 'revendedor']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Revendedor não encontrado' });
    }

    res.json({ success: true, message: 'Revendedor excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir revendedor:', error);
    res.status(500).json({ error: 'Erro ao excluir revendedor' });
  }
};

// Toggle status ativo/inativo
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    const novoStatus = ativo ? 'ativo' : 'inativo';

    const result = await pool.query(
      `UPDATE users SET status=$1, updated_at=NOW() WHERE id=$2 AND tipo='revendedor' RETURNING id, status`,
      [novoStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Revendedor não encontrado' });
    }

    res.json({ success: true, status: novoStatus });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(500).json({ error: 'Erro ao alterar status' });
  }
};

// Enviar créditos para revendedor (apenas admin)
exports.sendCredits = async (req, res) => {
  try {
    const { revendedor_id, quantidade } = req.body;
    const adminId = req.user.id;

    if (!revendedor_id || !quantidade) {
      return res.status(400).json({ error: 'Revendedor e quantidade são obrigatórios' });
    }

    if (quantidade < 1) {
      return res.status(400).json({ error: 'Quantidade mínima é 1 crédito' });
    }

    const revendedorResult = await pool.query(
      'SELECT id, nome, creditos FROM users WHERE id=$1 AND tipo=$2',
      [revendedor_id, 'revendedor']
    );

    if (revendedorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Revendedor não encontrado' });
    }

    const revendedor = revendedorResult.rows[0];

    await pool.query(
      'UPDATE users SET creditos = creditos + $1 WHERE id=$2',
      [quantidade, revendedor_id]
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

// Obter estatísticas do dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      'SELECT creditos, plano_revenda, tipo FROM users WHERE id=$1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    res.json({
      creditos: user.tipo === 'admin' ? 'ilimitado' : user.creditos,
      plano: user.plano_revenda || 'admin'
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
