const pool = require('../../config/database');
const bcrypt = require('bcryptjs');

// Listar todos os revendedores (apenas admin)
exports.listResellers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT \n        id, nome, email, telefone, empresa, creditos, plano_revenda, preco_credito, \n        limite_dispositivos, status, tipo, criado_em,\n        (SELECT COUNT(*) FROM devices WHERE revendedor_id = users.id AND (modelo != 'Web Browser' OR modelo IS NULL)) as dispositivos_ativos\n       FROM users \n       WHERE tipo = 'revendedor'\n       ORDER BY nome ASC`
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
    const welcome = require('../notifications/welcomeNotifier');
    const expires_at = await welcome.calculateExpiration();

    const result = await pool.query(
      `INSERT INTO users (nome, email, senha_hash, telefone, empresa, limite_dispositivos, creditos, tipo, status, expires_at) \n       VALUES ($1, $2, $3, $4, $5, $6, $7, 'revendedor', 'ativo', $8) \n       RETURNING id, nome, email, telefone, empresa, limite_dispositivos, creditos, tipo, status, expires_at`,
      [nome, email, senhaHash, telefone || null, empresa || null, limite_dispositivos || 10, creditos || 0, expires_at]
    );

    const newUser = result.rows[0];

    // Enviar Boas-vindas via WhatsApp
    if (newUser.telefone) {
        welcome.sendWelcomeCredentials(newUser, senha);
    }

    res.status(201).json(newUser);
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
      query = `UPDATE users SET nome=$1, email=$2, senha_hash=$3, telefone=$4, empresa=$5, \n               limite_dispositivos=$6, creditos=$7, status=$8, updated_at=NOW()\n               WHERE id=$9 AND tipo='revendedor' RETURNING id, nome, email, telefone, empresa, limite_dispositivos, creditos, status`;
      params = [nome, email, senhaHash, telefone || null, empresa || null, limite_dispositivos || 10, creditos || 0, status !== undefined ? (status ? 'ativo' : 'inativo') : 'ativo', id];
    } else {
      query = `UPDATE users SET nome=$1, email=$2, telefone=$3, empresa=$4, \n               limite_dispositivos=$5, creditos=$6, status=$7, updated_at=NOW()\n               WHERE id=$8 AND tipo='revendedor' RETURNING id, nome, email, telefone, empresa, limite_dispositivos, creditos, status`;
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

// Enviar créditos para revendedor (apenas admin/master com segurança Telegram)
exports.sendCredits = async (req, res) => {
  try {
    const { revendedor_id, quantidade, tfa_code } = req.body;
    const adminId = req.userId; // ID do admin/master logado

    if (!revendedor_id || !quantidade) {
      return res.status(400).json({ error: 'Revendedor e quantidade são obrigatórios' });
    }

    if (quantidade < 1) {
      return res.status(400).json({ error: 'Quantidade mínima é 1 crédito' });
    }

    // 1. Verificar se o Admin/Master tem 2FA ativo
    const adminResult = await pool.query(
      'SELECT email, tfa_enabled, telegram_chat_id, tfa_code FROM users WHERE id = $1',
      [adminId]
    );
    const admin = adminResult.rows[0];

    if (admin.tfa_enabled && admin.telegram_chat_id) {
      // Se não enviou o código ainda, gerar e enviar via Telegram
      if (!tfa_code) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await pool.query('UPDATE users SET tfa_code = $1 WHERE id = $2', [code, adminId]);
        
        const { send2FACode } = require('../telegram/telegramBot');
        await send2FACode(admin.telegram_chat_id, code, admin.email);
        
        return res.json({ 
          require2FA: true, 
          message: 'Confirme o código enviado ao seu Telegram para autorizar a transferência.' 
        });
      }

      // Se enviou o código, validar
      if (tfa_code !== admin.tfa_code) {
        return res.status(401).json({ error: 'Código de segurança inválido ou expirado.' });
      }

      // Limpar código após sucesso
      await pool.query('UPDATE users SET tfa_code = NULL WHERE id = $1', [adminId]);
    }

    // 2. Processar a transferência
    const revendedorResult = await pool.query(
      'SELECT id, nome, creditos FROM users WHERE id=$1 AND tipo=$2',
      [revendedor_id, 'revendedor']
    );

    if (revendedorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Revendedor não encontrado' });
    }

    const revendedor = revendedorResult.rows[0];

    // Iniciar Transação SQL para garantir integridade
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Adicionar créditos
      await client.query(
        'UPDATE users SET creditos = creditos + $1 WHERE id=$2',
        [quantidade, revendedor_id]
      );

      // Registrar no histórico financeiro (tipo manual)
      await client.query(
        `INSERT INTO mp_transactions (reseller_id, credits, amount, status, type)
         VALUES ($1, $2, $3, 'approved', 'manual')`,
        [revendedor_id, quantidade, 0] // Valor 0 para manual (ou poderia ser o custo unitário)
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ 
      success: true, 
      message: `${quantidade} créditos enviados com segurança para ${revendedor.nome}`,
      novo_saldo: revendedor.creditos + quantidade
    });
  } catch (error) {
    console.error('Erro ao enviar créditos:', error);
    res.status(500).json({ error: 'Erro ao processar transferência com segurança.' });
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