const pool = require('../config/database');

async function reset() {
    try {
        await pool.query('DELETE FROM tv_categories');
        console.log('✅ Categorias limpas com sucesso. Recarregue o painel para recriar com as oficiais da Web!');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
reset();
