/**
 * Middleware de autenticação para dispositivos (apps)
 * Valida o token de API fixo que os apps usam para se registrar
 */

const deviceAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['x-device-token'] || req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token de dispositivo não fornecido',
        message: 'Envie o token no header X-Device-Token ou Authorization' 
      });
    }

    // Remove "Bearer " se existir
    const token = authHeader.replace('Bearer ', '').trim();
    
    // Valida contra o token configurado no .env
    const validToken = process.env.DEVICE_API_TOKEN || 'tvmaxx_device_api_token_2024_secure_key';
    
    if (token !== validToken) {
      return res.status(403).json({ 
        error: 'Token de dispositivo inválido',
        message: 'O token fornecido não é válido' 
      });
    }

    // Token válido, continua
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação de dispositivo:', error);
    res.status(500).json({ error: 'Erro ao validar token de dispositivo' });
  }
};

module.exports = deviceAuthMiddleware;
