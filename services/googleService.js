const { google } = require('googleapis');
const pool = require('../config/database');

class GoogleService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI;

    // Apenas criará a instância se as variáves existirem, previnindo crashes se o usuário não configurou.
    if (this.clientId && this.clientSecret && this.redirectUri) {
      this.oauth2Client = new google.auth.OAuth2(
        this.clientId,
        this.clientSecret,
        this.redirectUri
      );
    }
  }

  // Se o servidor for reiniciado e precisa recuperar tokens de um usuário.
  async getClientForUser(userId) {
    if (!this.oauth2Client) throw new Error('Google OAuth2 não está configurado (.env).');

    const result = await pool.query('SELECT * FROM google_configs WHERE user_id = $1 AND enabled = true', [userId]);
    if (result.rows.length === 0) {
      throw new Error('Usuário não possui conta Google conectada.');
    }

    const config = result.rows[0];
    const client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    client.setCredentials({
      access_token: config.access_token,
      refresh_token: config.refresh_token,
      expiry_date: config.expiry_date
    });

    // Lida com a atuallização automática do access_token usando o refresh_token se estiver vencido
    client.on('tokens', async (tokens) => {
      let updateQuery = 'UPDATE google_configs SET access_token = $1, expiry_date = $2';
      let params = [tokens.access_token, tokens.expiry_date];

      if (tokens.refresh_token) {
        updateQuery += ', refresh_token = $3';
        params.push(tokens.refresh_token);
      }
      
      updateQuery += ' WHERE user_id = $' + (params.length + 1);
      params.push(userId);

      await pool.query(updateQuery, params);
    });

    return client;
  }

  // Gera URL de Autenticação
  // state vai conter um JWT assinado com o userId, pra gente saber no callback quem foi que logou
  getAuthUrl(state) {
    if (!this.oauth2Client) throw new Error('Google OAuth2 não está configurado (.env).');

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Importante para retornar o refresh_token
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/contacts'
      ],
      state: state, // passa nosso userId mascarado em JWT
      prompt: 'consent' // forçamos o consent screen para garantir o refresh_token na primeira vez
    });
  }

  // Pega o token através do code retornado do callback do Google
  async getTokens(code) {
    if (!this.oauth2Client) throw new Error('Google OAuth2 não está configurado (.env).');
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Interfaces prontas para chamadas
  async getDriveApi(userId) {
    const auth = await this.getClientForUser(userId);
    return google.drive({ version: 'v3', auth });
  }

  async getPeopleApi(userId) {
    const auth = await this.getClientForUser(userId);
    return google.people({ version: 'v1', auth });
  }
}

module.exports = new GoogleService();
