const pool = require('../../config/database');
const axios = require('axios');
const crypto = require('crypto');

// Obter os tokens do MP a partir do global_settings
// Suporta tanto o formato antigo (key='mp') quanto o novo (key='mp_access_token')
// Obter os tokens do MP a partir do global_settings
// Suporta tanto o formato antigo (key='mp') quanto o novo (key='mp_access_token')
const getMpConfig = async () => {
  // Tenta buscar no formato novo primeiro
  const newResult = await pool.query("SELECT key, value FROM global_settings WHERE key IN ('mp_access_token', 'mp_public_key')");
  if (newResult.rows.length > 0) {
    const config = {};
    newResult.rows.forEach(row => {
      let val = row.value;
      if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch(e) {}
      }
      config[row.key] = val;
    });
    if (config.mp_access_token) {
      return { mpAccessToken: config.mp_access_token, mpPublicKey: config.mp_public_key || '' };
    }
  }

  // Fallback: formato antigo (objeto único na chave 'mp')
  const result = await pool.query("SELECT value FROM global_settings WHERE key = 'mp'");
  if (result.rows.length > 0 && result.rows[0].value) {
    const oldConfig = result.rows[0].value;
    // Se for string JSON, faz o parse
    let parsed = oldConfig;
    if (typeof oldConfig === 'string') {
        try { parsed = JSON.parse(oldConfig); } catch(e) {}
    }
    // Mapeia chaves antigas (accessToken/access_token) para o novo padrão
    return {
      mpAccessToken: parsed.mpAccessToken || parsed.accessToken || parsed.access_token || '',
      mpPublicKey: parsed.mpPublicKey || parsed.publicKey || parsed.public_key || ''
    };
  }
  return null;
};

// Validar Access Token do Mercado Pago chamando a API real
exports.validateToken = async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.json({ valid: false, status: 'missing', message: 'Token não informado.' });
  }

  try {
    // Chama a API de usuário do MP para verificar se o token é válido
    const response = await axios.get('https://api.mercadopago.com/users/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    const user = response.data;
    res.json({
      valid: true,
      status: 'active',
      seller: {
        id: user.id,
        nickname: user.nickname || user.first_name || 'Vendedor',
        email: user.email,
        site_id: user.site_id
      }
    });
  } catch (error) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return res.json({ valid: false, status: 'invalid', message: 'Token inválido ou expirado.' });
    }
    console.error('Erro ao validar token MP:', error.response?.data || error.message);
    res.json({ valid: false, status: 'error', message: 'Erro ao conectar com Mercado Pago.' });
  }
};

// Validar credenciais do PayPal (Client ID e Client Secret)
exports.validatePaypal = async (req, res) => {
  const { client_id, client_secret } = req.body;

  if (!client_id || !client_secret) {
    return res.json({ valid: false, message: 'Credenciais incompletas.' });
  }

  try {
    // Tenta obter um token de acesso do PayPal (OAuth2)
    const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    
    await axios.post('https://api-m.paypal.com/v1/oauth2/token', 'grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.json({ valid: true, status: 'active' });
  } catch (error) {
    console.error('Erro ao validar PayPal:', error.response?.data || error.message);
    res.json({ valid: false, status: 'invalid', message: 'Client ID ou Client Secret incorretos.' });
  }
};

exports.createPixPayment = async (req, res) => {
  const { package_id, credits, amount, mac_address, app_id } = req.body;
  const reseller_id = req.userId; // ID do usuário logado via middleware auth

  try {
    const config = await getMpConfig();
    if (!config || !config.mpAccessToken) {
      return res.status(400).json({ error: 'Mercado Pago não configurado no painel.' });
    }

    // Criar um idempotency key para a requisição do MP
    const idempotencyKey = crypto.randomUUID();
    const external_reference = `PKG_${package_id}_${Date.now()}`;

    // Payload de criação de PIX via API do Mercado Pago
    const paymentPayload = {
      transaction_amount: Number(amount),
      description: `Pacote de ${credits} Créditos - TV MAXX PRO`,
      payment_method_id: 'pix',
      external_reference: external_reference,
      payer: {
        email: req.userEmail || "payer@example.com"
      }
    };

    const response = await axios.post('https://api.mercadopago.com/v1/payments', paymentPayload, {
      headers: {
        'Authorization': `Bearer ${config.mpAccessToken}`,
        'X-Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json'
      }
    });

    const paymentData = response.data;
    
    const qr_code_base64 = paymentData.point_of_interaction?.transaction_data?.qr_code_base64;
    const qr_code = paymentData.point_of_interaction?.transaction_data?.qr_code;

    // Salva transação pendente no BD
    await pool.query(
      `INSERT INTO mp_transactions 
       (payment_id, reseller_id, package_id, credits, amount, status, type, qr_code_base64, qr_code, mac_address, app_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'pix', $7, $8, $9, $10)`,
      [paymentData.id, reseller_id, package_id || null, credits, amount, paymentData.status, qr_code_base64, qr_code, mac_address || null, app_id || null]
    );

    res.json({
      payment_id: paymentData.id,
      status: paymentData.status,
      qr_code: qr_code,
      qr_code_base64: qr_code_base64
    });

  } catch (error) {
    console.error('Erro ao gerar PIX:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Falha ao processar pagamento com Mercado Pago.' });
  }
};

