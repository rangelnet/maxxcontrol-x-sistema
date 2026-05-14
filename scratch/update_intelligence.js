const pool = require('../config/database');

async function applyIntelligence() {
    console.log('🐘 Conectando ao banco de dados...');
    try {
        // Adicionar colunas caso a tabela já exista
        await pool.query(`
            ALTER TABLE tv_categories 
            ADD COLUMN IF NOT EXISTS keywords JSONB DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS exclude_keywords JSONB DEFAULT '[]'
        `);
        console.log('✅ Colunas de inteligência (keywords/exclude_keywords) garantidas.');

        // Deletar categorias existentes e limpar os canais para testarmos a importação do zero
        await pool.query('DELETE FROM tv_channels');
        await pool.query('DELETE FROM tv_categories');
        
        console.log('✅ Banco limpo. O painel vai recriar as categorias (com as novas regras de inteligência) ao ser carregado!');
    } catch (e) {
        console.error('❌ Erro na atualização:', e.message);
    } finally {
        process.exit(0);
    }
}

applyIntelligence();
