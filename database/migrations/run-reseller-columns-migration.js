const fs = require('fs');
const path = require('path');
const pool = require('../../config/database');

async function runMigration() {
  try {
    console.log('🔄 Executando migração de colunas de revendedor...');
    const sql = fs.readFileSync(path.join(__dirname, 'add-reseller-columns.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
