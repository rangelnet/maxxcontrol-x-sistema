/**
 * Parser para respostas da API IPTV externa
 * Valida e extrai credenciais de forma segura
 */

class IptvApiParser {
  /**
   * Parseia resposta de criação de credenciais da API IPTV
   * @param {Object} response - Resposta da API IPTV
   * @returns {Object} Credenciais parseadas
   * @throws {Error} Se campos obrigatórios estiverem faltando
   */
  static parseCredentials(response) {
    if (!response || typeof response !== 'object') {
      throw new Error('Resposta da API IPTV inválida: resposta não é um objeto');
    }

    // Campos obrigatórios
    const requiredFields = ['username', 'password', 'server_url'];
    const missingFields = [];

    for (const field of requiredFields) {
      if (!response[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(
        `Resposta da API IPTV incompleta. Campos faltando: ${missingFields.join(', ')}`
      );
    }

    // Validar tipos
    if (typeof response.username !== 'string') {
      throw new Error('Campo username deve ser uma string');
    }

    if (typeof response.password !== 'string') {
      throw new Error('Campo password deve ser uma string');
    }

    if (typeof response.server_url !== 'string') {
      throw new Error('Campo server_url deve ser uma string');
    }

    // Converter expires_at para TIMESTAMP se presente
    let expiresAt = null;
    if (response.expires_at) {
      try {
        expiresAt = new Date(response.expires_at);
        if (isNaN(expiresAt.getTime())) {
          console.warn('⚠️  expires_at inválido, ignorando:', response.expires_at);
          expiresAt = null;
        }
      } catch (error) {
        console.warn('⚠️  Erro ao parsear expires_at, ignorando:', error.message);
        expiresAt = null;
      }
    }

    return {
      username: response.username.trim(),
      password: response.password.trim(),
      server_url: response.server_url.trim(),
      expires_at: expiresAt
    };
  }

  /**
   * Serializa credenciais para formato da API IPTV
   * @param {Object} credentials - Credenciais a serem serializadas
   * @returns {Object} Credenciais no formato da API
   */
  static serializeCredentials(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Credenciais inválidas para serialização');
    }

    const serialized = {
      username: credentials.username,
      password: credentials.password,
      server_url: credentials.server_url
    };

    if (credentials.expires_at) {
      serialized.expires_at = credentials.expires_at instanceof Date
        ? credentials.expires_at.toISOString()
        : credentials.expires_at;
    }

    return serialized;
  }

  /**
   * Valida round-trip: parsing → serialização → parsing
   * Garante que o processo é idempotente
   * @param {Object} response - Resposta original da API
   * @returns {boolean} True se round-trip é válido
   */
  static validateRoundTrip(response) {
    try {
      const parsed1 = this.parseCredentials(response);
      const serialized = this.serializeCredentials(parsed1);
      const parsed2 = this.parseCredentials(serialized);

      // Comparar campos essenciais
      return (
        parsed1.username === parsed2.username &&
        parsed1.password === parsed2.password &&
        parsed1.server_url === parsed2.server_url
      );
    } catch (error) {
      console.error('❌ Erro no round-trip validation:', error.message);
      return false;
    }
  }
}

module.exports = IptvApiParser;
