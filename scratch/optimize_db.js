const pool = require('../config/database');

async function applyIndexes() {
  console.log('🚀 Iniciando otimização de índices...');
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('  - Otimizando tabela [devices]...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_devices_ultimo_acesso ON devices (ultimo_acesso DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_devices_modelo ON devices (modelo)');
    
    console.log('  - Otimizando tabela [qpanel_accounts]...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_qpanel_accounts_group ON qpanel_accounts (username, password)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_qpanel_accounts_panel_id ON qpanel_accounts (panel_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_qpanel_accounts_mac ON qpanel_accounts (device_mac)');
    
    console.log('  - Otimizando tabela [qpanel_servers]...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_qpanel_servers_lookup ON qpanel_servers (panel_id, server_name)');
    
    await client.query('COMMIT');
    console.log('✅ Índices aplicados com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao aplicar índices:', err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

applyIndexes();
