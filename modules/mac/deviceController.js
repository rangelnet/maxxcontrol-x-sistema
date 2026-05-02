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
