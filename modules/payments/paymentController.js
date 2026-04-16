const pool = require('../../config/database');
const axios = require('axios');
const crypto = require('crypto');

// Obter os tokens do MP a partir do global_settings
const getMpConfig = async () => {
  const result = await pool.query("SELECT value FROM global_settings WHERE key = 'mp'");
  if (result.rows.length > 0 && result.rows[0].value) {
    return result.rows[0].value;
  }
  return null;
};

exports.createPixPayment = async (req, res) => {
  const { package_id, credits, amount } = req.body;
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
       (payment_id, reseller_id, package_id, credits, amount, status, type, qr_code_base64, qr_code)
       VALUES ($1, $2, $3, $4, $5, $6, 'pix', $7, $8)`,
      [paymentData.id, reseller_id, package_id, credits, amount, paymentData.status, qr_code_base64, qr_code]
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

    // Se o pagamento for aprovado, atualizar nossa base de dados e adicionar créditos ao revendedor
    if (currentStatus === 'approved') {
       const resultTx = await pool.query(
          "UPDATE mp_transactions SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE payment_id = $1 AND status != 'approved' RETURNING *",
          [payment_id]
       );
       
       if (resultTx.rows.length > 0) {
           const tx = resultTx.rows[0];
           // Atualiza os créditos do usuário que comprou
           await pool.query("UPDATE users SET creditos = CASE WHEN tipo = 'admin' THEN creditos ELSE creditos + $1 END WHERE id = $2", [tx.credits, tx.reseller_id]);
           console.log(`✅ Pagamento ${payment_id} aprovado. ${tx.credits} créditos adicionados ao usuário ${tx.reseller_id}.`);
       }
    }

    res.json({ status: currentStatus });

  } catch (error) {
     console.error('Erro ao checar status do PIX:', error.response ? error.response.data : error.message);
     res.status(500).json({ error: 'Falha ao verificar pagamento.' });
  }
};

// Obter histórico de transações reais do usuário
exports.getPaymentHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, payment_id, credits, amount, status, type,
              TO_CHAR(created_at, 'DD/MM/YYYY') as date,
              TO_CHAR(created_at, 'HH24:MI') as time
       FROM mp_transactions 
       WHERE reseller_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico financeiro:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};
