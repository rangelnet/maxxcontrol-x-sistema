const pool = require('../../config/database');
const axios = require('axios');
const crypto = require('crypto');

const maskEmail = (email = '') => {
  const [name, domain] = String(email).split('@');
  if (!name || !domain) return email ? '***' : '';
  return `${name.slice(0, 2)}***@${domain}`;
};

const sanitizeMercadoPagoError = (errorDetail) => {
  if (!errorDetail || typeof errorDetail !== 'object') return errorDetail;
  return {
    message: errorDetail.message,
    error: errorDetail.error,
    status: errorDetail.status,
    status_detail: errorDetail.status_detail,
    cause: errorDetail.cause,
  };
};

let publicPaymentColumnsReady = false;
const ensurePublicPaymentColumns = async () => {
  if (publicPaymentColumnsReady) return;
  await pool.query(`ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS mp_payment_id VARCHAR(255)`);
  await pool.query(`ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS client_email VARCHAR(255)`);
  await pool.query(`ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_user_id VARCHAR(255)`);
  await pool.query(`ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_user_status VARCHAR(50)`);
  await pool.query(`ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_mac_address VARCHAR(50)`);
  await pool.query(`ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_username VARCHAR(255)`);
  await pool.query(`ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_password VARCHAR(255)`);
  publicPaymentColumnsReady = true;
};

let checkoutCustomerColumnsReady = false;
const ensureCheckoutCustomerColumns = async () => {
  if (checkoutCustomerColumnsReady) return;

  const statements = [
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS nome VARCHAR(255)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS email VARCHAR(255)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS telefone VARCHAR(50)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS notas TEXT`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS package_name VARCHAR(255)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS max_connections INTEGER`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS finance_plan_id INTEGER`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS finance_plan_name VARCHAR(255)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS finance_plan_price NUMERIC(10,2)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS plan_duration_days INTEGER`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS panel_url TEXT`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS server_name VARCHAR(255)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS app_user_id VARCHAR(255)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS app_user_status VARCHAR(50)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS last_payment_id VARCHAR(255)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS last_payment_amount NUMERIC(10,2)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS last_payment_method VARCHAR(50)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS last_payment_status VARCHAR(50)`,
    `ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP`
  ];

  for (const statement of statements) {
    await pool.query(statement);
  }

  checkoutCustomerColumnsReady = true;
};

