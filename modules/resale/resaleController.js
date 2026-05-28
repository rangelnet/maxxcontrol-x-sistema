const pool = require('../../config/database');
const bcrypt = require('bcryptjs');
const { logAction } = require('./logsHelper');

// Auto-Migração para garantir as colunas extras do Revendedor VIP
exports.migrateResale = async () => {
  try {
    await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS telefone VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS empresa VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS limite_dispositivos INTEGER DEFAULT 10;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_code VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS dns_url VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS test_api_urls JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_dashboard BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_dispositivos BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_revenda BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_jogos BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_banners BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_iptv BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_plugin BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_arvore BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_api BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_branding BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_galeria BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_whitelabel BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_versoes BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_config BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_tickets BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_device_resumo BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_device_assinatura BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_device_tv BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_device_apps BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_device_credenciais BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_device_futebol BOOLEAN DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_device_acoes BOOLEAN DEFAULT true;
    `);
    console.log('  ✅ Migração de campos de revenda OK');
  } catch (err) {
    console.error("Erro na migração de campos de revenda:", err);
  }
};


// Listar todos os revendedores (apenas admin)
exports.listResellers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, nome, email, telefone, empresa, creditos, plano_revenda, preco_credito, 
        limite_dispositivos, status, tipo, criado_em,
        provider_code, dns_url, test_api_urls,
        perm_dashboard, perm_dispositivos, perm_revenda, perm_jogos, perm_banners,
        perm_iptv, perm_plugin, perm_arvore, perm_api, perm_branding, perm_galeria,
        perm_whitelabel, perm_versoes, perm_config, perm_tickets,
        perm_device_resumo, perm_device_assinatura, perm_device_tv, perm_device_apps, perm_device_credenciais, perm_device_futebol, perm_device_acoes,
        (SELECT COUNT(*) FROM devices WHERE revendedor_id = users.id AND (modelo != 'Web Browser' OR modelo IS NULL)) as dispositivos_ativos
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
    const { nome, email, senha, telefone, empresa, limite_dispositivos, provider_code, dns_url, test_api_urls, plano_revenda,
            perm_dashboard, perm_dispositivos, perm_carteira, perm_revenda, perm_planos, perm_assinatura, perm_jogos, perm_banners, perm_chat, perm_agentes,
            perm_iptv, perm_plugin, perm_arvore, 
            perm_api, perm_branding, perm_galeria, perm_whitelabel, perm_whatsapp, perm_versoes, perm_config, perm_tickets,
            perm_dispositivos_lista, perm_dispositivos_logs,
            perm_revenda_lista, perm_revenda_shop, perm_revenda_apps, perm_revenda_logs,
            perm_planos_lista, perm_planos_crm, perm_planos_loja, perm_planos_apps, perm_planos_gateways,
            perm_banners_gen, perm_banners_themes,
            perm_api_config, perm_api_monitor,
            perm_iptv_global, perm_iptv_mapping, perm_iptv_servers,
            perm_whatsapp_bulk, perm_whatsapp_flow,
            perm_tickets_abertos, perm_tickets_fechados,
            perm_whitelabel_geral, perm_whitelabel_planos, perm_whitelabel_aparencia, perm_whitelabel_pagamento,
            perm_device_resumo, perm_device_assinatura, perm_device_tv, perm_device_apps, perm_device_credenciais, perm_device_futebol, perm_device_acoes
          } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const welcome = require('../notifications/welcomeNotifier');
    const expires_at = await welcome.calculateExpiration();

    const result = await pool.query(
      `INSERT INTO users (
        nome, email, senha_hash, tipo, telefone, empresa, limite_dispositivos, creditos, status, expires_at, provider_code, dns_url, test_api_urls, plano_revenda,
        perm_dashboard, perm_dispositivos, perm_carteira, perm_revenda, perm_planos, perm_assinatura, perm_jogos, perm_banners, perm_chat, perm_agentes,
        perm_iptv, perm_plugin, perm_arvore, 
        perm_api, perm_branding, perm_galeria, perm_whitelabel, perm_whatsapp, perm_versoes, perm_config, perm_tickets,
        perm_dispositivos_lista, perm_dispositivos_logs, perm_revenda_lista, perm_revenda_shop, perm_revenda_apps, perm_revenda_logs,
        perm_planos_lista, perm_planos_crm, perm_planos_loja, perm_planos_apps, perm_planos_gateways,
        perm_banners_gen, perm_banners_themes, perm_api_config, perm_api_monitor, perm_iptv_global, perm_iptv_mapping, perm_iptv_servers,
        perm_whatsapp_bulk, perm_whatsapp_flow, perm_tickets_abertos, perm_tickets_fechados,
        perm_whitelabel_geral, perm_whitelabel_planos, perm_whitelabel_aparencia, perm_whitelabel_pagamento,
        perm_device_resumo, perm_device_assinatura, perm_device_tv, perm_device_apps, perm_device_credenciais, perm_device_futebol, perm_device_acoes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35,
        $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61,
        $62, $63, $64, $65, $66, $67, $68
      ) RETURNING *`,
      [
        nome, email, senhaHash, 'revendedor', telefone || null, empresa || null, limite_dispositivos || 10, req.body.creditos || 0, 'ativo', expires_at, provider_code || null, dns_url || null, JSON.stringify(test_api_urls || []), plano_revenda || 'Revenda',
        perm_dashboard ?? true, perm_dispositivos ?? true, perm_carteira ?? false, perm_revenda ?? false, perm_planos ?? false, perm_assinatura ?? false, perm_jogos ?? false, perm_banners ?? false, perm_chat ?? false, perm_agentes ?? false,
        perm_iptv ?? true, perm_plugin ?? true, perm_arvore ?? false,
        perm_api ?? false, perm_branding ?? false, perm_galeria ?? false, perm_whitelabel ?? false, perm_whatsapp ?? false, perm_versoes ?? false, perm_config ?? false, perm_tickets ?? true,
        perm_dispositivos_lista ?? false, perm_dispositivos_logs ?? false, perm_revenda_lista ?? false, perm_revenda_shop ?? false, perm_revenda_apps ?? false, perm_revenda_logs ?? false,
        perm_planos_lista ?? false, perm_planos_crm ?? false, perm_planos_loja ?? false, perm_planos_apps ?? false, perm_planos_gateways ?? false,
        perm_banners_gen ?? false, perm_banners_themes ?? false, perm_api_config ?? false, perm_api_monitor ?? false, perm_iptv_global ?? false, perm_iptv_mapping ?? false, perm_iptv_servers ?? false,
        perm_whatsapp_bulk ?? false, perm_whatsapp_flow ?? false, perm_tickets_abertos ?? false, perm_tickets_fechados ?? false,
        perm_whitelabel_geral ?? false, perm_whitelabel_planos ?? false, perm_whitelabel_aparencia ?? false, perm_whitelabel_pagamento ?? false,
        perm_device_resumo ?? true, perm_device_assinatura ?? true, perm_device_tv ?? true, perm_device_apps ?? true, perm_device_credenciais ?? true, perm_device_futebol ?? true, perm_device_acoes ?? true
      ]
    );

    const newUser = result.rows[0];

    // Log the action
    await logAction(req.user?.id || 1, 'Revendedor Criado', `Criou o revendedor: ${nome} (${email})`, req.ip);

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
    const { nome, email, senha, telefone, empresa, limite_dispositivos, creditos, status, provider_code, dns_url, test_api_urls, plano_revenda,
            perm_dashboard, perm_dispositivos, perm_carteira, perm_revenda, perm_planos, perm_assinatura, perm_jogos, perm_banners, perm_chat, perm_agentes,
            perm_iptv, perm_plugin, perm_arvore, 
            perm_api, perm_branding, perm_galeria, perm_whitelabel, perm_whatsapp, perm_versoes, perm_config, perm_tickets,
            perm_dispositivos_lista, perm_dispositivos_logs,
            perm_revenda_lista, perm_revenda_shop, perm_revenda_apps, perm_revenda_logs,
            perm_planos_lista, perm_planos_crm, perm_planos_loja, perm_planos_apps, perm_planos_gateways,
            perm_banners_gen, perm_banners_themes,
            perm_api_config, perm_api_monitor,
            perm_iptv_global, perm_iptv_mapping, perm_iptv_servers,
            perm_whatsapp_bulk, perm_whatsapp_flow,
            perm_tickets_abertos, perm_tickets_fechados,
            perm_whitelabel_geral, perm_whitelabel_planos, perm_whitelabel_aparencia, perm_whitelabel_pagamento,
            perm_device_resumo, perm_device_assinatura, perm_device_tv, perm_device_apps, perm_device_credenciais, perm_device_futebol, perm_device_acoes
          } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    let query, params;

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      query = `UPDATE users SET nome=$1, email=$2, senha_hash=$3, telefone=$4, empresa=$5, 
               limite_dispositivos=$6, creditos=$7, status=$8, provider_code=$9, dns_url=$10, test_api_urls=$11::jsonb, plano_revenda=$12,
               perm_dashboard=$13, perm_dispositivos=$14, perm_carteira=$15, perm_revenda=$16, perm_planos=$17, perm_assinatura=$18, perm_jogos=$19, perm_banners=$20, perm_chat=$21, perm_agentes=$22, 
               perm_iptv=$23, perm_plugin=$24, perm_arvore=$25, 
               perm_api=$26, perm_branding=$27, perm_galeria=$28, perm_whitelabel=$29, perm_whatsapp=$30, perm_versoes=$31, perm_config=$32, perm_tickets=$33,
               perm_dispositivos_lista=$34, perm_dispositivos_logs=$35, perm_revenda_lista=$36, perm_revenda_shop=$37, perm_revenda_apps=$38, perm_revenda_logs=$39,
               perm_planos_lista=$40, perm_planos_crm=$41, perm_planos_loja=$42, perm_planos_apps=$43, perm_planos_gateways=$44,
               perm_banners_gen=$45, perm_banners_themes=$46, perm_api_config=$47, perm_api_monitor=$48, perm_iptv_global=$49, perm_iptv_mapping=$50, perm_iptv_servers=$51,
               perm_whatsapp_bulk=$52, perm_whatsapp_flow=$53, perm_tickets_abertos=$54, perm_tickets_fechados=$55,
               perm_whitelabel_geral=$56, perm_whitelabel_planos=$57, perm_whitelabel_aparencia=$58, perm_whitelabel_pagamento=$59,
               perm_device_resumo=$60, perm_device_assinatura=$61, perm_device_tv=$62, perm_device_apps=$63, perm_device_credenciais=$64, perm_device_futebol=$65, perm_device_acoes=$66,
               updated_at=NOW()
               WHERE id=$67 AND tipo='revendedor' RETURNING *`;
      params = [
        nome, email, senhaHash, telefone || null, empresa || null, limite_dispositivos || 10, creditos || 0, status !== undefined ? (status ? 'ativo' : 'inativo') : 'ativo', provider_code || null, dns_url || null, JSON.stringify(test_api_urls || []), plano_revenda || 'Revenda',
        perm_dashboard ?? true, perm_dispositivos ?? true, perm_carteira ?? false, perm_revenda ?? false, perm_planos ?? false, perm_assinatura ?? false, perm_jogos ?? false, perm_banners ?? false, perm_chat ?? false, perm_agentes ?? false,
        perm_iptv ?? true, perm_plugin ?? true, perm_arvore ?? false, 
        perm_api ?? false, perm_branding ?? false, perm_galeria ?? false, perm_whitelabel ?? false, perm_whatsapp ?? false, perm_versoes ?? false, perm_config ?? false, perm_tickets ?? true,
        perm_dispositivos_lista ?? false, perm_dispositivos_logs ?? false, perm_revenda_lista ?? false, perm_revenda_shop ?? false, perm_revenda_apps ?? false, perm_revenda_logs ?? false,
        perm_planos_lista ?? false, perm_planos_crm ?? false, perm_planos_loja ?? false, perm_planos_apps ?? false, perm_planos_gateways ?? false,
        perm_banners_gen ?? false, perm_banners_themes ?? false, perm_api_config ?? false, perm_api_monitor ?? false, perm_iptv_global ?? false, perm_iptv_mapping ?? false, perm_iptv_servers ?? false,
        perm_whatsapp_bulk ?? false, perm_whatsapp_flow ?? false, perm_tickets_abertos ?? false, perm_tickets_fechados ?? false,
        perm_whitelabel_geral ?? false, perm_whitelabel_planos ?? false, perm_whitelabel_aparencia ?? false, perm_whitelabel_pagamento ?? false, 
        perm_device_resumo ?? false, perm_device_assinatura ?? false, perm_device_tv ?? false, perm_device_apps ?? false, perm_device_credenciais ?? false, perm_device_futebol ?? false, perm_device_acoes ?? false,
        id
      ];
    } else {
      query = `UPDATE users SET nome=$1, email=$2, telefone=$3, empresa=$4, 
               limite_dispositivos=$5, creditos=$6, status=$7, provider_code=$8, dns_url=$9, test_api_urls=$10::jsonb, plano_revenda=$11,
               perm_dashboard=$12, perm_dispositivos=$13, perm_carteira=$14, perm_revenda=$15, perm_planos=$16, perm_assinatura=$17, perm_jogos=$18, perm_banners=$19, perm_chat=$20, perm_agentes=$21,
               perm_iptv=$22, perm_plugin=$23, perm_arvore=$24, 
               perm_api=$25, perm_branding=$26, perm_galeria=$27, perm_whitelabel=$28, perm_whatsapp=$29, perm_versoes=$30, perm_config=$31, perm_tickets=$32,
               perm_dispositivos_lista=$33, perm_dispositivos_logs=$34, perm_revenda_lista=$35, perm_revenda_shop=$36, perm_revenda_apps=$37, perm_revenda_logs=$38,
               perm_planos_lista=$39, perm_planos_crm=$40, perm_planos_loja=$41, perm_planos_apps=$42, perm_planos_gateways=$43,
               perm_banners_gen=$44, perm_banners_themes=$45, perm_api_config=$46, perm_api_monitor=$47, perm_iptv_global=$48, perm_iptv_mapping=$49, perm_iptv_servers=$50,
               perm_whatsapp_bulk=$51, perm_whatsapp_flow=$52, perm_tickets_abertos=$53, perm_tickets_fechados=$54,
               perm_whitelabel_geral=$55, perm_whitelabel_planos=$56, perm_whitelabel_aparencia=$57, perm_whitelabel_pagamento=$58,
               perm_device_resumo=$59, perm_device_assinatura=$60, perm_device_tv=$61, perm_device_apps=$62, perm_device_credenciais=$63, perm_device_futebol=$64, perm_device_acoes=$65,
               updated_at=NOW()
               WHERE id=$66 AND tipo='revendedor' RETURNING *`;
      params = [
        nome, email, telefone || null, empresa || null, limite_dispositivos || 10, creditos || 0, status !== undefined ? (status ? 'ativo' : 'inativo') : 'ativo', provider_code || null, dns_url || null, JSON.stringify(test_api_urls || []), plano_revenda || 'Revenda',
        perm_dashboard ?? true, perm_dispositivos ?? true, perm_carteira ?? false, perm_revenda ?? false, perm_planos ?? false, perm_assinatura ?? false, perm_jogos ?? false, perm_banners ?? false, perm_chat ?? false, perm_agentes ?? false,
        perm_iptv ?? true, perm_plugin ?? true, perm_arvore ?? false, 
        perm_api ?? false, perm_branding ?? false, perm_galeria ?? false, perm_whitelabel ?? false, perm_whatsapp ?? false, perm_versoes ?? false, perm_config ?? false, perm_tickets ?? true,
        perm_dispositivos_lista ?? false, perm_dispositivos_logs ?? false, perm_revenda_lista ?? false, perm_revenda_shop ?? false, perm_revenda_apps ?? false, perm_revenda_logs ?? false,
        perm_planos_lista ?? false, perm_planos_crm ?? false, perm_planos_loja ?? false, perm_planos_apps ?? false, perm_planos_gateways ?? false,
        perm_banners_gen ?? false, perm_banners_themes ?? false, perm_api_config ?? false, perm_api_monitor ?? false, perm_iptv_global ?? false, perm_iptv_mapping ?? false, perm_iptv_servers ?? false,
        perm_whatsapp_bulk ?? false, perm_whatsapp_flow ?? false, perm_tickets_abertos ?? false, perm_tickets_fechados ?? false,
        perm_whitelabel_geral ?? false, perm_whitelabel_planos ?? false, perm_whitelabel_aparencia ?? false, perm_whitelabel_pagamento ?? false, 
        perm_device_resumo ?? false, perm_device_assinatura ?? false, perm_device_tv ?? false, perm_device_apps ?? false, perm_device_credenciais ?? false, perm_device_futebol ?? false, perm_device_acoes ?? false,
        id
      ];
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
      
      // Log the action
      await logAction(adminId, 'Créditos Enviados', `Enviou ${quantidade} créditos para o revendedor ${revendedor.nome} (ID: ${revendedor_id})`, req.ip);

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

// Obter logs de auditoria
exports.getLogs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar se o usuário é Master ou tem permissão ilimitada
    const userResult = await pool.query('SELECT tipo, plano_revenda FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    const user = userResult.rows[0];
    const isMaster = user.tipo === 'admin';
    const isUnlimited = user.plano_revenda && user.plano_revenda.toLowerCase().includes('ilimitado');

    if (!isMaster && !isUnlimited) {
      return res.status(403).json({ error: 'Você não tem permissão para visualizar o log de auditoria.' });
    }

    // Retorna todos os logs ordenados por data descrescente, com nome do usuário
    const logsResult = await pool.query(`
      SELECT l.*, u.nome as user_name 
      FROM audit_logs l 
      LEFT JOIN users u ON l.user_id = u.id 
      ORDER BY l.created_at DESC 
      LIMIT 100
    `);

    res.json({ logs: logsResult.rows });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
  }
};