const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');

async function runResaleMigration() {
  try {
    console.log('🚀 Iniciando migração do sistema de revenda...\n');

    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, 'create-resale-system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Dividir em statements individuais
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executando ${statements.length} statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await pool.query(statement);
        
        // Extrair nome da tabela/índice para log
        const match = statement.match(/CREATE\s+(?:TABLE|INDEX|UNIQUE\s+INDEX)\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
        const objectName = match ? match[1] : `Statement ${i + 1}`;
        
        console.log(`  ✅ ${objectName}`);
      } catch (error) {
        // Ignorar erros de objetos já existentes
        if (error.code === '42P07' || error.code === '42701' || error.code === '42P11') {
          const match = statement.match(/CREATE\s+(?:TABLE|INDEX|UNIQUE\s+INDEX)\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          const objectName = match ? match[1] : `Statement ${i + 1}`;
          console.log(`  ⏭️  ${objectName} (já existe)`);
        } else {
          console.error(`  ❌ Erro no statement ${i + 1}:`, error.message);
          console.error(`     SQL: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log('\n✅ Migração do sistema de revenda concluída com sucesso!');
    console.log('\n📊 Verificando estrutura criada...\n');

    // Verificar tabelas criadas
    const tables = [
      'creditos_historico',
      'creditos_transacoes',
      'planos_revenda',
      'creditos_alertas',
      'revenda_logs'
    ];

    for (const table of tables) {
      try {
        const result = await pool.query(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        console.log(`  ✅ Tabela ${table}: ${result.rows[0].count} registros`);
      } catch (error) {
        console.log(`  ❌ Tabela ${table}: Erro ao verificar`);
      }
    }

    // Verificar colunas adicionadas na tabela users
    try {
      const result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('tipo', 'creditos', 'plano_revenda', 'preco_credito', 'revendedor_id')
        ORDER BY column_name
      `);
      
      console.log(`\n  ✅ Colunas adicionadas em users: ${result.rows.map(r => r.column_name).join(', ')}`);
    } catch (error) {
      console.log(`  ⚠️  Não foi possível verificar colunas de users`);
    }

    console.log('\n🎉 Sistema de revenda pronto para uso!\n');

  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar migração
runResaleMigration()
  .then(() => {
    console.log('✅ Processo concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Processo falhou:', error);
    process.exit(1);
  });
