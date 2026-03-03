const pool = require('./config/database');

async function checkDevices() {
  try {
    // Verificar estrutura da tabela
    const tableInfo = await pool.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='devices'");
    console.log('\n=== ESTRUTURA DA TABELA DEVICES ===\n');
    if (tableInfo.rows.length > 0) {
      console.log(tableInfo.rows[0].sql);
    } else {
      console.log('Tabela devices não encontrada!');
    }
    
    // Buscar os dispositivos
    const result = await pool.query('SELECT * FROM devices ORDER BY id');
    
    console.log('\n=== DISPOSITIVOS NO BANCO ===\n');
    if (result.rows.length === 0) {
      console.log('Nenhum dispositivo encontrado no banco!');
    } else {
      result.rows.forEach(device => {
        console.log(JSON.stringify(device, null, 2));
        console.log('---');
      });
    }
    
    console.log(`\nTotal: ${result.rows.length} dispositivos`);
  } catch (error) {
    console.error('Erro:', error.message);
    console.error(error.stack);
  }
}

checkDevices();
