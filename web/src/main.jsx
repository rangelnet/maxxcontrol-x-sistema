import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // CÓDIGO NUCLEAR: Deleta todos os caches antigos do navegador
    caches.keys().then(names => {
      for (let name of names) {
        caches.delete(name);
      }
    });

    // Desregistra SW antigos presos e registra o novo com versão baseada no horário
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for(let registration of registrations) {
        registration.unregister();
      }
    }).then(() => {
      navigator.serviceWorker.register('/sw.js?v=' + new Date().getTime())
        .then(registration => {
          console.log('SW PWA Registrado com sucesso:', registration.scope);
          registration.update();
        })
        .catch(error => {
          console.log('Falha ao registrar SW PWA:', error);
        });
    });
  });
}
