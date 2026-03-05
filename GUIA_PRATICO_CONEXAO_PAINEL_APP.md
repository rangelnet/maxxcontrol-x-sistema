# 🛠️ Guia Prático: Implementar Conexão Painel ↔ App em TV-MAXX-PRO

## 📋 Resumo

Este guia mostra como implementar a comunicação entre o painel MaxxControl e o app TV-MAXX-PRO, baseado na análise do MESH TV.

**Abordagem Recomendada**: Opção 1 (Manter Atual) ou Opção 3 (Híbrida)

---

## 🎯 Opção 1: Manter Abordagem Atual (Recomendado para Agora)

### ✅ Vantagens
- Simples e rápido
- Já implementado
- Funciona bem para TV Box único
- Sem tela de login

### ❌ Desvantagens
- Menos seguro
- Sem suporte a múltiplos usuários

### 📝 Implementação Atual

**Arquivo**: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/core/branding/BrandingManager.kt`

```kotlin
// Ao iniciar o app
BrandingManager.loadBranding()
    ├─ GET /api/app-config/config
    ├─ GET /api/branding/active
    ├─ GET /api/iptv-server/config
    └─ Pronto para usar!
```

**Fluxo Completo**:

```
MainActivity.onCreate()
    ↓
BrandingManager.loadBranding()
    ├─ Busca config da API
    ├─ Busca branding
    ├─ Busca credenciais Xtream
    │
    └─ XtreamRepository.initialize(url, user, pass)
        ↓
    LiveTvScreen carrega canais
```

### ✅ Checklist de Implementação

- [x] Backend retorna config em `/api/app-config/config`
- [x] Backend retorna branding em `/api/branding/active`
- [x] Backend retorna credenciais em `/api/iptv-server/config`
- [x] App busca config ao iniciar
- [x] App armazena credenciais localmente
- [x] App usa credenciais para carregar canais
- [x] Dashboard MESH TV implementado

---

## 🔐 Opção 2: Implementar Login (Para Múltiplos Usuários)

### ✅ Vantagens
- Mais seguro (JWT por usuário)
- Suporta múltiplos usuários
- Padrão da indústria
- Melhor controle

### ❌ Desvantagens
- Mais complexo
- Mais lento (requisição extra)
- Menos amigável para TV Box

### 📝 Implementação

#### Passo 1: Criar Tela de Login

**Arquivo**: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/features/auth/LoginScreen.kt`

```kotlin
@Composable
fun LoginScreen(
    onLoginSuccess: (String) -> Unit,
    onLoginError: (String) -> Unit
) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Logo
        Image(
            painter = painterResource(id = R.drawable.logo),
            contentDescription = "Logo",
            modifier = Modifier.size(120.dp)
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Título
        Text(
            text = "TV MAXX",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFFF6A00)
        )
        
        Spacer(modifier = Modifier.height(48.dp))
        
        // Campo Usuário
        OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            label = { Text("Usuário") },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFFFF6A00),
                unfocusedBorderColor = Color.Gray
            )
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Campo Senha
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Senha") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFFFF6A00),
                unfocusedBorderColor = Color.Gray
            )
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Botão Entrar
        Button(
            onClick = {
                isLoading = true
                performLogin(username, password, onLoginSuccess, onLoginError)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFFF6A00)
            ),
            enabled = !isLoading && username.isNotEmpty() && password.isNotEmpty()
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Text("Entrar", fontSize = 18.sp)
            }
        }
    }
}

private fun performLogin(
    username: String,
    password: String,
    onSuccess: (String) -> Unit,
    onError: (String) -> Unit
) {
    // Implementar chamada à API
    // POST /auth/login
    // Retorna token JWT
}
```

#### Passo 2: Criar AuthViewModel

