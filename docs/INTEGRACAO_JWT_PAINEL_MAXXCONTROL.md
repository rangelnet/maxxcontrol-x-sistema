# � Integração JWT no Painel MaxxControl X Sistema

## 📋 Visão Geral

O painel `maxxcontrol-x-sistema` já possui uma estrutura de autenticação. Vamos integrar o JWT que foi implementado no app Android para que o painel e o app funcionem com o mesmo sistema de autenticação.

## �️ Estrutura Atual do Painel

```
maxxcontrol-x-sistema/
├── modules/
│   ├── auth/              ← Módulo de autenticação
│   ├── api-config/
│   ├── banners/
│   ├── branding/
│   ├── content/
│   ├── iptv-server/
│   └── ...
├── middlewares/
│   ├── auth.js            ← Middleware de autenticação
│   └── deviceAuth.js
├── web/                   ← Frontend React
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   └── ...
│       └── context/
│           └── AuthContext.jsx
├── config/
│   ├── database.js
│   └── supabase.js
└── server.js
```

## ✅ O Que Já Existe

- ✅ Módulo de autenticação (`modules/auth/`)
- ✅ Middleware de autenticação (`middlewares/auth.js`)
- ✅ Frontend com Login (`web/src/pages/Login.jsx`)
- ✅ Context de autenticação (`web/src/context/AuthContext.jsx`)
- ✅ Banco de dados configurado (Supabase/SQLite)

## 🔄 O Que Precisa Ser Integrado

### Backend (Node.js)

1. **Verificar endpoints JWT existentes**
   - `POST /api/auth/login` - Já existe?
   - `GET /api/auth/validate-token` - Já existe?
   - `DELETE /api/auth/logout` - Já existe?

2. **Adicionar suporte a device_id**
   - Registrar device_id do app na tabela de devices
   - Associar JWT com device_id

3. **Adicionar retorno de config**
   - Retornar URLs dinâmicas do painel
   - Retornar credenciais IPTV
   - Retornar dados de branding

### Frontend (React)

1. **Atualizar AuthContext**
   - Adicionar suporte a JWT tokens
   - Armazenar token em localStorage
   - Enviar token em Authorization header

2. **Atualizar Login.jsx**
   - Integrar com endpoints JWT
   - Salvar token após login
   - Redirecionar para Dashboard

3. **Adicionar proteção de rotas**
   - Verificar token antes de acessar páginas
   - Redirecionar para login se token inválido

## � Plano de Ação

### Fase 1: Verificação (Hoje)
- [ ] Verificar endpoints JWT existentes em `modules/auth/`
- [ ] Verificar estrutura do banco de dados
- [ ] Verificar AuthContext atual

### Fase 2: Backend (Amanhã)
- [ ] Adicionar suporte a device_id nos endpoints
- [ ] Adicionar retorno de config nos endpoints
- [ ] Testar endpoints com Postman

### Fase 3: Frontend (Amanhã)
- [ ] Atualizar AuthContext com JWT
- [ ] Atualizar Login.jsx
- [ ] Adicionar proteção de rotas

### Fase 4: Testes (Amanhã)
- [ ] Testar login no painel
- [ ] Testar login no app
- [ ] Testar token persistence
- [ ] Testar logout

## 🔗 Conexão App ↔ Painel

```
┌─────────────────────────────────────────────────────────┐
│                    TV-MAXX-PRO-Android                  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ LoginScreen                                      │  │
│  │ ├─ Email + Senha                                │  │
│  │ └─ POST /api/auth/login                         │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ AuthRepository                                   │  │
│  │ ├─ login()                                       │  │
│  │ ├─ logout()                                      │  │
│  │ └─ validateToken()                              │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ SessionManager                                   │  │
│  │ ├─ saveToken()                                   │  │
│  │ ├─ getToken()                                    │  │
│  │ └─ clearToken()                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ JWT Token
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              MaxxControl X Sistema (Painel)             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Backend (Node.js)                                │  │
│  │ ├─ POST /api/auth/login                          │  │
│  │ ├─ GET /api/auth/validate-token                  │  │
│  │ └─ DELETE /api/auth/logout                       │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Frontend (React)                                 │  │
│  │ ├─ Login.jsx                                     │  │
│  │ ├─ AuthContext.jsx                               │  │
│  │ └─ Dashboard.jsx                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Resultado Final

Após a integração:

1. **App Android**
   - Faz login com email/senha
   - Recebe JWT token
   - Salva token em SharedPreferences
   - Valida token na inicialização
   - Usa token para acessar APIs

2. **Painel Web**
   - Faz login com email/senha
   - Recebe JWT token
   - Salva token em localStorage
   - Valida token em cada requisição
   - Usa token para acessar APIs

3. **Backend**
   - Valida JWT em todas as requisições
   - Retorna dados específicos do usuário
   - Gerencia sessões de múltiplos dispositivos

## 📞 Próximos Passos

1. Verificar endpoints JWT existentes
2. Verificar estrutura do banco de dados
3. Adicionar suporte a device_id
4. Atualizar frontend com JWT
5. Testar integração completa

