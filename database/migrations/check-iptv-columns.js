const pool = require('../../config/database');

/**
 * Script de diagnóstico: Verificar colunas IPTV na tabela devices
 * 
 * Este script verifica se as colunas necessárias para monitoramento IPTV
 * existem na tabela devices.
 * 
 * Colunas esperadas:
 * - server (VARCHAR 255) - URL do servidor IPTV atual
 * - username (VARCHAR 100) - Username IPTV do dispositivo
 * - password (VARCHAR 100) - Password IPTV do dispositivo
 * - ping (INTEGER) - Tempo de resposta em ms
 * - quality (VARCHAR 20) - Qualidade: excelente, boa, regular, ruim
 * - stream_status (VARCHAR 20) - Status: playing, buffering, error, stopped
 * - server_mode (VARCHAR 10) - Modo: auto, manual
 * - api_test_url (VARCHAR 500) - URL customizada para API de teste
 */

async function checkIptvColumns() {
  console.log('🔍 Verificando colunas IPTV na tabela devices...\n');
  
  try {
    // Verificar se a tabela devices existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'devices'
      ) as table_exists
    `);
    
    if (!tableCheck.rows[0].table_exists) {
      console.error('❌ ERRO: Tabela devices não existe!');
      process.exit(1);
    }
    
    console.log('✅ Tabela devices existe\n');
    
    // Listar todas as colunas da tabela devices
    const columnsQuery = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'devices'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colunas existentes na tabela devices:');
    console.log('─'.repeat(80));
    columnsQuery.rows.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type}${length.padEnd(10)} ${nullable}${defaultVal}`);
    });
    console.log('─'.repeat(80));
    console.log(`Total: ${columnsQuery.rows.length} colunas\n`);
    
    // Verificar colunas IPTV específicas
    const iptvColumns = [
      'server',
      'username', 
      'password',
      'ping',
      'quality',
      'stream_status',
      'server_mode',
      'api_test_url'
    ];
    
    console.log('🎯 Verificando colunas IPTV necessárias:\n');
    
    const existingColumns = columnsQuery.rows.map(col => col.column_name);
    let allColumnsExist = true;
    
    iptvColumns.forEach(colName => {
      const exists = existingColumns.includes(colName);
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${colName.padEnd(20)} ${exists ? 'EXISTE' : 'NÃO EXISTE'}`);
      if (!exists) allColumnsExist = false;
    });
    
    console.log('\n' + '─'.repeat(80));
    
    if (allColumnsExist) {
      console.log('\n✅ SUCESSO: Todas as colunas IPTV existem!');
      console.log('\n📊 Verificando dados de exemplo...\n');
      
      // Mostrar alguns dispositivos com dados IPTV
      const devicesQuery = await pool.query(`
        SELECT 
          id,
          mac_address,
          modelo,
          server,
          username,
          ping,
          quality,
          stream_status
        FROM devices
        LIMIT 5
      `);
      
      if (devicesQuery.rows.length > 0) {
        console.log('Dispositivos de exemplo:');
        console.log('─'.repeat(120));
        devicesQuery.rows.forEach(device => {
          console.log(`ID: ${device.id} | MAC: ${device.mac_address}`);
          console.log(`  Modelo: ${device.modelo || 'N/A'}`);
          console.log(`  Servidor: ${device.server || 'N/A'}`);
          console.log(`  Usuário: ${device.username || 'N/A'}`);
          console.log(`  Ping: ${device.ping || 'N/A'}ms`);
          console.log(`  Qualidade: ${device.quality || 'N/A'}`);
          console.log(`  Status: ${device.stream_status || 'N/A'}`);
          console.log('─'.repeat(120));
        });
      } else {
        console.log('⚠️ Nenhum dispositivo encontrado na tabela');
      }
      
    } else {
      console.log('\n❌ PROBLEMA: Algumas colunas IPTV estão faltando!');
      console.log('\n📝 SOLUÇÃO:');
      console.log('   Execute a migration para adicionar as colunas:');
      console.log('   node database/migrations/run-iptv-multi-server-migrations.js');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO ao verificar colunas:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar verificação
checkIptvColumns();
