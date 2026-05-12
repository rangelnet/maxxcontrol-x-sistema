const pool = require('./config/database');

async function test() {
  try {
    console.log('📱 Testando listAllDevices...');
    const result = await pool.query(`
      SELECT 
        d.*,
        u.email
      FROM devices d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.modelo != 'Web Browser' OR d.modelo IS NULL
      ORDER BY d.ultimo_acesso DESC
    `);
    console.log(`✅ Encontrados ${result.rows.length} dispositivos`);
    console.log(result.rows.map(d => ({ id: d.id, modelo: d.modelo, mac: d.mac_address })));

    console.log('\n👥 Testando qpanel-grouped-accounts...');
    const clientsResult = await pool.query(`
      SELECT 
        a.username,
        a.password,
        json_agg(
          json_build_object(
            'id', a.id,
            'status', a.status
          )
        ) as accounts
      FROM qpanel_accounts a
      GROUP BY a.username, a.password
    `);
    console.log(`✅ Encontrados ${clientsResult.rows.length} grupos de contas`);
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Erro no teste:', e);
    process.exit(1);
  }
}

test();
