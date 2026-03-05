# 🧪 Guia Prático - Testar Conexão Painel ↔ App

## 📋 Checklist de Testes

### Fase 1: Verificar Backend (API)

#### Teste 1.1: API está online?
```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/app-config/config
```

**Resultado esperado**: JSON com configuração
```json
{
  "server_url": "https://maxxcontrol-x-sistema.onrender.com",
  "api_base_url": "https://maxxcontrol-x-sistema.onrender.com/api",
  ...
}
```

#### Teste 1.2: Endpoint de Servidor IPTV
```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/iptv-server/config
```

**Resultado esperado**: Credenciais Xtream (ou vazio se não configurado)
```json
{
  "id": 1,
  "xtream_url": "http://servidor.com:8080",
  "xtream_username": "usuario",
  "xtream_password": "senha"
}
```

#### Teste 1.3: Endpoint de Branding
```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/active
```

**Resultado esperado**: Logo, cores, splash
```json
{
  "banner_titulo": "TV MAXX",
  "logo_url": "https://...",
  "banner_cor_fundo": "#000000"
}
```

#### Teste 1.4: Registrar Dispositivo (com token)
```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/mac/register-device \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: tvmaxx_device_api_token_2024_secure_key" \
  -d '{
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "modelo": "Test Device",
    "android_version": "11",
    "app_version": "1.0.0",
    "ip": "192.168.1.100"
  }'
```

**Resultado esperado**: 201 Created
```json
{
  "device": {
    "id": 1,
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "status": "ativo"
  }
}
```

#### Teste 1.5: Registrar sem token (deve falhar)
```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/mac/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "modelo": "Test Device",
    "android_version": "11",
    "app_version": "1.0.0"
  }'
```

**Resultado esperado**: 401 Unauthorized
```json
{
  "error": "Token de dispositivo não fornecido"
}
```

---

### Fase 2: Configurar Painel

#### Teste 2.1: Acessar Painel
```
URL: https://maxxcontrol-frontend.onrender.com
Login: admin@maxxcontrol.com
Senha: Admin@123
```

**Resultado esperado**: Dashboard carrega

#### Teste 2.2: Configurar Servidor IPTV
```
1. Menu → Servidor IPTV
2. Preencha:
   - URL: http://seu-servidor.com:8080
   - Usuário: seu_usuario
   - Senha: sua_senha
3. Clique "Salvar"
```

**Resultado esperado**: Mensagem "Salvo com sucesso"

#### Teste 2.3: Configurar Branding
```
1. Menu → Branding
2. Preencha:
   - Título: TV MAXX
   - Logo URL: https://...
   - Cor Fundo: #000000
   - Cor Texto: #FF6A00
3. Clique "Salvar"
```

**Resultado esperado**: Mensagem "Salvo com sucesso"

#### Teste 2.4: Verificar Dispositivos
```
1. Menu → Dispositivos
2. Veja lista de TVs registradas
```

**Resultado esperado**: Lista vazia (ou com dispositivos anteriores)

---

### Fase 3: Compilar e Instalar App

#### Teste 3.1: Compilar APK
```bash
cd TV-MAXX-PRO-Android
./gradlew clean build
```

**Resultado esperado**: Build bem-sucedido
```
BUILD SUCCESSFUL in XXs
```

#### Teste 3.2: Instalar em Emulador
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Resultado esperado**: App instalado
```
Success
```

#### Teste 3.3: Instalar em TV Box (via ADB)
```bash
# Conectar TV Box via USB
adb connect 192.168.1.100:5555

# Instalar
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Resultado esperado**: App instalado no TV Box

---

### Fase 4: Testar App

#### Teste 4.1: Abrir App
```
1. Clique no ícone do app
2. Aguarde carregar
```

**Resultado esperado**: App abre com splash screen

#### Teste 4.2: Verificar Logs
```bash
adb logcat | grep MainActivity
```

**Resultado esperado**: Logs de inicialização
```
D/MainActivity: Buscando configuração...
D/MainActivity: Configuração carregada
D/MainActivity: Registrando dispositivo...
D/MainActivity: Dispositivo registrado: AA:BB:CC:DD:EE:FF
```

#### Teste 4.3: Verificar Branding
```
1. Abra o app
2. Veja se logo e cores estão corretos
```

**Resultado esperado**: Logo e cores do painel aparecem

#### Teste 4.4: Verificar Canais
```
1. Vá para Live TV
2. Veja se canais carregam
```

**Resultado esperado**: Lista de canais do servidor IPTV

#### Teste 4.5: Verificar Dashboard
```
1. Vá para Live TV
2. Veja se TopBar, números e BottomBar aparecem
```

**Resultado esperado**: Dashboard MESH TV Style renderiza

---

### Fase 5: Verificar Painel

#### Teste 5.1: Dispositivo Registrado
```
1. Acesse painel
2. Menu → Dispositivos
3. Procure pelo MAC do TV Box
```

**Resultado esperado**: Dispositivo aparece na lista
```
MAC: AA:BB:CC:DD:EE:FF
Modelo: Xiaomi Mi Box S
Android: 9
Último acesso: 2026-02-28 11:00:00
```

#### Teste 5.2: Logs de Atividade
```
1. Menu → Logs
2. Procure por logs do dispositivo
```

**Resultado esperado**: Logs aparecem
```
[INFO] Dispositivo registrado: AA:BB:CC:DD:EE:FF
[INFO] Configuração carregada
[INFO] Branding carregado
```

---

### Fase 6: Testar Mudanças Dinâmicas

#### Teste 6.1: Trocar Servidor IPTV
```
1. Painel → Servidor IPTV
2. Mude URL para outro servidor
3. Clique "Salvar"
4. Feche app no TV Box
5. Abra app novamente
```

**Resultado esperado**: Canais do novo servidor aparecem

#### Teste 6.2: Trocar Branding
```
1. Painel → Branding
2. Mude logo e cores
3. Clique "Salvar"
4. Feche app no TV Box
5. Abra app novamente
```

**Resultado esperado**: App com novo branding

#### Teste 6.3: Trocar URLs da API
```
1. Painel → Config do App
2. Mude URLs
3. Clique "Salvar"
4. Feche app no TV Box
5. Abra app novamente
```

**Resultado esperado**: App usa novas URLs

---

## 🐛 Troubleshooting

### Problema: API retorna erro 500
**Solução**:
```bash
# Verificar logs do backend
heroku logs --app maxxcontrol-x-sistema

