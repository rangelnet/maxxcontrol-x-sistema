# 🔗 Conexão Painel ↔ App Android - Resumo Completo

## 📊 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  PAINEL WEB (MaxxControl)                                       │
│  https://maxxcontrol-frontend.onrender.com                      │
│                                                                 │
│  ├─ Dashboard                                                   │
│  ├─ Dispositivos (lista de TVs)                                │
│  ├─ Servidor IPTV (configurar URL/user/pass)                  │
│  ├─ Config do App (URLs da API)                               │
│  ├─ Branding (logo, cores, splash)                            │
│  └─ Gerenciar Banners                                          │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ API REST
                         │ https://maxxcontrol-x-sistema.onrender.com
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│  BACKEND (Node.js + Express)                                   │
│                                                                 │
│  ├─ /api/app-config/config          (URLs da API)             │
│  ├─ /api/iptv-server/config         (Credenciais Xtream)      │
│  ├─ /api/branding/active            (Logo, cores, splash)     │
│  ├─ /api/mac/register-device        (Registrar TV)            │
│  ├─ /api/clients/verify/{mac}       (Verificar autorização)   │
│  ├─ /api/device/register            (Dados do dispositivo)     │
│  ├─ /api/log/create                 (Enviar logs)             │
│  └─ /api/bug/report                 (Reportar bugs)           │
│                                                                 │
│  Banco de Dados (PostgreSQL)                                   │
│  ├─ app_config                                                 │
│  ├─ iptv_server_config                                         │
│  ├─ branding                                                   │
│  ├─ devices                                                    │
│  ├─ clients                                                    │
│  ├─ logs                                                       │
│  └─ bugs                                                       │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ API REST
                         │ (HTTPS)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│  APP ANDROID (TV-MAXX-PRO)                                     │
│                                                                 │
│  ├─ MainActivity                                               │
│  │  └─ Busca config ao iniciar                                │
│  │                                                             │
│  ├─ BrandingManager                                            │
│  │  ├─ Busca logo, cores, splash                             │
│  │  └─ Busca credenciais Xtream                              │
│  │                                                             │
│  ├─ XtreamRepository                                           │
│  │  └─ Inicializa com credenciais dinâmicas                  │
│  │                                                             │
│  ├─ LiveTvScreen                                              │
│  │  └─ Carrega canais do servidor IPTV                       │
│  │                                                             │
│  └─ DashboardLiveScreen (NOVO!)                              │
│     ├─ TopBar com controles                                  │
│     ├─ Números dos canais                                    │
│     └─ BottomBar com ações                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxos de Dados

### 1️⃣ Ao Abrir o App (Inicialização)

```
App Inicia
    ↓
MainActivity.onCreate()
    ↓
BrandingManager.loadBranding()
    ├─ GET /api/app-config/config
    │  └─ Retorna: URLs da API, versão mínima, etc
    │
    ├─ GET /api/branding/active
    │  └─ Retorna: Logo, cores, splash, tema
    │
    └─ GET /api/iptv-server/config
       └─ Retorna: URL Xtream, usuário, senha
           ↓
       XtreamRepository.initialize(url, user, pass)
           ↓
       LiveTV pronto para carregar canais!
```

### 2️⃣ Registrar Dispositivo (Primeira Vez)

```
App Inicia
    ↓
MainActivity.onCreate()
    ↓
registerDevice()
    ├─ Pega MAC Address do TV Box
    ├─ Pega modelo, Android version, IP
    │
    └─ POST /api/mac/register-device
       Header: X-Device-Token: tvmaxx_device_api_token_2024_secure_key
       Body: { mac, modelo, android_version, app_version, ip }
           ↓
       Backend valida token
           ├─ Token válido? → Registra no banco
           └─ Token inválido? → Retorna 403
               ↓
           Dispositivo aparece no painel!
```

### 3️⃣ Verificar Autorização (MAC Address)

```
App Inicia
    ↓
LiveTvViewModel.init()
    ├─ GET /api/clients/verify/{mac_address}
    │
    └─ Resposta:
       ├─ authorized: true
       │  └─ Carrega canais normalmente
       │
       └─ authorized: false
          └─ Mostra mensagem: "Dispositivo não autorizado"
```

### 4️⃣ Trocar Servidor IPTV (Sem Recompilar)

```
Admin no Painel
    ├─ Acessa: /iptv-server
    ├─ Muda URL, usuário, senha
    └─ Clica "Salvar"
        ↓
    Backend atualiza banco de dados
        ↓
    Usuário fecha e abre o app
        ↓
    App busca novas credenciais
        ├─ GET /api/iptv-server/config
        └─ Retorna novo servidor
            ↓
        XtreamRepository reinicializa
            ↓
        Canais do novo servidor aparecem!
```

### 5️⃣ Atualizar Branding (Logo, Cores, Splash)

```
Admin no Painel
    ├─ Acessa: /branding
    ├─ Muda logo, cores, splash
    └─ Clica "Salvar"
        ↓
    Backend atualiza banco de dados
        ↓
    Usuário fecha e abre o app
        ↓
    App busca novo branding
        ├─ GET /api/branding/active
        └─ Retorna logo, cores, splash
            ↓
        App renderiza com novo branding!
```

---

## 📋 Endpoints Principais

### 1. Configuração do App
```
GET /api/app-config/config

Retorna:
{
  "server_url": "https://maxxcontrol-x-sistema.onrender.com",
  "api_base_url": "https://maxxcontrol-x-sistema.onrender.com/api",
  "auth_url": "https://auth.novomundo.live/v1/",
  "painel_url": "https://painel.tvmaxx.pro/api/",
  "cache_url": "https://api1.novomundo.live/cache/",
  "tmdb_url": "https://api.themoviedb.org/3/",
  "tmdb_api_key": "...",
  "check_updates": true,
  "force_update": false,
  "min_version": "1.0.0",
  "updated_at": "2026-02-28T..."
}
```

