# 🎨 GERENCIAR BANNER DO PAINEL COM APIs

## 🎯 OBJETIVO

Permitir que você customize o banner/branding do painel através de APIs, sem precisar editar código.

---

## 📋 PASSO 1: CRIAR TABELA DE BRANDING

**No SQL Editor do Supabase (ou Render):**

```sql
CREATE TABLE IF NOT EXISTS branding_settings (
  id SERIAL PRIMARY KEY,
  banner_titulo VARCHAR(255),
  banner_subtitulo VARCHAR(255),
  banner_cor_fundo VARCHAR(7),
  banner_cor_texto VARCHAR(7),
  logo_url VARCHAR(500),
  splash_url VARCHAR(500),
  tema VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Inserir branding padrão
INSERT INTO branding_settings (banner_titulo, banner_subtitulo, banner_cor_fundo, banner_cor_texto, tema)
VALUES (
  'MaxxControl X',
  'Painel de Controle',
  '#FF6A00',
  '#FFFFFF',
  'dark'
);
```

---

## 🔧 PASSO 2: CRIAR CONTROLLER DE BRANDING

**Arquivo:** `modules/branding/brandingController.js`

```javascript
const pool = require('../../config/database');

// Obter branding atual
exports.getBranding = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM branding_settings WHERE ativo = true ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Branding não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter branding:', error);
    res.status(500).json({ error: 'Erro ao obter branding' });
  }
};

// Atualizar branding
exports.updateBranding = async (req, res) => {
  const { banner_titulo, banner_subtitulo, banner_cor_fundo, banner_cor_texto, logo_url, splash_url, tema } = req.body;

  try {
    const result = await pool.query(
      `UPDATE branding_settings 
       SET banner_titulo = $1, 
           banner_subtitulo = $2, 
           banner_cor_fundo = $3, 
           banner_cor_texto = $4,
           logo_url = $5,
           splash_url = $6,
           tema = $7,
           atualizado_em = NOW()
       WHERE ativo = true
       RETURNING *`,
      [banner_titulo, banner_subtitulo, banner_cor_fundo, banner_cor_texto, logo_url, splash_url, tema]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Branding não encontrado' });
    }

    res.json({ message: 'Branding atualizado com sucesso', branding: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar branding:', error);
    res.status(500).json({ error: 'Erro ao atualizar branding' });
  }
};

// Criar novo branding
exports.createBranding = async (req, res) => {
  const { banner_titulo, banner_subtitulo, banner_cor_fundo, banner_cor_texto, logo_url, splash_url, tema } = req.body;

  try {
    // Desativar branding anterior
    await pool.query('UPDATE branding_settings SET ativo = false');

    // Criar novo
    const result = await pool.query(
      `INSERT INTO branding_settings (banner_titulo, banner_subtitulo, banner_cor_fundo, banner_cor_texto, logo_url, splash_url, tema, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [banner_titulo, banner_subtitulo, banner_cor_fundo, banner_cor_texto, logo_url, splash_url, tema]
    );

    res.status(201).json({ message: 'Branding criado com sucesso', branding: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar branding:', error);
    res.status(500).json({ error: 'Erro ao criar branding' });
  }
};

// Listar histórico de branding
exports.listBrandingHistory = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM branding_settings ORDER BY criado_em DESC LIMIT 10'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar branding:', error);
    res.status(500).json({ error: 'Erro ao listar branding' });
  }
};
```

---

## 🛣️ PASSO 3: CRIAR ROTAS

**Arquivo:** `modules/branding/brandingRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const brandingController = require('./brandingController');
const auth = require('../../middlewares/auth');

// Obter branding atual (público)
router.get('/current', brandingController.getBranding);

// Atualizar branding (protegido)
router.put('/', auth, brandingController.updateBranding);

// Criar novo branding (protegido)
router.post('/', auth, brandingController.createBranding);

// Listar histórico (protegido)
router.get('/history', auth, brandingController.listBrandingHistory);

