# 📐 CONVENTIONS.md — Convenções de Código MaxxControl

> Mapeado em: 2026-05-05

---

## 1. Estilo de Código

### Backend (Node.js)
- **Module System:** CommonJS (`require` / `module.exports`)
- **Sem TypeScript** — JavaScript puro
- **Strings:** Single quotes preferencial
- **Semicolons:** Sim
- **Indentação:** 2 espaços
- **Logging:** Emojis + prefixos descritivos (`✅`, `❌`, `⚠️`, `🔧`, `🚀`)
- **Nomenclatura SQL:** snake_case (`iptv_servers`, `mac_address`)
- **Nomenclatura JS:** camelCase para variáveis e funções
- **Nomenclatura Arquivos:** kebab-case para módulos, camelCase para services

### Frontend (React)
- **JSX** (não TSX)
- **Componentes:** Functional components com hooks
- **Estado:** useState, useEffect, Context API (sem Redux)
- **Styling:** TailwindCSS utility classes inline
- **Ícones:** Lucide React (`import { Icon } from 'lucide-react'`)
- **Nomenclatura:** PascalCase para componentes/páginas
- **Roteamento:** React Router v6 com `<Routes>` e `<Route>`

---

## 2. Padrões de Código

### Rotas Express
```javascript
// Padrão: arquivo de rotas por módulo
const router = require('express').Router();
const pool = require('../../config/database');
const auth = require('../../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tabela');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
```

### Queries SQL
```javascript
// Sempre parameterized queries
await pool.query('SELECT * FROM devices WHERE mac_address = $1', [mac]);
// NUNCA: pool.query(`SELECT * FROM devices WHERE mac = '${mac}'`);
```

### Migrações
```javascript
// Padrão: idempotente com IF NOT EXISTS
await pool.query(`CREATE TABLE IF NOT EXISTS tabela (...)`);
await pool.query(`ALTER TABLE tabela ADD COLUMN IF NOT EXISTS col TYPE`);
// Erros duplicados são ignorados (IGNORE_CODES: 42P07, 42701, etc.)
```

### Páginas React
```jsx
// Padrão: página com estado local, fetch no useEffect
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PageName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/endpoint');
      setData(res.data);
    } finally { setLoading(false); }
  };

  return (<div className="p-6">...</div>);
}
```

---

## 3. Error Handling

### Backend
- `try/catch` em todo handler async
- Erros retornam `{ error: 'mensagem' }` com status HTTP apropriado
- Console.error com emoji `❌` para erros críticos
- Console.warn com `⚠️` para avisos
- Migrações: erros de duplicação são silenciados (`IGNORE_CODES`)

### Frontend
- `try/catch` com `finally` para loading states
- Alerts/toasts inline (sem biblioteca de toast dedicada)
- Fallback para dados vazios (`data || []`)

---

## 4. Segurança

- **Helmet** em todas as respostas HTTP
- **CORS** aberto (`cors()` sem config — ALL origins)
- **Rate Limiting** por rota
- **JWT** para autenticação admin
- **Parameterized queries** obrigatórias (regra em `Rules/Backend_Rules.md`)
- **SSL** no PostgreSQL (mesmo que rejectUnauthorized: false)
- **Trust Proxy** habilitado para Render

---

## 5. Design Rules (CEREBRO)

Definidas em `CEREBRO MAXXCONTROL/Rules/Design_Rules.md`:

| Propriedade | Valor |
|:------------|:------|
| Background Principal | `#0F172A` (Slate 900) ou `#050505` |
| Secondary / Cards | `#1E293B` (Slate 800) |
| Accent (Maxx Orange) | `#FC5F16` |
| Text Primary | `#F8FAFC` |
| Text Muted | `#94A3B8` |
| Framework UI | React 18+ |
| Styling | TailwindCSS |
| Ícones | Lucide React |
| Build | Vite |
| Responsividade | Mobile First |

---

## 6. Naming Conventions

| Contexto | Padrão | Exemplos |
|:---------|:-------|:---------|
| Tabelas SQL | snake_case | `iptv_servers`, `whatsapp_messages` |
| Colunas SQL | snake_case | `mac_address`, `created_at` |
| Módulos backend | kebab-case dir | `iptv-server/`, `api-config/` |
| Arquivos de rotas | camelCase + Routes | `iptvServerRoutes.js` |
| Componentes React | PascalCase | `BannerGenerator.jsx` |
| Services backend | camelCase + Service | `tmdbService.js` |
| Env vars | SCREAMING_SNAKE | `DATABASE_URL`, `JWT_SECRET` |
| API endpoints | kebab-case | `/api/iptv-server`, `/api/api-config` |
