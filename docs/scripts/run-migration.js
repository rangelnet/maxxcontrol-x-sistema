const pool = require('./config/database');
const fs = require('fs');

async function runMigration() {
  try {
    console.log('\n📦 Executando migration: add_connection_status.sql\n');
    
    const sql = fs.readFileSync('./database/migrations/add_connection_status.sql', 'utf8');
    
    // Executar cada statement separadamente
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (const statement of statements) {
      console.log(`Executando: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
      console.log('✅ OK\n');
    }
    
    // Verificar estrutura atualizada
    const tableInfo = await pool.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='devices'");
    console.log('\n=== ESTRUTURA ATUALIZADA ===\n');
    console.log(tableInfo.rows[0].sql);
    
    console.log('\n✅ Migration executada com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

runMigration();
