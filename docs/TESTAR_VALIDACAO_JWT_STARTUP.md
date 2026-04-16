# 🧪 Guia de Testes - Validação de JWT Token na Inicialização

## Preparação

### Pré-requisitos
- APK compilado com as mudanças de JWT
- TV Box com Android 5.0+
- Acesso ao painel MaxxControl (backend rodando)
- Logcat disponível para debug

### Compilar APK
```bash
cd TV-MAXX-PRO-Android
./gradlew assembleDebug
# APK gerado em: app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Teste 1: Login e Persistência de Token

### Passos
1. Instalar APK no TV Box
2. Abrir o app
3. Fazer login com credenciais válidas
   - Email: `seu_email@exemplo.com`
   - Senha: `sua_senha`
4. Verificar se navega para Home
5. Fechar o app completamente (não apenas minimizar)
6. Reabrir o app

### Resultado Esperado
- ✅ App navega direto para Home (sem tela de login)
- ✅ Logcat mostra: `✅ JWT token válido, navegando para Home`

### Logcat para Monitorar
```bash
adb logcat | grep -E "SplashViewModel|AuthRepository|SessionManager"
```

### Resultado no Logcat
```
D/SplashViewModel: 🔐 JWT token encontrado, validando...
D/AuthRepository: ✔ Validando token
D/AuthRepository: 📡 Response Code: 200
D/AuthRepository: ✅ Token válido
D/SplashViewModel: ✅ JWT token válido, navegando para Home
```

---

## 🚪 Teste 2: Logout e Limpeza de Token

### Passos
1. Estar logado no app (Home screen)
2. Ir para Settings
3. Clicar em "Logout"
4. Verificar se navega para Login
5. Fechar o app
6. Reabrir o app

### Resultado Esperado
- ✅ App navega para Login (não para Home)
- ✅ Logcat mostra: `Token removido com sucesso`

### Logcat para Monitorar
```bash
adb logcat | grep -E "logout|clearToken|NavigateToLogin"
```

### Resultado no Logcat
```
D/AuthRepository: 🚪 Iniciando logout
D/AuthRepository: 📡 Response Code: 200
D/AuthRepository: ✅ Logout bem-sucedido
D/SessionManager: Token removido com sucesso
D/SplashViewModel: 🔐 JWT token encontrado, validando...
D/AuthRepository: ❌ Token inválido: 401
D/SplashViewModel: ❌ JWT token inválido, limpando...
D/SplashViewModel: NavigateToLogin
```

---

## ⏰ Teste 3: Token Expirado

### Passos
1. Fazer login com credenciais válidas
2. Aguardar token expirar (ou simular expiração no backend)
3. Fechar o app
4. Reabrir o app

### Resultado Esperado
- ✅ App detecta token expirado
- ✅ App navega para Login
- ✅ Logcat mostra: `❌ JWT token inválido`

### Logcat para Monitorar
```bash
adb logcat | grep -E "Token inválido|expires_in|NavigateToLogin"
```

### Resultado no Logcat
```
D/SplashViewModel: 🔐 JWT token encontrado, validando...
D/AuthRepository: ✔ Validando token
D/AuthRepository: 📡 Response Code: 401
D/AuthRepository: ❌ Token inválido: 401
D/SplashViewModel: ❌ JWT token inválido, limpando...
D/SplashViewModel: NavigateToLogin
```

---

## 🌐 Teste 4: Sem Conexão com Internet

### Passos
1. Fazer login com credenciais válidas
2. Desligar WiFi/Internet do TV Box
3. Fechar o app
4. Reabrir o app

### Resultado Esperado
- ✅ App tenta validar token (falha por falta de internet)
- ✅ App tenta login automático XTREAM como fallback
- ✅ Se XTREAM também falhar, navega para Login

### Logcat para Monitorar
```bash
adb logcat | grep -E "Erro ao validar|Exceção|fallback"
```

### Resultado no Logcat
```
D/SplashViewModel: 🔐 JWT token encontrado, validando...
D/AuthRepository: ✔ Validando token
E/AuthRepository: ❌ Exceção ao validar token: java.net.ConnectException
D/SplashViewModel: ❌ Erro ao validar JWT token: java.net.ConnectException
D/SplashViewModel: Tentando login automático XTREAM...
```

---

## 🔄 Teste 5: Múltiplos Logins/Logouts

### Passos
1. Fazer login com usuário A
2. Fechar e reabrir app (verificar se vai para Home)
3. Fazer logout
4. Fazer login com usuário B
5. Fechar e reabrir app (verificar se vai para Home com usuário B)
6. Fazer logout

### Resultado Esperado
- ✅ Cada login salva novo token
- ✅ Cada logout remove token anterior
- ✅ App sempre navega corretamente baseado no token atual

---

## 📊 Teste 6: Verificar SharedPreferences

### Verificar Token Armazenado
```bash
adb shell
su
cat /data/data/com.tvmaxx.pro/shared_prefs/tvmaxx_session.xml
```

### Resultado Esperado
```xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="jwt_token">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</string>
    <string name="user_email">usuario@exemplo.com</string>
    <boolean name="is_logged_in" value="true" />
</map>
```

### Após Logout
```xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <boolean name="is_logged_in" value="false" />
</map>
```

---

## 🐛 Troubleshooting

### Problema: App sempre vai para Login
**Solução:**
1. Verificar se backend está rodando
2. Verificar se endpoint `/api/auth/validate-token` está funcionando
3. Verificar logs do backend para erros

### Problema: Token não é salvo
**Solução:**
1. Verificar se `SessionManager.saveToken()` está sendo chamado
2. Verificar SharedPreferences com: `adb shell dumpsys package com.tvmaxx.pro`
3. Verificar permissões de escrita

### Problema: App trava na SplashScreen
**Solução:**
1. Verificar logcat para exceções
2. Aumentar timeout de validação de token
3. Verificar conexão com internet

---

## ✅ Checklist de Validação

- [ ] Teste 1: Login e Persistência ✅
- [ ] Teste 2: Logout e Limpeza ✅
- [ ] Teste 3: Token Expirado ✅
- [ ] Teste 4: Sem Internet ✅
- [ ] Teste 5: Múltiplos Logins ✅
- [ ] Teste 6: SharedPreferences ✅
- [ ] Logcat sem erros críticos ✅
- [ ] App não trava ✅
- [ ] Navegação correta ✅

---

## 📝 Notas

- Todos os testes devem ser executados em um TV Box real
- Verificar logcat durante cada teste para debug
- Se houver erros, consultar logs do backend também
- Documentar qualquer comportamento inesperado

