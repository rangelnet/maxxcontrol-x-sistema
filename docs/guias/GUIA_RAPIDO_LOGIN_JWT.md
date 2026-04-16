# ⚡ Guia Rápido: Login com JWT

## 🚀 Começar Agora

### 1. Backend - Testar com Postman

**Login**:
```
POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login

{
  "email": "admin@maxxcontrol.com",
  "password": "sua_senha",
  "device_id": "AA:BB:CC:DD:EE:FF",
  "device_model": "Xiaomi Mi Box S",
  "app_version": "1.0.0"
}
```

**Copiar o token da resposta**

**Validar Token**:
```
GET https://maxxcontrol-x-sistema.onrender.com/api/auth/validate-token

Header: Authorization: Bearer {token_aqui}
```

**Logout**:
```
DELETE https://maxxcontrol-x-sistema.onrender.com/api/auth/logout

Header: Authorization: Bearer {token_aqui}
```

---

### 2. App - Usar Login com JWT

**No LoginViewModel**:
```kotlin
// Login com JWT
viewModel.loginWithJWT(
    email = "admin@maxxcontrol.com",
    password = "sua_senha",
    onLoginSuccess = {
        // Navegar para home
        navController.navigate(Screen.Home.route)
    }
)

// Logout
viewModel.logout(
    onLogoutSuccess = {
        // Navegar para login
        navController.navigate(Screen.Login.route)
    }
)

// Validar Token
viewModel.validateToken(
    onTokenValid = {
        // Token é válido, ir para home
    },
    onTokenInvalid = {
        // Token é inválido, ir para login
    }
)
```

---

### 3. MainActivity - Verificar Token ao Iniciar

```kotlin
// Ao iniciar o app
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Verificar se token existe
    val token = SessionManager.getToken()
    if (token != null) {
        // Validar token com backend
        loginViewModel.validateToken(
            onTokenValid = {
                // Ir para home
                navController.navigate(Screen.Home.route)
            },
            onTokenInvalid = {
                // Ir para login
                navController.navigate(Screen.Login.route)
            }
        )
    } else {
        // Ir para login
        navController.navigate(Screen.Login.route)
    }
}
```

---

## 📋 Checklist Rápido

- [ ] Testar login com Postman
- [ ] Testar validação de token
- [ ] Testar logout
- [ ] Atualizar MainActivity
- [ ] Compilar APK
- [ ] Testar no TV Box

---

## 🔑 Funções Principais

### AuthRepository

```kotlin
// Login
suspend fun login(email: String, password: String): Result<LoginResponse>

// Logout
suspend fun logout(token: String): Result<Boolean>

// Validar Token
suspend fun validateToken(token: String): Result<ValidateTokenResponse>
```

### LoginViewModel

```kotlin
// Login com JWT
fun loginWithJWT(email: String, password: String, onLoginSuccess: () -> Unit)

// Logout
fun logout(onLogoutSuccess: () -> Unit)

// Validar Token
fun validateToken(onTokenValid: () -> Unit, onTokenInvalid: () -> Unit)
```

### SessionManager

```kotlin
// Salvar token
SessionManager.saveToken(token)

// Obter token
val token = SessionManager.getToken()

// Limpar token
SessionManager.clearToken()

// Salvar usuário
SessionManager.saveUser(email)

// Obter usuário
val user = SessionManager.getUser()

// Limpar usuário
SessionManager.clearUser()
```

---

## 🎨 Layout Mantido

✅ Sem mudanças no layout  
✅ Sem mudanças nas cores  
✅ Sem mudanças nas animações  
✅ Sem mudanças nas funcionalidades

---

## 📊 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/login | Login com JWT |
| DELETE | /api/auth/logout | Logout |
| GET | /api/auth/validate-token | Validar token |

---

## 🚨 Erros Comuns

### "Credenciais inválidas"
- Verificar email e senha
- Verificar se usuário existe no banco

### "Token inválido ou expirado"
- Fazer login novamente
- Verificar se token foi armazenado

### "Erro ao conectar ao servidor"
- Verificar internet
- Verificar se backend está rodando

---

## 💡 Dicas

1. **Sempre validar token ao iniciar o app**
2. **Armazenar token em SharedPreferences**
3. **Usar HTTPS em produção**
4. **Implementar refresh token para tokens expirados**
5. **Testar em múltiplos TV Boxes**

---

## 📞 Suporte

- Ler: `IMPLEMENTACAO_LOGIN_JWT.md`
- Ler: `TESTAR_LOGIN_JWT.md`
- Ler: `IMPLEMENTACAO_CONCLUIDA.md`

---

**Data**: 1º de Março de 2026  
**Status**: ✅ Pronto para Usar

