# Gerador de Banners - Sistema Completo

## ✅ Implementação Finalizada

Sistema completo de geração de banners para filmes/séries e futebol, integrado com TMDB API!

### Funcionalidades

**1. Banners de Filmes/Séries**
- Busca automática no TMDB
- Poster do filme/série
- Título, ano, descrição
- Rating com estrelas
- Badges "DUBLADO" e "LANÇAMENTO"
- Gradiente de fundo profissional

**2. Banners de Futebol**
- Tabela de jogos personalizável
- Múltiplos jogos em um banner
- Campeonato, times, horário
- Estilo Fire TV (como nas imagens)
- Gradiente de fogo no fundo

### Como Usar no Painel

**Passo 1: Acessar o Gerador**
- Menu lateral → "Banners"
- Clique em "Novo Banner"

**Passo 2: Escolher Tipo**
- Filme/Série: Para conteúdo de streaming
- Futebol: Para jogos e eventos esportivos

**Passo 3: Criar Banner de Filme**
1. Digite o nome do filme na busca TMDB
2. Aperte Enter
3. Dados preenchidos automaticamente:
   - Título
   - Ano
   - Descrição
   - Poster (URL do TMDB)
   - Rating
4. Marque "Dublado" e/ou "Lançamento"
5. Clique em "Gerar Preview"
6. Clique em "Salvar Banner"

**Passo 4: Criar Banner de Futebol**
1. Preencha título (ex: "TABELA DE JOGOS")
2. Preencha data (ex: "QUINTA - 27 DE NOVEMBRO")
3. Adicione jogos:
   - Campeonato (ex: "BRASILEIRÃO SÉRIE A")
   - Time 1 (ex: "FLAMENGO")
   - Time 2 (ex: "PALMEIRAS")
   - Horário (ex: "20:00")
4. Clique em "+ Adicionar Jogo" para mais jogos
5. Clique em "Gerar Preview"
6. Clique em "Salvar Banner"

### Estrutura Técnica

**Backend:**
```
modules/banners/
├── bannerController.js  - Lógica de geração
└── bannerRoutes.js      - Rotas da API
```

**Frontend:**
```
web/src/pages/
└── BannerGenerator.jsx  - Interface do gerador
```

**Banco de Dados:**
```sql
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),           -- 'movie' ou 'football'
  title VARCHAR(255),
  data JSONB,                 -- Dados do banner
  template VARCHAR(50),
  image_url VARCHAR(500),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Endpoints da API

- `GET /api/banners/list` - Listar todos os banners
- `GET /api/banners/:id` - Buscar banner específico
- `POST /api/banners/create` - Criar novo banner
- `PUT /api/banners/:id` - Atualizar banner
- `DELETE /api/banners/:id` - Deletar banner
- `POST /api/banners/generate` - Gerar imagem do banner

### Integração com TMDB

O sistema usa a API do TMDB que já está configurada:
- Busca filmes/séries por nome
- Retorna poster, descrição, rating
- URL do poster: `https://image.tmdb.org/t/p/w500{poster_path}`

### Tecnologia de Geração

**Node Canvas:**
- Biblioteca `canvas` para gerar imagens no servidor
- Suporta gradientes, textos, imagens
- Exporta PNG de alta qualidade (1920x1080)

**Recursos Visuais:**
- Gradientes personalizados
- Sombras e efeitos
- Fontes customizáveis
- Composição de múltiplas camadas

### Exemplos de Uso

**Banner de Filme:**
```json
{
  "type": "movie",
  "title": "THE MIGHTY NEIN",
  "year": "2025",
  "description": "Um grupo de excluídos...",
  "posterUrl": "https://image.tmdb.org/t/p/w500/abc123.jpg",
  "rating": 8.5,
  "dubbed": true,
  "isNew": true
}
```

**Banner de Futebol:**
```json
{
  "type": "football",
  "title": "TABELA DE JOGOS",
  "date": "QUINTA - 27 DE NOVEMBRO",
  "matches": [
    {
      "league": "BRASILEIRÃO SÉRIE A",
      "team1": "FLAMENGO",
      "team2": "PALMEIRAS",
      "time": "20:00"
    }
  ]
}
```

### Próximos Passos

**Para usar os banners no app:**
1. API retorna URL da imagem gerada
2. App carrega a imagem via URL
3. Exibe no carrossel ou tela inicial

**Melhorias Futuras:**
- Upload de logos de times
- Mais templates de design
- Animações nos banners
- Agendamento de publicação
- Preview em tempo real

### Status do Deploy

✅ Commit: `d5ed69f`
✅ Push realizado
✅ Dependência `canvas` adicionada
⏳ Aguardando rebuild do Render

### Observações Importantes

1. A biblioteca `canvas` precisa de dependências nativas no servidor
2. O Render pode precisar de configuração adicional para instalar o canvas
3. As imagens são salvas em `public/banners/`
4. URLs das imagens: `https://seu-dominio.com/banners/banner_123456.png`

### Troubleshooting

Se o canvas não funcionar no Render:
1. Adicionar buildpack para canvas
2. Ou usar serviço externo (Cloudinary, Imgix)
3. Ou gerar banners localmente e fazer upload

### Vantagens do Sistema

✅ Interface visual intuitiva
✅ Integração automática com TMDB
✅ Múltiplos templates
✅ Banners profissionais
✅ Fácil personalização
✅ Gerenciamento completo no painel
