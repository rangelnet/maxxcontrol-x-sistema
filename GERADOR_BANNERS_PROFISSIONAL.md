# Gerador de Banners Profissional

## Funcionalidades

### 1. Múltiplos Tamanhos
- **Cartaz (Portrait)**: 1080x1920 - Para stories, cartazes verticais
- **Banner (Landscape)**: 1920x1080 - Para TVs, banners horizontais  
- **Stories**: 1080x1920 - Instagram, Facebook stories
- **Post Quadrado**: 1080x1080 - Instagram feed
- **Capa Facebook**: 820x312 - Capa de página
- **Thumbnail YouTube**: 1280x720 - Miniaturas de vídeo

### 2. Busca Automática TMDB
- Busca filme/série por nome
- Retorna múltiplas imagens:
  - **Poster** (portrait) - Para cartazes verticais
  - **Backdrop** (landscape) - Para banners horizontais
  - **Logo** - Logo oficial do filme/série
- Preenche automaticamente:
  - Título
  - Ano
  - Descrição
  - Rating
  - Gêneros

### 3. Templates Disponíveis

**Template 1: Clássico**
- Imagem de fundo
- Título grande
- Descrição
- Rating com estrelas
- Badges (Dublado, Lançamento)

**Template 2: Minimalista**
- Imagem de fundo desfocada
- Poster centralizado
- Título e ano
- Rating

**Template 3: Moderno**
- Gradiente sobre imagem
- Título com efeito
- Informações em cards
- Ícones de plataformas

**Template 4: Futebol**
- Fundo com efeito de fogo
- Tabela de jogos
- Times e horários
- Logos de canais

### 4. Ícones de Plataformas

Ícones incluídos:
- 📺 TV Box
- 💻 Notebook
- 📱 Celular
- 🎮 Xbox
- 📡 Chromecast
- 🖥️ Smart TV

### 5. Personalização

**Cores:**
- Cor primária (padrão: #FF6A00)
- Cor secundária
- Cor do texto
- Cor de fundo

**Textos:**
- Título customizável
- Subtítulo
- Descrição
- Call-to-action

**Elementos:**
- Mostrar/ocultar rating
- Mostrar/ocultar badges
- Mostrar/ocultar ícones de plataforma
- Posição dos elementos

### 6. Fluxo de Uso

1. **Escolher tipo**: Filme ou Futebol
2. **Escolher tamanho**: Cartaz, Banner, Stories, etc.
3. **Buscar conteúdo**: 
   - Digite nome no TMDB
   - Ou escolha dos últimos adicionados
   - Ou selecione da lista completa
4. **Escolher template**: Clássico, Minimalista, Moderno
5. **Personalizar**: Cores, textos, elementos
6. **Gerar preview**: Ver em tempo real
7. **Baixar**: PNG em alta qualidade

### 7. Exemplo de Implementação

```javascript
const sizes = {
  'cartaz': { width: 1080, height: 1920, name: 'Cartaz (Portrait)' },
  'banner': { width: 1920, height: 1080, name: 'Banner (Landscape)' },
  'stories': { width: 1080, height: 1920, name: 'Stories' },
  'post': { width: 1080, height: 1080, name: 'Post Quadrado' },
  'facebook': { width: 820, height: 312, name: 'Capa Facebook' },
  'youtube': { width: 1280, height: 720, name: 'Thumbnail YouTube' }
}

const templates = {
  'classico': {
    name: 'Clássico',
    description: 'Layout tradicional com todos os elementos'
  },
  'minimalista': {
    name: 'Minimalista',
    description: 'Design limpo e moderno'
  },
  'moderno': {
    name: 'Moderno',
    description: 'Efeitos e gradientes'
  }
}
```

### 8. Geração de Imagens

**Para cada tamanho:**
- Canvas com dimensões específicas
- Layout adaptado ao formato
- Elementos reposicionados automaticamente
- Textos redimensionados proporcionalmente

**Otimizações:**
- Imagens em alta qualidade (original do TMDB)
- Compressão PNG otimizada
- Cache de imagens carregadas
- Preview rápido em baixa resolução

### 9. Interface

**Sidebar Esquerda:**
- Tipo (Filme/Futebol)
- Tamanho (dropdown)
- Template (cards com preview)

**Centro:**
- Busca TMDB
- Últimos adicionados
- Lista completa

**Direita:**
- Preview em tempo real
- Botões de ação:
  - Gerar Preview
  - Baixar PNG
  - Salvar no Banco

**Modal de Preview:**
- Banner em tamanho real
- Zoom in/out
- Comparação de tamanhos
- Download direto

### 10. Próximos Passos

1. Implementar seletor de tamanho
2. Criar templates visuais
3. Adicionar ícones de plataforma
4. Implementar geração por tamanho
5. Adicionar preview comparativo
6. Criar galeria de banners salvos
7. Adicionar edição de banners existentes
8. Implementar batch generation (gerar todos os tamanhos de uma vez)

## Vantagens

✅ Múltiplos tamanhos para diferentes usos
✅ Templates profissionais
✅ Busca automática de imagens
✅ Ícones de plataformas
✅ Preview em tempo real
✅ Alta qualidade de exportação
✅ Interface intuitiva
✅ Personalização completa
