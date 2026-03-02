const pool = require('../../config/database');

// Registrar dispositivo PÚBLICO (sem autenticação - para primeiro acesso)
exports.registerDevicePublic = async (req, res) => {
  const { mac_address, modelo, android_version, app_version, ip } = req.body;

  console.log('📱 Registrando dispositivo público:', { mac_address, modelo, android_version, app_version, ip });

  try {
    const existing = await pool.query('SELECT * FROM devices WHERE mac_address = $1', [mac_address]);

    if (existing.rows.length > 0) {
      // Atualizar dispositivo existente - mantém connection_status como está
      console.log('🔄 Dispositivo já existe, atualizando...');
      const result = await pool.query(
        'UPDATE devices SET modelo = $1, android_version = $2, app_version = $3, ip = $4, ultimo_acesso = CURRENT_TIMESTAMP WHERE mac_address = $5 RETURNING *',
        [modelo, android_version, app_version, ip, mac_address]
      );
      console.log('✅ Dispositivo atualizado:', result.rows[0]);
      return res.json({ device: result.rows[0], message: 'Dispositivo atualizado' });
    }

    // Criar novo dispositivo SEM user_id, connection_status = 'offline'
    console.log('✨ Criando novo dispositivo...');
    const result = await pool.query(
      'INSERT INTO devices (mac_address, modelo, android_version, app_version, ip, status, connection_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [mac_address, modelo, android_version, app_version, ip, 'ativo', 'offline']
    );

    console.log('✅ Dispositivo criado:', result.rows[0]);
    res.status(201).json({ device: result.rows[0], message: 'Dispositivo registrado' });
  } catch (error) {
    console.error('❌ Erro ao registrar dispositivo público:', error);
    res.status(500).json({ error: 'Erro ao registrar dispositivo' });
  }
};

