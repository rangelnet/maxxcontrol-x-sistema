# 🚀 PLANO DE INTEGRAÇÃO - MESH TV + TV MAXX PRO

## 🎯 OBJETIVO

Criar versão híbrida que combine:
- Base moderna do TV MAXX PRO (Kotlin + Compose)
- Recursos únicos do MESH TV (Games, Catch-up, Radio, etc.)
- Integração completa com MaxxControl X

---

## 📋 RECURSOS A ADICIONAR

### 1. RETRO GAMES 🎮

**Prioridade:** ALTA
**Complexidade:** MÉDIA
**Tempo estimado:** 2-3 dias

**O que fazer:**
```kotlin
// 1. Adicionar dependências do emulador
dependencies {
    implementation("com.retroarch:retroarch-android:1.15.0")
    // ou usar LibRetro diretamente
}

// 2. Criar GamesScreen.kt
@Composable
fun GamesScreen() {
    // Lista de jogos disponíveis
    // Categorias: NES, SNES, Genesis, etc.
    // Player integrado
}

// 3. Criar GamesViewModel.kt
class GamesViewModel : ViewModel() {
    fun loadGames()
    fun playGame(gameId: String)
    fun saveGameState()
}

// 4. Integrar com MaxxControl X
// - Logs de jogos jogados
// - Tempo de jogo
// - Favoritos
```

**Arquivos do Mesh TV para referência:**
- `activity_games.xml`
- `ActvityGame`
- `GameInfo`
- `SampleActivity`

---

### 2. CATCH-UP TV ⏮️

**Prioridade:** ALTA
**Complexidade:** MÉDIA
**Tempo estimado:** 2-3 dias

**O que fazer:**
```kotlin
// 1. Adicionar ao LiveTvScreen
enum class LiveTvViewMode {
    DASHBOARD,
    WATCHING,
    CATCHUP  // NOVO
}

// 2. Criar CatchUpScreen.kt
@Composable
fun CatchUpScreen(channel: ChannelGroup) {
    // EPG dos últimos 7 dias
    // Lista de programas passados
    // Player para assistir
}

// 3. Adicionar botão no OSD
OsdButton(
    icon = Icons.Default.History,
    text = "Catch-up",
    onClick = { viewMode = LiveTvViewMode.CATCHUP }
)

// 4. API Xtream Codes
// GET /player_api.php?username=X&password=Y&action=get_simple_data_table&stream_id=Z
```

**Arquivos do Mesh TV para referência:**
- `activity_catch_up.xml`
- `activity_catch_up_epg.xml`

---

### 3. RADIO 📻

**Prioridade:** MÉDIA
**Complexidade:** BAIXA
**Tempo estimado:** 1-2 dias

**O que fazer:**
```kotlin
// 1. Criar RadioScreen.kt
@Composable
fun RadioScreen() {
    // Lista de estações
    // Player de áudio
    // Visualizador de espectro
}

// 2. Criar RadioViewModel.kt
class RadioViewModel : ViewModel() {
    fun loadRadioStations()
    fun playStation(stationId: Int)
}

// 3. Usar ExoPlayer para áudio
val player = ExoPlayer.Builder(context)
    .setAudioAttributes(audioAttributes, true)
    .build()

// 4. Adicionar ao HomeScreen
NavigationItem(
    icon = Icons.Default.Radio,
    text = "Rádio",
    onClick = { navController.navigate("radio") }
)
```

**Arquivos do Mesh TV para referência:**
- `activity_radio.xml`

---

### 4. QR CODE LOGIN 📱

**Prioridade:** ALTA
**Complexidade:** BAIXA
**Tempo estimado:** 1 dia

**O que fazer:**
```kotlin
// 1. Adicionar dependência
dependencies {
    implementation("com.google.mlkit:barcode-scanning:17.2.0")
}

// 2. Criar QrScannerScreen.kt
@Composable
fun QrScannerScreen(onQrScanned: (String) -> Unit) {
    // Camera preview
    // ML Kit barcode scanner
    // Callback com dados
}

// 3. Adicionar ao LoginScreen
Button(onClick = { showQrScanner = true }) {
    Icon(Icons.Default.QrCode)
    Text("Scan QR Code")
}

// 4. Formato do QR Code
// {"server": "http://...", "username": "...", "password": "..."}
```

