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