const normalizeMacKey = (value = '') => String(value || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
const normalizePhoneKey = (value = '') => String(value || '').replace(/\D/g, '');
const formatExpireDateBR = (days = 0) => {
  const totalDays = Number(days) || 0;
  const expireDate = new Date();
  if (totalDays > 0) {
    expireDate.setDate(expireDate.getDate() + totalDays);
  }
  return expireDate.toLocaleDateString('pt-BR');
};
const toNullableNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const getFinancePlanById = async (planId) => {
  if (planId === undefined || planId === null || planId === '') return null;
  const result = await pool.query(
    `SELECT id, name, price, duration_days, max_connections, qpanel_id, sigma_package, is_active
       FROM finance_plans
      WHERE id = $1
      LIMIT 1`,
    [planId]
  );
  return result.rows[0] || null;
};

const getPrimaryQpanelPanel = async (preferredPanelId) => {
  if (preferredPanelId) {
    const preferred = await pool.query(
      'SELECT id, panel_name, panel_url, status FROM qpanel_panels WHERE id = $1 LIMIT 1',
      [preferredPanelId]
    );
    if (preferred.rows[0]) return preferred.rows[0];
  }

  const fallback = await pool.query(
    `SELECT id, panel_name, panel_url, status
       FROM qpanel_panels
      ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END, updated_at DESC, id ASC
      LIMIT 1`
  );
  return fallback.rows[0] || null;
};

const findCheckoutAccount = async ({ appUsername, appMacAddress, clientEmail, clientPhone, appUserId }) => {
  if (appUsername) {
    const result = await pool.query(
      'SELECT * FROM qpanel_accounts WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [String(appUsername).trim()]
    );
    if (result.rows[0]) return result.rows[0];
  }

  const normalizedMac = normalizeMacKey(appMacAddress);
  if (normalizedMac) {
    const result = await pool.query(
      `SELECT *
         FROM qpanel_accounts
        WHERE UPPER(REGEXP_REPLACE(device_mac, '[^a-zA-Z0-9]', '', 'g')) = $1
        LIMIT 1`,
      [normalizedMac]
    );
    if (result.rows[0]) return result.rows[0];
  }

  if (clientEmail) {
    const result = await pool.query(
      'SELECT * FROM qpanel_accounts WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [String(clientEmail).trim()]
    );
    if (result.rows[0]) return result.rows[0];
  }

  const normalizedPhone = normalizePhoneKey(clientPhone);
  if (normalizedPhone) {
    const result = await pool.query(
      `SELECT *
         FROM qpanel_accounts
        WHERE REGEXP_REPLACE(COALESCE(telefone, ''), '[^0-9]', '', 'g') = $1
        LIMIT 1`,
      [normalizedPhone]
    );
    if (result.rows[0]) return result.rows[0];
  }

  if (appUserId) {
    const result = await pool.query(
      'SELECT * FROM qpanel_accounts WHERE app_user_id = $1 LIMIT 1',
      [String(appUserId).trim()]
    );
    if (result.rows[0]) return result.rows[0];
  }

  return null;
};

const syncCheckoutCustomer = async (payload) => {
  await ensureCheckoutCustomerColumns();

  const plan = await getFinancePlanById(payload.plan_id);
  const planId = plan?.id ?? toNullableNumber(payload.plan_id);
  const planName = plan?.name || payload.plan_name || 'Plano';
  const planPrice = Number(plan?.price ?? payload.amount ?? 0) || 0;
  const durationDays = Number(plan?.duration_days ?? payload.plan_duration_days ?? 0) || 0;
  const maxConnections = Number(plan?.max_connections ?? payload.max_connections ?? 1) || 1;
  const packageName = plan?.sigma_package || planName;
  const panel = await getPrimaryQpanelPanel(plan?.qpanel_id);
  const accountStatus = String(payload.payment_status || '').toLowerCase() === 'approved' ? 'active' : 'pending';
  const expireDate = formatExpireDateBR(durationDays);

  let existing = await findCheckoutAccount({
    appUsername: payload.app_username,
    appMacAddress: payload.app_mac_address,
    clientEmail: payload.client_email,
    clientPhone: payload.client_phone,
    appUserId: payload.user_id
  });

  const basePanelId = existing?.panel_id || panel?.id || plan?.qpanel_id || null;
  if (!basePanelId) {
    console.warn('[CHECKOUT SYNC] Nenhum painel qPanel ativo encontrado para vincular o cliente.');
    return { skipped: true, reason: 'no_qpanel' };
  }

  const baseServerId = existing?.server_id || 1;
  const basePackageId = existing?.package_id || 0;
  const baseUsername = String(payload.app_username || existing?.username || payload.user_id || payload.client_email || '').trim();
  const basePassword = String(payload.app_password || existing?.password || '123456').trim();
  const baseDeviceMac = String(payload.app_mac_address || existing?.device_mac || '').trim();
  const baseName = payload.client_name || existing?.nome || null;
  const baseEmail = payload.client_email || existing?.email || null;
  const basePhone = payload.client_phone || existing?.telefone || null;
  const baseNotes = existing?.notas || null;
  const basePackageName = packageName || existing?.package_name || null;
  const baseMaxConnections = maxConnections || existing?.max_connections || 1;
  const basePanelUrl = panel?.panel_url || existing?.panel_url || null;
  const baseServerName = panel?.panel_name || existing?.server_name || basePackageName || null;
  const baseAppUserId = payload.user_id || existing?.app_user_id || null;
  const baseAppUserStatus = payload.user_status || existing?.app_user_status || null;
  const basePaymentId = payload.payment_id || existing?.last_payment_id || null;
  const basePaymentMethod = payload.payment_method || existing?.last_payment_method || 'PIX';
  const basePaymentStatus = payload.payment_status || existing?.last_payment_status || 'pending';

  if (!existing && !baseDeviceMac) {
    console.warn('[CHECKOUT SYNC] Checkout sem MAC e sem cadastro existente. Sincronização de Central ignorada.');
    return { skipped: true, reason: 'missing_mac' };
  }

  if (existing) {
    const result = await pool.query(
      `UPDATE qpanel_accounts
          SET panel_id = COALESCE($1, panel_id),
              server_id = COALESCE($2, server_id),
              package_id = COALESCE($3, package_id),
              username = COALESCE(NULLIF($4, ''), username),
              password = COALESCE(NULLIF($5, ''), password),
              device_mac = COALESCE(NULLIF($6, ''), device_mac),
              m3u_url = COALESCE(m3u_url, NULL),
              status = $7,
              expire_date = $8,
              nome = COALESCE(NULLIF($9, ''), nome),
              email = COALESCE(NULLIF($10, ''), email),
              telefone = COALESCE(NULLIF($11, ''), telefone),
              notas = COALESCE(NULLIF($12, ''), notas),
              package_name = COALESCE(NULLIF($13, ''), package_name),
              max_connections = COALESCE($14, max_connections),
              finance_plan_id = $15,
              finance_plan_name = $16,
              finance_plan_price = $17,
              plan_duration_days = $18,
              panel_url = COALESCE(NULLIF($19, ''), panel_url),
              server_name = COALESCE(NULLIF($20, ''), server_name),
              app_user_id = COALESCE(NULLIF($21, ''), app_user_id),
              app_user_status = COALESCE(NULLIF($22, ''), app_user_status),
              last_payment_id = COALESCE(NULLIF($23, ''), last_payment_id),
              last_payment_amount = $24,
              last_payment_method = $25,
              last_payment_status = $26,
              last_payment_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
        WHERE id = $27
        RETURNING *`,
      [
        basePanelId,
        baseServerId,
        basePackageId,
        baseUsername,
        basePassword,
        baseDeviceMac,
        accountStatus,
        expireDate,
        baseName,
        baseEmail,
        basePhone,
        baseNotes,
        basePackageName,
        baseMaxConnections,
        planId,
        planName,
        planPrice,
        durationDays || null,
        basePanelUrl,
        baseServerName,
        baseAppUserId,
        baseAppUserStatus,
        basePaymentId,
        planPrice,
        basePaymentMethod,
        basePaymentStatus,
        existing.id
      ]
    );
    return { account: result.rows[0], plan, panel, existed: true };
  }

  const result = await pool.query(
    `INSERT INTO qpanel_accounts (
      panel_id, server_id, package_id, username, password, device_mac, m3u_url, status,
      expire_date, nome, email, telefone, notas, package_name, max_connections,
      finance_plan_id, finance_plan_name, finance_plan_price, plan_duration_days,
      panel_url, server_name, app_user_id, app_user_status, last_payment_id,
      last_payment_amount, last_payment_method, last_payment_status, last_payment_at, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, NULL, $7,
      $8, $9, $10, $11, $12, $13, $14,
      $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, CURRENT_TIMESTAMP, NOW(), NOW()
    ) RETURNING *`,
    [
      basePanelId,
      baseServerId,
      basePackageId,
      baseUsername || `checkout_${Date.now()}`,
      basePassword,
      baseDeviceMac,
      accountStatus,
      expireDate,
      baseName,
      baseEmail,
      basePhone,
      baseNotes,
      basePackageName,
      baseMaxConnections,
      planId,
      planName,
      planPrice,
      durationDays || null,
      basePanelUrl,
      baseServerName,
      baseAppUserId,
      baseAppUserStatus,
      basePaymentId,
      planPrice,
      basePaymentMethod,
      basePaymentStatus
    ]
  );

  return { account: result.rows[0], plan, panel, existed: false };
};

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
       try {
         const resultCrm = await pool.query(
           "UPDATE crm_clients SET status = 'aprovado' WHERE mac_address = $1 AND status != 'aprovado' RETURNING *",
           [payment_id]
         );

         if (resultCrm.rows.length > 0) {
           console.log(`✅ Pagamento ${payment_id} aprovado (Cliente Final CRM).`);
           // Aqui você pode adicionar lógica para liberar o MAC automaticamente no painel se desejar
         }
       } catch (crmError) {
         console.warn(`ℹ️ Pagamento ${payment_id}: atualização de crm_clients ignorada`, crmError.message);
       }

         try {
           await ensurePublicPaymentColumns();
           const resultRevenue = await pool.query(
             "UPDATE revenue_logs SET status = 'pago' WHERE mp_payment_id = $1 AND status != 'pago' RETURNING *",
             [payment_id]
           );
           if (resultRevenue.rows.length > 0) {
             console.log(`✅ Pagamento ${payment_id} aprovado (Cliente Final Revenue).`);
             try {
               const row = resultRevenue.rows[0];
               await syncCheckoutCustomer({
                 plan_id: row.plan_id,
                 amount: row.amount,
                 client_name: row.client_name,
                 client_email: row.client_email,
                 client_phone: row.whatsapp,
                 user_id: row.app_user_id,
                 user_status: row.app_user_status,
                 app_mac_address: row.app_mac_address,
                 app_username: row.app_username,
                 app_password: row.app_password,
                 payment_id: row.mp_payment_id || payment_id,
                 payment_status: currentStatus,
                 payment_method: row.payment_method || 'PIX'
               });
               console.log(`🔄 Pagamento ${payment_id}: Central de Gerenciamento sincronizada como aprovado.`);
             } catch (syncError) {
               console.warn(`ℹ️ Pagamento ${payment_id}: sincronização da Central ignorada`, syncError.message);
             }
           }
         } catch (revenueError) {
          console.warn('Aviso ao atualizar revenue_logs do pagamento público:', revenueError.message);
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
    const { plan_id, plan_name, plan_duration_days, amount, client_name, client_email, client_phone, user_id, user_status, app_mac_address, app_username, app_password } = req.body;
  const requestId = crypto.randomUUID();
  let config = null;
  let paymentPayload = null;

  try {
    console.log(`[PIX PUBLIC ${requestId}] Iniciando pagamento`, {
      plan_id,
      plan_name,
      amount,
      client_name,
      client_email: maskEmail(client_email),
      has_phone: !!client_phone,
      user_id,
      user_status,
      app_mac_address,
    });

    config = await getMpConfig();
    console.log(`[PIX PUBLIC ${requestId}] Gateway Mercado Pago`, {
      found: !!config,
      hasToken: !!config?.mpAccessToken,
      tokenLength: config?.mpAccessToken?.length || 0,
      hasPublicKey: !!config?.mpPublicKey,
    });

    if (!config || !config.mpAccessToken) {
      return res.status(400).json({ error: 'Mercado Pago não configurado no painel.' });
    }

    if (!plan_id || !amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Dados do plano inválidos para gerar PIX.' });
    }

    const idempotencyKey = crypto.randomUUID();
    const external_reference = `PLAN_${plan_id}_${Date.now()}`;

    paymentPayload = {
      transaction_amount: Number(amount),
      description: `Assinatura: ${plan_name}`,
      payment_method_id: 'pix',
      external_reference: external_reference,
      payer: {
        email: client_email || "cliente@tvmaxx.com",
        first_name: client_name || "Cliente"
      }
    };

    console.log(`[PIX PUBLIC ${requestId}] Payload Mercado Pago`, paymentPayload);

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

    console.log(`[PIX PUBLIC ${requestId}] Resposta Mercado Pago`, {
      httpStatus: response.status,
      payment_id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail,
      qr_code_base64_len: qr_code_base64?.length || 0,
      qr_code_len: qr_code?.length || 0,
    });

    await ensurePublicPaymentColumns();

    // Registrar no financeiro para histórico e liberação. A tabela CRM real desta tela é revenue_logs.
      await pool.query(
        `INSERT INTO revenue_logs (
          plan_id, amount, client_name, whatsapp, payment_method, status,
          mp_payment_id, client_email, app_user_id, app_user_status, app_mac_address, app_username, app_password
         )
       VALUES ($1, $2, $3, $4, 'PIX', 'pendente', $5, $6, $7, $8, $9, $10, $11)`,
      [
        plan_id || null,
        amount,
        client_name,
        client_phone || null,
        paymentData.id,
        client_email || null,
        user_id || null,
        user_status || null,
        app_mac_address || null,
          app_username || null,
          app_password || null
        ]
      );

      try {
        const syncResult = await syncCheckoutCustomer({
          plan_id,
          plan_name,
          plan_duration_days,
          amount,
          client_name,
          client_email,
          client_phone,
          user_id,
          user_status,
          app_mac_address,
          app_username,
          app_password,
          payment_id: paymentData.id,
          payment_status: paymentData.status,
          payment_method: 'PIX'
        });
        console.log(`[PIX PUBLIC ${requestId}] Sync Central`, {
          skipped: !!syncResult?.skipped,
          existed: !!syncResult?.existed,
          reason: syncResult?.reason || null
        });
      } catch (syncError) {
        console.warn(`[PIX PUBLIC ${requestId}] Falha ao sincronizar Central:`, syncError.message);
      }

      res.json({
        payment_id: paymentData.id,
        status: paymentData.status,
        status_detail: paymentData.status_detail,
      qr_code: qr_code,
      qr_code_base64: qr_code_base64,
      copy_paste: qr_code
    });

  } catch (error) {
    // Log detalhado no servidor
    const errorDetail = error.response?.data || error.message || error;
    console.error('╔══════════════════════════════════════════╗');
    console.error('║  ERRO REAL - createPublicPixPayment     ║');
    console.error('╠══════════════════════════════════════════╣');
    console.error('║ Request ID:', requestId);
    console.error('║ Mensagem:', JSON.stringify(sanitizeMercadoPagoError(errorDetail)));
    console.error('║ Status:', error.response?.status || 'N/A');
    console.error('║ Token config:', config?.mpAccessToken ? 'PRESENTE ('+config.mpAccessToken.length+' chars)' : 'VAZIO/NULO');
    console.error('║ Amount:', amount, '| Plan:', plan_id);
    console.error('║ Payload:', JSON.stringify(paymentPayload));
    console.error('╚══════════════════════════════════════════╝');
    
    // Retornar erro detalhado para o frontend (remover em produção)
    res.status(500).json({ 
      error: 'Falha ao processar pagamento.',
      debug: {
        requestId,
        mercadoPagoError: sanitizeMercadoPagoError(errorDetail),
        status: error.response?.status,
        hasToken: !!config?.mpAccessToken,
        tokenLength: config?.mpAccessToken?.length || 0,
        payload: paymentPayload
      }
    });
  }
};

exports.createPublicCardPayment = async (req, res) => {
    const { plan_id, plan_name, plan_duration_days, amount, client_name, client_email, client_phone, user_id, user_status, app_mac_address, app_username, app_password, token, payment_method_id, installments, issuer_id } = req.body;

  try {
    const requestId = crypto.randomUUID();
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

    console.log(`[CARD PUBLIC ${requestId}] Iniciando pagamento`, {
      plan_id,
      plan_name,
      amount,
      client_name,
      client_email: maskEmail(client_email),
      has_phone: !!client_phone,
      user_id,
      user_status,
      app_mac_address,
    });

    const response = await axios.post('https://api.mercadopago.com/v1/payments', paymentPayload, {
      headers: {
        'Authorization': `Bearer ${config.mpAccessToken}`,
        'X-Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json'
      }
    });

    const paymentData = response.data;

    await ensurePublicPaymentColumns();

    // Registrar no financeiro para histórico e liberação. A tabela CRM real desta tela é revenue_logs.
      await pool.query(
        `INSERT INTO revenue_logs (
          plan_id, amount, client_name, whatsapp, payment_method, status,
          mp_payment_id, client_email, app_user_id, app_user_status, app_mac_address, app_username, app_password
         )
       VALUES ($1, $2, $3, $4, 'Cartão de Crédito', $5, $6, $7, $8, $9, $10, $11)`,
      [
        plan_id || null,
        amount,
        client_name,
        client_phone || null,
        paymentData.status === 'approved' ? 'pago' : 'pendente',
        paymentData.id,
        client_email || null,
        user_id || null,
        user_status || null,
        app_mac_address || null,
          app_username || null,
          app_password || null
        ]
      );

      try {
        const syncResult = await syncCheckoutCustomer({
          plan_id,
          plan_name,
          plan_duration_days,
          amount,
          client_name,
          client_email,
          client_phone,
          user_id,
          user_status,
          app_mac_address,
          app_username,
          app_password,
          payment_id: paymentData.id,
          payment_status: paymentData.status,
          payment_method: 'Cartão de Crédito'
        });
        console.log(`[CARD PUBLIC ${requestId}] Sync Central`, {
          skipped: !!syncResult?.skipped,
          existed: !!syncResult?.existed,
          reason: syncResult?.reason || null
        });
      } catch (syncError) {
        console.warn(`[CARD PUBLIC ${requestId}] Falha ao sincronizar Central:`, syncError.message);
      }

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
