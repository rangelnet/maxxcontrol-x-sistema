const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');

/**
 * 🕵️‍♂️ AGENTE SENTINELA MAXX PRO
 * Responsável por:
 * 1. Limpeza de logs antigos (> 7 dias)
 * 2. Verificação de saúde do PostgreSQL
 * 3. Monitoramento de serviços IPTV
 */
class SentinelaAgent {
  constructor() {
    this.interval = 1000 * 60 * 60; // Rodar a cada 1 hora
    this.logsPath = path.join(__dirname, '../../logs');
  }

  async iniciar() {
    console.log('🦾 Sentinela Maxx PRO: Ativando protocolos de supervisão...');
    
    // Rodar imediatamente na subida
    this.protocoloManutencao();

    // Agendar
    setInterval(() => this.protocoloManutencao(), this.interval);
  }

  async protocoloManutencao() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 Sentinela: Iniciando rotina de manutenção...`);

    try {
      // 1. Limpeza de Logs
      this.limparLogs();

      // 2. Saúde do Banco
      await this.verificarBanco();

      // 3. Status das APIs (Opcional - Expandir depois)
      console.log('✅ Sentinela: Sistema estável e saudável.');
    } catch (error) {
      console.error('⚠️ Sentinela detectou anomalia:', error.message);
    }
  }

  limparLogs() {
    if (!fs.existsSync(this.logsPath)) return;
    
    const files = fs.readdirSync(this.logsPath);
    const agora = Date.now();
    const seteDias = 7 * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(this.logsPath, file);
      const stats = fs.statSync(filePath);
      if (agora - stats.mtimeMs > seteDias) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Sentinela: Log antigo removido: ${file}`);
      }
    });
  }

  async verificarBanco() {
    const start = Date.now();
    const res = await pool.query('SELECT NOW()');
    const latencia = Date.now() - start;
    
    if (latencia > 200) {
      console.warn(`🐢 Sentinela: Latência do banco elevada (${latencia}ms)`);
    } else {
      console.log(`💾 Sentinela: Banco de Dados OK (${latencia}ms)`);
    }
  }
}

module.exports = new SentinelaAgent();
