# 📱 COPIAR CONFIGURAÇÃO DO APP ANDROID

## 🎯 OBJETIVO
Pegar as URLs do servidor configuradas no app TV MAXX Android e adicionar no painel MaxxControl X.

## 📋 PASSO 1: ENCONTRAR O ARQUIVO DE CONFIGURAÇÃO

O app Android geralmente tem a configuração em um destes locais:

```
TV-MAXX-PRO-Android/
├── app/src/main/java/
│   └── com/tvmaxx/
│       ├── utils/Constants.java (ou .kt)
│       ├── config/ApiConfig.java (ou .kt)
│       └── network/ApiService.java (ou .kt)
├── app/src/main/res/values/
│   └── strings.xml
└── gradle.properties
```

## 📋 PASSO 2: COPIAR O ARQUIVO PARA CÁ

Execute este comando no PowerShell:

```powershell
# Opção 1: Copiar arquivo Constants
Copy-Item "R:\Users\Usuario\Documents\tv-maxx\TV-MAXX-PRO-Android\app\src\main\java\com\tvmaxx\utils\Constants.java" -Destination "R:\Users\Usuario\Documents\MaxxControl\" -ErrorAction SilentlyContinue

# Opção 2: Copiar arquivo ApiConfig
Copy-Item "R:\Users\Usuario\Documents\tv-maxx\TV-MAXX-PRO-Android\app\src\main\java\com\tvmaxx\config\ApiConfig.java" -Destination "R:\Users\Usuario\Documents\MaxxControl\" -ErrorAction SilentlyContinue

# Opção 3: Copiar strings.xml
Copy-Item "R:\Users\Usuario\Documents\tv-maxx\TV-MAXX-PRO-Android\app\src\main\res\values\strings.xml" -Destination "R:\Users\Usuario\Documents\MaxxControl\" -ErrorAction SilentlyContinue
```

## 📋 PASSO 3: OU PROCURAR MANUALMENTE

1. Abra o Windows Explorer
2. Navegue até: `R:\Users\Usuario\Documents\tv-maxx\TV-MAXX-PRO-Android`
3. Procure por arquivos que contenham "API", "Config", "Constants" ou "Server"
4. Abra com Notepad e procure por URLs (http:// ou https://)
5. Copie o arquivo para: `R:\Users\Usuario\Documents\MaxxControl\`

## 🔍 O QUE PROCURAR

Procure por linhas como estas:

```java
// Java
public static final String BASE_URL = "https://api.tvmaxx.com/";
public static final String AUTH_URL = "https://auth.tvmaxx.com/";
private static final String API_ENDPOINT = "https://painel.tvmaxx.pro/api/";
```

```kotlin
// Kotlin
const val BASE_URL = "https://api.tvmaxx.com/"
const val AUTH_URL = "https://auth.tvmaxx.com/"
private const val API_ENDPOINT = "https://painel.tvmaxx.pro/api/"
```

```xml
<!-- XML -->
<string name="api_base_url">https://api.tvmaxx.com/</string>
<string name="auth_url">https://auth.tvmaxx.com/</string>
```

## 📋 PASSO 4: ME ENVIAR O ARQUIVO

Depois de copiar o arquivo, me avise e eu vou:
1. Ler o arquivo
2. Extrair todas as URLs
3. Adicionar automaticamente no painel de APIs
4. Configurar para monitoramento

## 🚀 ALTERNATIVA RÁPIDA

Se você souber as URLs de cabeça, me diga e eu adiciono direto! Por exemplo:

- URL de autenticação: `https://auth.novomundo.live/v1/`
- URL do painel: `https://painel.tvmaxx.pro/api/`
- URL de cache: `https://api1.novomundo.live/cache/`
- Outras URLs...

## 💡 DICA

Se o app usa as mesmas URLs que já estão no arquivo `TV_MAXX_APIS.md`, então já temos tudo configurado! Vou verificar...
