# 📱 ANÁLISE DO APP TV MAXX PRO ANDROID

## ✅ PROJETO ACESSÍVEL!

Agora tenho acesso completo ao projeto Android! 🎉

## 📊 ESTRUTURA DO PROJETO

### Tecnologias
- **Linguagem:** Kotlin
- **UI:** Jetpack Compose
- **Arquitetura:** MVVM + Repository Pattern
- **Player:** ExoPlayer (Media3)
- **Networking:** Retrofit + OkHttp
- **Imagens:** Coil
- **Banco Local:** Room

### Estrutura de Pastas
```
TV-MAXX-PRO-Android/
├── app/
│   ├── src/main/
│   │   ├── java/com/tvmaxx/pro/
│   │   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── core/            # Utilitários e constantes
│   │   │   ├── database/        # Room database
│   │   │   ├── features/        # Telas (auth, home, player, etc)
│   │   │   ├── network/         # Retrofit + Repository
│   │   │   ├── player/          # ExoPlayer
│   │   │   └── ui/              # Tema e componentes UI
│   │   ├── res/drawable/        # Imagens (WebP + PNG)
│   │   └── assets/lua/          # Scripts Lua
│   └── build.gradle.kts
```

## 🔍 CONFIGURAÇÃO ATUAL

### Servidor Padrão
```kotlin
// LoginViewModel.kt
companion object {
    const val DEFAULT_SERVER = "http://newoneblue.site"
    const val CHATBOT_URL = "https://painel.masterbins.com/api/chatbot/bOxLAQLZ7a/ANKWPKDPRq"
    const val FALLBACK_USER = "XnmdhkKG9W"
    const val FALLBACK_PASS = "qZKJQQaacc"
}
```

### Integração Parcial com MaxxControl X
```kotlin
// Já tem código para integrar! (linhas 38-48 do LoginViewModel)
launch(Dispatchers.IO) {
    try {
        val mcRepo = DataModule.maxxControlRepository
        mcRepo.registerDevice()
        mcRepo.sendLog("login", "Login IPTV: $user@$serverUrl")
        mcRepo.reportOnline()
    } catch (_: Exception) { /* Silencioso */ }
}
```

**Isso significa que o app JÁ TEM código para se conectar ao MaxxControl X!** 🎉

## 📦 TAMANHO DO APK (80 MB)

### Dependências Pesadas
```gradle
// ExoPlayer (Media3) - ~8 MB
implementation("androidx.media3:media3-exoplayer:1.2.1")
implementation("androidx.media3:media3-ui:1.2.1")
implementation("androidx.media3:media3-common:1.2.1")

// Compose BOM - ~15 MB
implementation(platform("androidx.compose:compose-bom:2023.10.01"))

// Room - ~3 MB
implementation("androidx.room:room-runtime:2.6.1")
implementation("androidx.room:room-ktx:2.6.1")

// Coil - ~2 MB
implementation("io.coil-kt:coil-compose:2.5.0")
implementation("io.coil-kt:coil-svg:2.5.0")
```

### Imagens no APK
```
res/drawable/
├── ic_banner.png        # ⚠️ PNG (pesado)
├── ic_launcher.png      # ⚠️ PNG
├── ic_maxx_play.png     # ⚠️ PNG
├── logo_move.png        # ⚠️ PNG
├── ic_all.webp          # ✅ WebP (otimizado)
├── ic_bbb.webp          # ✅ WebP
├── ic_docs.webp         # ✅ WebP
└── ... (outros WebP)
```

### Configuração de Build
```gradle
// ✅ JÁ TEM minificação
release {
    isMinifyEnabled = true
    proguardFiles(...)
}

// ✅ JÁ TEM splits por ABI
splits {
    abi {
        isEnable = true
        include("armeabi-v7a", "arm64-v8a")
        isUniversalApk = true  // ⚠️ Gera APK universal (pesado)
    }
}
```

## 🎯 PLANO DE INTEGRAÇÃO COM MAXXCONTROL X

### 1. Configuração Remota (PRIORIDADE ALTA)

#### Criar MaxxControlRepository
```kotlin
// network/repository/MaxxControlRepository.kt
class MaxxControlRepository {
    private val api = RetrofitClient.createMaxxControlApi()
    
    suspend fun getAppConfig(): AppConfig {
        return api.getConfig()
    }
    
    suspend fun registerDevice() {
        val mac = DeviceUtils.getMacAddress()
        val model = Build.MODEL
        val androidVersion = Build.VERSION.RELEASE
        val appVersion = BuildConfig.VERSION_NAME
        
        api.registerDevice(DeviceRequest(mac, model, androidVersion, appVersion))
    }
    
    suspend fun sendLog(type: String, description: String) {
        api.sendLog(LogRequest(type, description))
    }
    
    suspend fun reportOnline() {
        api.reportOnline()
    }
}
```

