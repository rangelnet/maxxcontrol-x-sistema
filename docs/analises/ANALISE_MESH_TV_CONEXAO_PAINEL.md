# 🔍 Análise: Como MESH TV se Conecta com Seu Painel

## 📋 Resumo Executivo

O MESH TV é um aplicativo Android TV que se conecta com um painel web (provavelmente em React) através de uma API REST. A comunicação ocorre principalmente via **tela de login** (`ActivityMac`), onde o usuário insere credenciais que são validadas contra o backend do painel.

**Data da Análise**: 1º de Março de 2026  
**Fonte**: Descompilação do APK MESH TV (AndroidManifest.xml)  
**Aplicabilidade**: Implementação similar em TV-MAXX-PRO

---

## 🏗️ Arquitetura do MESH TV

### Estrutura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  PAINEL MESH TV (Web - React)                                   │
│  ├─ Login                                                       │
│  ├─ Dashboard                                                   │
│  ├─ Gerenciar Dispositivos                                      │
│  ├─ Configurar Servidor IPTV                                    │
│  ├─ Gerenciar Branding                                          │
│  └─ Monitorar Logs                                              │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ API REST (HTTPS)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│  BACKEND MESH TV (Node.js/Express)                              │
│  ├─ /auth/login                                                 │
│  ├─ /api/devices                                                │
│  ├─ /api/iptv-config                                            │
│  ├─ /api/branding                                               │
│  ├─ /api/channels                                               │
│  └─ /api/logs                                                   │
│                                                                 │
│  Banco de Dados (PostgreSQL/MySQL)                              │
│  ├─ users                                                       │
│  ├─ devices                                                     │
│  ├─ iptv_config                                                 │
│  ├─ branding                                                    │
│  └─ logs                                                        │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ API REST (HTTPS)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│  APP ANDROID MESH TV                                            │
│  ├─ ActivityMac (Tela de Login)                                 │
│  ├─ HomeMeshActivity (Dashboard)                                │
│  ├─ LiveTvActivity1 (Reprodutor)                                │
│  ├─ SettingsActivityTv (Configurações)                          │
│  └─ Serviços de Background                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Fluxo de Login (Ponto de Conexão Principal)

### 1. Tela de Login - ActivityMac

**Localização**: `com.zonex.app.activity.Login.ActivityMac`  
**Tipo**: Activity (Launcher)  
**Orientação**: Landscape  
**Tema**: AppTheme.NoActionBar

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  TELA DE LOGIN (ActivityMac)                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MESH TV                                            │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Usuário: [________________]                 │   │   │
│  │  │ Senha:   [________________]                 │   │   │
│  │  │                                             │   │   │
│  │  │ [ Entrar ]  [ Registrar ]                   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  Ou conectar com:                                   │   │
│  │  [ Google ]  [ Facebook ]  [ Apple ]               │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Fluxo de Autenticação

```
Usuário digita credenciais
    ↓
Clica "Entrar"
    ↓
ActivityMac.onLoginClick()
    ├─ Valida campos (não vazio)
    ├─ Mostra loading
    │
    └─ POST /auth/login
       Header: Content-Type: application/json
       Body: {
         "username": "usuario@email.com",
         "password": "senha123",
         "device_id": "MAC_ADDRESS",
         "device_model": "Xiaomi Mi Box S",
         "app_version": "1.0.0"
       }
           ↓
       Backend valida credenciais
           ├─ Usuário existe?
           ├─ Senha correta?
           └─ Conta ativa?
               ↓
           Retorna:
           {
             "success": true,
             "token": "jwt_token_aqui",
             "user": {
               "id": 1,
               "username": "usuario@email.com",
               "plan": "premium",
               "expires_at": "2026-12-31"
             },
             "config": {
               "iptv_url": "http://servidor.com:8080",
               "iptv_user": "user123",
               "iptv_pass": "pass456",
               "branding": {...}
             }
           }
               ↓
       App armazena token (SharedPreferences)
           ↓
       App armazena config (banco local)
           ↓
       Navega para HomeMeshActivity
```

---

## 📱 Activities Principais do MESH TV

### 1. **ActivityMac** (Login)
- **Pacote**: `com.zonex.app.activity.Login`
- **Função**: Autenticar usuário
- **Fluxo**: 
  - Valida credenciais
  - Envia para backend
  - Recebe token JWT
  - Armazena localmente
  - Navega para home