**Arquivos do Mesh TV para referência:**
- `QrScannerActivity`
- `activity_qr_scanner.xml`

---

### 5. MÚLTIPLOS TEMAS 🎨

**Prioridade:** MÉDIA
**Complexidade:** MÉDIA
**Tempo estimado:** 2-3 dias

**O que fazer:**
```kotlin
// 1. Criar ThemeManager.kt
object ThemeManager {
    enum class AppTheme {
        LIGHT,      // HomeLigth
        PLUS,       // HomePlus
        MESH,       // HomeMesh
        NETFLIX,    // Netflix style
        CUSTOM      // Customizado
    }
    
    fun setTheme(theme: AppTheme)
    fun getTheme(): AppTheme
}

// 2. Criar temas no Compose
@Composable
fun MaxxTheme(
    theme: AppTheme = ThemeManager.getTheme(),
    content: @Composable () -> Unit
) {
    val colors = when(theme) {
        AppTheme.LIGHT -> lightColorScheme(...)
        AppTheme.PLUS -> plusColorScheme(...)
        AppTheme.MESH -> meshColorScheme(...)
        AppTheme.NETFLIX -> netflixColorScheme(...)
        AppTheme.CUSTOM -> customColorScheme(...)
    }
    
    MaterialTheme(colorScheme = colors) {
        content()
    }
}

// 3. Criar ThemeSettingsScreen.kt
@Composable
fun ThemeSettingsScreen() {
    // Preview de cada tema
    // Botão para selecionar
    // Customização de cores
}

// 4. Salvar preferência
dataStore.edit { prefs ->
    prefs[THEME_KEY] = theme.name
}
```

**Arquivos do Mesh TV para referência:**
- `ThemeActivity`
- `activity_theme.xml`
- `activity_home_ligth.xml`
- `activity_ui_netflix.xml`

---

### 6. MÚLTIPLOS PERFIS 👥

**Prioridade:** MÉDIA
**Complexidade:** MÉDIA
**Tempo estimado:** 2-3 dias

**O que fazer:**
```kotlin
// 1. Criar entidade Profile
@Entity(tableName = "profiles")
data class Profile(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val avatar: String,
    val isPinProtected: Boolean = false,
    val pin: String? = null,
    val isKidsMode: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

// 2. Criar ProfileSelectionScreen.kt
@Composable
fun ProfileSelectionScreen(
    profiles: List<Profile>,
    onProfileSelected: (Profile) -> Unit
) {
    // Grid de perfis
    // Avatar + nome
    // Botão "Adicionar perfil"
}

// 3. Criar ProfileManager.kt
class ProfileManager(private val dao: ProfileDao) {
    suspend fun createProfile(name: String, avatar: String)
    suspend fun switchProfile(profileId: Int)
    fun getCurrentProfile(): Flow<Profile?>
}

// 4. Separar dados por perfil
// - Favoritos
// - Histórico
// - Configurações
```

**Arquivos do Mesh TV para referência:**
- `ProfileActivity`
- `activity_profile.xml`

---

### 7. ESPORTES DEDICADO ⚽

**Prioridade:** ALTA
**Complexidade:** ALTA
**Tempo estimado:** 3-4 dias

**O que fazer:**
```kotlin
// 1. Criar SportsScreen.kt
@Composable
fun SportsScreen() {
    // Jogos ao vivo agora
    // Próximos jogos
    // Resultados
    // Calendário
}

// 2. Criar SportsViewModel.kt
class SportsViewModel : ViewModel() {
    fun loadLiveMatches()
    fun loadUpcomingMatches()
    fun loadResults()
}

// 3. Integrar API de esportes
// API-FOOTBALL, TheSportsDB, etc.
interface SportsApi {
    @GET("fixtures/live")
    suspend fun getLiveMatches(): List<Match>
    
    @GET("fixtures/upcoming")
    suspend fun getUpcomingMatches(): List<Match>
}

// 4. Criar MatchDetailsScreen.kt
@Composable
fun MatchDetailsScreen(match: Match) {
    // Placar ao vivo
    // Estatísticas
    // Lineup
    // Stream do jogo
}
```

**Arquivos do Mesh TV para referência:**
- `ActivityEsporte`
- `ActivityEsporteDate`
- `InfoJogos`
- `activity_info_jogos.xml`

