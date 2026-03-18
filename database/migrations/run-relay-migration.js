const fs = require('fs');
const path = require('path');
const pool = require('../../config/database');

async function runMigration() {
  console.log('🚀 Executando migration: create-relay-commands-table...');
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'create-relay-commands-table.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Tabela plugin_relay_commands criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migration:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
