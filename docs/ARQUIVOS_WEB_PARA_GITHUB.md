# 📁 ARQUIVOS DA PASTA WEB PARA ADICIONAR NO GITHUB

Crie cada arquivo usando "Add file" → "Create new file" no GitHub.

---

## Arquivo 2: `web/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

---

## Arquivo 3: `web/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6A00',
        dark: '#0a0a0a',
      }
    },
  },
  plugins: [],
}
```

---

## Arquivo 4: `web/postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Arquivo 5: `web/src/main.jsx`

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Arquivo 6: `web/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #0a0a0a;
  color: white;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

---

## Arquivo 7: `web/src/services/api.js`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || 'Erro na requisição');
    }

    return response.json();
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};

export default api;
```

---

## Arquivo 8: `web/src/services/websocket.js`

```javascript
const WS_URL = import.meta.env.VITE_API_URL?.replace('https://', 'wss://').replace('http://', 'ws://') || 'ws://localhost:3001';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket conectado');
      this.send({ type: 'auth', token });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach(callback => callback(data));
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket erro:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket desconectado');
      setTimeout(() => this.connect(token), 5000);
    };
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(callback) {
    const id = Date.now();
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService();
```

---

## ⚠️ IMPORTANTE

Depois de criar esses 8 arquivos, ainda faltam os componentes React (App.jsx, páginas, etc.).

Mas com esses arquivos já dá para testar o build no Render!

---

## 🚀 PRÓXIMO PASSO

Depois de criar todos esses arquivos, me avise que vou te passar os componentes React!

Ou se preferir, podemos testar o deploy agora com esses arquivos básicos e adicionar os componentes depois.

O que prefere? 🤔
