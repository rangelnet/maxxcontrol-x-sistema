# Cores Dinâmicas no App Android

## Como Funciona

O app Android pode buscar as cores configuradas no painel e aplicá-las dinamicamente em todos os botões e elementos da interface.

## 1. Endpoint da API

```
GET https://maxxcontrol-x-sistema.onrender.com/api/branding/current
```

Retorna:
```json
{
  "id": 1,
  "app_name": "TV Maxx",
  "primary_color": "#FF6A00",
  "secondary_color": "#FF0000",
  "background_color": "#000000",
  "text_color": "#FFFFFF",
  "accent_color": "#FFA500",
  "button_primary_color": "#FF6A00",
  "button_secondary_color": "#333333",
  "button_text_color": "#FFFFFF",
  "button_focus_color": "#FF8C00",
  "logo_url": "https://...",
  "splash_screen_url": "https://...",
  "ativo": true
}
```

## 2. No App Android - Criar Arquivo de Tema Dinâmico

### `app/src/main/java/com/tvmaxx/pro/core/theme/DynamicColors.kt`

```kotlin
package com.tvmaxx.pro.core.theme

import androidx.compose.ui.graphics.Color

object DynamicColors {
    // Cores padrão (fallback)
    var ButtonPrimary = Color(0xFFFF6A00)
    var ButtonSecondary = Color(0xFF333333)
    var ButtonText = Color(0xFFFFFFFF)
    var ButtonFocus = Color(0xFFFF8C00)
    var Primary = Color(0xFFFF6A00)
    var Secondary = Color(0xFFFF0000)
    var Background = Color(0xFF000000)
    var TextPrimary = Color(0xFFFFFFFF)
    var Accent = Color(0xFFFFA500)
    
    fun updateFromApi(branding: BrandingResponse) {
        ButtonPrimary = Color(android.graphics.Color.parseColor(branding.button_primary_color))
        ButtonSecondary = Color(android.graphics.Color.parseColor(branding.button_secondary_color))
        ButtonText = Color(android.graphics.Color.parseColor(branding.button_text_color))
        ButtonFocus = Color(android.graphics.Color.parseColor(branding.button_focus_color))
        Primary = Color(android.graphics.Color.parseColor(branding.primary_color))
        Secondary = Color(android.graphics.Color.parseColor(branding.secondary_color))
        Background = Color(android.graphics.Color.parseColor(branding.background_color))
        TextPrimary = Color(android.graphics.Color.parseColor(branding.text_color))
        Accent = Color(android.graphics.Color.parseColor(branding.accent_color))
    }
}

data class BrandingResponse(
    val id: Int,
    val app_name: String,
    val primary_color: String,
    val secondary_color: String,
    val background_color: String,
    val text_color: String,
    val accent_color: String,
    val button_primary_color: String,
    val button_secondary_color: String,
    val button_text_color: String,
    val button_focus_color: String,
    val logo_url: String?,
    val splash_screen_url: String?,
    val ativo: Boolean
)
```

## 3. Buscar Cores ao Iniciar o App

### No `MainActivity.kt` ou `SplashActivity.kt`

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Buscar cores da API
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.getBranding()
                DynamicColors.updateFromApi(response)
            } catch (e: Exception) {
                Log.e("MainActivity", "Erro ao buscar branding", e)
                // Usa cores padrão
            }
        }
        
        setContent {
            TVMaxxTheme {
                // Seu app aqui
            }
        }
    }
}
```

## 4. Usar as Cores nos Componentes

### Exemplo: Botão Primário

```kotlin
@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isFocused by remember { mutableStateOf(false) }
    
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = if (isFocused) 
                DynamicColors.ButtonFocus 
            else 
                DynamicColors.ButtonPrimary,
            contentColor = DynamicColors.ButtonText
        ),
        modifier = modifier
            .onFocusChanged { isFocused = it.isFocused }
            .focusable()
    ) {
        Text(text)
    }
}
```

### Exemplo: Substituir MaxxOrange

Onde você tem:
```kotlin
color = MaxxOrange
```

Substitua por:
```kotlin
color = DynamicColors.ButtonPrimary
```

## 5. Atualizar Cores em Tempo Real (Opcional)

Se quiser que o app atualize as cores sem reiniciar:

```kotlin
object DynamicColors {
    private val _buttonPrimary = mutableStateOf(Color(0xFFFF6A00))
    val buttonPrimary: State<Color> = _buttonPrimary
    
    fun updateFromApi(branding: BrandingResponse) {
        _buttonPrimary.value = Color(android.graphics.Color.parseColor(branding.button_primary_color))
        // ... outras cores
    }
}

// Usar assim:
@Composable
fun MyButton() {
    val buttonColor by DynamicColors.buttonPrimary
    
    Button(
        colors = ButtonDefaults.buttonColors(
            containerColor = buttonColor
        )
    ) {
        Text("Botão")
    }
}
```

## 6. Cache Local

Para melhor performance, salve as cores localmente:

```kotlin
// SharedPreferences ou DataStore
fun saveBrandingToCache(branding: BrandingResponse) {
    val prefs = context.getSharedPreferences("branding", Context.MODE_PRIVATE)
    prefs.edit {
        putString("button_primary_color", branding.button_primary_color)
        putString("button_secondary_color", branding.button_secondary_color)
        // ... outras cores
    }
}

fun loadBrandingFromCache(): BrandingResponse? {
    val prefs = context.getSharedPreferences("branding", Context.MODE_PRIVATE)
    val buttonPrimary = prefs.getString("button_primary_color", null) ?: return null
    // ... carregar outras cores
    return BrandingResponse(...)
}
```

## Resumo

1. ✅ Painel atualizado com campos de cores de botões
2. ✅ API retorna as cores configuradas
3. ⏳ App Android precisa:
   - Criar `DynamicColors.kt`
   - Buscar cores da API ao iniciar
   - Substituir cores fixas por `DynamicColors.ButtonPrimary`, etc.
   - (Opcional) Implementar cache local

Com isso, você pode mudar as cores de todos os botões do app direto pelo painel, sem precisar recompilar o APK!