// Atualizar status de conexão (online/offline)
exports.updateConnectionStatus = async (req, res) => {
  const { mac_address, connection_status } = req.body;

  if (!['online', 'offline'].includes(connection_status)) {
    return res.status(400).json({ error: 'Status inválido. Use: online ou offline' });
  }

  try {
    const result = await pool.query(
      'UPDATE devices SET connection_status = $1, ultimo_acesso = CURRENT_TIMESTAMP WHERE mac_address = $2 RETURNING *',
      [connection_status, mac_address]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }

    res.json({ 
      device: result.rows[0], 
      message: `Status atualizado para ${connection_status}` 
    });
  } catch (error) {
    console.error('Erro ao atualizar status de conexão:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

// Registrar dispositivo
exports.registerDevice = async (req, res) => {
  const { mac_address, modelo, android_version, app_version, ip } = req.body;
  const userId = req.userId;

  try {
    const existing = await pool.query('SELECT * FROM devices WHERE mac_address = $1', [mac_address]);

    if (existing.rows.length > 0) {
      // Atualizar dispositivo existente
      const result = await pool.query(
        'UPDATE devices SET user_id = $1, modelo = $2, android_version = $3, app_version = $4, ip = $5, ultimo_acesso = CURRENT_TIMESTAMP WHERE mac_address = $6 RETURNING *',
        [userId, modelo, android_version, app_version, ip, mac_address]
      );
      return res.json({ device: result.rows[0], message: 'Dispositivo atualizado' });
    }

    // Criar novo dispositivo
    const result = await pool.query(
      'INSERT INTO devices (user_id, mac_address, modelo, android_version, app_version, ip) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, mac_address, modelo, android_version, app_version, ip]
    );

    res.status(201).json({ device: result.rows[0], message: 'Dispositivo registrado' });
  } catch (error) {
    console.error('Erro ao registrar dispositivo:', error);
    res.status(500).json({ error: 'Erro ao registrar dispositivo' });
  }
};

// Verificar dispositivo
exports.checkDevice = async (req, res) => {
  const { mac_address } = req.body;

  try {
    const result = await pool.query('SELECT * FROM devices WHERE mac_address = $1', [mac_address]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado', allowed: false });
    }

    const device = result.rows[0];

    if (device.status !== 'ativo') {
      return res.status(403).json({ error: 'Dispositivo bloqueado', allowed: false });
    }

    // Atualizar último acesso
    await pool.query('UPDATE devices SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = $1', [device.id]);

    res.json({ allowed: true, device });
  } catch (error) {
    console.error('Erro ao verificar dispositivo:', error);
    res.status(500).json({ error: 'Erro ao verificar dispositivo' });
  }
};

// Bloquear dispositivo
exports.blockDevice = async (req, res) => {
  const { device_id } = req.body;

  try {
    await pool.query('UPDATE devices SET status = $1 WHERE id = $2', ['bloqueado', device_id]);
    res.json({ message: 'Dispositivo bloqueado com sucesso' });
  } catch (error) {
    console.error('Erro ao bloquear dispositivo:', error);
    res.status(500).json({ error: 'Erro ao bloquear dispositivo' });
  }
};

// Desbloquear dispositivo
exports.unblockDevice = async (req, res) => {
  const { device_id } = req.body;

  try {
    await pool.query('UPDATE devices SET status = $1 WHERE id = $2', ['ativo', device_id]);
    res.json({ message: 'Dispositivo desbloqueado com sucesso' });
  } catch (error) {
    console.error('Erro ao desbloquear dispositivo:', error);
    res.status(500).json({ error: 'Erro ao desbloquear dispositivo' });
  }
};

// Listar dispositivos do usuário
exports.listDevices = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query('SELECT * FROM devices WHERE user_id = $1 ORDER BY ultimo_acesso DESC', [userId]);
    res.json({ devices: result.rows });
  } catch (error) {
    console.error('Erro ao listar dispositivos:', error);
    res.status(500).json({ error: 'Erro ao listar dispositivos' });
  }
};

// Listar TODOS os dispositivos (admin)
exports.listAllDevices = async (req, res) => {
  try {
    console.log('📱 Listando TODOS os dispositivos...');
    const result = await pool.query(`
      SELECT 
        d.*,
        u.email
      FROM devices d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.ultimo_acesso DESC
    `);
    console.log(`✅ Encontrados ${result.rows.length} dispositivos`);
    console.log('Dispositivos:', result.rows.map(d => ({ mac: d.mac_address, modelo: d.modelo, user_id: d.user_id })));
    res.json({ devices: result.rows });
  } catch (error) {
    console.error('❌ Erro ao listar todos os dispositivos:', error);
    res.status(500).json({ error: 'Erro ao listar dispositivos' });
  }
};

// Configurar URL da API de teste grátis para um dispositivo
// NOTA: Esta função será implementada após adicionar a coluna test_api_url no banco
exports.setTestApiUrl = async (req, res) => {
  res.status(501).json({ error: 'Funcionalidade não implementada ainda' });
};

// Buscar URL da API de teste grátis por MAC (público - sem autenticação)
// NOTA: Esta função será implementada após adicionar a coluna test_api_url no banco
exports.getTestApiUrl = async (req, res) => {
  res.status(501).json({ error: 'Funcionalidade não implementada ainda' });
};

// ========== ROTAS ALTERNATIVAS QUE ACEITAM MAC ADDRESS ==========

// Verificar status por MAC
exports.checkDeviceStatusByMac = async (req, res) => {
  const { mac_address } = req.params;

  try {
    console.log(`🔍 Verificando status por MAC: ${mac_address}`);
    
    const result = await pool.query(
      `SELECT id, mac_address, status, connection_status, modelo, 
              android_version, app_version, ip, ultimo_acesso
       FROM devices 
       WHERE mac_address = $1`,
      [mac_address]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Dispositivo não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    console.log('✅ Status do dispositivo:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao verificar status por MAC:', error);
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
};

// Bloquear por MAC
exports.blockDeviceByMac = async (req, res) => {
  const { mac_address } = req.body;

  try {
    console.log(`🔒 Bloqueando dispositivo por MAC: ${mac_address}`);
    
    const result = await pool.query(
      `UPDATE devices 
       SET status = 'bloqueado' 
       WHERE mac_address = $1 
       RETURNING *`,
      [mac_address]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Dispositivo não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    console.log('✅ Dispositivo bloqueado:', result.rows[0]);
    res.json({ 
      device: result.rows[0],
      message: 'Dispositivo bloqueado com sucesso' 
    });
  } catch (error) {
    console.error('❌ Erro ao bloquear dispositivo por MAC:', error);
    res.status(500).json({ error: 'Erro ao bloquear dispositivo' });
  }
};

// Desbloquear por MAC
exports.unblockDeviceByMac = async (req, res) => {
  const { mac_address } = req.body;

  try {
    console.log(`🔓 Desbloqueando dispositivo por MAC: ${mac_address}`);
    
    const result = await pool.query(
      `UPDATE devices 
       SET status = 'ativo' 
       WHERE mac_address = $1 
       RETURNING *`,
      [mac_address]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Dispositivo não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    console.log('✅ Dispositivo desbloqueado:', result.rows[0]);
    res.json({ 
      device: result.rows[0],
      message: 'Dispositivo desbloqueado com sucesso' 
    });
  } catch (error) {
    console.error('❌ Erro ao desbloquear dispositivo por MAC:', error);
    res.status(500).json({ error: 'Erro ao desbloquear dispositivo' });
  }
};
