const fs = require('fs');
const path = require('path');
const pool = require('../../config/database');

/**
 * Script para executar migração das tabelas do Plugin IPTV Unificado
 */

async function runMigration() {
  try {
    console.log('🚀 Iniciando migração do Plugin IPTV Unificado...');
    
    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, 'create-iptv-plugin-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar SQL
    await pool.query(sqlContent);
    
    console.log('✅ Migração executada com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('   - iptv_servers');
    console.log('   - iptv_playlists');
    console.log('   - device_iptv_sync');
    console.log('   - Índices de performance');
    
    // Verificar se as tabelas foram criadas
    const checkTables = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('iptv_servers', 'iptv_playlists', 'device_iptv_sync')
      AND table_schema = 'public'
    `;
    
    const result = await pool.query(checkTables);
    console.log(`\n🔍 Verificação: ${result.rows.length} tabelas encontradas`);
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

// Executar migração
runMigration();