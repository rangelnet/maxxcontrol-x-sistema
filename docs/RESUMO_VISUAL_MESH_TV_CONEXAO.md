# 🎨 Resumo Visual: Conexão MESH TV ↔ Painel

## 🔄 Fluxo Completo em 4 Passos

### Passo 1: Login
```
┌─────────────────────────────────────────┐
│  TELA DE LOGIN (ActivityMac)            │
│                                         │
│  Usuário: [usuario@email.com]           │
│  Senha:   [••••••••]                    │
│                                         │
│  [ Entrar ]                             │
└─────────────────────────────────────────┘
         │
         │ POST /auth/login
         │ {username, password, device_id}
         ▼
┌─────────────────────────────────────────┐
│  BACKEND (Node.js)                      │
│                                         │
│  ✓ Valida credenciais                   │
│  ✓ Gera JWT token                       │
│  ✓ Retorna token + config               │
└─────────────────────────────────────────┘
         │
         │ Retorna: {token, user, config}
         ▼
┌─────────────────────────────────────────┐
│  APP ANDROID                            │
│                                         │
│  ✓ Armazena token (SharedPreferences)   │
│  ✓ Armazena config (banco local)        │
│  ✓ Navega para home                     │
└─────────────────────────────────────────┘
```

### Passo 2: Carregar Canais
```
┌─────────────────────────────────────────┐
│  HOME SCREEN (HomeMeshActivity)         │
│                                         │
│  Carregando canais...                   │
└─────────────────────────────────────────┘
         │
         │ GET /api/channels
         │ Header: Authorization: Bearer {token}
         ▼
┌─────────────────────────────────────────┐
│  BACKEND (Node.js)                      │
│                                         │
│  ✓ Valida token                         │
│  ✓ Busca canais do banco                │
│  ✓ Retorna lista de canais              │
└─────────────────────────────────────────┘
         │
         │ Retorna: {channels: [...]}
         ▼
┌─────────────────────────────────────────┐
│  APP ANDROID                            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Globo          [Logo]           │   │
│  │ SBT            [Logo]           │   │
│  │ Record         [Logo]           │   │
│  │ Band           [Logo]           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ✓ Renderiza canais na tela             │
└─────────────────────────────────────────┘
```

### Passo 3: Reproduzir Canal
```
┌─────────────────────────────────────────┐
│  HOME SCREEN                            │
│                                         │
│  Usuário seleciona "Globo"              │
└─────────────────────────────────────────┘
         │
         │ Extrai URL do canal
         │ Inicia LiveTvActivity1
         ▼
┌─────────────────────────────────────────┐
│  PLAYER SCREEN (LiveTvActivity1)        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [REPRODUZINDO GLOBO]       │   │
│  │                                 │   │
│  │      ▶ ━━━━━━━━━━━━━━━━ 45%    │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ✓ Inicializa player (VLC/IJK)         │
│  ✓ Reproduz stream                     │
└─────────────────────────────────────────┘
```

### Passo 4: Logout
```
┌─────────────────────────────────────────┐
│  SETTINGS SCREEN (SettingsActivityTv)   │
│                                         │
│  [ Sair ]                               │
└─────────────────────────────────────────┘
         │
         │ DELETE /auth/logout
         │ Header: Authorization: Bearer {token}
         ▼
┌─────────────────────────────────────────┐
│  BACKEND (Node.js)                      │
│                                         │
│  ✓ Invalida token                       │
│  ✓ Retorna sucesso                      │
└─────────────────────────────────────────┘
         │
         │ Retorna: {success: true}
         ▼
┌─────────────────────────────────────────┐
│  APP ANDROID                            │
│                                         │
│  ✓ Remove token (SharedPreferences)     │
│  ✓ Limpa banco local                    │
│  ✓ Navega para login                    │
└─────────────────────────────────────────┘
```