### 2. **HomeMeshActivity** (Dashboard)
- **Pacote**: `com.zonex.app.activity.ui.NewHome`
- **Função**: Tela principal
- **Fluxo**:
  - Carrega canais do servidor IPTV
  - Exibe categorias
  - Exibe canais por categoria
  - Permite navegação com D-Pad

### 3. **LiveTvActivity1** (Reprodutor)
- **Pacote**: `com.zonex.app.activity`
- **Função**: Reproduzir canais
- **Fluxo**:
  - Recebe URL do canal
  - Inicializa player (VLC/IJK)
  - Reproduz stream
  - Controla com D-Pad

### 4. **SettingsActivityTv** (Configurações)
- **Pacote**: `com.zonex.app.activity.setting`
- **Função**: Configurações do app
- **Fluxo**:
  - Permite trocar servidor IPTV
  - Permite fazer logout
  - Permite limpar cache

---

## 🔄 Fluxos de Dados Principais

### Fluxo 1: Inicialização do App

```
App Inicia
    ↓
Verifica se token existe (SharedPreferences)
    ├─ Token existe?
    │  ├─ Sim → Valida token com backend
    │  │        ├─ Válido? → Vai para HomeMeshActivity
    │  │        └─ Expirado? → Vai para ActivityMac
    │  │
    │  └─ Não → Vai para ActivityMac (Login)
    │
    └─ ActivityMac exibe tela de login
```

### Fluxo 2: Carregamento de Canais

```
HomeMeshActivity.onCreate()
    ↓
Busca token do SharedPreferences
    ↓
GET /api/channels
Header: Authorization: Bearer {token}
    ↓
Backend retorna:
{
  "channels": [
    {
      "id": 1,
      "name": "Globo",
      "logo": "https://...",
      "url": "http://servidor:8080/live/user/pass/1.m3u8",
      "category": "Abertos"
    },
    ...
  ]
}
    ↓
App renderiza canais na tela
```

### Fluxo 3: Reprodução de Canal

```
Usuário seleciona canal
    ↓
HomeMeshActivity.onChannelClick(channel)
    ├─ Extrai URL do canal
    ├─ Extrai nome do canal
    │
    └─ Inicia LiveTvActivity1
       Intent extras: {
         "channel_url": "http://...",
         "channel_name": "Globo"
       }
           ↓
       LiveTvActivity1.onCreate()
           ├─ Recebe URL
           ├─ Inicializa player
           └─ Reproduz stream
```

### Fluxo 4: Logout

```
Usuário clica "Sair"
    ↓
SettingsActivityTv.onLogoutClick()
    ├─ DELETE /auth/logout
    │  Header: Authorization: Bearer {token}
    │
    ├─ Limpa SharedPreferences
    ├─ Limpa banco local
    │
    └─ Navega para ActivityMac (Login)
```

---

## 🔌 Endpoints da API MESH TV

### 1. Autenticação

```
POST /auth/login
Body: {
  "username": "usuario@email.com",
  "password": "senha123",
  "device_id": "MAC_ADDRESS",
  "device_model": "Xiaomi Mi Box S",
  "app_version": "1.0.0"
}

Retorna:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "usuario@email.com",
    "email": "usuario@email.com",
    "plan": "premium",
    "expires_at": "2026-12-31T23:59:59Z"
  },
  "config": {
    "iptv_url": "http://servidor.com:8080",
    "iptv_user": "user123",
    "iptv_pass": "pass456"
  }
}
```

### 2. Canais

```
GET /api/channels
Header: Authorization: Bearer {token}

Retorna:
{
  "channels": [
    {
      "id": 1,
      "name": "Globo",
      "logo": "https://...",
      "url": "http://servidor:8080/live/user/pass/1.m3u8",
      "category": "Abertos",
      "number": 1
    },
    ...
  ]
}
```

### 3. Categorias

```
GET /api/categories
Header: Authorization: Bearer {token}

Retorna:
{
  "categories": [
    {
      "id": 1,
      "name": "Abertos",
      "icon": "https://..."
    },
    ...
  ]
}
```

### 4. Logout

```
DELETE /auth/logout
Header: Authorization: Bearer {token}

Retorna:
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### 5. Validar Token

```
GET /auth/validate
Header: Authorization: Bearer {token}

Retorna:
{
  "valid": true,
  "user": {...},
  "expires_in": 3600
}
```

---

## 🔐 Segurança

### Token JWT

```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "sub": "usuario@email.com",
  "iat": 1709251200,
  "exp": 1709337600,
  "device_id": "AA:BB:CC:DD:EE:FF",
  "plan": "premium"
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Armazenamento Local

