const pool = require('../config/database');

async function checkDevices() {
  try {
    const res = await pool.query('SELECT * FROM devices ORDER BY ultimo_acesso DESC LIMIT 10');
    console.log('--- ÚLTIMOS DISPOSITIVOS REGISTRADOS ---');
    console.table(res.rows);
    
    const count = await pool.query('SELECT COUNT(*) FROM devices');
    console.log('Total de dispositivos no banco:', count.rows[0].count);
    
    process.exit(0);
  } catch (err) {
    console.error('Erro ao acessar o banco:', err);
    process.exit(1);
  }
}

checkDevices();
