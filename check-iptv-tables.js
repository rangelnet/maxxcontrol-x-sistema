const pool = require('./config/database');

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas IPTV...\n');
    
    // Verificar tabelas existentes (PostgreSQL)
    const tables = await pool.query(`
      SELECT tablename as name FROM pg_tables 
      WHERE schemaname = 'public' AND tablename LIKE '%iptv%'
    `);
    
    console.log('📋 Tabelas IPTV encontradas:', tables.rows);
    
    // Verificar estrutura da tabela device_iptv_config
    if (tables.rows.some(t => t.name === 'device_iptv_config')) {
      const structure = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'device_iptv_config'
      `);
      console.log('\n📊 Estrutura device_iptv_config:', structure.rows);
    }
    
    // Verificar estrutura da tabela iptv_server_config
    if (tables.rows.some(t => t.name === 'iptv_server_config')) {
      const structure = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'iptv_server_config'
      `);
      console.log('\n📊 Estrutura iptv_server_config:', structure.rows);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkTables();
