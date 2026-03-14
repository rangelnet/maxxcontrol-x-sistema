/**
 * IptvConfigPrinter - Utilitário para debug de configurações IPTV
 * Formata configurações de forma legível e segura (mascarando senhas)
 */

/**
 * Formata configuração IPTV para debug
 * @param {Object} config - Configuração IPTV
 * @param {string} config.username - Username IPTV
 * @param {string} config.password - Password IPTV
 * @param {string} config.server - URL do servidor
 * @param {string} config.server_mode - Modo do servidor (auto/manual)
 * @param {number} config.ping - Ping em ms
 * @param {string} config.quality - Qualidade da conexão
 * @param {string} config.stream_status - Status do stream
 * @returns {string} Configuração formatada em JSON
 */
exports.format = (config) => {
  if (!config) {
    return JSON.stringify({ error: 'Configuração não fornecida' }, null, 2);
  }
  
  // Criar cópia para não modificar original
  const safeCopy = { ...config };
  
  // Mascarar password (primeiros 3 chars + ***)
  if (safeCopy.password && safeCopy.password.length > 3) {
    safeCopy.password = safeCopy.password.substring(0, 3) + '***';
  } else if (safeCopy.password) {
    safeCopy.password = '***';
  }
  
  // Adicionar timestamp
  safeCopy.formatted_at = new Date().toISOString();
  
  // Formatar em JSON indentado
  return JSON.stringify(safeCopy, null, 2);
};

/**
 * Formata múltiplas configurações
 * @param {Array} configs - Array de configurações
 * @returns {string} Configurações formatadas
 */
exports.formatMultiple = (configs) => {
  if (!Array.isArray(configs)) {
    return JSON.stringify({ error: 'Esperado array de configurações' }, null, 2);
  }
  
  const formatted = configs.map(config => {
    const safeCopy = { ...config };
    if (safeCopy.password && safeCopy.password.length > 3) {
      safeCopy.password = safeCopy.password.substring(0, 3) + '***';
    } else if (safeCopy.password) {
      safeCopy.password = '***';
    }
    return safeCopy;
  });
  
  return JSON.stringify({
    total: formatted.length,
    formatted_at: new Date().toISOString(),
    configs: formatted
  }, null, 2);
};

module.exports = exports;
