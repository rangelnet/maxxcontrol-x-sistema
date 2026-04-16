const jwt = require('jsonwebtoken');
const pool = require('../../../config/database');
const googleService = require('../../../services/googleService');

exports.getAuthUrl = async (req, res) => {
  try {
    const userId = req.userId; // Vem do middleware de autenticação (authenticateToken)

    // Assina o ID do usuário em um JWT curto para passar como 'state' no OAuth2
    // Assim quando o Google retornar no callback, sabemos DE QUEM é aquela permissão.
    const stateToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10m' });

    const url = googleService.getAuthUrl(stateToken);

    res.json({ url });
  } catch (error) {
    console.error('Erro ao gerar Auth URL do Google:', error.message);
    res.status(500).json({ error: error.message || 'Erro ao gerar URL de autenticação.' });
  }
};

exports.oauthCallback = async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('Erro no callback do Google OAuth:', error);
    return res.status(400).json({ error: 'Autorização negada pelo usuário ou falha do Google.' });
  }

  if (!code || !state) {
    return res.status(400).json({ error: 'Parâmetros inválidos no retorno do Google.' });
  }

  try {
    // Decodifica o userId
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Troca o código pelo token (precisa que no Console Google o redirect seja idêntico ao .env)
    const tokens = await googleService.getTokens(code);

    // Salva/Atualiza no Banco usando Upsert (INSERT ON CONFLICT)
    const checkUser = await pool.query('SELECT id FROM google_configs WHERE user_id = $1', [userId]);

    if (checkUser.rows.length > 0) {
      await pool.query(
        `UPDATE google_configs 
         SET access_token = $1, refresh_token = COALESCE($2, refresh_token), expiry_date = $3, enabled = true, updated_at = NOW() 
         WHERE user_id = $4`,
        [tokens.access_token, tokens.refresh_token, tokens.expiry_date, userId]
      );
    } else {
      await pool.query(
        `INSERT INTO google_configs (user_id, access_token, refresh_token, expiry_date, enabled) 
         VALUES ($1, $2, $3, $4, true)`,
        [userId, tokens.access_token, tokens.refresh_token, tokens.expiry_date]
      );
    }

    // Redirecionamento de Sucesso. Nós podemos mandar de volta para o frontend.
    // O frontend pode ter uma página de "/settings" ou algo que diga "Sucesso".
    res.send(`
      <html>
        <head><title>Integração Concluída</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #050505; color: white;">
          <h2 style="color: #FFA500;">Google Integrado com Sucesso! 🚀</h2>
          <p>Você já pode fechar esta janela e voltar para o Painel Mxxcontrol.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Erro no processamento do Callback do Google:', error);
    res.status(500).json({ error: 'Erro ao processar as permissões do Google.' });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const result = await pool.query('SELECT enabled, updated_at FROM google_configs WHERE user_id = $1', [req.userId]);
    
    if (result.rows.length === 0) {
      return res.json({ connected: false });
    }

    res.json({
      connected: result.rows[0].enabled,
      last_sync: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Erro ao checar status do Google:', error);
    res.status(500).json({ error: 'Erro ao checar conexão.' });
  }
};

exports.disconnect = async (req, res) => {
  try {
    await pool.query('UPDATE google_configs SET enabled = false WHERE user_id = $1', [req.userId]);
    res.json({ message: 'Conta Google desconectada com sucesso.' });
  } catch (error) {
    console.error('Erro ao desconectar banco Google:', error);
    res.status(500).json({ error: 'Erro ao desconectar conta.' });
  }
};
