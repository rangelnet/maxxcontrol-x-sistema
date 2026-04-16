import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registra o Service Worker do PWA para exibir o popup automático de "Instalar App"
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW PWA Registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        console.log('Falha ao registrar SW PWA:', error);
      });
  });
}
