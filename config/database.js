require('dotenv').config();

// Usar SQLite se PostgreSQL não estiver disponível
const USE_SQLITE = process.env.USE_SQLITE === 'true' || !process.env.DB_PASSWORD;

if (USE_SQLITE) {
  console.log('📦 Usando SQLite como banco de dados');
  module.exports = require('./database-sqlite');
} else {
  console.log('🐘 Usando PostgreSQL como banco de dados');
  const { Pool } = require('pg');
  
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool do banco:', err);
  });

  module.exports = pool;
}