exports.createCardPayment = async (req, res) => {
  const { 
    token, payment_method_id, installments, issuer_id, 
    package_id, credits, amount, email, mac_address, app_id 
  } = req.body;
  
  const reseller_id = req.userId;

  try {
    const config = await getMpConfig();
    if (!config || !config.mpAccessToken) {
      return res.status(400).json({ error: 'Mercado Pago não configurado.' });
    }

    const idempotencyKey = crypto.randomUUID();
    const external_reference = `CARD_PKG_${package_id}_${Date.now()}`;

    const paymentPayload = {
      transaction_amount: Number(amount),
      token: token,
      description: `Pacote de ${credits} Créditos - TV MAXX PRO`,
      installments: Number(installments),
      payment_method_id: payment_method_id,
      issuer_id: issuer_id,
      external_reference: external_reference,
      payer: {
        email: email || req.userEmail || "payer@example.com"
      }
    };

    const response = await axios.post('https://api.mercadopago.com/v1/payments', paymentPayload, {
      headers: {
        'Authorization': `Bearer ${config.mpAccessToken}`,
        'X-Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json'
      }
    });

    const paymentData = response.data;

    // Salva transação no BD
    await pool.query(
      `INSERT INTO mp_transactions 
       (payment_id, reseller_id, package_id, credits, amount, status, type, mac_address, app_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'card', $7, $8)`,
      [paymentData.id, reseller_id, package_id || null, credits, amount, paymentData.status, mac_address || null, app_id || null]
    );

    // Se aprovado na hora (comum em cartão), já atualiza os créditos
    if (paymentData.status === 'approved') {
       await pool.query("UPDATE users SET creditos = CASE WHEN tipo = 'admin' THEN creditos ELSE creditos + $1 END WHERE id = $2", [credits, reseller_id]);
    }

    res.json({
      payment_id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail
    });

  } catch (error) {
    console.error('Erro ao processar Cartão:', error.response ? error.response.data : error.message);
    const mpError = error.response?.data?.message || 'Erro ao processar cartão de crédito.';
    res.status(500).json({ error: mpError });
  }
};

