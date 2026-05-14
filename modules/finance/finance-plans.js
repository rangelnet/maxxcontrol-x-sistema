const express = require('express');
const router = express.Router();
const pool = require('../../config/database');

// ============================================
// AUTO-MIGRAÇÃO DE BANCO DE DADOS (FINANCEIRO & PLANOS)
// ============================================
pool.query(`
    CREATE TABLE IF NOT EXISTS finance_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        duration_days INTEGER NOT NULL,
        max_connections INTEGER NOT NULL,
        qpanel_id INTEGER,
        sigma_package VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    ALTER TABLE finance_plans ADD COLUMN IF NOT EXISTS sigma_package TEXT;
    ALTER TABLE finance_plans ALTER COLUMN sigma_package TYPE TEXT;

    CREATE TABLE IF NOT EXISTS revenue_logs (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER,
        amount NUMERIC(10, 2) NOT NULL,
        client_name VARCHAR(255),
        whatsapp VARCHAR(50),
        payment_method VARCHAR(50) DEFAULT 'PIX',
        status VARCHAR(50) DEFAULT 'pago',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);
    ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'PIX';
    ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pago';

    CREATE TABLE IF NOT EXISTS credit_packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        credit_amount INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        promo_price NUMERIC(10, 2),
        owner_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_activation_packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        duration_days INTEGER DEFAULT 365,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Migração suave caso a tabela já exista com nomes antigos
    ALTER TABLE app_activation_packages RENAME COLUMN app_name TO name;
    ALTER TABLE app_activation_packages RENAME COLUMN yearly_price TO price;
    ALTER TABLE app_activation_packages ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 365;
    ALTER TABLE app_activation_packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE app_activation_packages DROP COLUMN IF EXISTS monthly_price;
    ALTER TABLE app_activation_packages DROP COLUMN IF EXISTS logo_url;

`).then(async () => {
    // Seed default credit packages se a tabela estiver vazia
    const { rows } = await pool.query('SELECT COUNT(*) FROM credit_packages');
    if (parseInt(rows[0].count) === 0) {
        const defaultPackages = [
            { name: 'PACOTE TESTE', credits: 1, price: 1.00, promo_price: 0.50 },
            { name: 'Pacote 10 Créditos', credits: 10, price: 100 },
            { name: 'Pacote 30 Créditos', credits: 30, price: 240 },
            { name: 'Pacote 50 Créditos', credits: 50, price: 350 },
            { name: 'Pacote 100 Créditos', credits: 100, price: 650 },
            { name: 'Pacote 500 Créditos', credits: 500, price: 3000 },
            { name: 'Pacote 1000 Créditos', credits: 1000, price: 5000 }
        ];
        for (let pkg of defaultPackages) {
            await pool.query(
                'INSERT INTO credit_packages (name, credit_amount, price) VALUES ($1, $2, $3)',
                [pkg.name, pkg.credits, pkg.price]
            );
        }
        console.log("Pacotes de créditos padrão (Mocks antigos) inseridos com sucesso no banco de dados.");
    }
}).catch(err => console.error("Erro na migração automática do Módulo Financeiro:", err));

// ============================================
// ENDPOINTS DE PLANOS COMERCIAIS
// ============================================

/**
 * GET /api/finance/plans
 * Lista todos os planos cadastrados
 */