---

## 🔗 INTEGRAÇÃO COM MAXXCONTROL X

### 1. Configuração Remota

```kotlin
// Buscar configuração ao iniciar
class AppConfigManager(
    private val api: MaxxControlApi,
    private val dataStore: DataStore<Preferences>
) {
    suspend fun syncConfig() {
        val config = api.getAppConfig()
        
        // Aplicar URLs
        XtreamRepository.serverUrl = config.xtreamUrl
        
        // Aplicar branding
        BrandingManager.applyBranding(config.branding)
        
        // Aplicar features
        FeatureFlags.apply(config.features)
    }
}
```

### 2. Verificação de MAC

```kotlin
// Verificar MAC ao fazer login
class LoginViewModel : ViewModel() {
    suspend fun login(username: String, password: String) {
        // 1. Verificar no MaxxControl X
        val macAddress = getMacAddress()
        val authorized = maxxControlApi.verifyMAC(macAddress)
        
        if (!authorized) {
            _uiState.value = LoginUiState.Error("Dispositivo não autorizado")
            return
        }
        
        // 2. Login no Xtream
        val result = xtreamRepository.login(username, password)
        
        // 3. Enviar log
        maxxControlApi.sendLog("login", "Login realizado")
    }
}
```

### 3. Sistema de Revendedores

```kotlin
// Verificar créditos do revendedor
class ResellerManager(private val api: MaxxControlApi) {
    suspend fun checkCredits(resellerId: Int): Boolean {
        val reseller = api.getReseller(resellerId)
        return reseller.credits > 0 || reseller.unlimitedCredits
    }
    
    suspend fun consumeCredit(resellerId: Int, clientMac: String) {
        api.consumeCredit(resellerId, clientMac)
    }
}
```

### 4. Logs e Analytics

```kotlin
// Enviar logs de uso
class AnalyticsManager(private val api: MaxxControlApi) {
    suspend fun trackChannelWatch(channel: ChannelGroup, duration: Long) {
        api.sendLog(
            type = "channel_watch",
            message = "Canal: ${channel.baseName}",
            metadata = mapOf(
                "channel_id" to channel.variants.first().stream_id,
                "duration" to duration
            )
        )
    }
    
    suspend fun trackMovieWatch(movie: Movie, duration: Long) {
        api.sendLog(
            type = "movie_watch",
            message = "Filme: ${movie.name}",
            metadata = mapOf(
                "movie_id" to movie.stream_id,
                "duration" to duration
            )
        )
    }
}
```

### 5. Branding Dinâmico

```kotlin
// Aplicar branding do painel
class BrandingManager(private val api: MaxxControlApi) {
    suspend fun applyBranding() {
        val branding = api.getBranding()
        
        // Cores
        ThemeManager.setPrimaryColor(Color(branding.primaryColor))
        ThemeManager.setSecondaryColor(Color(branding.secondaryColor))
        
        // Logo
        LogoManager.setLogo(branding.logoUrl)
        
        // Nome do app
        AppNameManager.setName(branding.appName)
        
        // Banner
        BannerManager.setBanner(branding.bannerUrl)
    }
}
```

---

## 📅 CRONOGRAMA

### Semana 1: Recursos Básicos
- [ ] QR Code Login (1 dia)
- [ ] Radio (2 dias)
- [ ] Múltiplos Perfis (2 dias)

### Semana 2: Recursos Avançados
- [ ] Catch-up TV (3 dias)
- [ ] Retro Games (2 dias)

### Semana 3: Esportes e Temas
- [ ] Esportes Dedicado (4 dias)
- [ ] Múltiplos Temas (1 dia)

### Semana 4: Integração MaxxControl X
- [ ] Configuração Remota (1 dia)
- [ ] Verificação de MAC (1 dia)
- [ ] Sistema de Revendedores (1 dia)
- [ ] Logs e Analytics (1 dia)
- [ ] Branding Dinâmico (1 dia)

### Semana 5: Testes e Ajustes
- [ ] Testes de integração
- [ ] Correção de bugs
- [ ] Otimização de performance
- [ ] Documentação

---

## 🎯 PRIORIDADES

### FASE 1 (Essencial)
1. ✅ QR Code Login
2. ✅ Catch-up TV
3. ✅ Integração MaxxControl X básica

