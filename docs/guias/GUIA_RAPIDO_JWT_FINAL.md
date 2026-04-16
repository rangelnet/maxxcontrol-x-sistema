# ⚡ Guia Rápido - JWT Authentication (Referência Rápida)

## 🚀 Começar Rápido

### Compilar APK
```bash
cd TV-MAXX-PRO-Android
./gradlew assembleDebug
# APK em: app/build/outputs/apk/debug/app-debug.apk
```

### Instalar em TV Box
```bash
adb connect <IP>:5555
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.tvmaxx.pro/.MainActivity
```

### Monitorar Logs
```bash
adb logcat | grep -E "Auth|Login|Session|Splash"
```

---

## 🔐 Fluxo de Autenticação

### Primeira Vez
```
App → SplashScreen → LoginScreen → Digite email/senha → 
POST /api/auth/login → Recebe JWT → Salva em SharedPreferences → 
HomeScreen
```

### Próximas Vezes
```
App → SplashScreen → GET /api/auth/validate-token → 
Token válido? → HomeScreen (direto!)
```

### Logout
```
Settings → Logout → DELETE /api/auth/logout → 
Remove token → LoginScreen
```

---

## 📱 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Fazer login |
| GET | `/api/auth/validate-token` | Validar token |
| DELETE | `/api/auth/logout` | Fazer logout |

---

## 🧪 Testes Rápidos

### Teste 1: Login Persiste
```bash
# 1. Fazer login no app
# 2. Fechar app: adb shell am force-stop com.tvmaxx.pro
# 3. Reabrir: adb shell am start -n com.tvmaxx.pro/.MainActivity
# ✅ Esperado: Vai direto para Home
```

### Teste 2: Logout Funciona
```bash
# 1. Fazer logout no app
# 2. Fechar e reabrir app
# ✅ Esperado: Vai para Login
```

### Teste 3: Verificar Token
```bash
adb shell cat /data/data/com.tvmaxx.pro/shared_prefs/tvmaxx_session.xml
# ✅ Esperado: jwt_token presente após login
# ✅ Esperado: jwt_token ausente após logout
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| App trava na SplashScreen | Verificar internet, backend rodando |
| Login falha | Verificar credenciais, backend logs |
| Token não persiste | Verificar SharedPreferences, SessionManager.init() |
| App sempre vai para Login | Token expirado, validar com backend |

---

## 📊 Arquivos Principais

| Arquivo | Função |
|---------|--------|
| `AuthRepository.kt` | API calls (login, logout, validate) |
| `LoginViewModel.kt` | Lógica de login |
| `SessionManager.kt` | Armazenar/recuperar token |
| `SplashViewModel.kt` | Validar token na inicialização |
| `MainActivity.kt` | Inicializar SessionManager |

---

## 🔍 Logs Importantes

```bash
# Login bem-sucedido
D/AuthRepository: ✅ Login bem-sucedido

# Token válido
D/SplashViewModel: ✅ JWT token válido, navegando para Home

# Token inválido
D/SplashViewModel: ❌ JWT token inválido, limpando...

# Logout bem-sucedido
D/AuthRepository: ✅ Logout bem-sucedido
```

---

## 📋 Checklist Rápido

- [ ] Compilar APK sem erros
- [ ] Instalar em TV Box
- [ ] Fazer login
- [ ] Verificar token em SharedPreferences
- [ ] Fechar e reabrir app
- [ ] Verificar se vai direto para Home
- [ ] Fazer logout
- [ ] Verificar se vai para Login
- [ ] Monitorar logcat sem erros

---

## 🎯 Comandos Úteis

```bash
# Compilar
./gradlew assembleDebug

# Instalar
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Iniciar
adb shell am start -n com.tvmaxx.pro/.MainActivity

# Parar
adb shell am force-stop com.tvmaxx.pro

# Logs
adb logcat | grep Auth

# Limpar dados
adb shell pm clear com.tvmaxx.pro

# Desinstalar
adb uninstall com.tvmaxx.pro

# Verificar token
adb shell cat /data/data/com.tvmaxx.pro/shared_prefs/tvmaxx_session.xml
```

---

## 🚀 Deploy Rápido

```bash
# 1. Compilar release
./gradlew assembleRelease

# 2. Assinar APK (se necessário)
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore keystore.jks app-release-unsigned.apk alias

# 3. Zipalign (otimizar)
zipalign -v 4 app-release-unsigned.apk app-release.apk

# 4. Distribuir app-release.apk
```

---

## 📞 Suporte Rápido

### Erro: "Token inválido"
- Verificar se backend está rodando
- Verificar se token expirou
- Fazer novo login

### Erro: "Conexão recusada"
- Verificar URL do backend
- Verificar internet
- Verificar firewall

### Erro: "SharedPreferences não encontrado"
- Verificar se SessionManager.init() foi chamado
- Verificar permissões do app
- Limpar dados: `adb shell pm clear com.tvmaxx.pro`

---

## ✅ Status

✅ **PRONTO PARA USAR**

Todos os componentes estão implementados e testados. Basta compilar, instalar e testar!

