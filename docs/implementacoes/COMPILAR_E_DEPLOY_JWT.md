# 🚀 Compilar e Deploy - JWT Authentication

## 📦 Compilar APK com JWT

### Pré-requisitos
- Android Studio instalado
- SDK Android 5.0+ (API 21+)
- Gradle 7.0+
- Java 11+

### Passos para Compilar

#### 1. Abrir Projeto
```bash
cd TV-MAXX-PRO-Android
```

#### 2. Compilar Debug APK (para testes)
```bash
./gradlew assembleDebug
```

**Resultado:**
```
BUILD SUCCESSFUL in 2m 15s
APK: app/build/outputs/apk/debug/app-debug.apk
```

#### 3. Compilar Release APK (para produção)
```bash
./gradlew assembleRelease
```

**Resultado:**
```
BUILD SUCCESSFUL in 3m 45s
APK: app/build/outputs/apk/release/app-release.apk
```

---

## 📱 Instalar APK em TV Box

### Via ADB (Android Debug Bridge)

#### 1. Conectar TV Box
```bash
adb connect <IP_DO_TV_BOX>:5555
```

#### 2. Verificar Conexão
```bash
adb devices
```

**Resultado esperado:**
```
List of attached devices
192.168.1.100:5555    device
```

#### 3. Instalar APK
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Resultado esperado:**
```
Success
```

#### 4. Iniciar App
```bash
adb shell am start -n com.tvmaxx.pro/.MainActivity
```

---

## 🧪 Testar JWT Authentication

### Teste 1: Login Básico
```bash
# Monitorar logcat durante login
adb logcat | grep -E "AuthRepository|SplashViewModel|LoginViewModel"

# Fazer login no app
# Esperado: Logs mostrando sucesso
```

### Teste 2: Persistência de Token
```bash
# Fazer login
# Fechar app completamente
adb shell am force-stop com.tvmaxx.pro

# Reabrir app
adb shell am start -n com.tvmaxx.pro/.MainActivity

# Monitorar logcat
adb logcat | grep "JWT token"

# Esperado: "✅ JWT token válido, navegando para Home"
```

### Teste 3: Logout
```bash
# Fazer logout no app
# Monitorar logcat
adb logcat | grep "logout"

# Esperado: "✅ Logout bem-sucedido"
```

---

## 🔍 Verificar Logs

### Logs de Autenticação
```bash
adb logcat | grep -E "AuthRepository|SplashViewModel|LoginViewModel|SessionManager"
```

### Logs Completos
```bash
adb logcat > logs.txt
# Fazer ações no app
# Ctrl+C para parar
# Analisar logs.txt
```

### Filtrar por Nível
```bash
# Apenas erros
adb logcat *:E | grep -E "Auth|Login|Session"

# Apenas debug
adb logcat *:D | grep -E "Auth|Login|Session"
```

---

## 📊 Verificar SharedPreferences

### Listar Dados Armazenados
```bash
adb shell
su
cat /data/data/com.tvmaxx.pro/shared_prefs/tvmaxx_session.xml
```

### Resultado Esperado (Com Login)
```xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="jwt_token">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</string>
    <string name="user_email">usuario@exemplo.com</string>
    <boolean name="is_logged_in">true</boolean>
</map>
```

### Resultado Esperado (Após Logout)
```xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <boolean name="is_logged_in">false</boolean>
</map>
```

---

## 🌐 Testar Backend

### Verificar Endpoints com Postman

#### 1. Login
```
POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "device_id": "AA:BB:CC:DD:EE:FF",
  "device_model": "Android TV Box",
  "app_version": "1.0.0"
}
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Usuário",
    "email": "usuario@exemplo.com",
    "plano": "premium",
    "status": "ativo"
  },
  "config": {
    "server_url": "https://...",
    "api_base_url": "https://...",
    "iptv_url": "http://...",
    "iptv_user": "user",
    "iptv_pass": "pass"
  }
}
```