**Arquivo**: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/features/auth/AuthViewModel.kt`

```kotlin
class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()
    
    fun login(username: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val response = authRepository.login(username, password)
                
                // Armazenar token
                SharedPreferencesManager.saveToken(response.token)
                SharedPreferencesManager.saveUser(response.user)
                
                _authState.value = AuthState.Success(response.token)
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Erro desconhecido")
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            try {
                authRepository.logout()
                SharedPreferencesManager.clearToken()
                SharedPreferencesManager.clearUser()
                _authState.value = AuthState.Idle
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Erro ao fazer logout")
            }
        }
    }
}

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val token: String) : AuthState()
    data class Error(val message: String) : AuthState()
}
```

#### Passo 3: Criar AuthRepository

**Arquivo**: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/data/repository/AuthRepository.kt`

```kotlin
class AuthRepository(
    private val apiService: ApiService
) {
    
    suspend fun login(username: String, password: String): LoginResponse {
        return apiService.login(
            LoginRequest(
                username = username,
                password = password,
                device_id = getDeviceMacAddress(),
                device_model = Build.MODEL,
                app_version = BuildConfig.VERSION_NAME
            )
        )
    }
    
    suspend fun logout() {
        apiService.logout()
    }
    
    suspend fun validateToken(): Boolean {
        return try {
            val token = SharedPreferencesManager.getToken()
            apiService.validateToken("Bearer $token")
            true
        } catch (e: Exception) {
            false
        }
    }
    
    private fun getDeviceMacAddress(): String {
        // Implementar obtenção de MAC address
        return ""
    }
}

data class LoginRequest(
    val username: String,
    val password: String,
    val device_id: String,
    val device_model: String,
    val app_version: String
)

data class LoginResponse(
    val success: Boolean,
    val token: String,
    val user: UserData,
    val config: ConfigData
)

data class UserData(
    val id: Int,
    val username: String,
    val email: String,
    val plan: String,
    val expires_at: String
)

data class ConfigData(
    val iptv_url: String,
    val iptv_user: String,
    val iptv_pass: String,
    val branding: BrandingData
)
```

#### Passo 4: Atualizar ApiService

**Arquivo**: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/data/api/ApiService.kt`

```kotlin
interface ApiService {
    
