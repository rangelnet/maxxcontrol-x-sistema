const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credenciais do Supabase
const SUPABASE_URL = 'https://mmfbirjrhrhobbnzfffe.supabase.co';
const SUPABASE_SERVICE_KEY = 'sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0';

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigrations() {
  console.log('🚀 Iniciando aplicação de migrações...\n');
  
  const migrationsDir = path.join(__dirname, 'database', 'migrations');
  
  // Ler todos os arquivos SQL
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ordem alfabética
  
  console.log(`📁 Encontradas ${files.length} migrações:\n`);
  
  for (const file of files) {
    console.log(`📄 Aplicando: ${file}`);
    
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      // Executar SQL diretamente via RPC
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error(`   ❌ Erro: ${error.message}`);
        
        // Tentar método alternativo: query direto
        console.log(`   🔄 Tentando método alternativo...`);
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ sql_query: sql })
        });
        
        if (response.ok) {
          console.log(`   ✅ Aplicada com sucesso (método alternativo)`);
        } else {
          console.error(`   ❌ Falhou também no método alternativo`);
        }
      } else {
        console.log(`   ✅ Aplicada com sucesso`);
      }
    } catch (err) {
      console.error(`   ❌ Erro ao aplicar: ${err.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎉 Processo concluído!\n');
  console.log('⚠️  NOTA: Algumas migrações podem ter falhado se as tabelas já existirem.');
  console.log('   Isso é normal. Verifique no Supabase se as tabelas foram criadas.\n');
}

// Executar
applyMigrations().catch(console.error);
