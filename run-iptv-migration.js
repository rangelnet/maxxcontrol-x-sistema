const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Executando migration das tabelas IPTV...\n');
    
    const sqlPath = path.join(__dirname, 'database/migrations/create_iptv_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Tabelas IPTV criadas com sucesso!\n');
    
    // Verificar tabelas criadas
    const tables = await pool.query(`
      SELECT tablename as name FROM pg_tables 
      WHERE schemaname = 'public' AND tablename LIKE '%iptv%'
    `);
    
    console.log('📋 Tabelas criadas:', tables.rows);
    
    // Verificar colunas adicionadas em devices
    const columns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'devices' 
      AND column_name LIKE '%iptv%'
    `);
    
    console.log('\n📊 Colunas IPTV em devices:', columns.rows);
    
    console.log('\n✅ Migration concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
