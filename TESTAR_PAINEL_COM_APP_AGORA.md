# 🧪 Testar Painel + App - Comunicação em Tempo Real

## 🎯 Objetivo

Verificar se o painel e o app estão se comunicando corretamente via JWT.

---

## 📋 Pré-requisitos

- ✅ Painel rodando: https://maxxcontrol-frontend.onrender.com
- ✅ Backend rodando: https://maxxcontrol-x-sistema.onrender.com
- ✅ App Android compilado e rodando em emulador/TV Box
- ✅ Credenciais: admin@maxxcontrol.com / Admin@123

---

## 🚀 TESTE 1: Testar Backend (5 min)

### Passo 1: Verificar Health Check

```bash
curl https://maxxcontrol-x-sistema.onrender.com/health
```

**Esperado:**
```json
{
  "status": "online",
  "timestamp": "2026-03-01T...",
  "service": "MaxxControl X API"
}
```

✅ Se retornar isso → Backend está online

---

### Passo 2: Testar Login

```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@maxxcontrol.com",
    "senha": "Admin@123",
    "device_id": "AA:BB:CC:DD:EE:FF",
    "modelo": "TV Box Teste",
    "android_version": "11",
    "app_version": "1.0.0"
  }'
```

**Esperado:**
```json
{
  "user": {
    "id": 4,
    "nome": "Administrador",
    "email": "admin@maxxcontrol.com",
    "plano": "free",
    "status": "ativo"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "config": {
    "painel_url": "https://maxxcontrol-frontend.onrender.com",
    "api_url": "https://maxxcontrol-x-sistema.onrender.com/api",
    "device_id": 1,
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "iptv_config": { ... }
  }
}
```

✅ Se retornar isso → Login funcionando com device_id

---

### Passo 3: Testar Branding (Público)

```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current
```

**Esperado:**
```json
{
  "banner_titulo": "TV Maxx",
  "banner_subtitulo": "Seu Entretenimento",
  "banner_cor_fundo": "#000000",
  "banner_cor_texto": "#FF6A00",
  "logo_url": null,
  "splash_url": null,
  "tema": "dark"
}
```

✅ Se retornar isso → Branding está acessível

---

## 🌐 TESTE 2: Testar Painel (10 min)

### Passo 1: Acessar Painel

1. Abra: https://maxxcontrol-frontend.onrender.com
2. Faça login:
   - Email: admin@maxxcontrol.com
   - Senha: Admin@123

**Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionado para Dashboard
- ✅ Menu lateral visível

---

### Passo 2: Verificar Token em localStorage

Abra DevTools (F12) e execute:

```javascript
console.log(localStorage.getItem('token'))
```

**Esperado:**
- ✅ Retorna um JWT token (começa com `eyJ...`)

---

### Passo 3: Verificar Config em localStorage

```javascript
console.log(JSON.parse(localStorage.getItem('config')))
```

**Esperado:**
```json
{
  "painel_url": "https://maxxcontrol-frontend.onrender.com",
  "api_url": "https://maxxcontrol-x-sistema.onrender.com/api",
  "device_id": null,
  "mac_address": null,
  "iptv_config": { ... }
}
```

✅ Se retornar isso → Config salva corretamente

---

### Passo 4: Testar Proteção de Rotas

1. Abra DevTools (F12)
2. Execute:

```javascript
localStorage.removeItem('token')
localStorage.removeItem('config')
```

3. Recarregue a página (F5)

**Esperado:**
- ✅ Redirecionado para login
- ✅ Não consegue acessar Dashboard

---

### Passo 5: Fazer Login Novamente

1. Faça login novamente
2. Clique em "Sair" (botão no topo)

**Esperado:**
- ✅ Redirecionado para login
- ✅ Token removido de localStorage
- ✅ Config removida de localStorage

---

## 📱 TESTE 3: Testar App Android (15 min)

### Passo 1: Compilar APK

```bash
cd TV-MAXX-PRO-Android
./gradlew assembleDebug
```

**Esperado:**
- ✅ APK compilado sem erros
- ✅ Arquivo: `app/build/outputs/apk/debug/app-debug.apk`

---

### Passo 2: Instalar no Emulador/TV Box

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Esperado:**
- ✅ APK instalado com sucesso

---

### Passo 3: Abrir App

1. Abra o app TV-MAXX-PRO-Android
2. Você deve ver a tela de login

**Esperado:**
- ✅ Tela de login carregada
- ✅ Campos de email e senha visíveis
- ✅ Botão "TESTE GRÁTIS" visível

---

### Passo 4: Fazer Login no App

1. Preencha:
   - Email: admin@maxxcontrol.com
   - Senha: Admin@123
2. Clique em "TESTE GRÁTIS"

**Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionado para Dashboard
- ✅ Sem erros no logcat

---

### Passo 5: Verificar Token no App

Abra logcat:

```bash
adb logcat | grep -E "Auth|Login|Session"
```

