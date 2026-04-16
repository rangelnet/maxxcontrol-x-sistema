const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/database');

// Registro de usuário
exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    
    const result = await pool.query(
      'INSERT INTO users (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, plano, status',
      [nome, email, senha_hash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, senha, device_id, modelo, android_version, app_version } = req.body;

  try {
    console.log('🔐 Tentativa de login para:', email);
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (user.status !== 'ativo') {
      return res.status(403).json({ error: 'Usuário bloqueado' });
    }

    // --- LÓGICA DE 2FA ---
    if (user.tfa_enabled && user.telegram_chat_id) {
        const trustedDevice = await pool.query(
          'SELECT id FROM devices WHERE user_id = $1 AND mac_address = $2',
          [user.id, device_id]
        );

        if (trustedDevice.rows.length === 0) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            await pool.query('UPDATE users SET tfa_code = $1 WHERE id = $2', [code, user.id]);
            
            const { send2FACode } = require('../telegram/telegramBot');
            try {
                await send2FACode(user.telegram_chat_id, code, user.email);
                return res.json({ 
                    require2FA: true, 
                    email: user.email,
                    device_id,
                    message: 'Código de segurança enviado para o seu Telegram.'
                });
            } catch (tgError) {
                console.error('Erro ao enviar 2FA:', tgError);
                return res.status(500).json({ error: 'Falha ao enviar código via Telegram.' });
            }
        }
    }

    const token = jwt.sign({ id: user.id, email: user.email, tipo: user.tipo }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    let deviceData = null;
    if (device_id) {
      try {
        const deviceIdSafe = String(device_id).substring(0, 17);
        const deviceResult = await pool.query(
          `INSERT INTO devices (user_id, mac_address, modelo, android_version, app_version, status, connection_status)
           VALUES ($1, $2, $3, $4, $5, 'ativo', 'online')
           ON CONFLICT (mac_address) DO UPDATE SET
           user_id = $1, modelo = $3, ultimo_acesso = NOW()
           RETURNING id, mac_address`,
          [user.id, deviceIdSafe, modelo || 'Web Browser', android_version || 'N/A', app_version || '1.0.0']
        );
        deviceData = deviceResult.rows[0];
      } catch (err) {}
    }

    const config = {
      api_url: process.env.API_URL || 'http://localhost:3000/api',
      device_id: deviceData?.id || null,
      mac_address: deviceData?.mac_address || device_id || null
    };

    res.json({
      user: { id: user.id, nome: user.nome, email: user.email, plano: user.plano, status: user.status, tipo: user.tipo },
      token,
      config
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

exports.verify2FA = async (req, res) => {
  const { email, code, device_id, modelo, android_version, app_version } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

    const user = result.rows[0];
    if (user.tfa_code !== code) return res.status(401).json({ error: 'Código inválido ou expirado' });

    await pool.query('UPDATE users SET tfa_code = NULL WHERE id = $1', [user.id]);

    if (device_id) {
      try {
        const deviceIdSafe = String(device_id).substring(0, 17);
        await pool.query(
          `INSERT INTO devices (user_id, mac_address, modelo, android_version, app_version, status, connection_status)
           VALUES ($1, $2, $3, $4, $5, 'ativo', 'online')
           ON CONFLICT (mac_address) DO UPDATE SET user_id = $1, ultimo_acesso = NOW()`,
          [user.id, deviceIdSafe, modelo || 'Web Browser', android_version || 'N/A', app_version || '1.0.0']
        );
      } catch (devError) {
        console.error('Erro silencioso ao registrar dispositivo no 2FA:', devError);
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, tipo: user.tipo }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.json({
      user: { id: user.id, nome: user.nome, email: user.email, plano: user.plano, status: user.status, tipo: user.tipo },
      token
    });
  } catch (error) {
    console.error('Erro na verificação 2FA:', error);
    res.status(500).json({ error: 'Erro ao verificar código 2FA' });
  }
};

// Validar token e retornar dados do usuário
exports.validateToken = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, plano, status, tipo, tfa_enabled, telegram_chat_id FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    res.json({ valid: true, user: result.rows[0] });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ error: 'Erro ao validar token' });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // Em JWT, logout é stateless - apenas retorna sucesso
    // O cliente remove o token do localStorage/SharedPreferences
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
};

// Listar dispositivos do usuário (2FA Inteligente)
exports.getDevices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, mac_address as device_id, modelo as device, 
              TO_CHAR(ultimo_acesso, 'DD/MM/YYYY HH24:MI') as time, 
              status, 
              CASE WHEN mac_address = $2 THEN true ELSE false END as active
       FROM devices 
       WHERE user_id = $1 
       ORDER BY ultimo_acesso DESC`,
      [req.userId, String(req.headers['x-device-id'] || '').substring(0, 17)]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar dispositivos:', error);
    res.status(500).json({ error: 'Erro ao listar dispositivos' });
  }
};

// Remover dispositivo (revogar confiança/sessão)
exports.deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM devices WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ message: 'Dispositivo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover dispositivo:', error);
    res.status(500).json({ error: 'Erro ao remover dispositivo' });
  }
};

// Alternar status do 2FA
exports.toggleTFA = async (req, res) => {
  const { enabled } = req.body;
  try {
    await pool.query('UPDATE users SET tfa_enabled = $1 WHERE id = $2', [enabled, req.userId]);
    res.json({ message: `2FA ${enabled ? 'ativado' : 'desativado'} com sucesso` });
  } catch (error) {
    console.error('Erro ao alternar 2FA:', error);
    res.status(500).json({ error: 'Erro ao alternar 2FA' });
  }
};
