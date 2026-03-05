# Como Trocar a Logo do App pelo Painel

## Como Funciona Atualmente

A logo do app já está configurada para ser carregada de uma URL remota:
- **URL Atual**: `https://i.postimg.cc/y8cgrt9t/logomove.png`
- **Arquivo**: `ImageUrls.kt` linha 15

## Opção 1: Trocar Direto no Código (Simples)

### Passo 1: Fazer upload da nova logo
1. Acesse um serviço de hospedagem de imagens:
   - **ImgBB**: https://imgbb.com/ (recomendado)
   - **PostImage**: https://postimages.org/
   - **Imgur**: https://imgur.com/
2. Faça upload da sua logo (PNG com fundo transparente, tamanho recomendado: 512x512px)
3. Copie a URL direta da imagem

### Passo 2: Atualizar no código
Edite o arquivo `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/core/constants/ImageUrls.kt`:

```kotlin
const val LOGO = "https://sua-nova-url-aqui.png"
```

### Passo 3: Recompilar o APK
```bash
./gradlew assembleDebug
```

## Opção 2: Gerenciar pelo Painel (Dinâmico)

Com essa opção, você pode trocar a logo sem recompilar o APK!

### No Painel (já existe!)

A página de **Branding** já tem o campo "URL do Logo". Você só precisa:
1. Fazer upload da logo em um serviço de hospedagem
2. Colar a URL no campo "URL do Logo"
3. Salvar

### No App Android

O app precisa buscar a logo da API ao invés de usar a URL fixa.

#### Modificar `ImageUrls.kt`:

```kotlin
object ImageUrls {
    // Logo dinâmica (será atualizada pela API)
    var LOGO = "https://i.postimg.cc/y8cgrt9t/logomove.png" // Padrão
    var SPLASH_BG = "https://i.postimg.cc/8PnKKWFB/splash_screen.jpg"
    var HERO_BANNER = "https://i.postimg.cc/FsnWWcfk/hero_banner.jpg"
    
    // Atualizar URLs do branding
    fun updateFromBranding(branding: BrandingResponse) {
        branding.logo_url?.let { LOGO = it }
        branding.splash_screen_url?.let { SPLASH_BG = it }
        branding.hero_banner_url?.let { HERO_BANNER = it }
    }
    
    // ... resto do código
}
```

#### Buscar no `MainActivity.kt`:

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Buscar branding da API
        lifecycleScope.launch {
            try {
                val branding = RetrofitClient.api.getBranding()
                ImageUrls.updateFromBranding(branding)
                DynamicColors.updateFromApi(branding)
            } catch (e: Exception) {
                Log.e("MainActivity", "Erro ao buscar branding", e)
            }
        }
        
        setContent {
            TVMaxxTheme {
                AppNavigation()
            }
        }
    }
}
```

## Opção 3: Logo Compilada no APK (Avançado)

Se você quer que a logo fique dentro do APK (sem internet):

### Passo 1: Adicionar a logo no projeto
1. Coloque sua logo em `app/src/main/res/drawable/`
2. Nomeie como `logo_custom.png`

### Passo 2: Usar no código
```kotlin
// Em vez de AsyncImage com URL
Image(
    painter = painterResource(id = R.drawable.logo_custom),
    contentDescription = "Logo"
)
```

### Desvantagens:
- ❌ Precisa recompilar o APK toda vez que mudar a logo
- ❌ Aumenta o tamanho do APK
- ❌ Não pode atualizar remotamente

## Recomendação

Use a **Opção 2 (Painel Dinâmico)** porque:
- ✅ Troca a logo sem recompilar
- ✅ Atualiza em tempo real
- ✅ Gerencia tudo pelo painel
- ✅ Não aumenta o tamanho do APK

## Hospedagem de Imagens Recomendada

### ImgBB (Melhor opção)
- ✅ Gratuito
- ✅ Sem limite de banda
- ✅ URLs diretas
- ✅ Não expira
- 🔗 https://imgbb.com/

### Como usar:
1. Acesse https://imgbb.com/
2. Clique em "Start uploading"
3. Selecione sua logo
4. Após upload, clique com botão direito na imagem
5. Copie o endereço da imagem (URL direta)
6. Cole no painel de Branding

## Tamanhos Recomendados

- **Logo Principal**: 512x512px (PNG transparente)
- **Splash Screen**: 1080x1920px (JPG ou PNG)
- **Hero Banner**: 1920x1080px (JPG ou PNG)

## Exemplo de Fluxo Completo

1. Você cria uma logo nova no Photoshop/Canva
2. Exporta como PNG 512x512px com fundo transparente
3. Faz upload no ImgBB
4. Copia a URL: `https://i.ibb.co/abc123/logo.png`
5. Abre o painel MaxxControl
6. Vai em "Branding"
7. Cola a URL no campo "URL do Logo"
8. Clica em "Salvar"
9. O app busca a nova logo na próxima vez que abrir!

## Quer Implementar Agora?

Posso modificar o código do app para buscar a logo do painel automaticamente. Quer que eu faça isso?