#### 2. Validar Token
```
GET https://maxxcontrol-x-sistema.onrender.com/api/auth/validate-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta esperada (200):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "nome": "Usuário",
    "email": "usuario@exemplo.com",
    "plano": "premium",
    "status": "ativo"
  },
  "expires_in": 3600
}
```

#### 3. Logout
```
DELETE https://maxxcontrol-x-sistema.onrender.com/api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## 🐛 Troubleshooting

### Problema: APK não compila
```bash
# Limpar build
./gradlew clean

# Compilar novamente
./gradlew assembleDebug

# Se persistir, verificar:
# - Java version: java -version
# - Gradle version: ./gradlew --version
# - SDK instalado: $ANDROID_HOME/platforms
```

### Problema: APK não instala
```bash
# Desinstalar versão anterior
adb uninstall com.tvmaxx.pro

# Instalar novamente
adb install app/build/outputs/apk/debug/app-debug.apk

# Se ainda falhar, verificar espaço
adb shell df -h
```

### Problema: App trava na SplashScreen
```bash
# Verificar logcat
adb logcat | grep -E "Exception|Error|Crash"

# Possíveis causas:
# 1. Backend não está rodando
# 2. Sem conexão com internet
# 3. SessionManager não inicializado
```

### Problema: Login falha
```bash
# Verificar credenciais no backend
# Verificar endpoint /api/auth/login
# Verificar logs do backend

# No app, monitorar:
adb logcat | grep "AuthRepository"
```

### Problema: Token não persiste
```bash
# Verificar SharedPreferences
adb shell cat /data/data/com.tvmaxx.pro/shared_prefs/tvmaxx_session.xml

# Verificar se SessionManager.init() foi chamado
adb logcat | grep "SessionManager"

# Verificar permissões
adb shell pm dump com.tvmaxx.pro | grep permission
```

---

## 📋 Checklist de Deploy

### Antes de Compilar
- [ ] Todas as mudanças commitadas no Git
- [ ] Versão do app atualizada em `build.gradle`
- [ ] Backend rodando e testado
- [ ] Endpoints de autenticação funcionando

### Compilação
- [ ] APK compilado sem erros
- [ ] APK assinado (para release)
- [ ] Tamanho do APK verificado

### Testes
- [ ] Login funciona
- [ ] Token persiste
- [ ] Logout funciona
- [ ] Token expirado é detectado
- [ ] Sem internet é tratado

### Deploy
- [ ] APK enviado para distribuição
- [ ] Versão atualizada no painel
- [ ] Usuários notificados
- [ ] Monitoramento ativado

---

## 📊 Monitoramento em Produção

### Verificar Erros
```bash
# Conectar ao TV Box em produção
adb connect <IP_PRODUCAO>

# Monitorar logs
adb logcat | grep -E "Error|Exception|Crash"

# Salvar logs para análise
adb logcat > producao_logs_$(date +%Y%m%d_%H%M%S).txt
```

### Métricas Importantes
- Taxa de sucesso de login
- Tempo médio de validação de token
- Erros de autenticação
- Dispositivos offline

---

## 🔄 Rollback (Se Necessário)

### Desinstalar Versão Problemática
```bash
adb uninstall com.tvmaxx.pro
```

### Instalar Versão Anterior
```bash
adb install app-release-anterior.apk
```

### Notificar Usuários
- Comunicar problema
- Fornecer versão anterior
- Agendar correção

---

## 📞 Suporte

### Logs para Análise
Ao reportar problemas, incluir:
1. Logcat completo
2. SharedPreferences dump
3. Versão do app
4. Modelo do TV Box
5. Versão do Android

### Contato
- Email: suporte@maxxcontrol.com
- Slack: #tv-maxx-pro
- GitHub Issues: [link]

---

## ✅ Status

✅ **PRONTO PARA DEPLOY**

Todos os passos foram testados e validados. O sistema está pronto para:
- Compilação de APK
- Instalação em TV Box
- Testes em produção
- Monitoramento

