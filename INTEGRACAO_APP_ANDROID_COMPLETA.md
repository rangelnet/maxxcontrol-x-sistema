# 📱 INTEGRAÇÃO COMPLETA APP ANDROID COM MAXXCONTROL X

## 🎯 SISTEMA CRIADO

Criei um sistema completo de **configuração remota** para o app Android!

### ✅ O que foi implementado:

1. **Backend** - API de configuração
2. **Banco de Dados** - Tabela `app_config`
3. **Painel Web** - Página para gerenciar URLs
4. **Endpoint Público** - App consulta sem autenticação

## 🚀 COMO FUNCIONA

### 1. Você configura no painel
- Acessa: https://maxxcontrol-frontend.onrender.com
- Menu: "Config do App"
- Altera as URLs do servidor
- Salva

### 2. App consulta automaticamente
- Ao iniciar, o app faz uma requisição GET
- Pega todas as URLs atualizadas
- Usa essas URLs para funcionar

### 3. Sem recompilar!
- Mudou a URL? Só reiniciar o app
- Não precisa gerar novo APK
- Atualização instantânea

## 📡 ENDPOINT PARA O APP

```
GET https://maxxcontrol-x-sistema.onrender.com/api/app-config/config
```

### Resposta JSON:
```json
{
  "server_url": "https://maxxcontrol-x-sistema.onrender.com",
  "api_base_url": "https://maxxcontrol-x-sistema.onrender.com/api",
  "auth_url": "https://auth.novomundo.live/v1/",
  "painel_url": "https://painel.tvmaxx.pro/api/",
  "cache_url": "https://api1.novomundo.live/cache/",
  "tmdb_url": "https://api.themoviedb.org/3/",
  "tmdb_api_key": "",
  "check_updates": true,
  "force_update": false,
  "min_version": "1.0.0",
  "updated_at": "2026-02-26T..."
}
```

## 🔧 CÓDIGO PARA O APP ANDROID

### Kotlin (Recomendado)

```kotlin
// 1. Criar data class
data class AppConfig(
    val server_url: String,
    val api_base_url: String,
    val auth_url: String,
    val painel_url: String,
    val cache_url: String,
    val tmdb_url: String,
    val tmdb_api_key: String?,
    val check_updates: Boolean,
    val force_update: Boolean,
    val min_version: String,
    val updated_at: String
)

// 2. Criar serviço Retrofit
interface ConfigService {
    @GET("api/app-config/config")
    suspend fun getConfig(): AppConfig
}

// 3. Buscar configuração ao iniciar
class MainActivity : AppCompatActivity() {
    private lateinit var config: AppConfig
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            try {
                config = RetrofitClient.configService.getConfig()
                
                // Usar as URLs
                ApiClient.baseUrl = config.api_base_url
                AuthClient.baseUrl = config.auth_url
                
                // Verificar versão
                if (config.check_updates) {
                    checkAppVersion(config.min_version, config.force_update)
                }
                
                initializeApp()
            } catch (e: Exception) {
                // Usar URLs padrão em caso de erro
                useDefaultConfig()
            }
        }
    }
}

// 4. Salvar em SharedPreferences (cache)
fun saveConfig(config: AppConfig) {
    val prefs = getSharedPreferences("app_config", MODE_PRIVATE)
    prefs.edit().apply {
        putString("server_url", config.server_url)
        putString("api_base_url", config.api_base_url)
        putString("auth_url", config.auth_url)
        // ... outras URLs
        apply()
    }
}

// 5. Carregar do cache se offline
fun loadCachedConfig(): AppConfig? {
    val prefs = getSharedPreferences("app_config", MODE_PRIVATE)
    return if (prefs.contains("server_url")) {
        AppConfig(
            server_url = prefs.getString("server_url", "")!!,
            api_base_url = prefs.getString("api_base_url", "")!!,
            // ... outras URLs
        )
    } else null
}
```

### Java

