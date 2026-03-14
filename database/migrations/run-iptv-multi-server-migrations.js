const fs = require('fs');
const path = require('path');
const pool = require('../../config/database');

/**
 * Script para executar migrations do sistema IPTV Multi-Server
 * Executa as migrations em ordem e verifica se já foram aplicadas
 */

const migrations = [
  {
    name: 'add-iptv-multi-server-columns',
    file: 'add-iptv-multi-server-columns.sql',
    description: 'Adiciona colunas IPTV à tabela devices'
  },
  {
    name: 'create-servers-table',
    file: 'create-servers-table.sql',
    description: 'Cria tabela servers para gerenciar servidores IPTV'
  }
];

async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await pool.query(query);
  console.log('✅ Tabela migrations criada/verificada');
}

async function isMigrationExecuted(migrationName) {
  const query = 'SELECT id FROM migrations WHERE name = $1';
  const result = await pool.query(query, [migrationName]);
  return result.rows.length > 0;
}

async function markMigrationAsExecuted(migrationName) {
  const query = 'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING';
  await pool.query(query, [migrationName]);
}

async function executeMigration(migration) {
  const migrationPath = path.join(__dirname, migration.file);
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`❌ Arquivo de migration não encontrado: ${migration.file}`);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`\n📝 Executando migration: ${migration.name}`);
  console.log(`   Descrição: ${migration.description}`);
  
  await pool.query(sql);
  await markMigrationAsExecuted(migration.name);
  
  console.log(`✅ Migration ${migration.name} executada com sucesso`);
}

async function runMigrations() {
  try {
    console.log('🚀 Iniciando execução das migrations IPTV Multi-Server...\n');
    
    // Criar tabela de controle de migrations
    await createMigrationsTable();
    
    let executedCount = 0;
    let skippedCount = 0;
    
    // Executar cada migration
    for (const migration of migrations) {
      const alreadyExecuted = await isMigrationExecuted(migration.name);
      
      if (alreadyExecuted) {
        console.log(`⏭️  Migration ${migration.name} já foi executada anteriormente`);
        skippedCount++;
      } else {
        await executeMigration(migration);
        executedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Processo de migrations concluído!');
    console.log(`   Migrations executadas: ${executedCount}`);
    console.log(`   Migrations puladas: ${skippedCount}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Erro ao executar migrations:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar migrations
runMigrations();
