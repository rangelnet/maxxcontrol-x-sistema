const pool = require('./config/database');

async function addMissingColumns() {
  try {
    console.log('\n📦 Adicionando colunas faltantes...\n');
    
    // Verificar colunas existentes
    const tableInfo = await pool.query("PRAGMA table_info(devices)");
    const existingColumns = tableInfo.rows.map(col => col.name);
    
    console.log('Colunas existentes:', existingColumns.join(', '));
    console.log('');
    
    // Adicionar test_api_url
    if (!existingColumns.includes('test_api_url')) {
      await pool.query("ALTER TABLE devices ADD COLUMN test_api_url TEXT");
      console.log('✅ Coluna test_api_url adicionada!');
    } else {
      console.log('⏭️  Coluna test_api_url já existe');
    }
    
    // Adicionar current_iptv_server_url
    if (!existingColumns.includes('current_iptv_server_url')) {
      await pool.query("ALTER TABLE devices ADD COLUMN current_iptv_server_url TEXT");
      console.log('✅ Coluna current_iptv_server_url adicionada!');
    } else {
      console.log('⏭️  Coluna current_iptv_server_url já existe');
    }
    
    // Adicionar current_iptv_username
    if (!existingColumns.includes('current_iptv_username')) {
      await pool.query("ALTER TABLE devices ADD COLUMN current_iptv_username TEXT");
      console.log('✅ Coluna current_iptv_username adicionada!');
    } else {
      console.log('⏭️  Coluna current_iptv_username já existe');
    }
    
    // Verificar estrutura final
    const finalInfo = await pool.query("PRAGMA table_info(devices)");
    console.log('\n=== COLUNAS FINAIS ===\n');
    finalInfo.rows.forEach(col => {
      console.log(`- ${col.name} (${col.type || 'TEXT'})`);
    });
    
    console.log('\n✅ Todas as colunas foram adicionadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

addMissingColumns();
