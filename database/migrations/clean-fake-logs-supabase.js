const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false
});

async function cleanFakeLogs() {
  try {
    console.log('🧹 Iniciando limpeza de logs fake no Supabase...\n');

    // Lista de modelos fake para remover
    const fakeModels = [
      'Test Device',
      'Samsung TV',
      'Xiaomi Box',
      'Xiaomi Mi Box',
      'LG TV',
      'LG Smart TV',
      'Sony TV',
      'Philips TV',
      'rockchip TV BOX',
      'Fire TV Stick',
      'Android TV Box',
      'Generic Android TV'
    ];

    // Contar logs fake antes de deletar
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM system_logs WHERE modelo = ANY($1)',
      [fakeModels]
    );
    
    const totalFakeLogs = parseInt(countResult.rows[0].count);
    
    if (totalFakeLogs === 0) {
      console.log('✅ Nenhum log fake encontrado!');
      return;
    }

    console.log(`📊 Encontrados ${totalFakeLogs} logs fake\n`);

    // Mostrar detalhes dos logs fake
    const detailsResult = await pool.query(
      `SELECT modelo, COUNT(*) as count 
       FROM system_logs 
       WHERE modelo = ANY($1) 
       GROUP BY modelo 
       ORDER BY count DESC`,
      [fakeModels]
    );

    console.log('📋 Detalhes dos logs fake:');
    detailsResult.rows.forEach(row => {
      console.log(`   - ${row.modelo}: ${row.count} logs`);
    });
    console.log('');

    // Deletar logs fake
    const deleteResult = await pool.query(
      'DELETE FROM system_logs WHERE modelo = ANY($1)',
      [fakeModels]
    );

    console.log(`✅ ${deleteResult.rowCount} logs fake removidos com sucesso!\n`);

    // Contar logs restantes
    const remainingResult = await pool.query('SELECT COUNT(*) FROM system_logs');
    const remainingLogs = parseInt(remainingResult.rows[0].count);

    console.log(`📊 Logs restantes no banco: ${remainingLogs}\n`);

    console.log('═══════════════════════════════════');
    console.log('✨ LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('═══════════════════════════════════');

  } catch (error) {
    console.error('❌ Erro ao limpar logs fake:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

cleanFakeLogs();
