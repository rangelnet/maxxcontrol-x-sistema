const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');

// Listar apps instalados no dispositivo
exports.listInstalledApps = async (req, res) => {
  const { device_id } = req.params;

  try {
    console.log(`📱 Listando apps instalados do dispositivo ${device_id}...`);
    
    const result = await pool.query(
      `SELECT * FROM device_apps 
       WHERE device_id = $1 
       ORDER BY app_name ASC`,
      [device_id]
    );

    console.log(`✅ ${result.rows.length} apps encontrados`);
    res.json({ apps: result.rows });
  } catch (error) {
    console.error('❌ Erro ao listar apps:', error);
    res.status(500).json({ error: 'Erro ao listar apps' });
  }
};

// Registrar app instalado (chamado pelo app Android)
exports.registerInstalledApp = async (req, res) => {
  const { device_id, package_name, app_name, version_code, version_name, is_system } = req.body;

  try {
    console.log(`📦 Registrando app: ${app_name} (${package_name})`);

    const result = await pool.query(
      `INSERT INTO device_apps (device_id, package_name, app_name, version_code, version_name, is_system, installed_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (device_id, package_name) DO UPDATE SET
       app_name = $3, version_code = $4, version_name = $5, is_system = $6, updated_at = NOW()
       RETURNING *`,
      [device_id, package_name, app_name, version_code, version_name, is_system || false]
    );

    console.log('✅ App registrado:', result.rows[0]);
    res.json({ app: result.rows[0], message: 'App registrado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao registrar app:', error);
    res.status(500).json({ error: 'Erro ao registrar app' });
  }
};

// Desinstalar app (envia comando para o dispositivo)
exports.uninstallApp = async (req, res) => {
  const { device_id, package_name } = req.body;

  try {
    console.log(`🗑️ Desinstalando app: ${package_name} do dispositivo ${device_id}`);

    // Registrar comando de desinstalação
    const commandResult = await pool.query(
      `INSERT INTO device_commands (device_id, command_type, command_data, status)
       VALUES ($1, 'uninstall_app', $2, 'pending')
       RETURNING *`,
      [device_id, JSON.stringify({ package_name })]
    );

    console.log('✅ Comando de desinstalação criado');

    // Remover do banco de dados
    await pool.query(
      'DELETE FROM device_apps WHERE device_id = $1 AND package_name = $2',
      [device_id, package_name]
    );

    res.json({ 
      command: commandResult.rows[0],
      message: 'Comando de desinstalação enviado' 
    });
  } catch (error) {
    console.error('❌ Erro ao desinstalar app:', error);
    res.status(500).json({ error: 'Erro ao desinstalar app' });
  }
};

// Enviar APK para o dispositivo
exports.sendApk = async (req, res) => {
  const { device_id, app_name, app_url } = req.body;

  try {
    console.log(`📤 Enviando APK: ${app_name} para dispositivo ${device_id}`);

    // Registrar comando de instalação
    const commandResult = await pool.query(
      `INSERT INTO device_commands (device_id, command_type, command_data, status)
       VALUES ($1, 'install_app', $2, 'pending')
       RETURNING *`,
      [device_id, JSON.stringify({ app_name, app_url })]
    );

    console.log('✅ Comando de instalação criado');
    res.json({ 
      command: commandResult.rows[0],
      message: 'Comando de instalação enviado' 
    });
  } catch (error) {
    console.error('❌ Erro ao enviar APK:', error);
    res.status(500).json({ error: 'Erro ao enviar APK' });
  }
};

// Listar comandos pendentes para um dispositivo
exports.getPendingCommands = async (req, res) => {
  const { device_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM device_commands 
       WHERE device_id = $1 AND status = 'pending'
       ORDER BY created_at ASC`,
      [device_id]
    );

    res.json({ commands: result.rows });
  } catch (error) {
    console.error('Erro ao buscar comandos:', error);
    res.status(500).json({ error: 'Erro ao buscar comandos' });
  }
};

// Atualizar status do comando
exports.updateCommandStatus = async (req, res) => {
  const { command_id, status, result } = req.body;

  try {
    const updateResult = await pool.query(
      `UPDATE device_commands 
       SET status = $1, result = $2, completed_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, result || null, command_id]
    );

    res.json({ command: updateResult.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar comando:', error);
    res.status(500).json({ error: 'Erro ao atualizar comando' });
  }
};

// ========== ROTAS ALTERNATIVAS QUE ACEITAM MAC ADDRESS ==========

// Listar apps por MAC
exports.listInstalledAppsByMac = async (req, res) => {
  const { mac_address } = req.params;

  try {
    console.log(`📱 Listando apps por MAC: ${mac_address}`);
    
    // Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      console.log('❌ Dispositivo não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const device_id = deviceResult.rows[0].id;
    console.log(`✅ Device ID encontrado: ${device_id}`);
    
    // Buscar apps
    const result = await pool.query(
      `SELECT * FROM device_apps 
       WHERE device_id = $1 
       ORDER BY app_name ASC`,
      [device_id]
    );
    
    console.log(`✅ ${result.rows.length} apps encontrados`);
    res.json({ apps: result.rows });
  } catch (error) {
    console.error('❌ Erro ao listar apps por MAC:', error);
    res.status(500).json({ error: 'Erro ao listar apps' });
  }
};

// Desinstalar app por MAC
exports.uninstallAppByMac = async (req, res) => {
  const { mac_address, package_name } = req.body;

  try {
    console.log(`🗑️ Desinstalando app por MAC: ${package_name} (${mac_address})`);
    
    // Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      console.log('❌ Dispositivo não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const device_id = deviceResult.rows[0].id;
    console.log(`✅ Device ID encontrado: ${device_id}`);
    
    // Criar comando
    const commandResult = await pool.query(
      `INSERT INTO device_commands (device_id, command_type, command_data, status)
       VALUES ($1, 'uninstall_app', $2, 'pending')
       RETURNING *`,
      [device_id, JSON.stringify({ package_name })]
    );
    
    console.log('✅ Comando de desinstalação criado');
    
    // Remover do banco
    await pool.query(
      'DELETE FROM device_apps WHERE device_id = $1 AND package_name = $2',
      [device_id, package_name]
    );
    
    res.json({ 
      command: commandResult.rows[0],
      message: 'Comando de desinstalação enviado' 
    });
  } catch (error) {
    console.error('❌ Erro ao desinstalar app por MAC:', error);
    res.status(500).json({ error: 'Erro ao desinstalar app' });
  }
};

// Enviar APK por MAC
exports.sendApkByMac = async (req, res) => {
  const { mac_address, app_name, app_url } = req.body;

  try {
    console.log(`📤 Enviando APK por MAC: ${app_name} (${mac_address})`);
    
    // Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      console.log('❌ Dispositivo não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const device_id = deviceResult.rows[0].id;
    console.log(`✅ Device ID encontrado: ${device_id}`);
    
    // Criar comando
    const commandResult = await pool.query(
      `INSERT INTO device_commands (device_id, command_type, command_data, status)
       VALUES ($1, 'install_app', $2, 'pending')
       RETURNING *`,
      [device_id, JSON.stringify({ app_name, app_url })]
    );
    
    console.log('✅ Comando de instalação criado');
    res.json({ 
      command: commandResult.rows[0],
      message: 'Comando de instalação enviado' 
    });
  } catch (error) {
    console.error('❌ Erro ao enviar APK por MAC:', error);
    res.status(500).json({ error: 'Erro ao enviar APK' });
  }
};

// Comandos pendentes por MAC
exports.getPendingCommandsByMac = async (req, res) => {
  const { mac_address } = req.params;

  try {
    console.log(`📋 Buscando comandos pendentes por MAC: ${mac_address}`);
    
    // Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      console.log('⚠️ Dispositivo não encontrado, retornando lista vazia');
      return res.json({ commands: [] });
    }
    
    const device_id = deviceResult.rows[0].id;
    console.log(`✅ Device ID encontrado: ${device_id}`);
    
    const result = await pool.query(
      `SELECT * FROM device_commands 
       WHERE device_id = $1 AND status = 'pending'
       ORDER BY created_at ASC`,
      [device_id]
    );
    
    console.log(`✅ ${result.rows.length} comandos pendentes encontrados`);
    res.json({ commands: result.rows });
  } catch (error) {
    console.error('❌ Erro ao buscar comandos por MAC:', error);
    res.status(500).json({ error: 'Erro ao buscar comandos' });
  }
};

