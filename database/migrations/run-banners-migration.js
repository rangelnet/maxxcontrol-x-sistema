const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');

async function runBannersMigration() {
  try {
    console.log('🔄 Executando migration da tabela banners...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'create_banners_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar a migration
    await pool.query(sql);
    
    console.log('✅ Migration executada com sucesso!');
    console.log('📋 Tabela banners criada/verificada');
    
    // Verificar se a tabela foi criada
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'banners'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Tabela banners confirmada no banco de dados');
    } else {
      console.log('⚠️ Tabela banners não encontrada após migration');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

runBannersMigration();
