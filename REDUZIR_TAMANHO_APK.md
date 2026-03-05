# 📦 REDUZIR TAMANHO DO APK - DE 80MB PARA ~15MB

## 🎯 META: Reduzir de 80MB para 15-20MB

## 🔍 PASSO 1: IDENTIFICAR O QUE ESTÁ OCUPANDO ESPAÇO

### Analisar o APK
```bash
# No Android Studio
Build > Analyze APK > Selecione seu APK

# Ou use o comando
./gradlew app:assembleRelease --scan
```

### Principais culpados (geralmente):
1. **Imagens não otimizadas** (30-40 MB)
2. **Bibliotecas não usadas** (20-30 MB)
3. **Recursos duplicados** (5-10 MB)
4. **Múltiplas arquiteturas** (10-15 MB)

## 🎨 PASSO 2: OTIMIZAR IMAGENS

### 2.1 Converter para WebP
```bash
# Instalar cwebp (conversor)
# Windows: baixe de https://developers.google.com/speed/webp/download

# Converter todas as imagens
for file in app/src/main/res/drawable*/*.png; do
    cwebp -q 80 "$file" -o "${file%.png}.webp"
    rm "$file"
done
```

### 2.2 Remover imagens não usadas
```bash
# No Android Studio
Refactor > Remove Unused Resources
```

### 2.3 Usar Vector Drawables (SVG)
```xml
<!-- Ao invés de PNG -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FF6A00"
        android:pathData="M12,2L2,7v10c0,5.55,3.84,10.74,9,12,5.16,-1.26,9,-6.45,9,-12V7L12,2z"/>
</vector>
```

## 📚 PASSO 3: REMOVER BIBLIOTECAS NÃO USADAS

### 3.1 Verificar dependências
```gradle
// build.gradle (app)
dependencies {
    // ❌ REMOVER se não usar:
    // implementation 'com.google.android.gms:play-services:12.0.1' // 15MB!
    
    // ✅ USAR apenas o necessário:
    implementation 'com.google.android.gms:play-services-base:18.0.1'
    
    // ❌ REMOVER bibliotecas pesadas:
    // implementation 'com.facebook.android:facebook-android-sdk:15.0.0' // 10MB
    
    // ✅ USAR alternativas leves:
    implementation 'com.squareup.retrofit2:retrofit:2.9.0' // 500KB
    implementation 'com.squareup.okhttp3:okhttp:4.10.0' // 800KB
}
```

### 3.2 Bibliotecas comuns que ocupam muito espaço:
```gradle
// ❌ EVITAR (se possível):
implementation 'com.google.firebase:firebase-bom:32.0.0' // 20-30MB
implementation 'com.google.android.gms:play-services:12.0.1' // 15MB
implementation 'com.facebook.android:facebook-android-sdk' // 10MB
implementation 'com.google.android.exoplayer:exoplayer:2.18.0' // 8MB

// ✅ ALTERNATIVAS LEVES:
implementation 'com.squareup.retrofit2:retrofit:2.9.0' // 500KB
implementation 'com.squareup.picasso:picasso:2.8' // 120KB
implementation 'com.google.code.gson:gson:2.10' // 240KB
```

## 🏗️ PASSO 4: CONFIGURAR build.gradle

### 4.1 Habilitar ProGuard/R8 (Minificação)
```gradle
// build.gradle (app)
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4.2 Gerar APK por arquitetura (App Bundle)
```gradle
android {
    bundle {
        language {
            enableSplit = true
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}
```

### 4.3 Remover idiomas não usados
```gradle
android {
    defaultConfig {
        // Manter apenas português
        resConfigs "pt", "pt-rBR"
    }
}
```

### 4.4 Configurar splits por ABI
```gradle
android {
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a'
            universalApk false
        }
    }
}
```

## 🗜️ PASSO 5: CONFIGURAÇÃO COMPLETA (build.gradle)

```gradle
android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.tvmaxx.pro"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        
        // Apenas português
        resConfigs "pt", "pt-rBR"
        
        // Apenas arquiteturas ARM
        ndk {
            abiFilters 'armeabi-v7a', 'arm64-v8a'
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            
            // Otimizações extras
            debuggable false
            jniDebuggable false
            renderscriptDebuggable false
            pseudoLocalesEnabled false
        }
    }
    
    // Splits por arquitetura
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a'
            universalApk false
        }
        density {
            enable true
            reset()
            include "mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"
        }
    }
    
    // Compressão de recursos
    packagingOptions {
        exclude 'META-INF/DEPENDENCIES'
        exclude 'META-INF/LICENSE'
        exclude 'META-INF/LICENSE.txt'
        exclude 'META-INF/NOTICE'
        exclude 'META-INF/NOTICE.txt'
        exclude 'META-INF/*.kotlin_module'
    }
}
```

## 📦 PASSO 6: USAR ANDROID APP BUNDLE (AAB)

### Ao invés de APK, gere AAB:
```bash
# Gerar AAB
./gradlew bundleRelease

