/**
 * Cache Manager para IPTV Tree Viewer
 * Gerencia cache em memória com TTL (Time To Live)
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Obtém valor do cache
   * @param {string} key - Chave do cache
   * @returns {any|null} Valor armazenado ou null se não existir/expirado
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Verificar se expirou
    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Armazena valor no cache com TTL
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a armazenar
   * @param {number} ttl - Time to live em segundos
   */
  set(key, value, ttl) {
    const expiresAt = Date.now() + (ttl * 1000);
    
    this.cache.set(key, {
      data: value,
      expiresAt: expiresAt
    });
  }

  /**
   * Remove uma chave específica do cache
   * @param {string} key - Chave a remover
   */
  clear(key) {
    this.cache.delete(key);
  }

  /**
   * Remove todas as chaves que começam com um prefixo
   * @param {string} prefix - Prefixo das chaves a remover
   */
  clearByPrefix(prefix) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    return keysToDelete.length;
  }

  /**
   * Limpa todo o cache
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Retorna estatísticas do cache
   * @returns {object} Estatísticas
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;
