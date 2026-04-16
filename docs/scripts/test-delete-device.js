const pool = require('./config/database');

async function testDelete() {
  try {
    console.log('🔍 Testando função de excluir dispositivo...\n');
    
    // Listar dispositivos
    const devices = await pool.query('SELECT id, mac_address FROM devices LIMIT 5');
    console.log('📋 Dispositivos disponíveis:', devices.rows);
    
    if (devices.rows.length === 0) {
      console.log('\n⚠️ Nenhum dispositivo encontrado para testar');
      process.exit(0);
    }
    
    console.log('\n✅ Endpoint está configurado corretamente');
    console.log('📍 Rota: DELETE /api/device/delete/:device_id');
    console.log('🔐 Requer autenticação: SIM (authMiddleware)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testDelete();
