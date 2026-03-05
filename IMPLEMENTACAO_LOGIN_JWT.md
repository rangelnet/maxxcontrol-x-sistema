# 🔐 Implementação: Login com JWT Token

## 📋 Resumo

Vamos implementar autenticação com JWT mantendo o layout e cores do TV-MAXX-PRO.

**Abordagem**: Opção 2 (Login com JWT)  
**Layout**: Mantém o atual (sem mudanças)  
**Cores**: TV-MAXX-PRO (laranja #FF6A00)  
**Status**: Em Progresso

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  BACKEND (MaxxControl)                                          │
│  ├─ POST /api/auth/login          → Autentica usuário          │
│  ├─ DELETE /api/auth/logout       → Faz logout                 │
│  ├─ GET /api/auth/validate        → Valida token               │
│  └─ GET /api/app-config/config    → Config do app              │
│                                                                 │
│  APP ANDROID (TV-MAXX-PRO)                                      │
│  ├─ LoginScreen (Mantém layout)                                │
│  ├─ LoginViewModel (Novo: JWT)                                 │
│  ├─ AuthRepository (Novo)                                      │
│  └─ MainActivity (Atualizado)                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Login

```
1. Usuário abre app
   ↓
2. Verifica se JWT token existe
   ├─ Sim → Valida com backend
   │        ├─ Válido? → Vai para home
   │        └─ Expirado? → Vai para login
   └─ Não → Vai para login
   ↓
3. Tela de Login (Layout mantido)
   ├─ Usuário digita credenciais
   ├─ Clica "ENTRAR ▶"
   └─ POST /api/auth/login
      ├─ Envia: email, password, device_id
      └─ Retorna: JWT token + user + config
   ↓
4. App armazena token (SharedPreferences)
   ↓
5. App busca config (GET /api/app-config/config)
   ↓
6. App busca branding (GET /api/branding/active)
   ↓
7. App busca credenciais Xtream (GET /api/iptv-server/config)
   ↓
8. App navega para home
   ↓
9. Usuário usa app normalmente
   ↓
10. Logout (DELETE /api/auth/logout)
    ├─ Remove token
    └─ Volta para login
```

---

## 📝 Mudanças Necessárias

### Backend (MaxxControl)

#### 1. Atualizar authController.js
- ✅ Já tem login() e validateToken()
- ⏳ Adicionar logout()
- ⏳ Adicionar device_id ao token

#### 2. Criar authRoutes.js
- ✅ Provavelmente já existe
- ⏳ Validar rotas

#### 3. Criar middleware de autenticação
- ⏳ Validar JWT token
- ⏳ Extrair userId do token

### App Android (TV-MAXX-PRO)

#### 1. Atualizar LoginViewModel
- ⏳ Adicionar função login() com JWT
- ⏳ Adicionar função logout()
- ⏳ Adicionar função validateToken()
- ⏳ Armazenar token em SharedPreferences

#### 2. Criar AuthRepository
- ⏳ Função login()
- ⏳ Função logout()
- ⏳ Função validateToken()

#### 3. Atualizar MainActivity
- ⏳ Verificar se token existe
- ⏳ Validar token ao iniciar
- ⏳ Navegar para login ou home

#### 4. Atualizar LoginScreen
- ✅ Layout mantido
- ✅ Cores mantidas
- ⏳ Integrar com novo LoginViewModel

---

## 🔑 Endpoints da API

### POST /api/auth/login
```
Request:
{
  "email": "usuario@email.com",
  "password": "senha123",
  "device_id": "AA:BB:CC:DD:EE:FF",
  "device_model": "Xiaomi Mi Box S",
  "app_version": "1.0.0"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nome": "Usuário",
    "email": "usuario@email.com",
    "plano": "premium",
    "status": "ativo"
  },
  "config": {
    "server_url": "https://...",
    "api_base_url": "https://...",
    "iptv_url": "http://...",
    "iptv_user": "user123",
    "iptv_pass": "pass456"
  }
}
```

### DELETE /api/auth/logout
```
Request:
Header: Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### GET /api/auth/validate
```
Request:
Header: Authorization: Bearer {token}

Response:
{
  "valid": true,
  "user": {...},
  "expires_in": 3600
}
```

---

## 🛠️ Implementação Passo a Passo

### Passo 1: Backend - Atualizar authController.js
- [ ] Adicionar logout()
- [ ] Adicionar device_id ao token
- [ ] Testar com Postman

### Passo 2: Backend - Criar middleware
- [ ] Criar authMiddleware.js
- [ ] Validar JWT token
- [ ] Extrair userId

### Passo 3: App - Criar AuthRepository
- [ ] Criar arquivo AuthRepository.kt
- [ ] Implementar login()
- [ ] Implementar logout()
- [ ] Implementar validateToken()

### Passo 4: App - Atualizar LoginViewModel
- [ ] Integrar com AuthRepository
- [ ] Adicionar armazenamento de token
- [ ] Adicionar validação de token

### Passo 5: App - Atualizar MainActivity
- [ ] Verificar token ao iniciar
- [ ] Validar token com backend
- [ ] Navegar para login ou home

### Passo 6: Testes
- [ ] Testar login com credenciais válidas
- [ ] Testar login com credenciais inválidas
- [ ] Testar logout
- [ ] Testar token expirado
- [ ] Testar persistência de token

---

## 📊 Status

| Componente | Status | Detalhes |
|-----------|--------|----------|
| Backend - authController | ✅ | Já tem login() |
| Backend - logout | ⏳ | Precisa adicionar |
| Backend - middleware | ⏳ | Precisa criar |
| App - AuthRepository | ⏳ | Precisa criar |
| App - LoginViewModel | ⏳ | Precisa atualizar |
| App - MainActivity | ⏳ | Precisa atualizar |
| Testes | ⏳ | Precisa fazer |

---

## 🚀 Próximos Passos

1. Implementar backend
2. Implementar app
3. Testar integração
4. Deploy

---

**Data**: 1º de Março de 2026  
**Status**: ✅ Planejamento Completo  
**Próximo**: Começar Implementação

