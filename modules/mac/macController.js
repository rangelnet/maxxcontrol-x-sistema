const pool = require('../../config/database');
const { broadcast } = require('../../websocket/wsServer');
const jwt = require('jsonwebtoken');

// Registrar dispositivo PÚBLICO (sem autenticação - para primeiro acesso)
exports.registerDevicePublic = async (req, res) => {
  const { mac_address, modelo, android_version, app_version, ip } = req.body;

  console.log('📱 Registrando dispositivo público:', { mac_address, modelo, android_version, app_version, ip });

  try {
    const existing = await pool.query('SELECT * FROM devices WHERE mac_address = $1', [mac_address]);

    let device;
    if (existing.rows.length > 0) {
      // Atualizar dispositivo existente - mantém connection_status como está
      console.log('🔄 Dispositivo já existe, atualizando...');
      const result = await pool.query(
        'UPDATE devices SET modelo = $1, android_version = $2, app_version = $3, ip = $4, ultimo_acesso = CURRENT_TIMESTAMP WHERE mac_address = $5 RETURNING *',
        [modelo, android_version, app_version, ip, mac_address]
      );
      device = result.rows[0];
      console.log('✅ Dispositivo atualizado:', device);
    } else {
      // Criar novo dispositivo SEM user_id, connection_status = 'offline'
      console.log('✨ Criando novo dispositivo...');
      const result = await pool.query(
        'INSERT INTO devices (mac_address, modelo, android_version, app_version, ip, status, connection_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [mac_address, modelo, android_version, app_version, ip, 'ativo', 'offline']
      );
      device = result.rows[0];
      console.log('✅ Dispositivo criado:', device);
    }

    // Gerar token JWT para o dispositivo
    const token = jwt.sign(
      { 
        device_id: device.id, 
        mac_address: device.mac_address,
        type: 'device' // Identificar que é um token de dispositivo
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: '365d' // Token válido por 1 ano
      }
    );

    console.log('🔑 Token JWT gerado para o dispositivo');

    res.status(existing.rows.length > 0 ? 200 : 201).json({ 
      device: device, 
      token: token, // ✅ NOVO: Retornar token JWT
      message: existing.rows.length > 0 ? 'Dispositivo atualizado' : 'Dispositivo registrado' 
    });
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

    let device;
    if (existing.rows.length > 0) {
      // Atualizar dispositivo existente
      const result = await pool.query(
        'UPDATE devices SET user_id = $1, modelo = $2, android_version = $3, app_version = $4, ip = $5, ultimo_acesso = CURRENT_TIMESTAMP WHERE mac_address = $6 RETURNING *',
        [userId, modelo, android_version, app_version, ip, mac_address]
      );
      device = result.rows[0];
    } else {
      // Criar novo dispositivo
      const result = await pool.query(
        'INSERT INTO devices (user_id, mac_address, modelo, android_version, app_version, ip) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, mac_address, modelo, android_version, app_version, ip]
      );
      device = result.rows[0];
    }

    // Gerar token JWT para o dispositivo
    const token = jwt.sign(
      { 
        device_id: device.id, 
        mac_address: device.mac_address,
        user_id: userId,
        type: 'device'
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: '365d'
      }
    );

    res.status(existing.rows.length > 0 ? 200 : 201).json({ 
      device: device, 
      token: token, // ✅ NOVO: Retornar token JWT
      message: existing.rows.length > 0 ? 'Dispositivo atualizado' : 'Dispositivo registrado' 
    });
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
        u.email,
        d.current_iptv_server_url,
        d.current_iptv_username
      FROM devices d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.ultimo_acesso DESC
    `);
    console.log(`✅ Encontrados ${result.rows.length} dispositivos`);
    console.log('Dispositivos:', result.rows.map(d => ({ 
      mac: d.mac_address, 
      modelo: d.modelo, 
      user_id: d.user_id,
      iptv_server: d.current_iptv_server_url || 'não configurado'
    })));
    res.json({ devices: result.rows });
  } catch (error) {
    console.error('❌ Erro ao listar todos os dispositivos:', error);
    res.status(500).json({ error: 'Erro ao listar dispositivos' });
  }
};

// Configurar URL da API de teste grátis para um dispositivo
exports.setTestApiUrl = async (req, res) => {
  const { mac_address, test_api_url } = req.body;

  // Validar formato do MAC address
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  if (!macRegex.test(mac_address)) {
    return res.status(400).json({ error: 'Formato de MAC address inválido' });
  }

  // Se test_api_url não for null/vazio, validar formato
  if (test_api_url !== null && test_api_url !== '') {
    // Validar formato de URL (HTTP/HTTPS apenas)
    try {
      const url = new URL(test_api_url);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return res.status(400).json({ error: 'URL deve usar protocolo HTTP ou HTTPS' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Formato de URL inválido' });
    }

    // Verificar padrões de SQL injection
    const sqlInjectionPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
      /(--|;|\/\*|\*\/|xp_|sp_)/i
    ];
    
    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(test_api_url)) {
        console.warn(`⚠️ Tentativa de SQL injection detectada: ${test_api_url}`);
        return res.status(400).json({ error: 'URL contém caracteres ou padrões não permitidos' });
      }
    }

    // Verificar padrões de JavaScript injection
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(test_api_url)) {
        console.warn(`⚠️ Tentativa de XSS detectada: ${test_api_url}`);
        return res.status(400).json({ error: 'URL contém caracteres ou padrões não permitidos' });
      }
    }
  }

  try {
    console.log(`🔧 Configurando test_api_url para MAC: ${mac_address}`);
    console.log(`   URL: ${test_api_url || 'null (limpar configuração)'}`);
    
    const result = await pool.query(
      'UPDATE devices SET test_api_url = $1 WHERE mac_address = $2 RETURNING *',
      [test_api_url || null, mac_address]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Dispositivo não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    console.log('✅ test_api_url configurado com sucesso');
    
    // Broadcast WebSocket para atualização em tempo real
    broadcast({
      type: 'device:test-api-updated',
      data: {
        device_id: result.rows[0].id,
        mac_address: result.rows[0].mac_address,
        test_api_url: result.rows[0].test_api_url
      }
    });
    
    res.json({
      device: result.rows[0],
      message: test_api_url ? 'URL configurada com sucesso' : 'Configuração removida com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao configurar test_api_url:', error);
    res.status(500).json({ error: 'Erro ao configurar URL' });
  }
};

// Buscar URL da API de teste grátis por MAC (público - sem autenticação)
exports.getTestApiUrl = async (req, res) => {
  const { mac_address } = req.params;

  // Validar formato do MAC address
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  if (!macRegex.test(mac_address)) {
    return res.status(400).json({ error: 'Formato de MAC address inválido' });
  }

  try {
    console.log(`🔍 Buscando test_api_url para MAC: ${mac_address}`);
    
    const result = await pool.query(
      'SELECT test_api_url FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Dispositivo não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const testApiUrl = result.rows[0].test_api_url;
    const hasCustomUrl = testApiUrl !== null && testApiUrl !== '';
    
    console.log(`✅ test_api_url encontrado: ${testApiUrl || 'null'} (has_custom_url: ${hasCustomUrl})`);
    
    res.json({
      test_api_url: testApiUrl,
      has_custom_url: hasCustomUrl
    });
  } catch (error) {
    console.error('❌ Erro ao buscar test_api_url:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
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

// Excluir dispositivo
exports.deleteDevice = async (req, res) => {
  const { device_id } = req.params;

  try {
    console.log(`🗑️ Excluindo dispositivo ID: ${device_id}`);
    
    // Deletar apps relacionados (se a tabela existir)
    try {
      await pool.query('DELETE FROM device_apps WHERE device_id = $1', [device_id]);
      console.log('✅ Apps relacionados excluídos');
    } catch (error) {
      console.log('⚠️ Tabela device_apps não existe ou erro ao deletar apps:', error.message);
    }
    
    // Deletar comandos relacionados (se a tabela existir)
    try {
      await pool.query('DELETE FROM device_commands WHERE device_id = $1', [device_id]);
      console.log('✅ Comandos relacionados excluídos');
    } catch (error) {
      console.log('⚠️ Tabela device_commands não existe ou erro ao deletar comandos:', error.message);
    }
    
    // Deletar configuração IPTV relacionada (se a tabela existir)
    try {
      await pool.query('DELETE FROM device_iptv_config WHERE device_id = $1', [device_id]);
      console.log('✅ Configuração IPTV excluída');
    } catch (error) {
      console.log('⚠️ Tabela device_iptv_config não existe ou erro ao deletar IPTV:', error.message);
    }
    
    // Deletar dispositivo
    const result = await pool.query('DELETE FROM devices WHERE id = $1 RETURNING *', [device_id]);
    
    if (result.rows.length === 0) {
      console.log('❌ Dispositivo não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    console.log('✅ Dispositivo excluído com sucesso:', result.rows[0]);
    res.json({ 
      message: 'Dispositivo excluído com sucesso', 
      device: result.rows[0] 
    });
  } catch (error) {
    console.error('❌ Erro ao excluir dispositivo:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao excluir dispositivo',
      details: error.message 
    });
  }
};
