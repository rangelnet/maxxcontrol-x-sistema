const pool = require('../config/database');

async function fix() {
  try {
    console.log('🛠️ Iniciando correção forçada...');
    
    // 1. Corrigir URL do App (valor deve ser JSON válido, então a string precisa de aspas extras)
    await pool.query(`
      INSERT INTO global_settings (key, value) 
      VALUES ('player_app_url', '"https://maxxplayer.app"') 
      ON CONFLICT (key) DO UPDATE SET value = '"https://maxxplayer.app"'
    `);
    console.log('✅ URL do App configurada como https://maxxplayer.app');

    // 2. Adicionar coluna updated_at se não existir
    await pool.query("ALTER TABLE app_activation_packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    console.log('✅ Coluna updated_at garantida na tabela app_activation_packages');

    // 3. Garantir que os pacotes estão ativos
    const res = await pool.query("UPDATE app_activation_packages SET is_active = true RETURNING id");
    console.log(`✅ ${res.rowCount} pacotes de ativação foram marcados como ativos.`);

    // 3. Verificar se existe algum problema de visibilidade (is_active)
    const all = await pool.query("SELECT * FROM app_activation_packages");
    console.log('📦 Planos atuais no banco:');
    console.table(all.rows);

    process.exit(0);
  } catch (e) {
    console.error('❌ Erro na correção:', e);
    process.exit(1);
  }
}

fix();
