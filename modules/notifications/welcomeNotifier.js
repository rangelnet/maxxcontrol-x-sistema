const pool = require('../../config/database');
const wa = require('../whatsapp/whatsappClient');

/**
 * 📨 NOTIFICADOR DE BOAS-VINDAS MAXX CONTROL
 * Responsável por enviar credenciais e calcular datas de expiração.
 */
class WelcomeNotifier {
    
    /**
     * Envia mensagem de boas-vindas para um novo usuário (Revenda ou Cliente)
     */
    async sendWelcomeCredentials(userData, rawPassword) {
        try {
            console.log(`📡 Iniciando envio de boas-vindas para: ${userData.nome} (${userData.email})`);

            // 1. Buscar configurações globais
            const settingsRes = await pool.query('SELECT key, value FROM global_settings WHERE key IN ($1, $2, $3)', [
                'panel_url', 
                'reseller_welcome_template',
                'trial_hours'
            ]);

            const settings = {};
            settingsRes.rows.forEach(row => {
                settings[row.key] = typeof row.value === 'string' && row.value.startsWith('"') 
                    ? JSON.parse(row.value) 
                    : row.value;
            });

            const panelUrl = settings.panel_url || 'https://maxxcontrol-x-sistema.onrender.com/';
            const template = settings.reseller_welcome_template || 'Olá {nome}! Seu acesso: {url} | Login: {login} | Senha: {senha}';
            
            // 2. Formatar data de expiração (se houver)
            let expiracaoTexto = 'Vitalício';
            if (userData.expires_at) {
                const data = new Date(userData.expires_at);
                expiracaoTexto = data.toLocaleString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }

            // 3. Montar Mensagem
            let message = template
                .replace(/{nome}/g, userData.nome)
                .replace(/{url}/g, panelUrl)
                .replace(/{login}/g, userData.email)
                .replace(/{senha}/g, rawPassword)
                .replace(/{expiracao}/g, expiracaoTexto);

            // 4. Formatar Telefone (remover caracteres não numéricos)
            if (!userData.telefone) {
                console.warn('⚠️ Telefone não informado para envio de WhatsApp.');
                return;
            }

            let phone = userData.telefone.replace(/\D/g, '');
            if (!phone.startsWith('55')) phone = '55' + phone;
            const jid = `${phone}@s.whatsapp.net`;

            // 5. Enviar via WhatsApp Client
            const sock = wa.getSock();
            if (sock) {
                await sock.sendMessage(jid, { text: message });
                console.log(`✅ Mensagem de boas-vindas enviada para ${jid}`);
            } else {
                console.error('❌ WhatsApp desconectado. Não foi possível enviar boas-vindas.');
            }

        } catch (error) {
            console.error('❌ Erro no WelcomeNotifier:', error.message);
        }
    }

    /**
     * Calcula a data de expiração baseada nas horas de teste configuradas
     */
    async calculateExpiration() {
        try {
            const res = await pool.query("SELECT value FROM global_settings WHERE key = 'trial_hours'");
            const hours = parseInt(res.rows[0]?.value || 24);
            
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + hours);
            
            return expiresAt;
        } catch (error) {
            console.error('Erro ao calcular expiração:', error);
            return null;
        }
    }
}

module.exports = new WelcomeNotifier();
