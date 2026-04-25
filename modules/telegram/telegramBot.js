const TelegramBot = require('node-telegram-bot-api');
const pool = require('../../config/database');

// Token do Bot de Segurança: @MxxcontrolBot
const token = process.env.TELEGRAM_BOT_TOKEN || '8577851677:AAG4OUNxIE9s7N5v4ZAnvBUQGiPFqX9vKFs';

let bot;

const initBot = () => {
  if (bot) return bot;

  bot = new TelegramBot(token, { polling: true });

  // Graceful shutdown para evitar "409 Conflict" em restarts do Nodemon
  process.once('SIGUSR2', () => {
    if (bot) bot.stopPolling();
    process.kill(process.pid, 'SIGUSR2');
  });

  process.on('SIGINT', () => {
    if (bot) bot.stopPolling();
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

      // Vincular o chatId ao usuário e ativar 2FA
      await pool.query(
        'UPDATE users SET telegram_chat_id = $1, tfa_enabled = TRUE WHERE id = $2',
        [chatId, user.id]
      );

      bot.sendMessage(chatId, `✅ Sucesso, ${user.nome}!\nSua conta vinculada ao e-mail ${email} agora está protegida com 2FA via Telegram.`);
      console.log(`🔗 Conta vinculada: ${email} -> ChatID: ${chatId}`);

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
