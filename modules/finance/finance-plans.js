const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const authMiddleware = require('../../middlewares/auth');


// ============================================
// AUTO-MIGRAÇÃO DE BANCO DE DADOS (FINANCEIRO & PLANOS)
// ============================================
const migrateFinance = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS panel_subscription_packages (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            trial_days INTEGER DEFAULT 7,
            features JSONB DEFAULT '[]'::jsonb,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

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

        ALTER TABLE finance_plans ADD COLUMN IF NOT EXISTS highlight_type VARCHAR(50) DEFAULT 'none';
        ALTER TABLE finance_plans ADD COLUMN IF NOT EXISTS badge_text VARCHAR(50);
        ALTER TABLE finance_plans ADD COLUMN IF NOT EXISTS badge_color VARCHAR(50);
        ALTER TABLE finance_plans ADD COLUMN IF NOT EXISTS border_color VARCHAR(50);
        ALTER TABLE finance_plans ADD COLUMN IF NOT EXISTS button_color VARCHAR(50);
        ALTER TABLE finance_plans ADD COLUMN IF NOT EXISTS glow_color VARCHAR(50);
        ALTER TABLE finance_plans ADD COLUMN IF NOT EXISTS is_carousel_highlight BOOLEAN DEFAULT false;
        ALTER TABLE finance_plans ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

        CREATE TABLE IF NOT EXISTS revenue_logs (
            id SERIAL PRIMARY KEY,
            plan_id INTEGER,
            amount NUMERIC(10, 2) NOT NULL,
            client_name VARCHAR(255),
            whatsapp VARCHAR(50),
            payment_method VARCHAR(50) DEFAULT 'PIX',
            status VARCHAR(50) DEFAULT 'pago',
            app_mac_address VARCHAR(50),
            app_username VARCHAR(255),
            app_password VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'PIX';
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pago';
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS mp_payment_id VARCHAR(255);
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_user_id VARCHAR(255);
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_user_status VARCHAR(50);
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_mac_address VARCHAR(50);
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_username VARCHAR(255);
        ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS app_password VARCHAR(255);

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
            trial_hours INTEGER DEFAULT 24,
            description TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Migração suave caso a tabela já exista com nomes antigos
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_activation_packages' AND column_name = 'app_name') THEN
            ALTER TABLE app_activation_packages RENAME COLUMN app_name TO name;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_activation_packages' AND column_name = 'yearly_price') THEN
            ALTER TABLE app_activation_packages RENAME COLUMN yearly_price TO price;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_activation_packages' AND column_name = 'monthly_price') THEN
            ALTER TABLE app_activation_packages DROP COLUMN monthly_price;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_activation_packages' AND column_name = 'logo_url') THEN
            ALTER TABLE app_activation_packages DROP COLUMN logo_url;
          END IF;
        END $$;

        ALTER TABLE app_activation_packages ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 365;
        ALTER TABLE app_activation_packages ADD COLUMN IF NOT EXISTS trial_hours INTEGER DEFAULT 24;
        ALTER TABLE app_activation_packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

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
    // Seed default panel subscription packages se a tabela estiver vazia
    const { rows: panelPlans } = await pool.query('SELECT COUNT(*) FROM panel_subscription_packages');
    if (parseInt(panelPlans[0].count) === 0) {
        const defaultSaaSPlans = [
            {
                name: 'PLANO ESSENCIAL',
                price: 29.90,
                trial_days: 7,
                features: ['dashboard', 'devices', 'tickets', 'settings', 'finance-plans', 'crm', 'credit-store', 'iptv-server', 'profile-screens'],
                is_active: true
            },
            {
                name: 'PLANO PROFISSIONAL',
                price: 59.90,
                trial_days: 7,
                features: ['dashboard', 'devices', 'tickets', 'versions', 'settings', 'finance-plans', 'crm', 'credit-store', 'iptv-server', 'branding', 'profile-screens', 'tv-manager', 'sports-manager', 'whatsapp-auto', 'banner-generator'],
                is_active: true
            },
            {
                name: 'PLANO ELITE',
                price: 99.90,
                trial_days: 7,
                features: ['dashboard', 'devices', 'tickets', 'versions', 'settings', 'finance-plans', 'crm', 'credit-store', 'iptv-server', 'branding', 'profile-screens', 'tv-manager', 'sports-manager', 'whatsapp-auto', 'banner-generator', 'livechat', 'white-label', 'agents', 'servers-management', 'playlist-manager', 'game-schedule'],
                is_active: true
            }
        ];
        for (let pkg of defaultSaaSPlans) {
            await pool.query(
                `INSERT INTO panel_subscription_packages (name, price, trial_days, features, is_active) VALUES ($1, $2, $3, $4::jsonb, $5)`,
                [pkg.name, pkg.price, pkg.trial_days, JSON.stringify(pkg.features), pkg.is_active]
            );
        }
        console.log("Pacotes de assinatura SaaS padrão inseridos com sucesso no banco de dados.");
    }

    console.log('  ✅ Migração automática do Módulo Financeiro OK');
  } catch (err) {
    console.error("Erro na migração automática do Módulo Financeiro:", err);
  }
};