### 2. Servidor IPTV
```
GET /api/iptv-server/config

Retorna:
{
  "id": 1,
  "xtream_url": "http://servidor.com:8080",
  "xtream_username": "usuario123",
  "xtream_password": "senha456",
  "updated_at": "2026-02-28T..."
}
```

### 3. Branding
```
GET /api/branding/active

Retorna:
{
  "banner_titulo": "TV MAXX",
  "banner_subtitulo": "Seu Entretenimento",
  "banner_cor_fundo": "#000000",
  "banner_cor_texto": "#FF6A00",
  "logo_url": "https://...",
  "splash_url": "https://...",
  "tema": "dark"
}
```

### 4. Registrar Dispositivo
```
POST /api/mac/register-device

Header:
X-Device-Token: tvmaxx_device_api_token_2024_secure_key

Body:
{
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "modelo": "Xiaomi Mi Box S",
  "android_version": "9",
  "app_version": "1.0.0",
  "ip": "192.168.1.100"
}

Retorna:
{
  "device": {
    "id": 1,
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "modelo": "Xiaomi Mi Box S",
    "status": "ativo",
    "ultimo_acesso": "2026-02-28 11:00:00"
  }
}
```

### 5. Verificar Autorização
```
GET /api/clients/verify/{mac_address}

Retorna:
{
  "authorized": true,
  "client": {
    "id": 1,
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "plan_name": "Premium",
    "expires_at": "2026-12-31",
    "reseller_name": "Revendedor X"
  }
}
```

---

## 🔐 Segurança

### Token de Dispositivo
- **Tipo**: Fixo (não expira)
- **Localização**: `.env` do painel e `NetworkConstants.kt` do app
- **Uso**: Header `X-Device-Token` em requisições de registro
- **Proteção**: Middleware valida antes de registrar

### Fluxo Seguro
```
1. App envia token no header
2. Backend valida token
3. Se válido → Registra dispositivo
4. Se inválido → Retorna 403 Forbidden
```

### Credenciais Xtream
- ❌ Não ficam no código do app
- ✅ Ficam no banco de dados do painel
- ✅ Transmitidas via HTTPS
- ✅ Só admin pode ver/editar

---

## 📱 Fluxo Completo do Usuário

### Primeira Vez

```
1. Admin configura no painel:
   ├─ Servidor IPTV (URL, user, pass)
   ├─ Branding (logo, cores)
   └─ Config do App (URLs)

2. Usuário instala app no TV Box

3. App abre:
   ├─ Busca config da API
   ├─ Busca branding
   ├─ Busca credenciais Xtream
   ├─ Registra dispositivo
   ├─ Verifica autorização
   └─ Carrega canais!

4. Dispositivo aparece no painel
```

### Próximas Vezes

```
1. Usuário abre app
   ├─ Busca config (pode ter mudado)
   ├─ Busca branding (pode ter mudado)
   ├─ Busca credenciais Xtream (pode ter mudado)
   └─ Carrega canais

2. Se admin mudou algo no painel:
   ├─ Novo servidor? → Canais do novo servidor
   ├─ Novo branding? → App com novo visual
   └─ Novas URLs? → App usa novas URLs
```

---

## ✅ Status Atual

| Componente | Status | Detalhes |
|-----------|--------|----------|
| Painel Web | ✅ Online | https://maxxcontrol-frontend.onrender.com |
| Backend API | ✅ Online | https://maxxcontrol-x-sistema.onrender.com |
| Banco de Dados | ✅ Online | PostgreSQL Supabase |
| App Android | ✅ Compilado | DashboardLiveScreen implementado |
| Registro de Dispositivos | ✅ Implementado | Com token seguro |
| Servidor IPTV Dinâmico | ✅ Implementado | Busca credenciais da API |
| Branding Dinâmico | ✅ Implementado | Logo, cores, splash |
| Config do App | ✅ Implementado | URLs dinâmicas |

---

## 🚀 Próximos Passos

### Curto Prazo
1. ✅ Compilar novo APK com dashboard MESH TV
2. ⏳ Testar registro de dispositivo
3. ⏳ Testar busca de credenciais Xtream
4. ⏳ Testar carregamento de canais

### Médio Prazo
1. ⏳ Testar em múltiplos TV Boxes
2. ⏳ Testar troca de servidor sem recompilar
3. ⏳ Testar atualização de branding
4. ⏳ Monitorar logs e bugs

### Longo Prazo
1. ⏳ Adicionar mais funcionalidades
2. ⏳ Otimizar performance
3. ⏳ Melhorar segurança
4. ⏳ Escalar para mais usuários

---

## 💡 Dicas

### Para Admin (Painel)
- Configure servidor IPTV em `/iptv-server`
- Configure branding em `/branding`
- Veja dispositivos em `/devices`
- Monitore logs em `/logs`

### Para Desenvolvedor (App)
- Credenciais Xtream vêm da API
- Não hardcode URLs
- Sempre use token seguro
- Trate erros de conexão

### Para Usuário (TV Box)
- Abre app → Busca config automaticamente
- Não precisa fazer nada
- Se mudar servidor no painel → Fecha e abre app
- Pronto!

---

**Data**: 1º de Março de 2026
**Status**: ✅ Sistema Completo e Online
**Próximo**: Compilar e testar novo APK
