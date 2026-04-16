require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    await pool.query(`ALTER TABLE qpanel_accounts ADD COLUMN IF NOT EXISTS expire_date VARCHAR(50)`);
    console.log("Coluna expire_date adicionada com sucesso!");
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    pool.end();
  }
}
run();