#### Criar API Interface
```kotlin
// network/api/MaxxControlApi.kt
interface MaxxControlApi {
    @GET("api/app-config/config")
    suspend fun getConfig(): AppConfig
    
    @POST("api/device/register")
    suspend fun registerDevice(@Body request: DeviceRequest)
    
    @POST("api/log/create")
    suspend fun sendLog(@Body request: LogRequest)
    
    @POST("api/monitor/online")
    suspend fun reportOnline()
    
    @GET("api/clients/verify/{mac}")
    suspend fun verifyMAC(@Path("mac") mac: String): MACVerification
}
```

#### Modificar LoginViewModel
```kotlin
// Ao iniciar o app, buscar configuração
init {
    viewModelScope.launch {
        try {
            val config = DataModule.maxxControlRepository.getAppConfig()
            // Atualizar URLs dinamicamente
            DEFAULT_SERVER = config.server_url
            // Salvar em SharedPreferences
            SessionManager.saveConfig(config)
        } catch (e: Exception) {
            // Usar configuração padrão
        }
    }
}
```

### 2. Verificação de MAC (Sistema de Revendedores)

```kotlin
// Antes de fazer login IPTV, verificar MAC
suspend fun checkMACAuthorization(): Boolean {
    return try {
        val mac = DeviceUtils.getMacAddress()
        val result = DataModule.maxxControlRepository.verifyMAC(mac)
        result.authorized
    } catch (e: Exception) {
        false // Se API estiver offline, permitir acesso
    }
}
```

### 3. Reduzir Tamanho do APK

#### Converter PNGs para WebP
```bash
# Converter ic_banner.png, ic_launcher.png, etc
cwebp -q 80 ic_banner.png -o ic_banner.webp
```

#### Otimizar build.gradle
```gradle
splits {
    abi {
        isEnable = true
        include("armeabi-v7a", "arm64-v8a")
        isUniversalApk = false  // ⚠️ MUDAR PARA FALSE
    }
}

// Adicionar
defaultConfig {
    resConfigs "pt", "pt-rBR"  // Apenas português
}

// Adicionar compressão
packagingOptions {
    resources {
        excludes += [
            "META-INF/DEPENDENCIES",
            "META-INF/LICENSE",
            "META-INF/LICENSE.txt",
            "META-INF/NOTICE",
            "META-INF/NOTICE.txt",
            "META-INF/*.kotlin_module"
        ]
    }
}
```

## 📋 CHECKLIST DE TAREFAS

### Integração MaxxControl X
- [ ] Criar `MaxxControlRepository.kt`
- [ ] Criar `MaxxControlApi.kt`
- [ ] Criar data classes (`AppConfig`, `DeviceRequest`, etc)
- [ ] Modificar `LoginViewModel` para buscar config remota
- [ ] Implementar verificação de MAC
- [ ] Testar integração completa

### Otimização de Tamanho
- [ ] Converter PNGs para WebP
- [ ] Mudar `isUniversalApk = false`
- [ ] Adicionar `resConfigs "pt", "pt-rBR"`
- [ ] Adicionar `packagingOptions`
- [ ] Remover recursos não usados
- [ ] Gerar AAB ao invés de APK

### Testes
- [ ] Testar login com config remota
- [ ] Testar verificação de MAC
- [ ] Testar logs e registro de device
- [ ] Testar em TV Box real
- [ ] Verificar tamanho do APK final

## 🎯 RESULTADO ESPERADO

### Antes
- APK Universal: 80 MB
- Configuração hardcoded
- Sem integração com painel

### Depois
- APK arm64-v8a: 15-18 MB
- APK armeabi-v7a: 12-15 MB
- AAB (Google Play): 10-12 MB
- Configuração remota pelo painel
- Integração completa com MaxxControl X
- Sistema de revendedores funcionando

## 🚀 PRÓXIMOS PASSOS

1. **Criar arquivos de integração** (Repository, API, Models)
2. **Modificar LoginViewModel** para usar config remota
3. **Otimizar build.gradle** para reduzir tamanho
4. **Converter imagens** PNG para WebP
5. **Testar** tudo localmente
6. **Gerar APK** otimizado
7. **Testar** em TV Box real

## 💡 QUER QUE EU FAÇA AGORA?

Posso criar todos os arquivos de integração agora mesmo! É só me avisar e eu:

1. Crio o `MaxxControlRepository.kt`
2. Crio o `MaxxControlApi.kt`
3. Crio as data classes
4. Modifico o `LoginViewModel.kt`
5. Otimizo o `build.gradle.kts`
6. Crio um guia de teste

Bora começar? 😊
