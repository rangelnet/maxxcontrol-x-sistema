const pool = require('../../config/database');

/**
 * Controller para monitoramento de streaming IPTV
 * Recebe e processa métricas dos dispositivos em tempo real
 */

/**
 * POST /api/iptv/monitor-status
 * Recebe métricas de streaming do dispositivo
 */
exports.monitorStatus = async (req, res) => {
  try {
    const { mac_address, server, ping, quality, stream_status } = req.body;
    
    // Validação de MAC address
    if (!mac_address) {
      return res.status(400).json({ error: 'MAC address é obrigatório' });
    }
    
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(mac_address)) {
      return res.status(400).json({ error: 'MAC address inválido' });
    }
    
    // Validar quality
    const validQualities = ['excelente', 'boa', 'regular', 'ruim', null];
    if (quality !== undefined && quality !== null && !validQualities.includes(quality)) {
      return res.status(400).json({ 
        error: `Qualidade inválida. Valores permitidos: ${validQualities.filter(q => q !== null).join(', ')}` 
      });
    }
    
    // Validar stream_status
    const validStatuses = ['playing', 'buffering', 'error', 'stopped', null];
    if (stream_status !== undefined && stream_status !== null && !validStatuses.includes(stream_status)) {
      return res.status(400).json({ 
        error: `Status inválido. Valores permitidos: ${validStatuses.filter(s => s !== null).join(', ')}` 
      });
    }
    
    // Verificar se dispositivo existe
    const checkQuery = 'SELECT id FROM devices WHERE mac_address = $1';
    const checkResult = await pool.query(checkQuery, [mac_address]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    // Atualizar métricas no banco
    const updateQuery = `
      UPDATE devices 
      SET 
        server = COALESCE($1, server),
        ping = COALESCE($2, ping),
        quality = COALESCE($3, quality),
        stream_status = COALESCE($4, stream_status),
        ultimo_acesso = NOW(),
        updated_at = NOW()
      WHERE mac_address = $5
      RETURNING id, mac_address, server, ping, quality, stream_status
    `;
    
    const updateResult = await pool.query(updateQuery, [
      server || null,
      ping || null,
      quality || null,
      stream_status || null,
      mac_address
    ]);
    
    const device = updateResult.rows[0];
    
    console.log(`📊 Status atualizado: ${mac_address} | ${stream_status || 'N/A'} | ${ping || 'N/A'}ms | ${quality || 'N/A'}`);
    
    res.json({ 
      success: true, 
      message: 'Status atualizado com sucesso',
      device: device
    });
    
  } catch (error) {
    console.error('❌ Erro ao monitorar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

/**
 * POST /api/iptv/force-switch
 * Força um dispositivo a trocar de servidor
 */
exports.forceSwitch = async (req, res) => {
  try {
    const { mac_address } = req.body;
    
    // Validação
    if (!mac_address) {
      return res.status(400).json({ error: 'MAC address é obrigatório' });
    }
    
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(mac_address)) {
      return res.status(400).json({ error: 'MAC address inválido' });
    }
    
    // Verificar se dispositivo existe
    const deviceQuery = 'SELECT id FROM devices WHERE mac_address = $1';
    const deviceResult = await pool.query(deviceQuery, [mac_address]);
    
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const deviceId = deviceResult.rows[0].id;
    
    // Criar comando na tabela device_commands
    const commandQuery = `
      INSERT INTO device_commands (device_id, command_type, command_data, status)
      VALUES ($1, 'switch_server', '{}', 'pending')
      RETURNING id, command_type, status, created_at
    `;
    
    const commandResult = await pool.query(commandQuery, [deviceId]);
    
    console.log(`🔄 Comando de troca de servidor criado para: ${mac_address}`);
    
    res.json({ 
      success: true, 
      message: 'Comando de troca de servidor enviado',
      command: commandResult.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao forçar troca de servidor:', error);
    res.status(500).json({ error: 'Erro ao criar comando' });
  }
};

/**
 * POST /api/iptv/server-switch
 * Registra evento de troca de servidor (chamado pelo app)
 */
exports.logServerSwitch = async (req, res) => {
  try {
    const { mac_address, old_server, new_server, reason } = req.body;
    
    // Validação
    if (!mac_address || !new_server) {
      return res.status(400).json({ error: 'MAC address e novo servidor são obrigatórios' });
    }
    
    // Verificar se dispositivo existe
    const deviceQuery = 'SELECT id FROM devices WHERE mac_address = $1';
    const deviceResult = await pool.query(deviceQuery, [mac_address]);
    
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const deviceId = deviceResult.rows[0].id;
    
    // Registrar log de troca
    const logQuery = `
      INSERT INTO logs (device_id, tipo, descricao)
      VALUES ($1, 'server_switch', $2)
    `;
    
    const description = `Troca de servidor: ${old_server || 'N/A'} → ${new_server}${reason ? ` (${reason})` : ''}`;
    await pool.query(logQuery, [deviceId, description]);
    
    // Atualizar servidor atual no dispositivo
    const updateQuery = `
      UPDATE devices 
      SET server = $1, updated_at = NOW()
      WHERE mac_address = $2
    `;
    
    await pool.query(updateQuery, [new_server, mac_address]);
    
    console.log(`🔄 Troca de servidor registrada: ${mac_address} | ${old_server || 'N/A'} → ${new_server}`);
    
    res.json({ 
      success: true, 
      message: 'Troca de servidor registrada com sucesso' 
    });
    
  } catch (error) {
    console.error('❌ Erro ao registrar troca de servidor:', error);
    res.status(500).json({ error: 'Erro ao registrar evento' });
  }
};

/**
 * GET /api/iptv/monitoring/stats
 * Obter estatísticas gerais de monitoramento
 */
exports.getMonitoringStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_devices,
        COUNT(CASE WHEN stream_status = 'playing' THEN 1 END) as playing,
        COUNT(CASE WHEN stream_status = 'buffering' THEN 1 END) as buffering,
        COUNT(CASE WHEN stream_status = 'error' THEN 1 END) as errors,
        COUNT(CASE WHEN quality = 'excelente' THEN 1 END) as excellent_quality,
        COUNT(CASE WHEN quality = 'boa' THEN 1 END) as good_quality,
        COUNT(CASE WHEN quality = 'regular' THEN 1 END) as regular_quality,
        COUNT(CASE WHEN quality = 'ruim' THEN 1 END) as poor_quality,
        AVG(ping) as avg_ping
      FROM devices
      WHERE stream_status IS NOT NULL
    `;
    
    const result = await pool.query(statsQuery);
    const stats = result.rows[0];
    
    // Converter avg_ping para número
    if (stats.avg_ping) {
      stats.avg_ping = Math.round(parseFloat(stats.avg_ping));
    }
    
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
};

// exports já está configurado corretamente via exports.xxx = ...