**Esperado:**
```
AuthRepository: Login bem-sucedido
SessionManager: Token salvo
SplashViewModel: Navegando para Home
```

---

### Passo 6: Verificar SharedPreferences

```bash
adb shell cat /data/data/com.tvmaxx.pro/shared_prefs/tvmaxx_session.xml
```

**Esperado:**
```xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
  <string name="jwt_token">eyJhbGc...</string>
  <string name="device_id">AA:BB:CC:DD:EE:FF</string>
</map>
```

✅ Se retornar isso → Token salvo corretamente

---

## 🔄 TESTE 4: Comunicação Painel ↔ App (20 min)

### Passo 1: Verificar Device Registrado no Painel

1. Faça login no painel
2. Clique em "Dispositivos" no menu
3. Procure pelo device que fez login no app

**Esperado:**
- ✅ Device aparece na lista
- ✅ MAC address: AA:BB:CC:DD:EE:FF
- ✅ Modelo: TV Box Teste
- ✅ Status: ativo
- ✅ Connection Status: online

---

### Passo 2: Alterar Branding no Painel

1. Clique em "🎨 Branding" no menu
2. Altere:
   - Título: "Teste Branding"
   - Cor Fundo: #FF0000 (vermelho)
   - Cor Texto: #FFFFFF (branco)
3. Clique em "Salvar Branding"

**Esperado:**
- ✅ Mensagem de sucesso
- ✅ Dados salvos no banco

---

### Passo 3: Verificar Branding no App

1. Feche o app completamente
2. Reabra o app
3. Verifique se as cores foram aplicadas

**Esperado:**
- ✅ Cores alteradas (vermelho + branco)
- ✅ Título alterado para "Teste Branding"
- ✅ Sem precisar fazer republish!

---

### Passo 4: Testar Logout no App

1. No app, procure por um botão de logout
2. Clique em logout

**Esperado:**
- ✅ Redirecionado para login
- ✅ Token removido de SharedPreferences
- ✅ Painel continua funcionando (tokens são independentes)

---

## ✅ CHECKLIST FINAL

### Backend
- [ ] Health check respondendo
- [ ] Login retornando token + config
- [ ] Branding acessível
- [ ] Device registrado no banco

### Painel
- [ ] Login bem-sucedido
- [ ] Token salvo em localStorage
- [ ] Config salva em localStorage
- [ ] Proteção de rotas funcionando
- [ ] Logout funcionando

### App
- [ ] APK compilado sem erros
- [ ] Login bem-sucedido
- [ ] Token salvo em SharedPreferences
- [ ] Device registrado no painel
- [ ] Branding aplicado dinamicamente
- [ ] Logout funcionando

### Integração
- [ ] Device aparece no painel após login no app
- [ ] Alterações de branding no painel refletem no app
- [ ] Logout em um não afeta o outro
- [ ] Ambos usam o mesmo JWT secret

---

## 🎯 Resultado Esperado

Se todos os testes passarem:

✅ **Painel e App estão se comunicando perfeitamente!**

- Painel controla branding
- App recebe branding dinamicamente
- Ambos usam JWT para autenticação
- Devices são registrados automaticamente
- Sistema está 100% operacional

---

## 🐛 Troubleshooting

### Problema: Login falha no app

**Solução:**
1. Verificar se backend está online
2. Verificar se credenciais estão corretas
3. Verificar logcat para erros
4. Verificar se device_id está sendo enviado

### Problema: Device não aparece no painel

**Solução:**
1. Verificar se login foi bem-sucedido
2. Verificar se device_id foi enviado
3. Verificar banco de dados (tabela devices)
4. Verificar logs do backend

### Problema: Branding não muda no app

**Solução:**
1. Verificar se branding foi salvo no painel
2. Fechar e reabrir app
3. Verificar se endpoint `/api/branding/current` está respondendo
4. Verificar logcat para erros

### Problema: Logout não funciona

**Solução:**
1. Verificar se token é válido
2. Verificar se middleware de autenticação está funcionando
3. Verificar se localStorage/SharedPreferences está sendo limpo
4. Verificar logs do backend

---

## 📊 Métricas de Sucesso

| Métrica | Esperado | Status |
|---------|----------|--------|
| Backend Online | ✅ | [ ] |
| Login Funcionando | ✅ | [ ] |
| Token Salvo | ✅ | [ ] |
| Device Registrado | ✅ | [ ] |
| Branding Dinâmico | ✅ | [ ] |
| Logout Funcionando | ✅ | [ ] |
| Comunicação Painel ↔ App | ✅ | [ ] |

---

## 🎉 Conclusão

Se todos os testes passarem, o sistema está **100% operacional** e pronto para:

✅ Produção
✅ Escalabilidade
✅ Novos recursos

---

**Tempo Total de Testes:** ~50 minutos

**Próximo Passo:** Se tudo passar, o sistema está pronto para deploy em produção!

---

**Última atualização:** 01/03/2026
**Versão:** 1.0.0
**Status:** ✅ PRONTO PARA TESTAR

