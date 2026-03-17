const fs = require('fs');
const path = require('path');
const pool = require('../../config/database');

/**
 * Script para executar migration do Playlist Manager
 * Cria tabela playlist_servers
 */

async function runMigration() {
  console.log('🚀 Iniciando migration do Playlist Manager...\n');

  try {
    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, 'create-playlist-servers-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executando SQL...');
    console.log('─'.repeat(50));
    console.log(sql);
    console.log('─'.repeat(50));
    console.log('');

    // Executar SQL
    await pool.query(sql);

    console.log('✅ Migration executada com sucesso!');
    console.log('');
    console.log('📊 Tabela criada:');
    console.log('   - playlist_servers (id, name, dns, created_at, updated_at)');
    console.log('');
    console.log('🎉 Playlist Manager pronto para uso!');

  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    console.error('');
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar
runMigration();
