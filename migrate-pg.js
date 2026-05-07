const pool = require('./config/database');

async function migrate() {
  console.log('🐘 Iniciando migração no PostgreSQL...');
  
  const queries = [
    'ALTER TABLE branding_settings ADD COLUMN IF NOT EXISTS tema TEXT DEFAULT \'Neon\'',
    'ALTER TABLE branding_settings ADD COLUMN IF NOT EXISTS button_primary_color TEXT',
    'ALTER TABLE branding_settings ADD COLUMN IF NOT EXISTS button_secondary_color TEXT',
    'ALTER TABLE branding_settings ADD COLUMN IF NOT EXISTS button_text_color TEXT',
    'ALTER TABLE branding_settings ADD COLUMN IF NOT EXISTS button_focus_color TEXT',
    'ALTER TABLE branding_settings ADD COLUMN IF NOT EXISTS platforms TEXT'
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
      console.log(`✅ Executado: ${query}`);
    } catch (err) {
      if (err.code === '42701') { // duplicate_column
        console.log(`ℹ️ Coluna já existe (pulando).`);
      } else {
        console.error(`❌ Erro ao executar "${query}":`, err.message);
      }
    }
  }

  console.log('✨ Migração PostgreSQL concluída!');
  process.exit(0);
}

migrate();
