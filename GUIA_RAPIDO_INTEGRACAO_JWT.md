# ⚡ Guia Rápido - Integração JWT Painel + App

## 🎯 Resumo em 30 Segundos

✅ **O que foi feito:**
- Backend: Adicionado suporte a device_id e retorno de configurações
- Frontend: Adicionada proteção de rotas com PrivateRoute
- Ambos: Implementado logout com chamada ao backend

✅ **Status:** Pronto para testes

---

## 📝 Mudanças Principais

### Backend (3 arquivos)

**1. `modules/auth/authController.js`**
```javascript
// Login agora:
// - Recebe device_id, modelo, versões
// - Registra device na tabela devices
// - Retorna config (URLs, IPTV, device_id)

// Novo método:
exports.logout = async (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
};
```

**2. `modules/auth/authRoutes.js`**
```javascript
// Adicionada rota:
router.delete('/logout', authMiddleware, authController.logout);
```

**3. `middlewares/auth.js`**
```javascript
// Já existia, sem mudanças
// Valida JWT no header Authorization
```

---

### Frontend (3 arquivos)

**1. `web/src/context/AuthContext.jsx`**
```javascript
// Adicionado:
// - loading state
// - deviceInfo no login
// - logout com chamada ao backend
// - salvar config em localStorage

const login = async (email, senha, deviceInfo = {}) => {
  // Envia device_id, modelo, versões
  // Salva config em localStorage
  // Retorna user e config
}

const logout = async () => {
  // Chama DELETE /api/auth/logout
  // Remove token e config de localStorage
}
```

**2. `web/src/components/PrivateRoute.jsx`** (novo)
```javascript
// Protege rotas que requerem autenticação
// Mostra loading enquanto valida
// Redireciona para login se não autenticado
```

**3. `web/src/App.jsx`**
```javascript
// Importa PrivateRoute
// Usa PrivateRoute para proteger rotas
```

---

## 🧪 Testes Rápidos

### Backend (Postman)
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "user@example.com",
  "senha": "senha123",
  "device_id": "AA:BB:CC:DD:EE:FF",
  "modelo": "TV Box",
  "android_version": "11",
  "app_version": "1.0.0"
}

# Response:
{
  "user": { ... },
  "token": "eyJhbGc...",
  "config": {
    "painel_url": "http://localhost:3000",
    "api_url": "http://localhost:3000/api",
    "device_id": 1,
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "iptv_config": { ... }
  }
}
```

### Frontend (Painel)
```
1. Abrir http://localhost:5173
2. Fazer login
3. Verificar localStorage: localStorage.getItem('token')
4. Recarregar página - deve manter login
5. Clicar em "Sair" - deve fazer logout
```

### App Android
```
1. Fazer login com mesma conta
2. Verificar se device foi registrado no painel
3. Fazer logout no app
4. Verificar se painel continua funcionando
```

---

## 📊 Fluxo de Autenticação

```
LOGIN
├─ Usuário preenche email/senha
├─ Frontend envia POST /api/auth/login
├─ Backend valida e registra device
├─ Backend retorna token + config
├─ Frontend salva em localStorage
└─ Frontend redireciona para Dashboard

VALIDAÇÃO (ao iniciar)
├─ Frontend carrega token de localStorage
├─ Frontend envia GET /api/auth/validate-token
├─ Backend valida token
├─ Se válido → Mantém login
└─ Se inválido → Faz logout

LOGOUT
├─ Usuário clica em "Sair"
├─ Frontend envia DELETE /api/auth/logout
├─ Frontend remove token de localStorage
└─ Frontend redireciona para login
```

---

## 🔑 Variáveis de Ambiente

```
# Backend (.env)
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d
PAINEL_URL=http://localhost:3000
API_URL=http://localhost:3000/api
```

---

## 📁 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `modules/auth/authController.js` | ✅ Adicionado device_id, config, logout |
| `modules/auth/authRoutes.js` | ✅ Adicionada rota DELETE /logout |
| `web/src/context/AuthContext.jsx` | ✅ Adicionado loading, deviceInfo, logout |
| `web/src/components/PrivateRoute.jsx` | ✅ Novo arquivo |
| `web/src/App.jsx` | ✅ Importa PrivateRoute |

---

## 🚀 Próximos Passos

1. **Testar Backend**
   ```bash
   # Testar login com device_id
   # Testar validação de token
   # Testar logout
   ```

2. **Testar Frontend**
   ```bash
   # Testar login no painel
   # Testar persistência de token
   # Testar proteção de rotas
   # Testar logout
   ```

3. **Testar Integração**
   ```bash
   # Testar login em ambos
   # Testar device registrado
   # Testar logout independente
   ```

4. **Deploy**
   ```bash
   # Deploy backend em produção
   # Deploy frontend em produção
   # Testar em produção
   ```

---

## 📚 Documentação Completa

- `PLANO_INTEGRACAO_JWT_PAINEL_COMPLETO.md` - Plano detalhado
- `TESTAR_INTEGRACAO_JWT_PAINEL.md` - Guia de testes
- `RESUMO_INTEGRACAO_JWT_PAINEL_CONCLUIDA.md` - Resumo da implementação
- `VISUAL_INTEGRACAO_JWT_PAINEL.md` - Visualização da arquitetura
- `GUIA_RAPIDO_INTEGRACAO_JWT.md` - Este arquivo

---

## ✅ Checklist

- [x] Backend modificado
- [x] Frontend modificado
- [x] PrivateRoute criado
- [x] Documentação criada
- [ ] Testes executados
- [ ] Deploy em produção

---

## 🎉 Status

**Implementação: ✅ CONCLUÍDA**

Pronto para testes!