# Arquivo gerado em:
app/build/outputs/bundle/release/app-release.aab
```

### Vantagens do AAB:
- Google Play gera APKs otimizados por dispositivo
- Usuário baixa apenas o necessário
- Redução de 35-50% no tamanho

## 🎯 PASSO 7: OTIMIZAÇÕES ESPECÍFICAS

### 7.1 Carregar imagens da internet
```kotlin
// ❌ NÃO incluir no APK:
R.drawable.banner_grande // 5MB

// ✅ Carregar da internet:
Picasso.get()
    .load("https://i.postimg.cc/FsnWWcfk/hero_banner.jpg")
    .into(imageView)
```

### 7.2 Usar Lottie para animações
```gradle
// Ao invés de GIFs pesados
implementation 'com.airbnb.android:lottie:6.0.0' // 500KB
```

### 7.3 Lazy loading de recursos
```kotlin
// Carregar apenas quando necessário
val heavyResource by lazy {
    loadHeavyResource()
}
```

## 📊 PASSO 8: VERIFICAR RESULTADO

### Antes das otimizações:
```
APK Universal: 80 MB
```

### Depois das otimizações:
```
APK arm64-v8a: 15-20 MB
APK armeabi-v7a: 12-18 MB
AAB (Google Play): 10-15 MB (download do usuário)
```

## 🚀 CHECKLIST COMPLETO

### Imagens
- [ ] Converter PNG para WebP
- [ ] Usar Vector Drawables (SVG)
- [ ] Remover imagens não usadas
- [ ] Carregar imagens grandes da internet
- [ ] Comprimir imagens (TinyPNG)

### Código
- [ ] Habilitar minifyEnabled
- [ ] Habilitar shrinkResources
- [ ] Remover bibliotecas não usadas
- [ ] Usar ProGuard/R8

### Recursos
- [ ] Remover idiomas não usados
- [ ] Configurar splits por ABI
- [ ] Configurar splits por densidade
- [ ] Remover recursos duplicados

### Build
- [ ] Gerar AAB ao invés de APK
- [ ] Configurar packagingOptions
- [ ] Testar em dispositivos reais

## 💡 DICAS EXTRAS

### 1. Analisar com APK Analyzer
```
Android Studio > Build > Analyze APK
```

### 2. Usar apenas bibliotecas essenciais
```gradle
// Mínimo necessário para IPTV:
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
implementation 'com.squareup.okhttp3:okhttp:4.10.0'
implementation 'com.squareup.picasso:picasso:2.8'
implementation 'com.google.android.exoplayer:exoplayer-core:2.18.0'
implementation 'com.google.android.exoplayer:exoplayer-hls:2.18.0'
```

### 3. Remover logs em produção
```kotlin
if (BuildConfig.DEBUG) {
    Log.d("TAG", "Debug info")
}
```

## 🎯 RESULTADO ESPERADO

Com todas as otimizações:
- **APK Universal:** 80 MB → 20-25 MB
- **APK arm64-v8a:** 15-18 MB
- **AAB (Google Play):** 10-15 MB de download

## 📞 PRECISA DE AJUDA?

Se você me enviar o `build.gradle` do app, eu posso:
1. Analisar as dependências
2. Identificar o que está ocupando espaço
3. Criar uma configuração otimizada específica
4. Reduzir drasticamente o tamanho

Quer que eu faça isso? 😊