    @POST("/auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
    
    @DELETE("/auth/logout")
    suspend fun logout()
    
    @GET("/auth/validate")
    suspend fun validateToken(
        @Header("Authorization") token: String
    ): ValidateTokenResponse
    
    // ... outros endpoints
}

data class ValidateTokenResponse(
    val valid: Boolean,
    val user: UserData,
    val expires_in: Int
)
```

#### Passo 5: Atualizar MainActivity

**Arquivo**: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/MainActivity.kt`

```kotlin
@Composable
fun MainApp() {
    val authViewModel: AuthViewModel = viewModel()
    val authState by authViewModel.authState.collectAsState()
    
    when (authState) {
        is AuthState.Idle -> {
            // Verificar se token existe
            val token = SharedPreferencesManager.getToken()
            if (token != null) {
                // Validar token
                LaunchedEffect(Unit) {
                    // Validar token com backend
                }
                HomeScreen()
            } else {
                LoginScreen(
                    onLoginSuccess = { token ->
                        // Navegar para home
                    },
                    onLoginError = { error ->
                        // Mostrar erro
                    }
                )
            }
        }
        is AuthState.Loading -> {
            LoadingScreen()
        }
        is AuthState.Success -> {
            HomeScreen()
        }
        is AuthState.Error -> {
            ErrorScreen(
                message = (authState as AuthState.Error).message,
                onRetry = { authViewModel.login("", "") }
            )
        }
    }
}
```

### ✅ Checklist de Implementação

- [ ] Criar tela de login
- [ ] Criar AuthViewModel
- [ ] Criar AuthRepository
- [ ] Atualizar ApiService
- [ ] Implementar armazenamento de token
- [ ] Implementar validação de token
- [ ] Implementar logout
- [ ] Testar fluxo de login
- [ ] Testar fluxo de logout
- [ ] Testar expiração de token

---

## 🔄 Opção 3: Híbrida (Recomendado para Futuro)

### ✅ Vantagens
- Melhor dos dois mundos
- Flexível (login ou token fixo)
- Seguro (JWT quando disponível)
- Rápido (token fixo como fallback)

### ❌ Desvantagens
- Mais complexo
- Mais código

### 📝 Implementação

```kotlin
@Composable
fun SplashScreen(
    onNavigate: (String) -> Unit
) {
    LaunchedEffect(Unit) {
        // Verificar se token JWT existe
        val jwtToken = SharedPreferencesManager.getJwtToken()
        
        if (jwtToken != null) {
            // Validar JWT com backend
            val isValid = validateJwtToken(jwtToken)
            if (isValid) {
                // Ir para home
                onNavigate("home")
            } else {
                // Ir para login
                onNavigate("login")
            }
        } else {
            // Verificar se token fixo existe
            val fixedToken = SharedPreferencesManager.getFixedToken()
            if (fixedToken != null) {
                // Usar token fixo
                onNavigate("home")
            } else {
                // Oferecer opções
                onNavigate("auth_options")
            }
        }
    }
}

@Composable
fun AuthOptionsScreen(
    onLoginClick: () -> Unit,
    onUseFixedTokenClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Como deseja entrar?",
            fontSize = 24.sp,
            color = Color.White
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = onLoginClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFFF6A00)
            )
        ) {
            Text("Entrar com Credenciais")
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = onUseFixedTokenClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Gray
            )
        ) {
            Text("Usar Token Fixo")
        }
    }
}
```

### ✅ Checklist de Implementação

- [ ] Criar tela de opções de autenticação
- [ ] Implementar lógica de verificação de token
- [ ] Implementar fallback para token fixo
- [ ] Testar ambos os fluxos
- [ ] Testar transição entre fluxos

---

## 🧪 Testes

### Teste 1: Fluxo de Login (Opção 2)

```
1. Abrir app
2. Ir para tela de login
3. Digitar credenciais válidas
4. Clicar "Entrar"
5. Verificar se token foi armazenado
6. Verificar se app foi para home
7. Fechar app
8. Abrir app novamente
9. Verificar se foi direto para home (sem login)
```

### Teste 2: Fluxo de Logout (Opção 2)

```
1. Estar logado
2. Ir para configurações
3. Clicar "Sair"
4. Verificar se token foi removido
5. Verificar se app foi para login
```

### Teste 3: Fluxo Híbrido (Opção 3)

```
1. Abrir app
2. Ir para tela de opções
3. Clicar "Entrar com Credenciais"
4. Fazer login
5. Fechar app
6. Abrir app novamente
7. Verificar se foi direto para home
8. Ir para configurações
9. Clicar "Sair"
10. Clicar "Usar Token Fixo"
11. Verificar se foi para home com token fixo
```

---

## 📊 Comparação de Opções

| Aspecto | Opção 1 | Opção 2 | Opção 3 |
|---------|---------|---------|---------|
| **Complexidade** | Baixa | Alta | Média |
| **Segurança** | Média | Alta | Alta |
| **Velocidade** | Rápida | Média | Rápida |
| **Múltiplos Usuários** | Não | Sim | Sim |
| **Implementação** | ✅ Feita | ⏳ Pendente | ⏳ Pendente |
| **Recomendação** | ✅ Agora | ⏳ Futuro | ✅ Futuro |

---

## 🚀 Recomendação Final

### Para Agora (Março 2026)
**Use Opção 1** (Manter Atual)
- Já está implementada
- Funciona bem
- Simples e rápido

### Para Futuro (Próximos Meses)
**Migre para Opção 3** (Híbrida)
- Mais segura
- Mais flexível
- Melhor experiência

### Se Precisar de Múltiplos Usuários
**Use Opção 2** (Login)
- Mais segura
- Padrão da indústria
- Melhor controle

---

## 📚 Referências

- [MESH TV Analysis](./ANALISE_MESH_TV_CONEXAO_PAINEL.md)
- [Panel-App Architecture](./ARQUITETURA_PAINEL_APP.md)
- [Panel-App Connection Summary](./RESUMO_CONEXAO_PAINEL_APP.md)
- [Testing Guide](./TESTAR_CONEXAO_PAINEL_APP.md)

---

**Data**: 1º de Março de 2026  
**Status**: ✅ Pronto para Implementação  
**Próximo**: Escolher opção e implementar