# Ou verificar status
curl https://maxxcontrol-x-sistema.onrender.com/health
```

### Problema: App não registra dispositivo
**Solução**:
```bash
# Verificar logs do app
adb logcat | grep "registerDevice"

# Verificar se token está correto em NetworkConstants.kt
grep "DEVICE_API_TOKEN" TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/core/network/NetworkConstants.kt
```

### Problema: Canais não carregam
**Solução**:
```bash
# Verificar se credenciais Xtream estão configuradas
curl https://maxxcontrol-x-sistema.onrender.com/api/iptv-server/config

# Se vazio, configure no painel
# Se preenchido, verificar se URL é válida
curl http://seu-servidor.com:8080/player_api.php?username=user&password=pass&action=get_live_categories
```

### Problema: Branding não aparece
**Solução**:
```bash
# Verificar se branding está configurado
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/active

# Se vazio, configure no painel
# Se preenchido, verificar URLs das imagens
curl https://url-da-logo.com/logo.png
```

### Problema: Dispositivo não aparece no painel
**Solução**:
```bash
# Verificar se registro foi bem-sucedido
adb logcat | grep "Dispositivo registrado"

# Verificar se MAC está correto
adb shell getprop ro.serialno

# Verificar se token está correto
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/mac/register-device \
  -H "X-Device-Token: tvmaxx_device_api_token_2024_secure_key" \
  -d '{"mac_address":"AA:BB:CC:DD:EE:FF","modelo":"Test","android_version":"11","app_version":"1.0.0"}'
```

---

## 📊 Matriz de Testes

| Teste | Painel | Backend | App | Status |
|-------|--------|---------|-----|--------|
| API Online | - | ✅ | - | ✅ |
| Config Endpoint | - | ✅ | - | ✅ |
| IPTV Endpoint | - | ✅ | - | ✅ |
| Branding Endpoint | - | ✅ | - | ✅ |
| Registrar Device | - | ✅ | - | ✅ |
| Acessar Painel | ✅ | - | - | ✅ |
| Configurar IPTV | ✅ | ✅ | - | ⏳ |
| Configurar Branding | ✅ | ✅ | - | ⏳ |
| Ver Dispositivos | ✅ | ✅ | - | ⏳ |
| Compilar App | - | - | ✅ | ⏳ |
| Instalar App | - | - | ✅ | ⏳ |
| Abrir App | - | ✅ | ✅ | ⏳ |
| Buscar Config | - | ✅ | ✅ | ⏳ |
| Registrar Device | - | ✅ | ✅ | ⏳ |
| Carregar Canais | - | ✅ | ✅ | ⏳ |
| Mostrar Branding | - | ✅ | ✅ | ⏳ |
| Trocar Servidor | ✅ | ✅ | ✅ | ⏳ |
| Trocar Branding | ✅ | ✅ | ✅ | ⏳ |

---

## 🎯 Ordem Recomendada

1. **Fase 1**: Testar API (5 min)
2. **Fase 2**: Configurar Painel (10 min)
3. **Fase 3**: Compilar e Instalar (15 min)
4. **Fase 4**: Testar App (10 min)
5. **Fase 5**: Verificar Painel (5 min)
6. **Fase 6**: Testar Mudanças (10 min)

**Total**: ~55 minutos

---

## ✅ Checklist Final

```
Fase 1: API
- [ ] GET /api/app-config/config retorna JSON
- [ ] GET /api/iptv-server/config retorna JSON
- [ ] GET /api/branding/active retorna JSON
- [ ] POST /api/mac/register-device com token funciona
- [ ] POST /api/mac/register-device sem token retorna 401

Fase 2: Painel
- [ ] Painel abre e faz login
- [ ] Servidor IPTV configurado
- [ ] Branding configurado
- [ ] Config do App configurada

Fase 3: App
- [ ] APK compila sem erros
- [ ] APK instala em emulador/TV Box
- [ ] App abre sem crashes

Fase 4: Testes
- [ ] Logs mostram "Dispositivo registrado"
- [ ] Branding aparece no app
- [ ] Canais carregam
- [ ] Dashboard renderiza

Fase 5: Painel
- [ ] Dispositivo aparece em "Dispositivos"
- [ ] Logs aparecem em "Logs"
- [ ] Último acesso atualiza

Fase 6: Dinâmico
- [ ] Trocar servidor → Canais mudam
- [ ] Trocar branding → Visual muda
- [ ] Trocar URLs → App usa novas URLs
```

---

**Data**: 1º de Março de 2026
**Status**: Pronto para Testes
**Próximo**: Executar testes conforme guia
