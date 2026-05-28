const pool = require('../../config/database');

/**
 * Função global para registrar logs de auditoria de qualquer lugar do sistema
 * @param {number} userId - ID do usuário que fez a ação
 * @param {string} action - Título curto da ação (Ex: 'TRIAL_CREATED', 'USER_CONVERTED')
 * @param {string} details - Detalhes em texto ou JSON string
 * @param {string} ipAddress - IP (opcional)
 */
async function logAction(userId, action, details, ipAddress = null) {
  try {
    if (!userId) return; // Se não tiver usuário, não fazemos log de auditoria do revendedor
    
    if (pool.query) {
      await pool.query(
        'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
        [userId, action, details, ipAddress]
      );
    } else {
      await pool.run(
        'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [userId, action, details, ipAddress]
      );
    }
  } catch (error) {
    console.error('❌ Falha ao gravar log de auditoria:', error.message);
  }
}

module.exports = { logAction };
