# 🎨 Visualização da Integração JWT - Painel + App

## 📊 Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         SISTEMA DE AUTENTICAÇÃO JWT                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                          TV-MAXX-PRO-ANDROID                               │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ LoginScreen                                                            │ │
│  │ ├─ Email: user@example.com                                            │ │
│  │ └─ Senha: ••••••••                                                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ AuthRepository.login()                                                 │ │
│  │ ├─ POST /api/auth/login                                               │ │
│  │ ├─ Body: {                                                            │ │
│  │ │   email, senha,                                                     │ │
│  │ │   device_id: \"AA:BB:CC:DD:EE:FF\",                                 │ │
│  │ │   modelo: \"TV Box X96\",                                           │ │
│  │ │   android_version: \"11\",                                          │ │
│  │ │   app_version: \"1.0.0\"                                            │ │
│  │ └─ }                                                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ SessionManager.saveToken()                                             │ │
│  │ ├─ Salva JWT em SharedPreferences                                      │ │
│  │ └─ Salva config em SharedPreferences                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ HomeScreen                                                             │ │
│  │ ├─ Dashboard com canais                                               │ │
│  │ └─ Todas as requisições incluem JWT no header                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ JWT Token
                                    │ (mesmo secret)
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                    MAXXCONTROL X SISTEMA (PAINEL)                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Backend (Node.js)                                                      │ │
│  │                                                                        │ │
│  │ POST /api/auth/login                                                  │ │
│  │ ├─ Valida email/senha                                                 │ │
│  │ ├─ Registra device na tabela devices                                  │ │
│  │ ├─ Gera JWT token                                                     │ │
│  │ └─ Retorna: { user, token, config }                                   │ │
│  │                                                                        │ │
│  │ GET /api/auth/validate-token (com middleware)                         │ │
│  │ ├─ Valida JWT no header Authorization                                 │ │
│  │ └─ Retorna: { valid: true, userId }                                   │ │
│  │                                                                        │ │
│  │ DELETE /api/auth/logout (com middleware)                              │ │
│  │ └─ Retorna: { message: \"Logout realizado\" }                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Frontend (React)                                                       │ │
│  │                                                                        │ │
│  │ Login.jsx                                                              │ │
│  │ ├─ Formulário de login                                                │ │
│  │ └─ Chama AuthContext.login()                                          │ │
│  │                                                                        │ │
│  │ AuthContext.jsx                                                        │ │
│  │ ├─ Armazena token em localStorage                                     │ │
│  │ ├─ Envia token em Authorization header                                │ │
│  │ ├─ Valida token ao iniciar                                            │ │
│  │ └─ Implementa logout                                                  │ │
│  │                                                                        │ │
│  │ PrivateRoute.jsx                                                       │ │
│  │ ├─ Protege rotas que requerem autenticação                            │ │
│  │ ├─ Mostra loading enquanto valida                                     │ │
│  │ └─ Redireciona para login se não autenticado                          │ │
│  │                                                                        │ │
│  │ App.jsx                                                                │ │
│  │ └─ Todas as rotas protegidas com PrivateRoute                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Dashboard                                                              │ │
│  │ ├─ Dispositivos                                                        │ │
│  │ ├─ Monitor de APIs                                                    │ │
│  │ ├─ Configurar APIs                                                    │ │
│  │ ├─ Branding                                                           │ │
│  │ ├─ Servidor IPTV                                                      │ │
│  │ ├─ Banners                                                            │ │
│  │ ├─ Bugs                                                               │ │
│  │ ├─ Versões                                                            │ │
│  │ └─ Logs                                                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Login

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUXO DE LOGIN                                     │
└─────────────────────────────────────────────────────────────────────────────┘

PAINEL (React)                          BACKEND (Node.js)
─────────────────────────────────────────────────────────────────────────────

1. Usuário preenche formulário
   ├─ Email: user@example.com
   └─ Senha: senha123
                                        
2. Clica em \"Entrar\"
   │
   ▼
3. AuthContext.login(email, senha)
   │
   ▼
4. POST /api/auth/login                 ──────────────────────────────────────►
   {                                    
     email: \"user@example.com\",
     senha: \"senha123\"
   }
                                        5. Backend valida credenciais
                                           ├─ Busca usuário no banco
                                           ├─ Compara senha com bcrypt
                                           └─ Verifica status = 'ativo'
                                        
                                        6. Registra device (se device_id)
                                           ├─ INSERT/UPDATE na tabela devices
                                           └─ Retorna device_id
                                        
                                        7. Gera JWT token
                                           ├─ Payload: { id, email }
                                           ├─ Secret: JWT_SECRET
                                           └─ Expires: JWT_EXPIRES_IN
                                        
                                        8. Busca config IPTV
                                           └─ SELECT FROM iptv_server_config
                                        
                                        9. Retorna response
   ◄──────────────────────────────────────────────────────────────────────────
   {
     user: {
       id: 1,
       nome: \"Usuário\",
       email: \"user@example.com\",
       plano: \"free\",
       status: \"ativo\"
     },
     token: \"eyJhbGc...\",
     config: {
       painel_url: \"http://localhost:3000\",
       api_url: \"http://localhost:3000/api\",
       device_id: 1,
       mac_address: \"AA:BB:CC:DD:EE:FF\",
       iptv_config: { ... }
     }
   }

10. Salva token em localStorage
    ├─ localStorage.setItem('token', token)
    └─ localStorage.setItem('config', JSON.stringify(config))

11. Configura header Authorization
    └─ api.defaults.headers.common['Authorization'] = `Bearer ${token}`

12. Redireciona para Dashboard
    └─ navigate('/')

13. Dashboard carrega
    ├─ Todas as requisições incluem JWT no header
    └─ Backend valida token em cada requisição
```

---

## 🔐 Fluxo de Validação (ao iniciar)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE VALIDAÇÃO (AO INICIAR)                          │
└─────────────────────────────────────────────────────────────────────────────┘

PAINEL (React)                          BACKEND (Node.js)
─────────────────────────────────────────────────────────────────────────────

1. App inicia
   │
   ▼
2. AuthProvider carrega
   ├─ Lê token de localStorage
   └─ Se encontrou token → continua
      Se não encontrou → loading = false

3. useEffect([token])
   │
   ▼
4. Se token existe:
   ├─ Configura header Authorization
   └─ Chama validateToken()

5. GET /api/auth/validate-token        ──────────────────────────────────────►
   Header: Authorization: Bearer eyJhbGc...
                                        
                                        6. Middleware valida JWT
                                           ├─ Extrai token do header
                                           ├─ Verifica assinatura
                                           ├─ Verifica expiração
                                           └─ Se válido → req.userId = id
                                        
                                        7. Retorna response
   ◄──────────────────────────────────────────────────────────────────────────
   {
     valid: true,
     userId: 1
   }

8. Token válido
   ├─ loading = false
   └─ Renderiza Dashboard

   OU

8. Token inválido/expirado
   ├─ Chama logout()
   ├─ Remove token de localStorage
   ├─ loading = false
   └─ Renderiza Login
```

---

## 🚪 Fluxo de Logout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUXO DE LOGOUT                                    │
└─────────────────────────────────────────────────────────────────────────────┘

PAINEL (React)                          BACKEND (Node.js)
─────────────────────────────────────────────────────────────────────────────

1. Usuário clica em \"Sair\"
   │
   ▼
2. Layout.jsx chama logout()
   │
   ▼
3. AuthContext.logout()
   │
   ▼
4. DELETE /api/auth/logout              ──────────────────────────────────────►
   Header: Authorization: Bearer eyJhbGc...
                                        
                                        5. Middleware valida JWT
                                           └─ Se válido → continua
                                        
                                        6. Retorna response
   ◄──────────────────────────────────────────────────────────────────────────
   {
     message: \"Logout realizado com sucesso\"
   }

7. Remove token de localStorage
   ├─ localStorage.removeItem('token')
   └─ localStorage.removeItem('config')

8. Remove header Authorization
   └─ delete api.defaults.headers.common['Authorization']

9. Redireciona para login
   └─ navigate('/login')

10. Login renderizado
    └─ Usuário pode fazer login novamente
```

---

## 📊 Estrutura do Banco de Dados

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BANCO DE DADOS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

users
├─ id (PK)
├─ nome
├─ email (UNIQUE)
├─ senha_hash
├─ plano
├─ status
├─ expira_em
└─ criado_em

devices
├─ id (PK)
├─ user_id (FK → users.id)
├─ mac_address (UNIQUE)
├─ modelo
├─ android_version
├─ app_version
├─ ip
├─ ultimo_acesso
├─ status
└─ connection_status

iptv_server_config
├─ id (PK, DEFAULT 1)
├─ xtream_url
├─ xtream_username
├─ xtream_password
└─ updated_at

Relacionamento:
users (1) ──────────────── (N) devices
```

---

## 🔑 Variáveis de Ambiente

```
# Backend (.env)
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d
PAINEL_URL=http://localhost:3000
API_URL=http://localhost:3000/api

# Frontend (.env)
VITE_API_URL=http://localhost:3000/api
```

---

## 📱 Integração App ↔ Painel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTEGRAÇÃO APP ↔ PAINEL                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Usuário faz login no APP
│
├─ AuthRepository.login(email, senha, device_id)
├─ POST /api/auth/login (com device_id)
├─ Backend registra device
├─ SessionManager salva token
└─ App acessa APIs com JWT

                    ↓ (mesmo JWT_SECRET)

Usuário faz login no PAINEL
│
├─ AuthContext.login(email, senha)
├─ POST /api/auth/login (sem device_id)
├─ Backend valida credenciais
├─ localStorage salva token
└─ Painel acessa APIs com JWT

                    ↓

Ambos têm acesso às mesmas APIs
├─ Mesma conta
├─ Tokens diferentes (esperado)
├─ Ambos conseguem acessar dados
└─ Logout em um não afeta o outro
```

---

## ✅ Checklist de Implementação

```
Backend
├─ [x] Modificar authController.js
│  ├─ [x] Adicionar device_id ao login
│  ├─ [x] Registrar device na tabela devices
│  ├─ [x] Retornar config no response
│  └─ [x] Adicionar logout()
├─ [x] Modificar authRoutes.js
│  └─ [x] Adicionar DELETE /logout
└─ [x] Middleware auth.js (já existia)

Frontend
├─ [x] Atualizar AuthContext.jsx
│  ├─ [x] Adicionar loading state
│  ├─ [x] Adicionar deviceInfo ao login
│  ├─ [x] Salvar config em localStorage
│  └─ [x] Implementar logout com chamada ao backend
├─ [x] Criar PrivateRoute.jsx
│  ├─ [x] Proteger rotas
│  ├─ [x] Mostrar loading
│  └─ [x] Redirecionar para login
└─ [x] Atualizar App.jsx
   └─ [x] Importar PrivateRoute

Documentação
├─ [x] PLANO_INTEGRACAO_JWT_PAINEL_COMPLETO.md
├─ [x] TESTAR_INTEGRACAO_JWT_PAINEL.md
├─ [x] RESUMO_INTEGRACAO_JWT_PAINEL_CONCLUIDA.md
└─ [x] VISUAL_INTEGRACAO_JWT_PAINEL.md (este arquivo)
```

---

## 🎉 Status

**Implementação: ✅ CONCLUÍDA**

Todos os componentes foram implementados e documentados. O sistema está pronto para testes.

