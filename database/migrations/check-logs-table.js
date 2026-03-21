const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false
});

async function checkLogsTable() {
  try {
    console.log('🔍 Verificando tabela system_logs...\n');

    // Verificar se a tabela existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_logs'
      );
    `);
    
    console.log('📋 Tabela system_logs existe:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela system_logs não existe!');
      return;
    }

    // Contar total de logs
    const countResult = await pool.query('SELECT COUNT(*) FROM system_logs');
    console.log(`📊 Total de logs: ${countResult.rows[0].count}\n`);

    // Mostrar últimos 20 logs
    const logsResult = await pool.query(`
      SELECT id, tipo, modelo, app_version, severity, data 
      FROM system_logs 
      ORDER BY data DESC 
      LIMIT 20
    `);

    console.log('📋 Últimos 20 logs:');
    logsResult.rows.forEach(log => {
      console.log(`   [${log.id}] ${log.tipo} | ${log.modelo} | ${log.app_version} | ${log.severity} | ${log.data}`);
    });

    // Contar por modelo
    const modelCountResult = await pool.query(`
      SELECT modelo, COUNT(*) as count 
      FROM system_logs 
      GROUP BY modelo 
      ORDER BY count DESC
    `);

    console.log('\n📊 Logs por modelo:');
    modelCountResult.rows.forEach(row => {
      console.log(`   - ${row.modelo}: ${row.count} logs`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

checkLogsTable();
