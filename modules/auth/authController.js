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
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    if (user.status !== 'ativo') {
      return res.status(403).json({ error: 'Usuário bloqueado' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    // Registrar/atualizar device se device_id foi fornecido
    let deviceData = null;
    if (device_id) {
      try {
        const deviceResult = await pool.query(
          `INSERT INTO devices (user_id, mac_address, modelo, android_version, app_version, status, connection_status)
           VALUES ($1, $2, $3, $4, $5, 'ativo', 'online')
           ON CONFLICT (mac_address) DO UPDATE SET
           user_id = $1, modelo = $3, android_version = $4, app_version = $5, 
           status = 'ativo', connection_status = 'online', ultimo_acesso = NOW()
           RETURNING id, mac_address, modelo, app_version`,
          [user.id, device_id, modelo || 'Unknown', android_version || 'Unknown', app_version || 'Unknown']
        );
        deviceData = deviceResult.rows[0];
      } catch (deviceError) {
        console.error('Erro ao registrar device:', deviceError);
        // Continua mesmo se falhar ao registrar device
      }
    }

    // Preparar configurações para retornar
    const config = {
      painel_url: process.env.PAINEL_URL || 'http://localhost:3000',
      api_url: process.env.API_URL || 'http://localhost:3000/api',
      device_id: deviceData?.id || null,
      mac_address: deviceData?.mac_address || device_id || null
    };

    // Tentar buscar configuração IPTV global
    try {
      const iptvResult = await pool.query('SELECT * FROM iptv_server_config LIMIT 1');
      if (iptvResult.rows.length > 0) {
        config.iptv_config = {
          url: iptvResult.rows[0].xtream_url,
          username: iptvResult.rows[0].xtream_username,
          password: iptvResult.rows[0].xtream_password
        };
      }
    } catch (iptvError) {
      console.error('Erro ao buscar config IPTV:', iptvError);
    }

    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        plano: user.plano,
        status: user.status
      },
      token,
      config
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

// Validar token
exports.validateToken = async (req, res) => {
  res.json({ valid: true, userId: req.userId });
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
