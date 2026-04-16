# 🚀 MaxxControl X - Sistema Completo Implementado!

## ✅ O QUE FOI CRIADO

### 1. Sistema de Conteúdo TMDB
- ✅ Integração completa com TMDB API
- ✅ Importar filmes e séries automaticamente
- ✅ Pesquisar conteúdo
- ✅ Listar populares
- ✅ Salvar no Supabase
- ✅ Gerenciar metadados completos

### 2. Sistema de Branding Dinâmico
- ✅ Configuração de cores do app
- ✅ Upload de logos
- ✅ Splash screen personalizado
- ✅ Hero banner customizável
- ✅ Tema claro/escuro
- ✅ Atualização em tempo real (sem republicar app)

### 3. Banco de Dados
- ✅ Tabela `conteudos` - Filmes e séries
- ✅ Tabela `branding_settings` - Configurações visuais
- ✅ Tabela `banner_templates` - Templates de banners
- ✅ Índices otimizados

## 📡 ENDPOINTS CRIADOS

### Conteúdo
```
GET    /api/content                    - Listar conteúdos
POST   /api/content/importar-filme/:id - Importar filme do TMDB
POST   /api/content/importar-serie/:id - Importar série do TMDB
GET    /api/content/pesquisar          - Pesquisar no TMDB
GET    /api/content/populares          - Obter populares
DELETE /api/content/:id                - Deletar conteúdo
POST   /api/content/:id/gerar-banners  - Gerar banners
```

### Branding
```
GET  /api/branding                - Listar todas configurações
GET  /api/branding/current        - Obter branding ativo (para o app)
PUT  /api/branding/:id            - Atualizar branding
GET  /api/branding/templates      - Listar templates de banner
```

## 🎯 COMO USAR

### 1. Configurar TMDB API Key

Edite o arquivo `.env`:
```env
TMDB_API_KEY=sua_chave_aqui
```

Obtenha sua chave em: https://www.themoviedb.org/settings/api

### 2. Importar Conteúdo

**Via API:**
```bash
# Importar filme (ex: The Matrix = ID 603)
POST http://localhost:3001/api/content/importar-filme/603

# Importar série (ex: Breaking Bad = ID 1396)
POST http://localhost:3001/api/content/importar-serie/1396
```

**Via Painel (em desenvolvimento):**
- Pesquisar conteúdo
- Clicar em "Importar"
- Gerar banners automaticamente

### 3. Configurar Branding

**Obter branding ativo (para o app Android):**
```bash
GET http://localhost:3001/api/branding/current
```

**Resposta:**
```json
{
  "branding": {
    "app_name": "TV Maxx",
    "logo_url": "https://...",
    "primary_color": "#FF6A00",
    "secondary_color": "#FF0000",
    "background_color": "#000000",
    "text_color": "#FFFFFF",
    "accent_color": "#FFA500"
  }
}
```

**Atualizar branding:**
```bash
PUT http://localhost:3001/api/branding/1
{
  "app_name": "TV Maxx Pro",
  "primary_color": "#0066FF",
  "ativo": true
}
```

## 📱 INTEGRAÇÃO COM APP ANDROID

### Kotlin + Jetpack Compose

```kotlin
// 1. Buscar branding ao iniciar
data class Branding(
    val app_name: String,
    val logo_url: String?,
    val primary_color: String,
    val secondary_color: String,
    val background_color: String,
    val text_color: String,
    val accent_color: String
)

suspend fun getBranding(): Branding {
    return supabase.from("branding_settings")
        .select()
        .eq("ativo", true)
        .decodeSingle<Branding>()
}

// 2. Converter cores
fun String.toColor(): Color {
    return Color(android.graphics.Color.parseColor(this))
}

// 3. Aplicar tema dinâmico
@Composable
fun MaxxTheme(
    branding: Branding,
    content: @Composable () -> Unit
) {
    val colors = darkColorScheme(
        primary = branding.primary_color.toColor(),
        secondary = branding.secondary_color.toColor(),
        background = branding.background_color.toColor(),
        onBackground = branding.text_color.toColor()
    )
    
    MaterialTheme(
        colorScheme = colors,
        content = content
    )
}

// 4. Logo dinâmica
AsyncImage(
    model = branding.logo_url,
    contentDescription = "Logo"
)
```

## 🎨 PRÓXIMAS FUNCIONALIDADES

### Geração de Banners (Node Canvas)
```javascript
// Instalar: npm install canvas
const { createCanvas, loadImage } = require('canvas');

async function gerarBannerApp(conteudo) {
    const width = 1280;
    const height = 720;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Backdrop
    const fundo = await loadImage(
        `https://image.tmdb.org/t/p/original${conteudo.backdrop_path}`
    );
    ctx.drawImage(fundo, 0, 0, width, height);
    
    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, width, height);
    
    // Título
    ctx.fillStyle = '#FFA500';
    ctx.font = 'bold 60px Arial';
    ctx.fillText(conteudo.titulo, 80, 500);
    
    // Nota
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.fillText(`⭐ ${conteudo.nota}`, 80, 580);
    
    return canvas.toBuffer('image/png');
}
```

### Upload para Supabase Storage
```javascript
const buffer = await gerarBannerApp(conteudo);

await supabase.storage
    .from('banners')
    .upload(`app-${conteudo.id}.png`, buffer, {
        contentType: 'image/png',
        upsert: true
    });
```

## 🔥 RECURSOS AVANÇADOS

### White Label (Múltiplas Marcas)
- Criar branding por cliente
- Filtrar por MAC address
- Tema personalizado por usuário

### Sistema de Templates
- Templates pré-definidos
- Editor visual de banners
- Preview em tempo real

### Integração IPTV
- Vincular conteúdo com streams
- EPG automático
- Canais ao vivo

## 📊 ESTRUTURA DO BANCO

```sql
conteudos
├── id (PK)
├── tmdb_id (unique)
├── tipo (filme/serie)
├── titulo
├── descricao
├── poster_path
├── backdrop_path
├── nota
├── ano
├── generos
├── banner_app_url
└── banner_share_url

branding_settings
├── id (PK)
├── app_name
├── logo_url
├── primary_color
├── secondary_color
├── background_color
├── text_color
├── accent_color
└── ativo
```

## 🚀 INICIAR SISTEMA

```bash
# Backend
npm install
npm start

# Frontend
cd web
npm run dev
```

**Acesse:** http://localhost:5174
**Login:** admin@maxxcontrol.com / Admin@123

---

**Sistema completo e pronto para escalar!** 👑🔥