### FASE 2 (Importante)
4. ✅ Esportes Dedicado
5. ✅ Múltiplos Perfis
6. ✅ Radio

### FASE 3 (Diferencial)
7. ✅ Retro Games
8. ✅ Múltiplos Temas
9. ✅ Integração MaxxControl X avançada

---

## 🔧 ESTRUTURA DO PROJETO

```
app/src/main/java/com/tvmaxx/pro/
├── features/
│   ├── auth/
│   │   ├── LoginScreen.kt
│   │   ├── QrScannerScreen.kt          # NOVO
│   │   └── ProfileSelectionScreen.kt   # NOVO
│   ├── home/
│   │   └── HomeScreen.kt
│   ├── tv/
│   │   ├── LiveTvScreen.kt
│   │   └── CatchUpScreen.kt            # NOVO
│   ├── movies/
│   │   └── MoviesScreen.kt
│   ├── series/
│   │   └── SeriesScreen.kt
│   ├── sports/                          # NOVO
│   │   ├── SportsScreen.kt
│   │   ├── MatchDetailsScreen.kt
│   │   └── SportsViewModel.kt
│   ├── games/                           # NOVO
│   │   ├── GamesScreen.kt
│   │   ├── GamePlayerScreen.kt
│   │   └── GamesViewModel.kt
│   ├── radio/                           # NOVO
│   │   ├── RadioScreen.kt
│   │   └── RadioViewModel.kt
│   └── settings/
│       ├── SettingsScreen.kt
│       └── ThemeSettingsScreen.kt      # NOVO
├── data/
│   ├── repository/
│   │   ├── XtreamRepository.kt
│   │   ├── MaxxControlRepository.kt    # NOVO
│   │   ├── SportsRepository.kt         # NOVO
│   │   └── GamesRepository.kt          # NOVO
│   ├── api/
│   │   ├── XtreamApi.kt
│   │   ├── MaxxControlApi.kt           # NOVO
│   │   └── SportsApi.kt                # NOVO
│   └── database/
│       ├── AppDatabase.kt
│       ├── ProfileDao.kt               # NOVO
│       └── GameStateDao.kt             # NOVO
├── ui/
│   └── theme/
│       ├── Theme.kt
│       ├── ThemeManager.kt             # NOVO
│       └── Themes.kt                   # NOVO (múltiplos temas)
└── util/
    ├── BrandingManager.kt              # NOVO
    ├── AnalyticsManager.kt             # NOVO
    └── FeatureFlags.kt                 # NOVO
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Recursos do Mesh TV
- [ ] Retro Games
- [ ] Catch-up TV
- [ ] Radio
- [ ] QR Code Login
- [ ] Múltiplos Temas
- [ ] Múltiplos Perfis
- [ ] Esportes Dedicado

### Integração MaxxControl X
- [ ] Configuração Remota
- [ ] Verificação de MAC
- [ ] Sistema de Revendedores
- [ ] Logs e Analytics
- [ ] Branding Dinâmico

### Testes
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes de UI
- [ ] Testes de performance

### Documentação
- [ ] README atualizado
- [ ] Guia de instalação
- [ ] Guia de uso
- [ ] API documentation

---

## 🚀 RESULTADO FINAL

### App Híbrido Completo

**Base:**
- ✅ Kotlin + Jetpack Compose
- ✅ MVVM + Repository Pattern
- ✅ Clean Architecture

**Recursos TV MAXX PRO:**
- ✅ Live TV com 2 modos
- ✅ EPG avançado com progress bar
- ✅ P2P Mesh
- ✅ Multi-qualidade (HD/FHD/UHD)
- ✅ Filmes e Séries com TMDB

**Recursos Mesh TV:**
- ✅ Retro Games
- ✅ Catch-up TV
- ✅ Radio
- ✅ QR Code Login
- ✅ Múltiplos Temas
- ✅ Múltiplos Perfis
- ✅ Esportes Dedicado

**Integração MaxxControl X:**
- ✅ Configuração remota
- ✅ Verificação de MAC
- ✅ Sistema de revendedores
- ✅ Logs e analytics
- ✅ Branding dinâmico

**Resultado:**
O app IPTV mais completo do mercado! 🔥