// ============================================
// ENDPOINTS DE PLANOS COMERCIAIS
// ============================================

/**
 * GET /api/finance/plans
 * Lista todos os planos cadastrados
 */
router.get('/plans', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM finance_plans ORDER BY display_order ASC, created_at DESC');
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
        const { 
            name, price, duration_days, max_connections, qpanel_id, sigma_package, is_active,
            highlight_type, badge_text, badge_color, border_color, button_color, glow_color, is_carousel_highlight, display_order 
        } = req.body;

        if (!name || !price || !duration_days || !max_connections) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios do plano.' });
        }

        const result = await pool.query(
            `INSERT INTO finance_plans (
                name, price, duration_days, max_connections, qpanel_id, sigma_package, is_active,
                highlight_type, badge_text, badge_color, border_color, button_color, glow_color, is_carousel_highlight, display_order
             ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [
                name, price, duration_days, max_connections, qpanel_id || null, sigma_package || null, is_active !== undefined ? is_active : true,
                highlight_type || 'none', badge_text || null, badge_color || null, border_color || null, button_color || null, glow_color || null, is_carousel_highlight || false, display_order || 0
            ]
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
        const { 
            name, price, duration_days, max_connections, qpanel_id, sigma_package, is_active,
            highlight_type, badge_text, badge_color, border_color, button_color, glow_color, is_carousel_highlight, display_order 
        } = req.body;

        if (!name || !price || !duration_days || !max_connections) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
        }

        const result = await pool.query(
            `UPDATE finance_plans 
             SET name = $1, price = $2, duration_days = $3, max_connections = $4, qpanel_id = $5, sigma_package = $6, is_active = $7, 
                 highlight_type = $8, badge_text = $9, badge_color = $10, border_color = $11, button_color = $12, glow_color = $13, is_carousel_highlight = $14, display_order = $15, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $16 RETURNING *`,
            [
                name, price, duration_days, max_connections, qpanel_id || null, sigma_package || null, is_active !== undefined ? is_active : true,
                highlight_type || 'none', badge_text || null, badge_color || null, border_color || null, button_color || null, glow_color || null, is_carousel_highlight || false, display_order || 0,
                id
            ]
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
        const { plan_id, amount, client_name, whatsapp, payment_method, status, app_mac_address, app_username, app_password } = req.body;

        const result = await pool.query(
            `INSERT INTO revenue_logs (plan_id, amount, client_name, whatsapp, payment_method, status, app_mac_address, app_username, app_password) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [plan_id, amount, client_name, whatsapp || null, payment_method || 'PIX', status || 'pago', app_mac_address || null, app_username || null, app_password || null]
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
        const { name, price, duration_days, trial_hours, description, is_active } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Preencha o nome e o preço do plano.' });
        }

        const result = await pool.query(
            `INSERT INTO app_activation_packages (name, price, duration_days, trial_hours, description, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                name,
                price,
                duration_days || 365,
                trial_hours || 24,
                description || null,
                is_active !== undefined ? is_active : true
            ]
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
        const { name, price, duration_days, trial_hours, description, is_active } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Preencha os campos obrigatórios.' });
        }

        const result = await pool.query(
            `UPDATE app_activation_packages 
             SET name = $1, price = $2, duration_days = $3, trial_hours = $4, description = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $7 RETURNING *`,
            [
                name,
                price,
                duration_days || 365,
                trial_hours || 24,
                description || null,
                is_active !== undefined ? is_active : true,
                id
            ]
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

// ============================================
// ENDPOINTS DE ASSINATURAS DO PAINEL (SaaS)
// ============================================

/**
 * GET /api/finance/panel-plans
 * Lista pacotes de assinatura do painel SaaS
 */
router.get('/panel-plans', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM panel_subscription_packages ORDER BY price ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pacotes de assinatura do painel:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * POST /api/finance/panel-plans
 * Cria ou edita um pacote de assinatura do painel SaaS
 */
router.post('/panel-plans', async (req, res) => {
    try {
        const { name, price, trial_days, features, is_active } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ error: 'Preencha o nome e o preço do plano.' });
        }

        const result = await pool.query(
            `INSERT INTO panel_subscription_packages (name, price, trial_days, features, is_active) 
             VALUES ($1, $2, $3, $4::jsonb, $5) RETURNING *`,
            [name, price, trial_days || 7, JSON.stringify(features || []), is_active !== undefined ? is_active : true]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar pacote de assinatura do painel:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * PUT /api/finance/panel-plans/:id
 * Edita um pacote de assinatura do painel SaaS
 */
router.put('/panel-plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, trial_days, features, is_active } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ error: 'Preencha os campos obrigatórios.' });
        }

        const result = await pool.query(
            `UPDATE panel_subscription_packages 
             SET name = $1, price = $2, trial_days = $3, features = $4::jsonb, is_active = $5, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $6 RETURNING *`,
            [name, price, trial_days || 7, JSON.stringify(features || []), is_active !== undefined ? is_active : true, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Plano não encontrado.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao editar pacote de assinatura do painel:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * DELETE /api/finance/panel-plans/:id
 */
router.delete('/panel-plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM panel_subscription_packages WHERE id = $1', [id]);
        res.json({ success: true, message: 'Pacote de assinatura deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar pacote de assinatura:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

/**
 * POST /api/finance/subscribe-panel-plan
 * Assina ou renova um plano de assinatura do painel SaaS para o usuário logado
 */
router.post('/subscribe-panel-plan', authMiddleware, async (req, res) => {
    try {
        const { panel_plan_id, payment_method } = req.body;
        const userId = req.userId;

        if (!panel_plan_id) {
            return res.status(400).json({ error: 'ID do plano não informado.' });
        }

        // Buscar plano no banco
        const planRes = await pool.query('SELECT * FROM panel_subscription_packages WHERE id = $1', [panel_plan_id]);
        if (planRes.rows.length === 0) {
            return res.status(404).json({ error: 'Plano SaaS não encontrado.' });
        }
        const plan = planRes.rows[0];

        // Buscar dados do usuário atual
        const userRes = await pool.query('SELECT nome, email, telefone FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        const user = userRes.rows[0];

        // Mapear features do plano para colunas de permissão do usuário
        const features = plan.features || [];
        const updatePerms = {
            perm_dashboard: features.includes('dashboard'),
            perm_dispositivos: features.includes('devices'),
            perm_revenda: features.includes('finance-plans'),
            perm_jogos: features.includes('game-schedule'),
            perm_banners: features.includes('banner-generator'),
            perm_iptv: features.includes('iptv-server'),
            perm_plugin: features.includes('iptv-plugin') || features.includes('iptv-server'),
            perm_arvore: features.includes('iptv-tree') || features.includes('iptv-server'),
            perm_api: features.includes('api-config') || features.includes('dashboard'),
            perm_branding: features.includes('branding'),
            perm_galeria: features.includes('gallery') || features.includes('branding'),
            perm_whitelabel: features.includes('white-label'),
            perm_versoes: features.includes('versions') || features.includes('settings'),
            perm_config: features.includes('settings'),
            perm_tickets: features.includes('tickets') || features.includes('livechat')
        };

        // Atualizar plano, vencimento e todas as permissões dinâmicas do revendedor
        const updatedUserRes = await pool.query(
            `UPDATE users 
             SET plano = $1, 
                 expires_at = NOW() + INTERVAL '30 days',
                 perm_dashboard = $3,
                 perm_dispositivos = $4,
                 perm_revenda = $5,
                 perm_jogos = $6,
                 perm_banners = $7,
                 perm_iptv = $8,
                 perm_plugin = $9,
                 perm_arvore = $10,
                 perm_api = $11,
                 perm_branding = $12,
                 perm_galeria = $13,
                 perm_whitelabel = $14,
                 perm_versoes = $15,
                 perm_config = $16,
                 perm_tickets = $17
             WHERE id = $2
             RETURNING *`,
            [
                plan.name, 
                userId,
                updatePerms.perm_dashboard,
                updatePerms.perm_dispositivos,
                updatePerms.perm_revenda,
                updatePerms.perm_jogos,
                updatePerms.perm_banners,
                updatePerms.perm_iptv,
                updatePerms.perm_plugin,
                updatePerms.perm_arvore,
                updatePerms.perm_api,
                updatePerms.perm_branding,
                updatePerms.perm_galeria,
                updatePerms.perm_whitelabel,
                updatePerms.perm_versoes,
                updatePerms.perm_config,
                updatePerms.perm_tickets
            ]
        );
        const updatedUser = updatedUserRes.rows[0];

        // Registrar a receita em revenue_logs para faturamento
        const appMacAddress = req.body.app_mac_address || null;
        await pool.query(
            `INSERT INTO revenue_logs (plan_id, amount, client_name, whatsapp, payment_method, status, app_mac_address, app_username, app_password) 
             VALUES ($1, $2, $3, $4, $5, 'pago', $6, $7, $8)`,
            [null, plan.price, user.nome, user.telefone || null, payment_method || 'PIX', appMacAddress, null, null]
        );

        // Registrar também em mp_transactions (opcional, histórico)
        await pool.query(
            `INSERT INTO mp_transactions (payment_id, reseller_id, package_id, credits, amount, status, type) 
             VALUES ($1, $2, $3, $4, $5, 'approved', 'manual')`,
            [`SUB_${Date.now()}`, userId, null, 0, plan.price]
        );

        res.json({
            success: true,
            message: `Plano ${plan.name} ativado com sucesso!`,
            plano: plan.name,
            expires_at: updatedUser.expires_at,
            user: {
                plano: updatedUser.plano,
                expires_at: updatedUser.expires_at,
                perm_dashboard: updatedUser.perm_dashboard,
                perm_dispositivos: updatedUser.perm_dispositivos,
                perm_revenda: updatedUser.perm_revenda,
                perm_jogos: updatedUser.perm_jogos,
                perm_banners: updatedUser.perm_banners,
                perm_iptv: updatedUser.perm_iptv,
                perm_plugin: updatedUser.perm_plugin,
                perm_arvore: updatedUser.perm_arvore,
                perm_api: updatedUser.perm_api,
                perm_branding: updatedUser.perm_branding,
                perm_galeria: updatedUser.perm_galeria,
                perm_whitelabel: updatedUser.perm_whitelabel,
                perm_versoes: updatedUser.perm_versoes,
                perm_config: updatedUser.perm_config,
                perm_tickets: updatedUser.perm_tickets
            }
        });

    } catch (error) {
        console.error('Erro ao assinar plano SaaS:', error);
        res.status(500).json({ error: 'Erro interno ao processar assinatura.' });
    }
});
// GET /extract - Retorna o histórico de transações de créditos do revendedor (Carteira)
router.get('/extract', authMiddleware, async (req, res) => {
    try {
        const resellerId = req.user.id;
        
        const userRes = await pool.query('SELECT tipo, plano_revenda, creditos FROM users WHERE id = $1', [resellerId]);
        const user = userRes.rows.length > 0 ? userRes.rows[0] : null;

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const isUnlimited = user.plano_revenda && user.plano_revenda.toLowerCase().includes('ilimitado');
        const isMaster = user.tipo === 'admin';
        const isMasterOrUnlimited = isMaster || isUnlimited;

        let transactionsRes;
        
        if (isMasterOrUnlimited) {
            // Master vê as transações globais, especialmente os créditos manuais enviados (type = 'manual')
            // Pode fazer JOIN com users para mostrar o nome da revenda
            transactionsRes = await pool.query(
                `SELECT t.*, u.nome as reseller_name 
                 FROM mp_transactions t
                 LEFT JOIN users u ON t.reseller_id = u.id
                 ORDER BY t.created_at DESC 
                 LIMIT 100`
            );
        } else {
            // Revendedor comum vê apenas suas transações
            transactionsRes = await pool.query(
                `SELECT * FROM mp_transactions 
                 WHERE reseller_id = $1 
                 ORDER BY created_at DESC 
                 LIMIT 100`,
                [resellerId]
            );
        }

        const currentCredits = isMasterOrUnlimited ? 'Ilimitado' : user.creditos;

        res.json({
            success: true,
            saldo: currentCredits,
            transactions: transactionsRes.rows
        });
    } catch (error) {
        console.error('Erro ao buscar extrato:', error);
        res.status(500).json({ error: 'Erro ao buscar extrato de créditos.' });
    }
});

router.migrateFinance = migrateFinance;
// ============================================
// HISTÓRICO FINANCEIRO (CRM & RECEITAS)
// ============================================
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;

    let mpWhere = [];
    let revWhere = [];
    let params = [];

    if (req.userTipo === 'revendedor') {
      params.push(req.userId);
      mpWhere.push(`reseller_id = $${params.length}`);
      revWhere.push(`1 = 0`); // Revendedor não vê log global
    }

    if (month && year) {
      params.push(month, year);
      mpWhere.push(`EXTRACT(MONTH FROM created_at) = $${params.length - 1}`);
      mpWhere.push(`EXTRACT(YEAR FROM created_at) = $${params.length}`);
      revWhere.push(`EXTRACT(MONTH FROM created_at) = $${params.length - 1}`);
      revWhere.push(`EXTRACT(YEAR FROM created_at) = $${params.length}`);
    }

    let mpQuery = `SELECT 'Mercado Pago' as source, id, amount, status, created_at, 'Venda Automática' as client_name, type as details FROM mp_transactions`;
    let revQuery = `SELECT 'Manual' as source, id, amount, status, created_at, client_name, payment_method as details FROM revenue_logs`;

    if (mpWhere.length > 0) mpQuery += ` WHERE ` + mpWhere.join(' AND ');
    if (revWhere.length > 0) revQuery += ` WHERE ` + revWhere.join(' AND ');

    const [mpRes, revRes] = await Promise.all([
      pool.query(mpQuery, params),
      pool.query(revQuery, params)
    ]);

    const history = [...mpRes.rows, ...revRes.rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico financeiro:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico financeiro' });
  }
});

module.exports = router;
