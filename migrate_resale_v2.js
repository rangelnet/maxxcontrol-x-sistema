const pool = require('./config/database');

async function runMigration() {
    console.log('Iniciando migração de permissões V2...');
    try {
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_carteira BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_planos BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_assinatura BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_chat BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_agentes BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_whatsapp BOOLEAN DEFAULT false;
        `);
        console.log('Migração V2 concluída com sucesso! Novas permissões adicionadas.');
    } catch (err) {
        console.error('Erro na migração:', err);
    } finally {
        await pool.end();
        console.log('Conexão encerrada.');
    }
}

runMigration();
