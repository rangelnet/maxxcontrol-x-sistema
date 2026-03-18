const pool = require('../../config/database');

async function runResaleMigration() {
  try {
    console.log('🚀 Iniciando migração do sistema de revenda...\n');

    // 1. Adicionar colunas na tabela users
    console.log('📝 Adicionando colunas na tabela users...');
    
    const userColumns = [
      { name: 'tipo', sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'usuario'" },
      { name: 'creditos', sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS creditos INTEGER DEFAULT 0" },
      { name: 'plano_revenda', sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS plano_revenda VARCHAR(20) DEFAULT 'bronze'" },
      { name: 'preco_credito', sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS preco_credito DECIMAL(10,2) DEFAULT 0" },
      { name: 'revendedor_id', sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS revendedor_id INTEGER REFERENCES users(id) ON DELETE SET NULL" }
    ];

    for (const col of userColumns) {
      try {
        await pool.query(col.sql);
        console.log(`  ✅ Coluna ${col.name} adicionada`);
      } catch (error) {
        if (error.code === '42701') {
          console.log(`  ⏭️  Coluna ${col.name} já existe`);
        } else {
          console.error(`  ❌ Erro ao adicionar coluna ${col.name}:`, error.message);
        }
      }
    }

    // 2. Criar tabelas
    console.log('\n📝 Criando tabelas...');

    const tables = [
      {
        name: 'creditos_historico',
        sql: `CREATE TABLE IF NOT EXISTS creditos_historico (
          id SERIAL PRIMARY KEY,
          revendedor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          quantidade INTEGER NOT NULL,
          tipo VARCHAR(20) NOT NULL,
          descricao TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'creditos_transacoes',
        sql: `CREATE TABLE IF NOT EXISTS creditos_transacoes (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          revendedor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          quantidade INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'planos_revenda',
        sql: `CREATE TABLE IF NOT EXISTS planos_revenda (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(50) UNIQUE NOT NULL,
          desconto_percentual INTEGER DEFAULT 0,
          creditos_minimos INTEGER DEFAULT 0,
          ativo BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'creditos_alertas',
        sql: `CREATE TABLE IF NOT EXISTS creditos_alertas (
          id SERIAL PRIMARY KEY,
          revendedor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          tipo VARCHAR(50) NOT NULL,
          mensagem TEXT NOT NULL,
          lido BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'revenda_logs',
        sql: `CREATE TABLE IF NOT EXISTS revenda_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          acao VARCHAR(100) NOT NULL,
          detalhes JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      }
    ];

    for (const table of tables) {
      try {
        await pool.query(table.sql);
        console.log(`  ✅ Tabela ${table.name} criada`);
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`  ⏭️  Tabela ${table.name} já existe`);
        } else {
          console.error(`  ❌ Erro ao criar tabela ${table.name}:`, error.message);
        }
      }
    }

    // 3. Inserir planos padrão
    console.log('\n📝 Inserindo planos padrão...');
    
    const planos = [
      { nome: 'bronze', desconto: 0, minimo: 0 },
      { nome: 'prata', desconto: 10, minimo: 100 },
      { nome: 'ouro', desconto: 20, minimo: 500 }
    ];

    for (const plano of planos) {
      try {
        await pool.query(
          `INSERT INTO planos_revenda (nome, desconto_percentual, creditos_minimos) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (nome) DO NOTHING`,
          [plano.nome, plano.desconto, plano.minimo]
        );
        console.log(`  ✅ Plano ${plano.nome} inserido`);
      } catch (error) {
        console.error(`  ❌ Erro ao inserir plano ${plano.nome}:`, error.message);
      }
    }

    // 4. Criar índices
    console.log('\n📝 Criando índices...');

    const indexes = [
      { name: 'idx_creditos_historico_revendedor', sql: 'CREATE INDEX IF NOT EXISTS idx_creditos_historico_revendedor ON creditos_historico(revendedor_id)' },
      { name: 'idx_creditos_transacoes_revendedor', sql: 'CREATE INDEX IF NOT EXISTS idx_creditos_transacoes_revendedor ON creditos_transacoes(revendedor_id)' },
      { name: 'idx_creditos_alertas_revendedor', sql: 'CREATE INDEX IF NOT EXISTS idx_creditos_alertas_revendedor ON creditos_alertas(revendedor_id)' },
      { name: 'idx_revenda_logs_user', sql: 'CREATE INDEX IF NOT EXISTS idx_revenda_logs_user ON revenda_logs(user_id)' },
      { name: 'idx_users_tipo', sql: 'CREATE INDEX IF NOT EXISTS idx_users_tipo ON users(tipo)' },
      { name: 'idx_users_revendedor', sql: 'CREATE INDEX IF NOT EXISTS idx_users_revendedor ON users(revendedor_id)' }
    ];

    for (const index of indexes) {
      try {
        await pool.query(index.sql);
        console.log(`  ✅ Índice ${index.name} criado`);
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`  ⏭️  Índice ${index.name} já existe`);
        } else {
          console.error(`  ❌ Erro ao criar índice ${index.name}:`, error.message);
        }
      }
    }

    // 5. Verificar estrutura criada
    console.log('\n📊 Verificando estrutura criada...\n');

    const tableNames = [
      'creditos_historico',
      'creditos_transacoes',
      'planos_revenda',
      'creditos_alertas',
      'revenda_logs'
    ];

    for (const table of tableNames) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ✅ Tabela ${table}: ${result.rows[0].count} registros`);
      } catch (error) {
        console.log(`  ❌ Tabela ${table}: ${error.message}`);
      }
    }

    // Verificar colunas em users
    try {
      const result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('tipo', 'creditos', 'plano_revenda', 'preco_credito', 'revendedor_id')
        ORDER BY column_name
      `);
      
      console.log(`\n  ✅ Colunas em users: ${result.rows.map(r => r.column_name).join(', ')}`);
    } catch (error) {
      console.log(`  ⚠️  Erro ao verificar colunas: ${error.message}`);
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
