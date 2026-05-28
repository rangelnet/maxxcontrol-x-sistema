// Service Worker para habilitar o PWA e o Prompt de Instalação (Add to Home Screen)
const CACHE_NAME = 'maxxcontrol-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Intercepta fetches para que o Chrome reconheça isso como um Web App (PWA Válido)
self.addEventListener('fetch', (event) => {
  event.respondWith(
      return new Response(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MaxxControl - Offline</title>
          <style>
            body { margin: 0; padding: 0; background-color: #050505; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; position: relative; }
            .container { text-align: center; max-width: 360px; padding: 40px 30px; border-radius: 24px; background: rgba(17, 17, 17, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); position: relative; z-index: 10; }
            .icon { width: 80px; height: 80px; background: rgba(252, 95, 22, 0.1); border: 1px solid rgba(252, 95, 22, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
            .icon svg { width: 40px; height: 40px; color: #FC5F16; }
            h1 { margin: 0 0 10px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
            p { margin: 0 0 25px; color: #a1a1aa; font-size: 14px; line-height: 1.5; }
            button { width: 100%; background: linear-gradient(90deg, #FC5F16, #ea580c); color: #fff; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; transition: transform 0.2s, opacity 0.2s; box-shadow: 0 10px 15px -3px rgba(252,95,22,0.2); display: flex; align-items: center; justify-content: center; gap: 8px; }
            button:active { transform: scale(0.95); }
            button:hover { opacity: 0.9; }
            
            /* Background grid e blobs inspirados na tela de login */
            .bg-grid { position: absolute; inset: 0; background-image: radial-gradient(#27272a 1px, transparent 1px); background-size: 24px 24px; opacity: 0.3; z-index: 1; }
            .blob { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; mix-blend-mode: multiply; opacity: 0.2; animation: blob 7s infinite; }
            .blob-1 { width: 300px; height: 300px; background: #FC5F16; top: -50px; left: -50px; }
            .blob-2 { width: 300px; height: 300px; background: #dc2626; bottom: -50px; right: -50px; animation-delay: 2s; }
            @keyframes blob { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0, 0) scale(1); } }
          </style>
        </head>
        <body>
          <div class="bg-grid"></div>
          <div class="blob blob-1"></div>
          <div class="blob blob-2"></div>
          <div class="container">
            <div class="icon">
              <!-- Ícone de WiFi Desconectado -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 13a10 10 0 0 1 14 0"/><path d="M1.5 9.5a15 15 0 0 1 21 0"/></svg>
            </div>
            <h1>Sem Conexão</h1>
            <p>Não conseguimos conectar aos servidores do MaxxControl. Verifique sua internet e tente novamente.</p>
            <button onclick="window.location.reload()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Tentar Novamente
            </button>
          </div>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
});
