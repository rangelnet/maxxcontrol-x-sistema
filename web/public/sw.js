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
    fetch(event.request).catch(() => {
      return new Response('Painel Offline. Verifique sua conexao com a internet.');
    })
  );
});
