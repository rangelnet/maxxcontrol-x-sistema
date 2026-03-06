# Correção do Painel de Branding - Exibição de Logos

## Problema Identificado

O painel de Branding não estava exibindo os campos de logo do app porque havia uma incompatibilidade entre:

1. **Tabela SQLite** (desenvolvimento): Usava campos antigos (`banner_titulo`, `banner_subtitulo`, `banner_cor_fundo`, `banner_cor_texto`, `tema`)
2. **Tabela PostgreSQL** (produção): Usa campos novos (`app_name`, `logo_url`, `logo_dark_url`, `primary_color`, `secondary_color`, etc)
3. **Painel Web**: Estava usando os campos antigos do SQLite

## Solução Implementada

### 1. Atualização do Painel Web (`web/src/pages/Branding.jsx`)

Alterado para usar os campos corretos do PostgreSQL:

**Campos Antigos (SQLite):**
```javascript
{
  banner_titulo: '',
  banner_subtitulo: '',
  banner_cor_fundo: '#000000',
  banner_cor_texto: '#F63012',
  logo_url: '',
  splash_url: '',
  tema: 'dark'
}
```

**Campos Novos (PostgreSQL):**
```javascript
{
  app_name: 'TV Maxx',
  logo_url: '',
  logo_dark_url: '',
  primary_color: '#F63012',
  secondary_color: '#FF0000',
  background_color: '#000000',
  text_color: '#FFFFFF',
  accent_color: '#FFA500',
  splash_screen_url: '',
  hero_banner_url: ''
}
```

### 2. Novos Recursos Adicionados

- **Preview de Logos**: Exibe preview das imagens quando URL é preenchida
- **Logo Claro e Escuro**: Suporte para duas versões do logo
- **Mais Cores**: Agora permite configurar 5 cores diferentes:
  - Cor Primária (primary_color)
  - Cor Secundária (secondary_color)
  - Cor de Fundo (background_color)
  - Cor do Texto (text_color)
  - Cor de Destaque (accent_color)
- **Hero Banner**: Campo adicional para banner hero
- **Preview Melhorado**: Mostra logo e botão com as cores configuradas

### 3. Templates Atualizados

Os templates agora usam os campos corretos:

```javascript
{
  id: 1,
  nome: 'TV Maxx Padrão',
  descricao: 'Template padrão com cores da TV Maxx',
  primary_color: '#F63012',
  secondary_color: '#FF0000',
  background_color: '#000000',
  text_color: '#FFFFFF',
  accent_color: '#FFA500'
}
```

### 4. Schema PostgreSQL Atualizado

Cor primária padrão alterada de `#FF6A00` para `#F63012` (MaxxOrange):

```sql
primary_color VARCHAR(7) DEFAULT '#F63012',
```

## Estrutura da Tabela PostgreSQL

```sql
CREATE TABLE IF NOT EXISTS branding_settings (
  id SERIAL PRIMARY KEY,
  app_name VARCHAR(100) DEFAULT 'TV Maxx',
  logo_url TEXT,
  logo_dark_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#F63012',
  secondary_color VARCHAR(7) DEFAULT '#FF0000',
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#FFFFFF',
  accent_color VARCHAR(7) DEFAULT '#FFA500',
  splash_screen_url TEXT,
  hero_banner_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Integração com App Android

O app Android já estava preparado para receber esses campos através do endpoint:

```kotlin
@GET("api/branding/current")
suspend fun getBranding(): Response<BrandingConfig>

data class BrandingConfig(
    val id: Int,
    val app_name: String?,
    val logo_url: String?,
    val logo_dark_url: String?,
    val primary_color: String?,
    val secondary_color: String?,
    val background_color: String?,
    val text_color: String?,
    val accent_color: String?,
    val button_primary_color: String?,
    val button_secondary_color: String?,
    val button_text_color: String?,
    val button_focus_color: String?,
    val splash_screen_url: String?,
    val hero_banner_url: String?,
    val ativo: Boolean
)
```

## Como Usar

1. Acesse o painel web: `http://localhost:5173`
2. Vá para "Gerenciar Branding"
3. Preencha os campos:
   - **Nome do App**: Nome que aparecerá no app
   - **Logo (Claro)**: URL do logo para fundo claro
   - **Logo (Escuro)**: URL do logo para fundo escuro
   - **Cores**: Configure as 5 cores do app
   - **Splash Screen**: URL da tela de abertura
   - **Hero Banner**: URL do banner principal
4. Veja o preview em tempo real
5. Clique em "Salvar Branding"

## Commits

- `500c3ae` - feat: Padronizar cor primária do branding para #F63012 (MaxxOrange)
- `2634b6a` - fix: Corrigir painel de Branding para usar campos corretos do PostgreSQL e exibir logos

## Resultado

Agora o painel de Branding:
- ✅ Exibe todos os campos de logo
- ✅ Mostra preview das imagens
- ✅ Usa os campos corretos do PostgreSQL
- ✅ Está sincronizado com o app Android
- ✅ Permite configurar cores completas
- ✅ Templates funcionam corretamente
