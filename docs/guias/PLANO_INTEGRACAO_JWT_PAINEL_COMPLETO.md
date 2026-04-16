# 🔗 Plano Completo de Integração JWT - Painel + App

## 📋 Resumo Executivo

O painel `maxxcontrol-x-sistema` já possui uma estrutura de autenticação JWT. Vamos integrar completamente com o app Android para que funcionem como um sistema único.

**Status Atual:**
- ✅ Backend: JWT endpoints já existem (`login`, `validate-token`)
- ✅ Frontend: AuthContext e Login.jsx já existem
- ⚠️ **Faltando**: Adicionar suporte a `device_id` e retorno de configurações

---

## 🎯 Objetivos da Integração

1. **Backend**: Adicionar suporte a device_id nos endpoints JWT
2. **Backend**: Retornar configurações (URLs, IPTV, branding) no login
3. **Frontend**: Garantir que JWT seja armazenado e enviado corretamente
4. **Testes**: Validar integração entre app e painel

---

## 📊 Análise do Estado Atual

### ✅ O Que Já Existe no Painel

**Backend:**
```javascript
// modules/auth/authController.js
- register() ✅
- login() ✅ (retorna user + token)
- validateToken() ✅

// modules/auth/authRoutes.js
- POST /api/auth/register ✅
- POST /api/auth/login ✅
- GET /api/auth/validate-token ✅ (com middleware)

// middlewares/auth.js
- Valida JWT no header Authorization ✅
- Extrai userId e userEmail ✅
```

**Frontend:**
```javascript
// web/src/context/AuthContext.jsx
- Armazena token em localStorage ✅
- Envia token em Authorization header ✅
- Valida token ao iniciar ✅
- login() e logout() ✅

// web/src/pages/Login.jsx
- Formulário de login ✅
- Integrado com AuthContext ✅
- Redireciona para Dashboard ✅
```

**Banco de Dados:**
```sql
- users table ✅
- devices table ✅ (com user_id)
- Relacionamento user → devices ✅
```

---

## 🔴 O Que Falta

### 1. Backend - Adicionar device_id

**Problema:** O endpoint de login não registra o device_id do app

**Solução:**
```javascript
// modules/auth/authController.js - login()
// Adicionar:
- Receber device_id no body
- Registrar/atualizar device na tabela devices
- Retornar device_id no response
```

### 2. Backend - Retornar Configurações

**Problema:** O endpoint de login não retorna URLs e configurações

**Solução:**
```javascript
// modules/auth/authController.js - login()
// Adicionar no response:
- painel_url: URL do painel
- iptv_config: Credenciais IPTV
- branding: Dados de branding
- device_id: ID do dispositivo registrado
```

### 3. Backend - Adicionar Logout

**Problema:** Não há endpoint de logout

**Solução:**
```javascript
// modules/auth/authController.js
// Adicionar:
- logout() - Invalida token (opcional)

// modules/auth/authRoutes.js
// Adicionar:
- DELETE /api/auth/logout
```

### 4. Frontend - Proteção de Rotas

**Problema:** Não há proteção de rotas (qualquer um pode acessar)

**Solução:**
```javascript
// web/src/App.jsx
// Adicionar:
- PrivateRoute component
- Verificar token antes de renderizar
- Redirecionar para login se inválido
```

---

## 🚀 Plano de Ação Detalhado

### Fase 1: Backend - Modificar Endpoints (30 min)

#### 1.1 Modificar `modules/auth/authController.js`

**Mudanças:**
- Adicionar `device_id` ao login
- Registrar device na tabela devices
- Retornar configurações no response
- Adicionar logout()

**Código:**
```javascript
// login() - Adicionar:
const { email, senha, device_id, modelo, android_version, app_version } = req.body;

// Registrar/atualizar device
const deviceResult = await pool.query(
  `INSERT INTO devices (user_id, mac_address, modelo, android_version, app_version, status)
   VALUES ($1, $2, $3, $4, $5, 'ativo')
   ON CONFLICT (mac_address) DO UPDATE SET
   user_id = $1, modelo = $3, android_version = $4, app_version = $5, ultimo_acesso = NOW()
   RETURNING id`,
  [user.id, device_id, modelo, android_version, app_version]
);

// Retornar configurações
const config = {
  painel_url: process.env.PAINEL_URL || 'http://localhost:3000',
  iptv_config: { /* credenciais */ },
  branding: { /* dados */ },
  device_id: deviceResult.rows[0].id
};

res.json({ user, token, config });
```

