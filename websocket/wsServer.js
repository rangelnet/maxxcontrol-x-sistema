const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

let wss;
const clients = new Map();

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    console.log('🔌 Nova conexão WebSocket');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        // Autenticação
        if (data.type === 'auth') {
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
          ws.userId = decoded.id;
          clients.set(decoded.id, ws);
          ws.send(JSON.stringify({ type: 'auth', status: 'success' }));
          console.log(`✅ Usuário ${decoded.id} autenticado no WebSocket`);
        }

        // Ping/Pong
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }

      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Erro ao processar mensagem' }));
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        console.log(`🔌 Usuário ${ws.userId} desconectado`);
      }
    });

    ws.on('error', (error) => {
      console.error('Erro no WebSocket:', error);
    });
  });

  console.log('🚀 WebSocket Server iniciado');
};

// Enviar notificação para usuário específico
const sendToUser = (userId, data) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

// Broadcast para todos
const broadcast = (data) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = { initWebSocket, sendToUser, broadcast };
