const pool = require('./config/database');

async function migrate() {
  console.log('🚀 Iniciando migração para Supabase/PostgreSQL...');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS plan_mappings (
      id SERIAL PRIMARY KEY,
      plan_id INTEGER NOT NULL UNIQUE,
      config JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    console.log('📝 Criando tabela plan_mappings...');
    await pool.query(sql);
    console.log('✅ Tabela plan_mappings criada ou já existente no Supabase!');
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    await pool.end();
    console.log('👋 Conexão encerrada.');
  }
}

migrate();
