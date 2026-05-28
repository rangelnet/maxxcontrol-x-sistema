// Service Worker para habilitar o PWA e o Prompt de Instalação (Add to Home Screen)
const CACHE_NAME = 'maxxcontrol-pwa-v2';

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
          <title>Painel Offline - MaxxControl</title>
          <style>
            body { margin: 0; padding: 0; background-color: #09090b; color: #fff; font-family: 'Inter', system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; position: relative; }
            .container { text-align: center; max-width: 400px; padding: 50px 40px; border-radius: 32px; background: rgba(24, 24, 27, 0.7); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1); position: relative; z-index: 10; }
            .brand { font-size: 14px; text-transform: uppercase; letter-spacing: 4px; color: #FC5F16; font-weight: 800; margin-bottom: 24px; display: block; }
            .icon { width: 96px; height: 96px; background: linear-gradient(135deg, rgba(252, 95, 22, 0.2), rgba(252, 95, 22, 0.05)); border: 1px solid rgba(252, 95, 22, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 0 40px rgba(252,95,22,0.2); }
            .icon svg { width: 48px; height: 48px; color: #FC5F16; filter: drop-shadow(0 0 8px rgba(252,95,22,0.5)); }
            h1 { margin: 0 0 16px; font-size: 28px; font-weight: 900; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
            p { margin: 0 0 32px; color: #a1a1aa; font-size: 15px; line-height: 1.6; }
            button { width: 100%; background: linear-gradient(135deg, #FC5F16, #ea580c); color: #fff; border: none; padding: 16px 24px; border-radius: 16px; font-weight: 800; font-size: 15px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 20px -5px rgba(252,95,22,0.4); display: flex; align-items: center; justify-content: center; gap: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            button:active { transform: scale(0.96); box-shadow: 0 5px 10px -5px rgba(252,95,22,0.4); }
            button:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(252,95,22,0.5); }
            
            /* Background Premium */
            .bg-grid { position: absolute; inset: 0; background-image: radial-gradient(#3f3f46 1px, transparent 1px); background-size: 32px 32px; opacity: 0.15; z-index: 1; }
            .blob { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.15; animation: blob 10s infinite alternate; }
            .blob-1 { width: 400px; height: 400px; background: #FC5F16; top: -100px; left: -100px; }
            .blob-2 { width: 400px; height: 400px; background: #ea580c; bottom: -100px; right: -100px; animation-delay: 3s; }
            @keyframes blob { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.2); } }
          </style>
        </head>
        <body>
          <div class="bg-grid"></div>
          <div class="blob blob-1"></div>
          <div class="blob blob-2"></div>
          <div class="container">
            <span class="brand">MaxxControl</span>
            <div class="icon">
              <!-- Ícone de Nuvem Offline -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </div>
            <h1>Painel Offline</h1>
            <p>Sua conexão caiu. Verifique sua internet para reconectar ao sistema com segurança.</p>
            <button onclick="window.location.reload()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Tentar Reconectar
            </button>
          </div>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
});
