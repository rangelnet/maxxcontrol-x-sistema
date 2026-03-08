const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar configurados no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBannersTable() {
  console.log('🚀 Iniciando criação da tabela banners...');
  
  try {
    // Executar SQL para criar a tabela
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Criar tabela banners
        CREATE TABLE IF NOT EXISTS banners (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          template VARCHAR(50),
          image_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Criar índices
        CREATE INDEX IF NOT EXISTS idx_banners_type ON banners(type);
        CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at DESC);
      `
    });

    if (error) {
      console.error('❌ Erro ao criar tabela:', error);
      console.log('\n📝 Execute manualmente no SQL Editor do Supabase:');
      console.log('https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/sql/new');
      console.log('\nSQL:');
      console.log(`
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  template VARCHAR(50),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banners_type ON banners(type);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at DESC);
      `);
      process.exit(1);
    }

    console.log('✅ Tabela banners criada com sucesso!');
    console.log('✅ Índices criados com sucesso!');
    
    // Verificar se a tabela foi criada
    const { data: tables, error: checkError } = await supabase
      .from('banners')
      .select('*')
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      console.warn('⚠️ Aviso ao verificar tabela:', checkError.message);
    } else {
      console.log('✅ Tabela banners está acessível!');
    }

    console.log('\n🎉 Migration concluída com sucesso!');
    console.log('🌐 Teste agora: https://maxxcontrol-x-sistema.onrender.com/banners');
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    process.exit(1);
  }
}

createBannersTable();