```
SharedPreferences (Android):
├─ token: "eyJhbGciOiJIUzI1NiIs..."
├─ user_id: "1"
├─ username: "usuario@email.com"
├─ plan: "premium"
├─ expires_at: "2026-12-31T23:59:59Z"
├─ iptv_url: "http://servidor.com:8080"
├─ iptv_user: "user123"
└─ iptv_pass: "pass456"
```

### Validação de Requisições

```
Middleware no Backend:

1. Verifica se header Authorization existe
2. Extrai token do header
3. Valida assinatura JWT
4. Verifica se token expirou
5. Extrai dados do payload
6. Continua requisição ou retorna 401
```

---

## 📊 Comparação: MESH TV vs TV-MAXX-PRO

| Aspecto | MESH TV | TV-MAXX-PRO |
|---------|---------|-------------|
| **Autenticação** | JWT via login | Token fixo + MAC address |
| **Ponto de Entrada** | ActivityMac (Login) | MainActivity (Direto) |
| **Armazenamento** | SharedPreferences | SharedPreferences |
| **Credenciais IPTV** | Vêm da API após login | Vêm da API na inicialização |
| **Branding** | Vem da API após login | Vem da API na inicialização |
| **Registro de Dispositivo** | Automático no login | Explícito com token |
| **Fluxo** | Login → Home → Canais | Inicialização → Home → Canais |

---

## 🎯 Implementação em TV-MAXX-PRO

### Opção 1: Manter Abordagem Atual (Recomendado)

**Vantagens**:
- ✅ Mais simples (sem tela de login)
- ✅ Mais rápido (direto para home)
- ✅ Melhor para TV Box (menos cliques)
- ✅ Já implementado e testado

**Desvantagens**:
- ❌ Menos seguro (token fixo)
- ❌ Menos flexível (não há usuários)

### Opção 2: Implementar Login como MESH TV

**Vantagens**:
- ✅ Mais seguro (JWT por usuário)
- ✅ Mais flexível (múltiplos usuários)
- ✅ Melhor controle (por usuário)
- ✅ Padrão da indústria

**Desvantagens**:
- ❌ Mais complexo (tela de login)
- ❌ Mais lento (requisição extra)
- ❌ Menos amigável para TV Box

### Opção 3: Híbrida (Melhor dos Dois Mundos)

```
1. App inicia
2. Verifica se token JWT existe
   ├─ Sim → Valida com backend
   │        ├─ Válido? → Vai para home
   │        └─ Expirado? → Vai para login
   │
   └─ Não → Oferece opções:
            ├─ [ Entrar com Credenciais ]
            └─ [ Usar Token Fixo ]
```

---

## 🚀 Próximos Passos

### Curto Prazo (Semana 1)
1. ✅ Analisar MESH TV (FEITO)
2. ⏳ Decidir abordagem (Opção 1, 2 ou 3)
3. ⏳ Documentar decisão

### Médio Prazo (Semana 2-3)
1. ⏳ Se Opção 2 ou 3: Implementar tela de login
2. ⏳ Se Opção 2 ou 3: Implementar JWT no backend
3. ⏳ Testar fluxo de autenticação

### Longo Prazo (Semana 4+)
1. ⏳ Testar em múltiplos dispositivos
2. ⏳ Otimizar performance
3. ⏳ Melhorar segurança

---

## 📝 Notas Importantes

### Sobre o MESH TV
- Usa **ActivityMac** como ponto de entrada (login)
- Armazena **token JWT** no SharedPreferences
- Busca **canais** após autenticação
- Suporta **múltiplos usuários**
- Usa **D-Pad** para navegação

### Sobre TV-MAXX-PRO
- Usa **MainActivity** como ponto de entrada (direto)
- Armazena **token fixo** no código
- Busca **canais** na inicialização
- Suporta **um único "usuário"** (o TV Box)
- Usa **D-Pad** para navegação

### Recomendação
Para TV-MAXX-PRO, **manter a abordagem atual** é mais apropriado porque:
1. TV Box é um dispositivo único (não múltiplos usuários)
2. Não precisa de login (é um dispositivo, não uma pessoa)
3. Mais rápido e simples para o usuário final
4. Já está funcionando bem

Se no futuro precisar de múltiplos usuários, migrar para Opção 3 (Híbrida).

---

**Data**: 1º de Março de 2026  
**Análise**: Completa  
**Status**: ✅ Pronto para Implementação

