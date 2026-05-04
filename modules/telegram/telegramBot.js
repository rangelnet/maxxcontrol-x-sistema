const TelegramBot = require('node-telegram-bot-api');
const pool = require('../../config/database');

// Token do Bot de Segurança: @MxxcontrolBot
const token = process.env.TELEGRAM_BOT_TOKEN || '8577851677:AAG4OUNxIE9s7N5v4ZAnvBUQGiPFqX9vKFs';

let bot;

const initBot = () => {
  if (bot) return bot;

  bot = new TelegramBot(token, { polling: true });

  // Tratamento de erros de polling (ex: 409 Conflict)
  bot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
      console.warn('⚠️ Telegram: Conflito de polling detectado. Aguardando instância anterior encerrar...');
      // Não mata o processo, apenas avisa. O node-telegram-bot-api tentará reconectar.
    } else {
      console.error('❌ Erro no polling do Telegram:', error.message);
    }
  });

  // Graceful shutdown para evitar "409 Conflict" em restarts do Nodemon
  const shutdown = async () => {
    if (bot && bot.isPolling()) {
      console.log('🛑 Encerrando polling do Telegram...');
      await bot.stopPolling();
    }
  };

  process.once('SIGUSR2', async () => {
    await shutdown();
    process.kill(process.pid, 'SIGUSR2');
  });

  process.on('SIGINT', async () => {
    await shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await shutdown();
    process.exit(0);
  });

  console.log('🤖 Bot do Telegram inicializado e pronto para 2FA.');

  // Listener para o comando /2fa start <email>
  bot.onText(/\/2fa start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match[1].trim().toLowerCase();

    try {
      // Verificar se o e-mail existe no banco
      const result = await pool.query('SELECT id, nome FROM users WHERE email = $1', [email]);

      if (result.rows.length === 0) {
        bot.sendMessage(chatId, `❌ Erro: O e-mail ${email} não foi encontrado no sistema Mxxcontrol.`);
        return;
      }

      const user = result.rows[0];
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Salvar Chat ID e Código de Verificação (mas manter tfa_enabled false por enquanto)
      await pool.query(
        'UPDATE users SET telegram_chat_id = $1, tfa_code = $2 WHERE id = $3',
        [chatId, verifyCode, user.id]
      );

      const responseMsg = `🚀 *Vínculo de Segurança Mxxcontrol*\n\nOlá ${user.nome}!\nPara ativar a proteção 2FA na sua conta (${email}), utilize o código abaixo no seu Painel de Configurações:\n\n\`${verifyCode}\`\n\n_Este código expira se você solicitar um novo._`;
      
      bot.sendMessage(chatId, responseMsg, { parse_mode: 'Markdown' });
      console.log(`🔑 Código de ativação gerado para: ${email}`);

    } catch (error) {
      console.error('Erro ao vincular 2FA no Telegram:', error);
      bot.sendMessage(chatId, '⚠️ Ocorreu um erro interno ao tentar vincular sua conta. Tente novamente mais tarde.');
    }
  });

  // Comando de ajuda
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🚀 Bem-vindo ao Mxxcontrol 2FA Bot!\n\nPara vincular sua conta, use:\n`/2fa start seuemail@exemplo.com`', { parse_mode: 'Markdown' });
  });

  return bot;
};

// Função para enviar o código de 2FA
const send2FACode = async (chatId, code, email = 'Administrador') => {
  if (!bot) initBot();
  const urlPainel = process.env.PAINEL_URL || 'http://localhost:5173';
  const msg1 = `URL do Painel\n${urlPainel}\n\nUsuário\n${email}\n---\nSeu código é:`;
  const msg2 = `\`${code}\``;
  
  await bot.sendMessage(chatId, msg1);
  await bot.sendMessage(chatId, msg2, { parse_mode: 'Markdown' });
};

module.exports = {
  initBot,
  send2FACode
};
