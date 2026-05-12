require('dotenv').config();

// Usar SQLite se PostgreSQL não estiver disponível
const USE_SQLITE = process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL;

if (USE_SQLITE) {
  console.log('📦 Usando SQLite como banco de dados');
  module.exports = require('./database-sqlite');
} else {
  console.log('🐘 Usando PostgreSQL como banco de dados');
  const { Pool } = require('pg');
  
  // Usar DATABASE_URL (connection string completa do Supabase)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 30,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool do banco:', err);
  });

  module.exports = pool;
}
