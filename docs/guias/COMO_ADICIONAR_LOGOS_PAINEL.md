# Como Adicionar Logos do App no Painel

## Situação Atual

O painel de Branding está pronto para exibir logos, mas precisa que você configure as URLs das imagens no banco de dados.

## Onde Estão as Logos do App?

As logos estão dentro do APK do app Android:
- **Logo Principal**: `app/src/main/res/drawable/logo.png`
- **Ícone do App**: `app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

## Como Fazer o Painel Exibir as Logos?

### Opção 1: Hospedar as Logos Online (Recomendado)

1. **Extrair as logos do projeto Android**:
   - Navegue até: `TV-MAXX-PRO-Android/app/src/main/res/drawable/`
   - Copie o arquivo `logo.png`

2. **Fazer upload para um servidor**:
   - GitHub (criar repositório público com as imagens)
   - Imgur
   - CDN próprio
   - Servidor web

3. **Obter a URL pública**:
   ```
   Exemplo: https://raw.githubusercontent.com/seu-usuario/assets/main/logo.png
   ```

4. **Configurar no Painel**:
   - Acesse: `http://localhost:5173`
   - Vá em "Gerenciar Branding"
   - Cole a URL no campo "URL do Logo (Claro)"
   - Clique em "Salvar Branding"

### Opção 2: Usar Logo Local (Desenvolvimento)

Se estiver testando localmente, você pode:

1. **Copiar a logo para a pasta public do painel**:
   ```bash
   cp TV-MAXX-PRO-Android/app/src/main/res/drawable/logo.png maxxcontrol-x-sistema/web/public/
   ```

2. **Usar URL relativa no painel**:
   ```
   URL: /logo.png
   ```

### Opção 3: Criar Endpoint para Servir Logos do APK

Posso criar um endpoint no backend que:
- Lê as logos diretamente do projeto Android
- Serve as imagens via HTTP
- Atualiza automaticamente quando você mudar as logos

**Quer que eu implemente essa opção?**

## Exemplo de URLs

Depois de hospedar as logos, você terá algo assim:

```javascript
{
  app_name: "TV Maxx Pro",
  logo_url: "https://exemplo.com/tvmaxx-logo.png",
  logo_dark_url: "https://exemplo.com/tvmaxx-logo-dark.png",
  primary_color: "#F63012",
  splash_screen_url: "https://exemplo.com/splash.png",
  hero_banner_url: "https://exemplo.com/hero.png"
}
```

## Verificar se Está Funcionando

1. Acesse o painel: `http://localhost:5173`
2. Vá em "Gerenciar Branding"
3. Você verá:
   - ✅ Preview da logo abaixo do campo URL
   - ✅ Logo no card de preview
   - ✅ Logo salva no banco de dados

## Fluxo Completo

```
┌─────────────────┐
│  Extrair Logo   │
│   do Projeto    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hospedar em    │
│  Servidor Web   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Obter URL      │
│  Pública        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Configurar no  │
│  Painel Web     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  App Android    │
│  Busca Logo     │
│  via API        │
└─────────────────┘
```

## Precisa de Ajuda?

Se quiser que eu:
1. Crie um endpoint que serve as logos automaticamente
2. Configure um servidor de imagens
3. Outra solução

É só me avisar!
