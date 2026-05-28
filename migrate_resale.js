const pool = require('./config/database');

async function runMigration() {
    console.log('Iniciando migração manual...');
    try {
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS telefone VARCHAR(50);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS empresa VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS limite_dispositivos INTEGER DEFAULT 10;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_code VARCHAR(50);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS dns_url VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS test_api_urls JSONB DEFAULT '[]'::jsonb;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_dashboard BOOLEAN DEFAULT true;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_dispositivos BOOLEAN DEFAULT true;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_revenda BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_jogos BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_banners BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_iptv BOOLEAN DEFAULT true;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_plugin BOOLEAN DEFAULT true;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_arvore BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_api BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_branding BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_galeria BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_whitelabel BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_versoes BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_config BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_tickets BOOLEAN DEFAULT true;
        `);
        console.log('Migração concluída com sucesso!');
    } catch (err) {
        console.error('Erro na migração:', err);
    } finally {
        await pool.end();
        console.log('Conexão encerrada.');
    }
}

runMigration();