---

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  CAMADA DE APRESENTAÇÃO                                         │
│                                                                 │
│  ┌──────────────────────────┐      ┌──────────────────────────┐│
│  │  PAINEL WEB (React)      │      │  APP ANDROID (Compose)   ││
│  │                          │      │                          ││
│  │  ├─ Dashboard            │      │  ├─ LoginScreen          ││
│  │  ├─ Dispositivos         │      │  ├─ HomeScreen           ││
│  │  ├─ Servidor IPTV        │      │  ├─ PlayerScreen         ││
│  │  ├─ Branding             │      │  └─ SettingsScreen       ││
│  │  └─ Gerenciar Banners    │      │                          ││
│  │                          │      │                          ││
│  └──────────────────────────┘      └──────────────────────────┘│
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS REST API
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│  CAMADA DE APLICAÇÃO                                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  BACKEND (Node.js + Express)                            │  │
│  │                                                          │  │
│  │  POST   /auth/login          → Autentica usuário        │  │
│  │  DELETE /auth/logout         → Faz logout              │  │
│  │  GET    /auth/validate       → Valida token            │  │
│  │  GET    /api/channels        → Lista canais            │  │
│  │  GET    /api/categories      → Lista categorias        │  │
│  │  GET    /api/branding        → Busca branding          │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│  CAMADA DE DADOS                                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  BANCO DE DADOS (PostgreSQL)                            │  │
│  │                                                          │  │
│  │  ├─ users (id, username, password, email, plan)        │  │
│  │  ├─ channels (id, name, logo, url, category)           │  │
│  │  ├─ categories (id, name, icon)                        │  │
│  │  ├─ branding (id, logo, colors, splash)                │  │
│  │  ├─ devices (id, mac_address, model, status)           │  │
│  │  └─ logs (id, device_id, type, description)            │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Segurança: JWT Token

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  JWT TOKEN STRUCTURE                                            │
│                                                                 │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.                         │
│  eyJzdWIiOiJ1c3VhcmlvQGVtYWlsLmNvbSIsImlhdCI6MTcwOTI1MTIwMH0. │
│  SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  HEADER (Base64)                                        │   │
│  │  {                                                      │   │
│  │    "alg": "HS256",                                      │   │
│  │    "typ": "JWT"                                         │   │
│  │  }                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PAYLOAD (Base64)                                       │   │
│  │  {                                                      │   │
│  │    "sub": "usuario@email.com",                          │   │
│  │    "iat": 1709251200,                                   │   │
│  │    "exp": 1709337600,                                   │   │
│  │    "device_id": "AA:BB:CC:DD:EE:FF",                    │   │
│  │    "plan": "premium"                                    │   │
│  │  }                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SIGNATURE (HMACSHA256)                                 │   │
│  │  HMACSHA256(                                            │   │
│  │    base64UrlEncode(header) + "." +                      │   │
│  │    base64UrlEncode(payload),                            │   │
│  │    secret                                               │   │
│  │  )                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparação: MESH TV vs TV-MAXX-PRO

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  MESH TV                          TV-MAXX-PRO                    │
│  ─────────────────────────────────────────────────────────────   │
│                                                                  │
│  ✓ Tela de Login                  ✓ Sem Login (Direto)          │
│  ✓ JWT Token                      ✓ Token Fixo                  │
│  ✓ Múltiplos Usuários             ✓ Um "Usuário" (TV Box)       │
│  ✓ Mais Seguro                    ✓ Mais Rápido                 │
│  ✓ Mais Complexo                  ✓ Mais Simples                │
│                                                                  │
│  Fluxo:                           Fluxo:                        │
│  1. Login                         1. Inicialização              │
│  2. Busca Config                  2. Busca Config               │
│  3. Busca Canais                  3. Busca Canais               │
│  4. Reproduz                      4. Reproduz                   │
│  5. Logout                        5. Continua                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Opções de Implementação

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  OPÇÃO 1: MANTER ATUAL (Recomendado Agora)                     │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ✓ Simples                                                      │
│  ✓ Rápido                                                       │
│  ✓ Já implementado                                              │
│  ✓ Funciona bem para TV Box único                               │
│                                                                 │
│  ❌ Menos seguro                                                │
│  ❌ Sem múltiplos usuários                                      │
│                                                                 │
│  Fluxo:                                                         │
│  App Inicia → Busca Config → Busca Canais → Pronto!            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  OPÇÃO 2: IMPLEMENTAR LOGIN (Para Múltiplos Usuários)           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ✓ Mais seguro                                                  │
│  ✓ Múltiplos usuários                                           │
│  ✓ Padrão da indústria                                          │
│  ✓ Melhor controle                                              │
│                                                                 │
│  ❌ Mais complexo                                               │
│  ❌ Mais lento                                                  │
│  ❌ Menos amigável para TV Box                                  │
│                                                                 │
│  Fluxo:                                                         │
│  App Inicia → Login → Busca Config → Busca Canais → Pronto!    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  OPÇÃO 3: HÍBRIDA (Recomendado Futuro)                          │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ✓ Melhor dos dois mundos                                       │
│  ✓ Flexível (login ou token fixo)                               │
│  ✓ Seguro (JWT quando disponível)                               │
│  ✓ Rápido (token fixo como fallback)                            │
│                                                                 │
│  ❌ Mais complexo                                               │
│  ❌ Mais código                                                 │
│                                                                 │
│  Fluxo:                                                         │
│  App Inicia → Oferece Opções → Login ou Token Fixo → Pronto!   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Activities do MESH TV

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ActivityMac (Login)                                            │
│  ├─ Tela de login                                               │
│  ├─ Valida credenciais                                          │
│  └─ Navega para home                                            │
│                                                                 │
│  HomeMeshActivity (Dashboard)                                   │
│  ├─ Carrega canais                                              │
│  ├─ Exibe categorias                                            │
│  ├─ Exibe canais por categoria                                  │
│  └─ Permite navegação com D-Pad                                 │
│                                                                 │
│  LiveTvActivity1 (Reprodutor)                                   │
│  ├─ Recebe URL do canal                                         │
│  ├─ Inicializa player (VLC/IJK)                                 │
│  ├─ Reproduz stream                                             │
│  └─ Controla com D-Pad                                          │
│                                                                 │
│  SettingsActivityTv (Configurações)                             │
│  ├─ Permite trocar servidor IPTV                                │
│  ├─ Permite fazer logout                                        │
│  └─ Permite limpar cache                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Próximos Passos

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  HOJE (1º de Março de 2026)                                     │
│  ├─ ✅ Analisar MESH TV                                         │
│  ├─ ✅ Documentar fluxos                                        │
│  └─ ⏳ Decidir opção                                            │
│                                                                 │
│  ESTA SEMANA                                                    │
│  ├─ ⏳ Ler documentação completa                                │
│  ├─ ⏳ Revisar código de exemplo                                │
│  └─ ⏳ Preparar plano de implementação                           │
│                                                                 │
│  PRÓXIMAS SEMANAS                                               │
│  ├─ ⏳ Implementar opção escolhida                               │
│  ├─ ⏳ Testar fluxos                                             │
│  └─ ⏳ Validar com painel                                        │
│                                                                 │
│  PRÓXIMOS MESES                                                 │
│  ├─ ⏳ Migrar para Opção 3 (se necessário)                       │
│  ├─ ⏳ Adicionar suporte a múltiplos usuários                    │
│  └─ ⏳ Melhorar segurança                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**Data**: 1º de Março de 2026  
**Status**: ✅ Análise Completa  
**Recomendação**: Opção 1 (Agora) → Opção 3 (Futuro)

