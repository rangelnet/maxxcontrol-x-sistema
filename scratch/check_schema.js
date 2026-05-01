const pool = require('./config/database');

async function checkSchema() {
  try {
    console.log('🔍 Verificando esquema da tabela qpanel_panels...');
    const res = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'qpanel_panels';
    `);
    console.log('Colunas:', res.rows);

    const constraints = await pool.query(`
      SELECT 
        conname as constraint_name, 
        contype as constraint_type 
      FROM 
        pg_constraint 
      WHERE 
        conrelid = 'qpanel_panels'::regclass;
    `);
    console.log('Restrições:', constraints.rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

checkSchema();