router.get('/plans', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM finance_plans ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar planos financeiros:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * POST /api/finance/plans
 * Cria um novo plano comercial customizado
 */
router.post('/plans', async (req, res) => {
    try {
        const { name, price, duration_days, max_connections, qpanel_id, sigma_package, is_active } = req.body;
        
        if (!name || !price || !duration_days || !max_connections) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios do plano.' });
        }

        const result = await pool.query(
            `INSERT INTO finance_plans (name, price, duration_days, max_connections, qpanel_id, sigma_package, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, price, duration_days, max_connections, qpanel_id || null, sigma_package || null, is_active !== undefined ? is_active : true]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar plano financeiro:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * PUT /api/finance/plans/:id
 * Atualiza um plano comercial existente
 */
router.put('/plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, duration_days, max_connections, qpanel_id, sigma_package, is_active } = req.body;

        if (!name || !price || !duration_days || !max_connections) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
        }

        const result = await pool.query(
            `UPDATE finance_plans 
             SET name = $1, price = $2, duration_days = $3, max_connections = $4, qpanel_id = $5, sigma_package = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $8 RETURNING *`,
            [name, price, duration_days, max_connections, qpanel_id || null, sigma_package || null, is_active !== undefined ? is_active : true, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Plano não encontrado.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar plano financeiro:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * DELETE /api/finance/plans/:id
 * Exclui ou desativa um plano comercial
 */
router.delete('/plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM finance_plans WHERE id = $1', [id]);
        res.json({ success: true, message: 'Plano deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar plano financeiro:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// ============================================
// ENDPOINTS DE RECEITAS (REVENUE)
// ============================================

/**
 * GET /api/finance/revenue/stats
 * Retorna estatísticas de vendas e lucro do mês atual
 */
router.get('/revenue/stats', async (req, res) => {
    try {
        // Busca a soma de receitas do mês atual
        const result = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) AS total_revenue 
            FROM revenue_logs 
            WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        `);
        
        const countResult = await pool.query(`
            SELECT COUNT(*) AS total_sales 
            FROM revenue_logs 
            WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        `);

        res.json({
            total_revenue: parseFloat(result.rows[0].total_revenue),
            total_sales: parseInt(countResult.rows[0].total_sales)
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas de receita:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * POST /api/finance/revenue
 * Registra uma nova venda de plano (Apenas mock para a tela)
 */
router.post('/revenue', async (req, res) => {
    try {
        const { plan_id, amount, client_name, whatsapp, payment_method, status } = req.body;
        
        const result = await pool.query(
            `INSERT INTO revenue_logs (plan_id, amount, client_name, whatsapp, payment_method, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [plan_id, amount, client_name, whatsapp || null, payment_method || 'PIX', status || 'pago']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// ============================================
// ENDPOINTS DO CRM DE VENDAS
// ============================================

/**
 * GET /api/finance/crm
 * Busca o histórico de CRM com detalhes do plano
 */
router.get('/crm', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, p.name as plan_name 
            FROM revenue_logs r
            LEFT JOIN finance_plans p ON r.plan_id = p.id
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar CRM:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * PUT /api/finance/crm/:id
 * Atualiza status ou método de pagamento
 */
router.put('/crm/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_method } = req.body;
        
        const result = await pool.query(
            `UPDATE revenue_logs SET status = $1, payment_method = $2 WHERE id = $3 RETURNING *`,
            [status, payment_method, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar CRM:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * DELETE /api/finance/crm/:id
 * Remove um registro de CRM
 */
router.delete('/crm/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM revenue_logs WHERE id = $1', [id]);
        res.json({ success: true, message: 'Registro deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar CRM:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// ============================================
// ENDPOINTS DA LOJA DE CRÉDITOS
// ============================================

/**
 * GET /api/finance/credit-packages
 * Lista todos os pacotes de crédito configurados
 */
router.get('/credit-packages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM credit_packages ORDER BY credit_amount ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pacotes de crédito:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * POST /api/finance/credit-packages
 * Cria ou edita um pacote de créditos
 */
router.post('/credit-packages', async (req, res) => {
    try {
        const { name, credit_amount, price, promo_price, owner_id, is_active } = req.body;
        
        if (!name || !credit_amount || !price) {
            return res.status(400).json({ error: 'Preencha os campos obrigatórios.' });
        }

        const result = await pool.query(
            `INSERT INTO credit_packages (name, credit_amount, price, promo_price, owner_id, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, credit_amount, price, promo_price || null, owner_id || null, is_active !== undefined ? is_active : true]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar pacote de crédito:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * DELETE /api/finance/credit-packages/:id
 */
router.delete('/credit-packages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM credit_packages WHERE id = $1', [id]);
        res.json({ success: true, message: 'Pacote deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar pacote de crédito:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * PUT /api/finance/credit-packages/:id
 * Edita um pacote de créditos existente
 */
router.put('/credit-packages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, credit_amount, price, promo_price, is_active } = req.body;

        if (!name || !credit_amount || !price) {
            return res.status(400).json({ error: 'Preencha os campos obrigatórios.' });
        }

        const result = await pool.query(
            `UPDATE credit_packages SET name = $1, credit_amount = $2, price = $3, promo_price = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *`,
            [name, credit_amount, price, promo_price || null, is_active !== undefined ? is_active : true, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao editar pacote de crédito:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// ============================================
// ENDPOINTS DE ATIVAÇÃO DE APPS (MAXX PLAYER, ETC)
// ============================================

/**
 * GET /api/finance/app-packages
 * Lista pacotes de ativação de apps
 */
router.get('/app-packages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM app_activation_packages ORDER BY price ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pacotes de apps:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * POST /api/finance/app-packages
 * Cria ou edita um pacote de ativação
 */
router.post('/app-packages', async (req, res) => {
    try {
        const { name, price, duration_days, description, is_active } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ error: 'Preencha o nome e o preço do plano.' });
        }

        const result = await pool.query(
            `INSERT INTO app_activation_packages (name, price, duration_days, description, is_active) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, price, duration_days || 365, description || null, is_active !== undefined ? is_active : true]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar pacote de app:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * DELETE /api/finance/app-packages/:id
 */
router.delete('/app-packages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM app_activation_packages WHERE id = $1', [id]);
        res.json({ success: true, message: 'Pacote de app deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar pacote de app:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * PUT /api/finance/app-packages/:id
 * Edita um pacote de ativação existente
 */
router.put('/app-packages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, duration_days, description, is_active } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ error: 'Preencha os campos obrigatórios.' });
        }

        const result = await pool.query(
            `UPDATE app_activation_packages 
             SET name = $1, price = $2, duration_days = $3, description = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $6 RETURNING *`,
            [name, price, duration_days || 365, description || null, is_active !== undefined ? is_active : true, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Plano não encontrado.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao editar pacote de app:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * GET /api/finance/app-activations
 * Lista todas as ativações de apps (vendas por MAC) realizadas via painel ou web
 */
router.get('/app-activations', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, a.name as package_name,
                   TO_CHAR(t.created_at, 'DD/MM/YYYY HH24:MI') as date_formatted
            FROM mp_transactions t
            LEFT JOIN app_activation_packages a ON t.app_id = a.id
            WHERE t.app_id IS NOT NULL OR t.mac_address IS NOT NULL
            ORDER BY t.created_at DESC
            LIMIT 100
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar histórico de ativações:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

module.exports = router;
