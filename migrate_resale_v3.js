const pool = require('./config/database');

async function runMigration() {
    console.log('Iniciando migração de sub-permissões V3...');
    try {
        await pool.query(`
            -- Dispositivos
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_dispositivos_lista BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_dispositivos_logs BOOLEAN DEFAULT false;
            
            -- Revenda
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_revenda_lista BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_revenda_shop BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_revenda_apps BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_revenda_logs BOOLEAN DEFAULT false;
            
            -- Planos & Receitas
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_planos_lista BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_planos_crm BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_planos_loja BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_planos_apps BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_planos_gateways BOOLEAN DEFAULT false;
            
            -- Gerador de Banners
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_banners_gen BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_banners_themes BOOLEAN DEFAULT false;
            
            -- APIs
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_api_config BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_api_monitor BOOLEAN DEFAULT false;
            
            -- Servidor IPTV
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_iptv_global BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_iptv_mapping BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_iptv_servers BOOLEAN DEFAULT false;
            
            -- Automação WhatsApp
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_whatsapp_bulk BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_whatsapp_flow BOOLEAN DEFAULT false;
            
            -- Tickets
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_tickets_abertos BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_tickets_fechados BOOLEAN DEFAULT false;
            
            -- White Label
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_whitelabel_geral BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_whitelabel_planos BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_whitelabel_aparencia BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS perm_whitelabel_pagamento BOOLEAN DEFAULT false;
        `);
        console.log('Migração V3 concluída com sucesso! 26 novas permissões adicionadas.');
    } catch (err) {
        console.error('Erro na migração:', err);
    } finally {
        await pool.end();
        console.log('Conexão encerrada.');
    }
}

runMigration();
