const pool = require('../config/database');

async function setup() {
  console.log('🚀 Iniciando script de configuração de banco de dados...');
  const IGNORE_CODES = ['42P07', '42701', '42P11', '42710'];

  try {
    // 1. Verificar conexão
    const now = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco OK:', now.rows[0].now);

    // 2. Criar Tabelas Estratégicas
    const tables = [
      {
        name: 'device_commands',
        sql: `CREATE TABLE IF NOT EXISTS device_commands (
          id SERIAL PRIMARY KEY,
          device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
          command_type VARCHAR(50) NOT NULL,
          command_data JSONB DEFAULT '{}',
          status VARCHAR(20) DEFAULT 'pending',
          result JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP
        )`
      },
      {
        name: 'device_apps',
        sql: `CREATE TABLE IF NOT EXISTS device_apps (
          id SERIAL PRIMARY KEY,
          device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
          package_name VARCHAR(255) NOT NULL,
          app_name VARCHAR(255) NOT NULL,
          version_code INTEGER,
          version_name VARCHAR(100),
          is_system BOOLEAN DEFAULT false,
          installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(device_id, package_name)
        )`
      },
      {
        name: 'app_activation_packages',
        sql: `CREATE TABLE IF NOT EXISTS app_activation_packages (
          id SERIAL PRIMARY KEY,
          app_name VARCHAR(100) NOT NULL UNIQUE,
          logo_url TEXT,
          monthly_price DECIMAL(10, 2) NOT NULL,
          yearly_price DECIMAL(10, 2) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      }
    ];

    for (const table of tables) {
      try {
        await pool.query(table.sql);
        console.log(`  ✅ Tabela ${table.name} verificada/criada.`);
      } catch (err) {
        if (!IGNORE_CODES.includes(err.code)) {
          console.error(`  ❌ Erro ao criar ${table.name}:`, err.message);
        } else {
          console.log(`  ℹ️ Tabela ${table.name} já existe.`);
        }
      }
    }

    // 3. Garantir UNIQUE em app_activation_packages
    try {
      await pool.query(`ALTER TABLE app_activation_packages ADD CONSTRAINT app_activation_packages_app_name_key UNIQUE (app_name)`);
      console.log('  ✅ Restrição UNIQUE adicionada a app_activation_packages.');
    } catch (err) {
      // Ignorar se já existe
    }

    // 4. Inserir dados iniciais
    console.log('📦 Inserindo dados iniciais...');
    await pool.query(`
      INSERT INTO app_activation_packages (app_name, logo_url, monthly_price, yearly_price, description)
      VALUES 
      ('MAXX PLAYER PRO', 'https://tvmaxx.pro/logo.png', 14.90, 119.00, 'Ativação oficial para TV Box e Android TV.'),
      ('SMARTONE IPTV', 'https://smartone-iptv.com/favicon.ico', 19.90, 149.00, 'Ativação vitalícia ou anual.'),
      ('IBO PLAYER', 'https://iboplayer.com/favicon.ico', 24.90, 189.00, 'Ativação anual premium.')
      ON CONFLICT (app_name) DO NOTHING
    `);
    console.log('  ✅ Dados iniciais de pacotes OK.');

    console.log('⭐ Configuração concluída com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('💥 Erro fatal no setup:', err.message);
    process.exit(1);
  }
}

setup();