// Sincronizar lista completa de apps (chamado pelo app Android)
exports.syncInstalledApps = async (req, res) => {
  const { mac_address, apps } = req.body;

  try {
    console.log('');
    console.log('🔄 ========== SINCRONIZAÇÃO DE APPS ==========');
    console.log(`📱 MAC Address: ${mac_address}`);
    console.log(`📦 Total de apps recebidos: ${apps ? apps.length : 0}`);
    
    // 1. Validar entrada
    if (!mac_address || !apps || !Array.isArray(apps) || apps.length === 0) {
      console.log('❌ Validação falhou: MAC ou apps inválidos');
      return res.status(400).json({ 
        error: 'MAC address e lista de apps são obrigatórios' 
      });
    }

    console.log(`✅ Validação OK`);
    
    // 2. Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      console.log(`❌ Dispositivo não encontrado: ${mac_address}`);
      console.log('🔄 ========== FIM DA SINCRONIZAÇÃO (ERRO) ==========');
      console.log('');
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const device_id = deviceResult.rows[0].id;
    console.log(`✅ Device ID encontrado: ${device_id}`);
    
    // Separar apps do sistema e do usuário
    const systemApps = apps.filter(app => app.is_system);
    const userApps = apps.filter(app => !app.is_system);
    console.log(`📊 Apps do sistema: ${systemApps.length}`);
    console.log(`📊 Apps do usuário: ${userApps.length}`);
    
    // 3. Iniciar transação
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      console.log('🔄 Transação iniciada');
      
      // 4. Limpar apps antigos
      const deleteResult = await client.query(
        'DELETE FROM device_apps WHERE device_id = $1',
        [device_id]
      );
      console.log(`🗑️ ${deleteResult.rowCount} apps antigos removidos`);
      
      // 5. Inserir novos apps
      let insertedCount = 0;
      for (const app of apps) {
        // Validar campos obrigatórios
        if (!app.package_name || !app.app_name || 
            app.version_code === undefined || !app.version_name) {
          throw new Error(`App inválido: ${JSON.stringify(app)}`);
        }
        
        await client.query(
          `INSERT INTO device_apps 
           (device_id, package_name, app_name, version_code, version_name, is_system, installed_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            device_id,
            app.package_name,
            app.app_name,
            app.version_code,
            app.version_name,
            app.is_system || false
          ]
        );
        insertedCount++;
      }
      
      // 6. Commit
      await client.query('COMMIT');
      console.log(`✅ ${insertedCount} apps sincronizados com sucesso`);
      console.log('✅ Transação concluída');
      console.log('🔄 ========== FIM DA SINCRONIZAÇÃO (SUCESSO) ==========');
      console.log('');
      
      // 7. Resposta de sucesso
      res.json({ 
        success: true,
        message: `${insertedCount} apps sincronizados`,
        device_id: device_id,
        total_apps: insertedCount
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.log('❌ Erro na transação, rollback executado');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar apps:', error);
    console.log('🔄 ========== FIM DA SINCRONIZAÇÃO (ERRO) ==========');
    console.log('');
    res.status(500).json({ error: 'Erro ao sincronizar apps' });
  }
};