exports.checkPaymentStatus = async (req, res) => {
  const { payment_id } = req.params;

  try {
    const config = await getMpConfig();
    if (!config || !config.mpAccessToken) {
      return res.status(400).json({ error: 'Mercado Pago não configurado.' });
    }

    const response = await axios.get(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${config.mpAccessToken}`
      }
    });

    const currentStatus = response.data.status;

    // Se o pagamento for aprovado, atualizar nossa base de dados
    if (currentStatus === 'approved') {
       // 1. Tenta atualizar transações de revendedores (créditos)
       const resultTx = await pool.query(
          "UPDATE mp_transactions SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE payment_id = $1 AND status != 'approved' RETURNING *",
          [payment_id]
       );
       
       if (resultTx.rows.length > 0) {
           const tx = resultTx.rows[0];
           await pool.query("UPDATE users SET creditos = CASE WHEN tipo = 'admin' THEN creditos ELSE creditos + $1 END WHERE id = $2", [tx.credits, tx.reseller_id]);
           console.log(`✅ Pagamento ${payment_id} aprovado (Revendedor).`);
       }

       // 2. Tenta atualizar transações de clientes finais (CRM)
       // Usamos o campo mac_address para guardar o payment_id do MP nessas rotas públicas
       const resultCrm = await pool.query(
         "UPDATE crm_clients SET status = 'aprovado' WHERE mac_address = $1 AND status != 'aprovado' RETURNING *",
         [payment_id]
       );

       if (resultCrm.rows.length > 0) {
         console.log(`✅ Pagamento ${payment_id} aprovado (Cliente Final CRM).`);
         // Aqui você pode adicionar lógica para liberar o MAC automaticamente no painel se desejar
       }
    }

    res.json({ status: currentStatus });

  } catch (error) {
     console.error('Erro ao checar status do pagamento:', error.response ? error.response.data : error.message);
     res.status(500).json({ error: 'Falha ao verificar pagamento.' });
  }
};

// Obter histórico de transações reais do usuário
exports.getPaymentHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.payment_id, t.credits, t.amount, t.status, t.type, t.mac_address,
              a.name as package_name,
              TO_CHAR(t.created_at, 'DD/MM/YYYY') as date,
              TO_CHAR(t.created_at, 'HH24:MI') as time
       FROM mp_transactions t
       LEFT JOIN app_activation_packages a ON t.app_id = a.id
       WHERE t.reseller_id = $1 
       ORDER BY t.created_at DESC 
       LIMIT 50`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico financeiro:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};

// --- ROTAS PÚBLICAS PARA O WEB PLAYER (CLIENTE FINAL) ---
exports.createPublicPixPayment = async (req, res) => {
  const { plan_id, plan_name, amount, client_name, client_email, client_phone } = req.body;

  try {
    const config = await getMpConfig();
    if (!config || !config.mpAccessToken) {
      return res.status(400).json({ error: 'Mercado Pago não configurado no painel.' });
    }

    const idempotencyKey = crypto.randomUUID();
    const external_reference = `PLAN_${plan_id}_${Date.now()}`;

    const paymentPayload = {
      transaction_amount: Number(amount),
      description: `Assinatura: ${plan_name}`,
      payment_method_id: 'pix',
      external_reference: external_reference,
      payer: {
        email: client_email || "cliente@tvmaxx.com",
        first_name: client_name || "Cliente"
      }
    };

    const response = await axios.post('https://api.mercadopago.com/v1/payments', paymentPayload, {
      headers: {
        'Authorization': `Bearer ${config.mpAccessToken}`,
        'X-Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json'
      }
    });

    const paymentData = response.data;
    const qr_code_base64 = paymentData.point_of_interaction?.transaction_data?.qr_code_base64;
    const qr_code = paymentData.point_of_interaction?.transaction_data?.qr_code;

    // Registrar no CRM para histórico e liberação
    await pool.query(
      `INSERT INTO crm_clients (client_name, whatsapp, plan_name, amount, payment_method, status, mac_address)
       VALUES ($1, $2, $3, $4, 'PIX', 'pendente', $5)`,
      [client_name, client_phone, plan_name, amount, paymentData.id] // Guardamos o paymentData.id no mac_address ou outro campo para check
    );

    res.json({
      payment_id: paymentData.id,
      status: paymentData.status,
      qr_code: qr_code,
      qr_code_base64: qr_code_base64
    });

  } catch (error) {
    // Log detalhado no servidor
    const errorDetail = error.response?.data || error.message || error;
    console.error('╔══════════════════════════════════════════╗');
    console.error('║  ERRO REAL - createPublicPixPayment     ║');
    console.error('╠══════════════════════════════════════════╣');
    console.error('║ Mensagem:', JSON.stringify(errorDetail));
    console.error('║ Status:', error.response?.status || 'N/A');
    console.error('║ Token config:', config?.mpAccessToken ? 'PRESENTE (='+config.mpAccessToken.length+' chars)' : 'VAZIO/NULO');
    console.error('║ Amount:', amount, '| Plan:', plan_id);
    console.error('╚══════════════════════════════════════════╝');
    
    // Retornar erro detalhado para o frontend (remover em produção)
    const errorMessage = errorDetail?.message || errorDetail?.error?.message || errorDetail?.status?.message || 'Falha ao processar pagamento';
    res.status(500).json({ 
      error: 'Falha ao processar pagamento.',
      debug: {
        mercadoPagoError: errorDetail,
        status: error.response?.status,
        hasToken: !!config?.mpAccessToken,
        tokenLength: config?.mpAccessToken?.length || 0
      }
    });
  }
};

exports.createPublicCardPayment = async (req, res) => {
  const { plan_id, plan_name, amount, client_name, client_email, client_phone, token, payment_method_id, installments, issuer_id } = req.body;

  try {
    const config = await getMpConfig();
    if (!config || !config.mpAccessToken) {
      return res.status(400).json({ error: 'Mercado Pago não configurado.' });
    }

    const idempotencyKey = crypto.randomUUID();
    const external_reference = `CARD_PLAN_${plan_id}_${Date.now()}`;

    const paymentPayload = {
      transaction_amount: Number(amount),
      token: token,
      description: `Assinatura: ${plan_name}`,
      installments: Number(installments) || 1,
      payment_method_id: payment_method_id,
      issuer_id: issuer_id,
      external_reference: external_reference,
      payer: {
        email: client_email || "cliente@tvmaxx.com",
        first_name: client_name || "Cliente"
      }
    };

    const response = await axios.post('https://api.mercadopago.com/v1/payments', paymentPayload, {
      headers: {
        'Authorization': `Bearer ${config.mpAccessToken}`,
        'X-Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json'
      }
    });

    const paymentData = response.data;

    // Registrar no CRM
    await pool.query(
      `INSERT INTO crm_clients (client_name, whatsapp, plan_name, amount, payment_method, status, mac_address)
       VALUES ($1, $2, $3, $4, 'Cartão de Crédito', $5, $6)`,
      [client_name, client_phone, plan_name, amount, paymentData.status === 'approved' ? 'aprovado' : 'pendente', paymentData.id]
    );

    res.json({
      payment_id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail
    });

  } catch (error) {
    console.error('Erro ao processar Cartão Publico:', error.response ? error.response.data : error.message);
    const mpError = error.response?.data?.message || 'Erro ao processar cartão de crédito.';
    res.status(500).json({ error: mpError });
  }
};