#### 1.2 Adicionar Logout

**Código:**
```javascript
exports.logout = async (req, res) => {
  // Logout é stateless em JWT, apenas retorna sucesso
  res.json({ message: 'Logout realizado com sucesso' });
};
```

#### 1.3 Atualizar `modules/auth/authRoutes.js`

**Adicionar:**
```javascript
router.delete('/logout', authMiddleware, authController.logout);
```

---

### Fase 2: Frontend - Proteção de Rotas (20 min)

#### 2.1 Criar `web/src/components/PrivateRoute.jsx`

**Código:**
```javascript
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

export default PrivateRoute
```

#### 2.2 Atualizar `web/src/App.jsx`

**Adicionar:**
```javascript
import PrivateRoute from './components/PrivateRoute'

// Nas rotas:
<Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
<Route path="/devices" element={<PrivateRoute><Devices /></PrivateRoute>} />
// ... outras rotas protegidas
```

---

### Fase 3: Testes (30 min)

#### 3.1 Testar Backend

**Postman:**
```
POST /api/auth/login
Body:
{
  "email": "user@example.com",
  "senha": "senha123",
  "device_id": "AA:BB:CC:DD:EE:FF",
  "modelo": "TV Box",
  "android_version": "11",
  "app_version": "1.0.0"
}

Response:
{
  "user": { ... },
  "token": "eyJhbGc...",
  "config": {
    "painel_url": "http://localhost:3000",
    "iptv_config": { ... },
    "branding": { ... },
    "device_id": 1
  }
}
```

#### 3.2 Testar Frontend

**Passos:**
1. Abrir painel em http://localhost:5173
2. Fazer login com credenciais válidas
3. Verificar se token foi salvo em localStorage
4. Recarregar página - deve manter login
5. Clicar em logout
6. Verificar se foi redirecionado para login

#### 3.3 Testar Integração App ↔ Painel

**Passos:**
1. Fazer login no app Android
2. Fazer login no painel com mesma conta
3. Verificar se ambos têm o mesmo token
4. Fazer logout no app
5. Verificar se painel ainda funciona (tokens são independentes)

---

## 📁 Arquivos a Modificar

| Arquivo | Mudança | Prioridade |
|---------|---------|-----------|
| `modules/auth/authController.js` | Adicionar device_id e config | 🔴 Alta |
| `modules/auth/authRoutes.js` | Adicionar DELETE /logout | 🔴 Alta |
| `web/src/components/PrivateRoute.jsx` | Criar novo arquivo | 🟡 Média |
| `web/src/App.jsx` | Adicionar proteção de rotas | 🟡 Média |
| `web/src/context/AuthContext.jsx` | Adicionar logout() | 🟡 Média |

---

## ⏱️ Cronograma

| Fase | Tarefa | Tempo | Status |
|------|--------|-------|--------|
| 1 | Modificar authController.js | 15 min | ⏳ |
| 1 | Modificar authRoutes.js | 5 min | ⏳ |
| 2 | Criar PrivateRoute.jsx | 10 min | ⏳ |
| 2 | Atualizar App.jsx | 10 min | ⏳ |
| 3 | Testar backend | 15 min | ⏳ |
| 3 | Testar frontend | 15 min | ⏳ |
| **Total** | | **70 min** | |

---

## ✅ Checklist de Implementação

- [ ] Modificar `authController.js` - adicionar device_id
- [ ] Modificar `authController.js` - adicionar retorno de config
- [ ] Modificar `authController.js` - adicionar logout()
- [ ] Modificar `authRoutes.js` - adicionar DELETE /logout
- [ ] Criar `PrivateRoute.jsx`
- [ ] Atualizar `App.jsx` - adicionar proteção de rotas
- [ ] Testar login no Postman
- [ ] Testar login no painel
- [ ] Testar integração app ↔ painel
- [ ] Documentar mudanças

---

## 🔗 Referências

- App Android JWT: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/data/repository/AuthRepository.kt`
- Implementação JWT: `MaxxControl/RESUMO_FINAL_JWT_IMPLEMENTACAO.md`
- Análise Conexão: `MaxxControl/ANALISE_MESH_TV_CONEXAO_PAINEL.md`

---

## 📞 Próximos Passos

1. ✅ Implementar mudanças no backend
2. ✅ Implementar proteção de rotas no frontend
3. ✅ Testar integração completa
4. ✅ Documentar processo
5. ✅ Deploy em produção