module.exports = router;
```

---

## 🎨 PASSO 4: CRIAR PÁGINA NO PAINEL

**Arquivo:** `web/src/pages/Branding.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Branding() {
  const [branding, setBranding] = useState({
    banner_titulo: 'MaxxControl X',
    banner_subtitulo: 'Painel de Controle',
    banner_cor_fundo: '#FF6A00',
    banner_cor_texto: '#FFFFFF',
    logo_url: '',
    splash_url: '',
    tema: 'dark'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Carregar branding atual
  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const response = await api.get('/branding/current');
      setBranding(response);
    } catch (error) {
      console.error('Erro ao carregar branding:', error);
    }
  };

  // Atualizar branding
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/branding', branding);
      setMessage('✅ Branding atualizado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erro ao atualizar branding');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBranding(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🎨 Gerenciar Banner</h1>

        {message && (
          <div className="mb-4 p-4 bg-blue-600 text-white rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="bg-gray-800 p-6 rounded-lg space-y-6">
          {/* Preview do Banner */}
          <div className="mb-8 p-4 rounded" style={{ backgroundColor: branding.banner_cor_fundo }}>
            <h2 style={{ color: branding.banner_cor_texto }} className="text-2xl font-bold">
              {branding.banner_titulo}
            </h2>
            <p style={{ color: branding.banner_cor_texto }} className="text-sm opacity-80">
              {branding.banner_subtitulo}
            </p>
          </div>

          {/* Título */}
          <div>
            <label className="block text-white mb-2">Título do Banner</label>
            <input
              type="text"
              name="banner_titulo"
              value={branding.banner_titulo}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="Ex: MaxxControl X"
            />
          </div>

          {/* Subtítulo */}
          <div>
            <label className="block text-white mb-2">Subtítulo</label>
            <input
              type="text"
              name="banner_subtitulo"
              value={branding.banner_subtitulo}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="Ex: Painel de Controle"
            />
          </div>

          {/* Cor de Fundo */}
          <div>
            <label className="block text-white mb-2">Cor de Fundo</label>
            <div className="flex gap-4">
              <input
                type="color"
                name="banner_cor_fundo"
                value={branding.banner_cor_fundo}
                onChange={handleChange}
                className="w-20 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={branding.banner_cor_fundo}
                onChange={handleChange}
                name="banner_cor_fundo"
                className="flex-1 bg-gray-700 text-white p-2 rounded"
                placeholder="#FF6A00"
              />
            </div>
          </div>

          {/* Cor do Texto */}
          <div>
            <label className="block text-white mb-2">Cor do Texto</label>
            <div className="flex gap-4">
              <input
                type="color"
                name="banner_cor_texto"
                value={branding.banner_cor_texto}
                onChange={handleChange}
                className="w-20 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={branding.banner_cor_texto}
                onChange={handleChange}
                name="banner_cor_texto"
                className="flex-1 bg-gray-700 text-white p-2 rounded"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* URL da Logo */}
          <div>
            <label className="block text-white mb-2">URL da Logo</label>
            <input
              type="url"
              name="logo_url"
              value={branding.logo_url}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          {/* URL do Splash */}
          <div>
            <label className="block text-white mb-2">URL do Splash Screen</label>
            <input
              type="url"
              name="splash_url"
              value={branding.splash_url}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="https://exemplo.com/splash.png"
            />
          </div>

          {/* Tema */}
          <div>
            <label className="block text-white mb-2">Tema</label>
            <select
              name="tema"
              value={branding.tema}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
            >
              <option value="dark">Escuro</option>
              <option value="light">Claro</option>
              <option value="auto">Automático</option>
            </select>
          </div>

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Salvando...' : '💾 Salvar Branding'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 📱 PASSO 5: ADICIONAR ROTA NO APP.JSX

**Arquivo:** `web/src/App.jsx`

```jsx
import Branding from './pages/Branding';

// Adicionar na rota:
<Route path="/branding" element={<Branding />} />
```

---

## 🔌 PASSO 6: ADICIONAR NO SERVER.JS

**Arquivo:** `server.js`

```javascript
// Adicionar esta linha com as outras rotas:
app.use('/api/branding', require('./modules/branding/brandingRoutes'));
```

---

## 📡 ENDPOINTS DA API

### Obter branding atual
```
GET /api/branding/current
```

**Resposta:**
```json
{
  "id": 1,
  "banner_titulo": "MaxxControl X",
  "banner_subtitulo": "Painel de Controle",
  "banner_cor_fundo": "#FF6A00",
  "banner_cor_texto": "#FFFFFF",
  "logo_url": "https://...",
  "splash_url": "https://...",
  "tema": "dark",
  "ativo": true
}
```

### Atualizar branding
```
PUT /api/branding
Authorization: Bearer {token}
```

**Body:**
```json
{
  "banner_titulo": "Novo Título",
  "banner_subtitulo": "Novo Subtítulo",
  "banner_cor_fundo": "#FF0000",
  "banner_cor_texto": "#FFFFFF",
  "logo_url": "https://...",
  "splash_url": "https://...",
  "tema": "dark"
}
```

### Criar novo branding
```
POST /api/branding
Authorization: Bearer {token}
```

### Listar histórico
```
GET /api/branding/history
Authorization: Bearer {token}
```

---

## 🎯 COMO USAR NO PAINEL

1. **Acesse:** https://maxxcontrol-frontend.onrender.com/branding
2. **Customize:**
   - Título do banner
   - Subtítulo
   - Cores (fundo e texto)
   - Logo e Splash
   - Tema
3. **Clique em "Salvar Branding"**
4. **Pronto!** O banner é atualizado em tempo real

---

## 🚀 COMO USAR VIA API

**Exemplo com cURL:**

```bash
curl -X PUT https://maxxcontrol-x-sistema.onrender.com/api/branding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token}" \
  -d '{
    "banner_titulo": "Meu App",
    "banner_subtitulo": "Versão 2.0",
    "banner_cor_fundo": "#FF0000",
    "banner_cor_texto": "#FFFFFF",
    "tema": "dark"
  }'
```

---

## 💡 CASOS DE USO

✅ **White-label:** Customize para cada cliente
✅ **Temas sazonais:** Mude cores por época
✅ **Branding dinâmico:** Sem precisar republish
✅ **A/B Testing:** Teste diferentes designs
✅ **Múltiplas marcas:** Gerencie várias identidades

---

**Seu painel agora tem branding totalmente customizável!** 🎨
