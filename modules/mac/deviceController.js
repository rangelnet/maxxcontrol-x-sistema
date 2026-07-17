const pool = require('../../config/database');
const crypto = require('crypto');

/**
 * Gera uma chave aleatória para o dispositivo
 */
const generateDeviceKey = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // Ex: A1B2C3D4
};

/**
 * Login de Dispositivo (MAC + Key)
 */
exports.deviceLogin = async (req, res) => {
    const { mac_address, device_key } = req.body;
    
    if (!mac_address) return res.status(400).json({ error: 'MAC Address é obrigatório' });

    try {
        // Verificar se o dispositivo já tem uma chave
        let result = await pool.query('SELECT * FROM device_keys WHERE mac_address = $1', [mac_address]);
        
        if (result.rows.length === 0) {
            // Se não tem chave, mas está ativado (tem transação approved), gera uma
            const activation = await pool.query(
                "SELECT * FROM mp_transactions WHERE mac_address = $1 AND status = 'approved' LIMIT 1",
                [mac_address]
            );

            if (activation.rows.length > 0) {
                const newKey = generateDeviceKey();
                await pool.query(
                    'INSERT INTO device_keys (mac_address, device_key) VALUES ($1, $2)',
                    [mac_address, newKey]
                );
                return res.json({ mac_address, device_key: newKey, first_login: true });
            } else {
                return res.status(401).json({ error: 'Dispositivo não ativado. Ative primeiro para gerar sua chave.' });
            }
        }

        const device = result.rows[0];
        if (device_key && device.device_key !== device_key.toUpperCase()) {
            return res.status(401).json({ error: 'Chave de acesso incorreta.' });
        }

        res.json({ mac_address: device.mac_address, device_key: device.device_key });

    } catch (error) {
        console.error('❌ Erro no login do dispositivo:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Listar Playlists do Dispositivo
 */
exports.getPlaylists = async (req, res) => {
    const { mac } = req.params;
    try {
        const result = await pool.query('SELECT * FROM device_playlists WHERE mac_address = $1 ORDER BY id DESC', [mac]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar playlists' });
    }
};

/**
 * Adicionar/Atualizar Playlist
 */
exports.savePlaylist = async (req, res) => {
    const { mac_address, name, type, content } = req.body;
    try {
        const query = `
            INSERT INTO device_playlists (mac_address, name, type, content)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE SET name = $2, type = $3, content = $4, updated_at = NOW()
            RETURNING *
        `;
        const result = await pool.query(query, [mac_address, name, type, content]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar playlist' });
    }
};

/**
 * Migrar Licença (MAC Swap)
 */
exports.migrateLicense = async (req, res) => {
    const { old_mac, new_mac, device_key } = req.body;
    
    try {
        // 1. Validar chave do MAC antigo
        const keyCheck = await pool.query('SELECT * FROM device_keys WHERE mac_address = $1 AND device_key = $2', [old_mac, device_key]);
        if (keyCheck.rows.length === 0) return res.status(401).json({ error: 'Chave de migração inválida para o MAC antigo.' });

        // 2. Transferir transações aprovadas
        await pool.query('UPDATE mp_transactions SET mac_address = $1 WHERE mac_address = $2', [new_mac, old_mac]);
        
        // 3. Transferir Playlists
        await pool.query('UPDATE device_playlists SET mac_address = $1 WHERE mac_address = $2', [new_mac, old_mac]);

        // 4. Atualizar Chave (O novo MAC assume a chave ou gera uma nova)
        await pool.query('DELETE FROM device_keys WHERE mac_address = $1', [old_mac]);
        await pool.query('INSERT INTO device_keys (mac_address, device_key) VALUES ($1, $2) ON CONFLICT (mac_address) DO UPDATE SET device_key = $2', [new_mac, device_key]);

        res.json({ success: true, message: 'Licença migrada com sucesso para o novo MAC!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro na migração de licença' });
    }
};

/**
 * Atualizar DNS do Dispositivo
 */
exports.updateDNS = async (req, res) => {
    const { mac_address, dns_url } = req.body;
    try {
        await pool.query(
            'INSERT INTO device_configs (mac_address, dns_url) VALUES ($1, $2) ON CONFLICT (mac_address) DO UPDATE SET dns_url = $2, updated_at = NOW()',
            [mac_address, dns_url]
        );
        res.json({ success: true, message: 'DNS atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar DNS' });
    }
};

/**
 * Gerar Código de Acesso (para o app na TV)
 */
exports.generateCode = async (req, res) => {
    const { mac_address } = req.params;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    try {
        await pool.query(
            'INSERT INTO device_codes (code, mac_address, expires_at) VALUES ($1, $2, $3) ON CONFLICT (code) DO UPDATE SET mac_address = $2, expires_at = $3',
            [code, mac_address, expires_at]
        );
        res.json({ code, expires_at });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar código' });
    }
};

/**
 * Login por Código (no painel)
 */
exports.loginByCode = async (req, res) => {
    const { code } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM device_codes WHERE code = $1 AND expires_at > NOW()',
            [code]
        );
        if (result.rows.length === 0) return res.status(401).json({ error: 'Código inválido ou expirado.' });

        const mac = result.rows[0].mac_address;
        
        // Buscar ou gerar a Key do dispositivo para a sessão
        let keyResult = await pool.query('SELECT * FROM device_keys WHERE mac_address = $1', [mac]);
        let deviceKey = keyResult.rows.length > 0 ? keyResult.rows[0].device_key : generateDeviceKey();

        if (keyResult.rows.length === 0) {
            await pool.query('INSERT INTO device_keys (mac_address, device_key) VALUES ($1, $2)', [mac, deviceKey]);
        }

        res.json({ mac_address: mac, device_key: deviceKey });
    } catch (error) {
        res.status(500).json({ error: 'Erro no login por código' });
    }
};

const parseLooseDate = (value) => {
    if (!value) return null;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    if (typeof value === 'number') {
        const millis = value > 1e12 ? value : value * 1000;
        const date = new Date(millis);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;

        const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (brMatch) {
            const [, dd, mm, yyyy] = brMatch;
            const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
            return Number.isNaN(date.getTime()) ? null : date;
        }

        const isoDate = new Date(trimmed);
        if (!Number.isNaN(isoDate.getTime())) {
            return isoDate;
        }

        const numeric = Number(trimmed);
        if (!Number.isNaN(numeric)) {
            const millis = numeric > 1e12 ? numeric : numeric * 1000;
            const date = new Date(millis);
            return Number.isNaN(date.getTime()) ? null : date;
        }
    }

    return null;
};

exports.getActivationEntitlementByMac = async (req, res) => {
    const rawMac = req.params.mac_address || req.query.mac_address || req.query.mac;
    const mac_address = String(rawMac || '').trim().toUpperCase();

    if (!mac_address) {
        return res.status(400).json({ error: 'MAC Address é obrigatório' });
    }

    try {
        const [deviceResult, qpanelResult, revenueResult, mpResult] = await Promise.all([
            pool.query('SELECT * FROM devices WHERE mac_address = $1 LIMIT 1', [mac_address]),
            pool.query(`
                  SELECT
                      a.*,
                      p.name AS app_activation_package_name,
                      p.duration_days AS app_activation_package_duration_days,
                      p.trial_hours AS app_activation_package_trial_hours,
                      p.price AS app_activation_package_price
                  FROM qpanel_accounts a
                  LEFT JOIN app_activation_packages p ON p.id = a.package_id
                WHERE a.device_mac = $1
                ORDER BY COALESCE(a.updated_at, a.created_at) DESC
                LIMIT 1
            `, [mac_address]),
            pool.query(`
                SELECT
                    id, plan_id, amount, client_name, whatsapp, payment_method, status,
                    app_mac_address, app_username, app_user_id, app_user_status,
                    client_email, created_at
                FROM revenue_logs
                WHERE UPPER(COALESCE(app_mac_address, '')) = $1
                ORDER BY created_at DESC
                LIMIT 1
            `, [mac_address]),
            pool.query(`
                SELECT
                    id, payment_id, status, amount, type, mac_address, app_id, created_at
                FROM mp_transactions
                WHERE UPPER(COALESCE(mac_address, '')) = $1
                ORDER BY created_at DESC
                LIMIT 1
            `, [mac_address]),
        ]);

        const device = deviceResult.rows[0] || null;
        const qpanelAccount = qpanelResult.rows[0] || null;
        const revenueLog = revenueResult.rows[0] || null;
        const mpTransaction = mpResult.rows[0] || null;

        const normalizedHistoryMac = mac_address;
        const normalizedHistoryUsername = String(
            qpanelAccount?.username ||
            qpanelAccount?.app_username ||
            revenueLog?.app_username ||
            device?.username ||
            ''
        ).trim().toUpperCase();
        const normalizedHistoryEmail = String(
            qpanelAccount?.email ||
            revenueLog?.client_email ||
            ''
        ).trim().toUpperCase();
        const normalizedHistoryWhatsapp = String(
            qpanelAccount?.telefone ||
            revenueLog?.whatsapp ||
            ''
        ).replace(/\D/g, '');
        const normalizedHistoryUserId = String(
            qpanelAccount?.app_user_id ||
            revenueLog?.app_user_id ||
            device?.user_id ||
            ''
        ).trim().toUpperCase();

        const historyConditions = [
            `UPPER(COALESCE(r.app_mac_address, '')) = $1`,
        ];
        const historyParams = [normalizedHistoryMac];
        let historyParamIndex = 2;

        if (normalizedHistoryUsername) {
            historyConditions.push(`UPPER(COALESCE(r.app_username, '')) = $${historyParamIndex++}`);
            historyParams.push(normalizedHistoryUsername);
        }

        if (normalizedHistoryEmail) {
            historyConditions.push(`UPPER(COALESCE(r.client_email, '')) = $${historyParamIndex++}`);
            historyParams.push(normalizedHistoryEmail);
        }

        if (normalizedHistoryWhatsapp) {
            historyConditions.push(`REGEXP_REPLACE(COALESCE(r.whatsapp, ''), '[^0-9]', '', 'g') = $${historyParamIndex++}`);
            historyParams.push(normalizedHistoryWhatsapp);
        }

        if (normalizedHistoryUserId) {
            historyConditions.push(`UPPER(COALESCE(r.app_user_id::text, '')) = $${historyParamIndex++}`);
            historyParams.push(normalizedHistoryUserId);
        }

        const revenueHistoryResult = await pool.query(`
            SELECT
                r.id,
                r.plan_id,
                COALESCE(p.name, r.plan_name) AS plan_name,
                r.amount,
                r.client_name,
                r.whatsapp,
                r.payment_method,
                r.status,
                r.app_mac_address,
                r.app_username,
                r.app_user_id,
                r.client_email,
                r.created_at,
                r.mp_payment_id
            FROM revenue_logs r
            LEFT JOIN finance_plans p ON p.id = r.plan_id
            WHERE ${historyConditions.join(' OR ')}
            ORDER BY r.created_at DESC
            LIMIT 8
        `, historyParams);

        const revenueHistory = revenueHistoryResult.rows || [];

        const deviceStatus = String(device?.status || '').toLowerCase();
        const deviceTrialExpiry = parseLooseDate(device?.expires_at || device?.trial_expires_at);
        const qpanelExpiry = parseLooseDate(qpanelAccount?.expire_date);
        const testBlocked = String(device?.test_blocked || '0') === '1';
        const isTrial =
            device?.is_trial === true ||
            device?.is_trial === 1 ||
            device?.is_trial === '1' ||
            device?.is_trial === 'true' ||
            deviceStatus === 'trial';

        const hasActiveQpanelExpiry = !!(qpanelExpiry && qpanelExpiry.getTime() > Date.now());
        const hasActiveDeviceTrialExpiry = !!(deviceTrialExpiry && deviceTrialExpiry.getTime() > Date.now());

        const activeExpiry = hasActiveQpanelExpiry
            ? qpanelExpiry
            : (hasActiveDeviceTrialExpiry && !testBlocked && isTrial)
                ? deviceTrialExpiry
                : null;

        const expiredExpiry = [qpanelExpiry, deviceTrialExpiry].find((date) => date && date.getTime() <= Date.now()) || null;

        let activation_status = 'no_activation';
        if (deviceStatus && ['blocked', 'suspended', 'inactive'].includes(deviceStatus)) {
            activation_status = 'blocked';
        } else if (hasActiveQpanelExpiry) {
            activation_status = 'plan_active';
        } else if (hasActiveDeviceTrialExpiry && isTrial && !testBlocked) {
            activation_status = 'trial_active';
        } else if (testBlocked && hasActiveDeviceTrialExpiry) {
            activation_status = 'blocked';
        } else if (device || qpanelAccount || revenueLog || mpTransaction) {
            activation_status = 'expired';
        }

        const packageInfo = qpanelAccount
            ? {
                  id: qpanelAccount.package_id,
                  name: qpanelAccount.app_activation_package_name || qpanelAccount.package_name || null,
                  duration_days: qpanelAccount.app_activation_package_duration_days || qpanelAccount.plan_duration_days || null,
                  trial_hours: qpanelAccount.app_activation_package_trial_hours || null,
                  price: qpanelAccount.app_activation_package_price || qpanelAccount.finance_plan_price || null,
              }
              : null;

        return res.json({
            success: true,
            mac_address,
            activation_status,
            has_device: !!device,
            has_qpanel_account: !!qpanelAccount,
            expires_at: activeExpiry ? activeExpiry.toISOString() : null,
            expired_at: expiredExpiry ? expiredExpiry.toISOString() : null,
            device: device
                ? {
                    id: device.id,
                    mac_address: device.mac_address,
                    user_id: device.user_id || null,
                    status: device.status || null,
                    package_name: device.package_name || null,
                    finance_plan_name: device.finance_plan_name || null,
                    max_connections: device.max_connections || null,
                    is_trial: device.is_trial || null,
                    test_blocked: device.test_blocked || null,
                    trial_started_at: device.trial_started_at || null,
                    trial_expires_at: device.trial_expires_at || null,
                    expires_at: device.expires_at || null,
                    current_iptv_server_url: device.current_iptv_server_url || null,
                    current_iptv_username: device.current_iptv_username || null,
                    updated_at: device.updated_at || null,
                    created_at: device.created_at || null,
                }
                : null,
            qpanel_account: qpanelAccount
                ? {
                    id: qpanelAccount.id,
                    panel_id: qpanelAccount.panel_id,
                    server_id: qpanelAccount.server_id,
                    package_id: qpanelAccount.package_id,
                    username: qpanelAccount.username,
                    device_mac: qpanelAccount.device_mac,
                    status: qpanelAccount.status,
                    expire_date: qpanelAccount.expire_date,
                    remote_id: qpanelAccount.remote_id,
                    panel_url: qpanelAccount.panel_url,
                    package_name: qpanelAccount.package_name,
                    max_connections: qpanelAccount.max_connections,
                    nome: qpanelAccount.nome || null,
                    email: qpanelAccount.email || null,
                    telefone: qpanelAccount.telefone || null,
                    finance_plan_id: qpanelAccount.finance_plan_id || null,
                      finance_plan_name: qpanelAccount.finance_plan_name || null,
                      finance_plan_price: qpanelAccount.finance_plan_price || null,
                      plan_duration_days: qpanelAccount.plan_duration_days || null,
                      app_activation_package_trial_hours: qpanelAccount.app_activation_package_trial_hours || null,
                      app_user_id: qpanelAccount.app_user_id || null,
                    app_user_status: qpanelAccount.app_user_status || null,
                    last_payment_id: qpanelAccount.last_payment_id || null,
                    last_payment_amount: qpanelAccount.last_payment_amount || null,
                    last_payment_method: qpanelAccount.last_payment_method || null,
                    last_payment_status: qpanelAccount.last_payment_status || null,
                    last_payment_at: qpanelAccount.last_payment_at || null,
                    created_at: qpanelAccount.created_at || null,
                    updated_at: qpanelAccount.updated_at || null,
                }
                : null,
            package: packageInfo,
            revenue_log: revenueLog
                ? {
                    id: revenueLog.id,
                    plan_id: revenueLog.plan_id || null,
                    amount: revenueLog.amount || null,
                    client_name: revenueLog.client_name || null,
                    whatsapp: revenueLog.whatsapp || null,
                    payment_method: revenueLog.payment_method || null,
                    status: revenueLog.status || null,
                    app_mac_address: revenueLog.app_mac_address || null,
                    app_username: revenueLog.app_username || null,
                    app_user_id: revenueLog.app_user_id || null,
                    app_user_status: revenueLog.app_user_status || null,
                    client_email: revenueLog.client_email || null,
                    created_at: revenueLog.created_at || null,
                }
                : null,
            revenue_history: revenueHistory.map((row) => ({
                id: row.id,
                plan_id: row.plan_id || null,
                plan_name: row.plan_name || null,
                amount: row.amount || null,
                client_name: row.client_name || null,
                whatsapp: row.whatsapp || null,
                payment_method: row.payment_method || null,
                status: row.status || null,
                app_mac_address: row.app_mac_address || null,
                app_username: row.app_username || null,
                app_user_id: row.app_user_id || null,
                client_email: row.client_email || null,
                created_at: row.created_at || null,
                mp_payment_id: row.mp_payment_id || null,
            })),
            mp_transaction: mpTransaction
                ? {
                    id: mpTransaction.id,
                    payment_id: mpTransaction.payment_id || null,
                    status: mpTransaction.status || null,
                    amount: mpTransaction.amount || null,
                    type: mpTransaction.type || null,
                    mac_address: mpTransaction.mac_address || null,
                    app_id: mpTransaction.app_id || null,
                    created_at: mpTransaction.created_at || null,
                }
                : null,
            source: qpanelAccount ? 'qpanel_accounts' : device ? 'devices' : revenueLog ? 'revenue_logs' : mpTransaction ? 'mp_transactions' : null,
            synced_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Erro ao consultar entitlement por MAC:', error);
        return res.status(500).json({ error: 'Erro ao consultar ativação do dispositivo' });
    }
};