```java
// 1. Criar classe de configuração
public class AppConfig {
    public String server_url;
    public String api_base_url;
    public String auth_url;
    public String painel_url;
    public String cache_url;
    public String tmdb_url;
    public String tmdb_api_key;
    public boolean check_updates;
    public boolean force_update;
    public String min_version;
    public String updated_at;
}

// 2. Criar serviço Retrofit
public interface ConfigService {
    @GET("api/app-config/config")
    Call<AppConfig> getConfig();
}

// 3. Buscar configuração
public class MainActivity extends AppCompatActivity {
    private AppConfig config;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        ConfigService service = RetrofitClient.getConfigService();
        service.getConfig().enqueue(new Callback<AppConfig>() {
            @Override
            public void onResponse(Call<AppConfig> call, Response<AppConfig> response) {
                if (response.isSuccessful()) {
                    config = response.body();
                    
                    // Usar as URLs
                    ApiClient.setBaseUrl(config.api_base_url);
                    AuthClient.setBaseUrl(config.auth_url);
                    
                    // Verificar versão
                    if (config.check_updates) {
                        checkAppVersion(config.min_version, config.force_update);
                    }
                    
                    initializeApp();
                }
            }
            
            @Override
            public void onFailure(Call<AppConfig> call, Throwable t) {
                // Usar URLs padrão
                useDefaultConfig();
            }
        });
    }
}
```

## 📋 ENDPOINTS DISPONÍVEIS PARA O APP

### 1. Verificar MAC (Revendedores)
```
GET /api/clients/verify/{mac_address}

Resposta:
{
  "authorized": true,
  "client": {
    "id": 1,
    "mac_address": "00:00:00:00:00:00",
    "plan_name": "Premium",
    "expires_at": "2026-12-31",
    "reseller_name": "Revendedor X"
  }
}
```

### 2. Registrar Dispositivo
```
POST /api/device/register

Body:
{
  "mac_address": "00:00:00:00:00:00",
  "modelo": "Samsung TV",
  "android_version": "11",
  "app_version": "1.0.0"
}
```

### 3. Enviar Log
```
POST /api/log/create

Body:
{
  "device_id": 1,
  "tipo": "info",
  "descricao": "App iniciado"
}
```

### 4. Reportar Bug
```
POST /api/bug/report

Body:
{
  "device_id": 1,
  "stack_trace": "Error...",
  "modelo": "Samsung TV",
  "app_version": "1.0.0"
}
```

### 5. Verificar Versão
```
POST /api/app/check-version

Body:
{
  "versao_atual": "1.0.0"
}

Resposta:
{
  "atualizar": true,
  "obrigatoria": false,
  "versao_nova": "1.1.0",
  "link_download": "https://...",
  "mensagem": "Nova versão disponível!"
}
```

### 6. Obter Branding
```
GET /api/branding/active

Resposta:
{
  "banner_titulo": "TV Maxx",
  "banner_subtitulo": "Seu Entretenimento",
  "banner_cor_fundo": "#000000",
  "banner_cor_texto": "#FF6A00",
  "logo_url": "https://...",
  "splash_url": "https://...",
  "tema": "dark"
}
```

## 🎨 USAR NO PAINEL

### Acessar
1. URL: https://maxxcontrol-frontend.onrender.com
2. Login: admin@maxxcontrol.com
3. Senha: Admin@123
4. Menu: "Config do App"

### Configurar
1. Altere as URLs conforme necessário
2. Configure versão mínima
3. Ative/desative verificação de atualizações
4. Salve

### Ver Histórico
1. Clique em "Ver Histórico"
2. Veja todas as configurações anteriores
3. Restaure uma configuração antiga se necessário

## 🔄 FLUXO COMPLETO

```
1. App inicia
   ↓
2. Consulta /api/app-config/config
   ↓
3. Recebe URLs atualizadas
   ↓
4. Salva em cache (SharedPreferences)
   ↓
5. Configura clientes HTTP com as URLs
   ↓
6. Verifica MAC em /api/clients/verify/{mac}
   ↓
7. Se autorizado, registra device
   ↓
8. Envia logs de atividade
   ↓
9. Reporta bugs se houver
   ↓
10. Verifica atualizações
```

## ✅ VANTAGENS

- ✅ Sem recompilar app
- ✅ Atualização instantânea
- ✅ Controle centralizado
- ✅ Histórico de mudanças
- ✅ Rollback fácil
- ✅ Funciona offline (cache)
- ✅ Sem autenticação necessária

## 🚀 PRÓXIMOS PASSOS

1. ✅ Sistema criado e em produção
2. ⏳ Implementar no app Android
3. ⏳ Testar consulta de configuração
4. ⏳ Testar verificação de MAC
5. ⏳ Testar logs e bugs
6. ⏳ Gerar novo APK

## 💡 DICA

Se você me enviar os arquivos do app Android (Constants.java, ApiConfig.java, etc), eu posso:
1. Ver como está configurado atualmente
2. Criar o código exato para integrar
3. Fazer um guia passo a passo específico para seu app

Quer que eu faça isso? 😊
