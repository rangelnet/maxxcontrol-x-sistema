const pool = require('./config/database');

async function addConnectionStatus() {
  try {
    console.log('\n📦 Adicionando coluna connection_status...\n');
    
    // Verificar se a coluna já existe
    const tableInfo = await pool.query("PRAGMA table_info(devices)");
    const hasConnectionStatus = tableInfo.rows.some(col => col.name === 'connection_status');
    
    if (hasConnectionStatus) {
      console.log('✅ Coluna connection_status já existe!');
      return;
    }
    
    // Adicionar coluna (SQLite não suporta IF NOT EXISTS no ALTER TABLE)
    await pool.query("ALTER TABLE devices ADD COLUMN connection_status TEXT DEFAULT 'offline'");
    console.log('✅ Coluna connection_status adicionada!');
    
    // Atualizar dispositivos existentes
    await pool.query("UPDATE devices SET connection_status = 'offline' WHERE connection_status IS NULL");
    console.log('✅ Dispositivos existentes atualizados!');
    
    // Verificar estrutura atualizada
    const result = await pool.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='devices'");
    console.log('\n=== ESTRUTURA ATUALIZADA ===\n');
    console.log(result.rows[0].sql);
    
    console.log('\n✅ Migration concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

addConnectionStatus();
