# Como Usar o Gerador de Banners

## 📋 Ver Conteúdos Cadastrados

Agora você pode ver todos os filmes e séries já cadastrados no sistema e gerar banners deles com um clique!

### ⚡ Últimos Adicionados (NOVO!)

Na parte superior do gerador, você verá uma galeria com os 10 conteúdos mais recentes:
- **Miniaturas grandes** das capas
- **Rating** no canto superior
- **Hover** mostra o título
- **Um clique** para selecionar

Perfeito para criar banners dos lançamentos mais recentes rapidamente!

### Passo a Passo

**1. Acessar o Gerador**
- Entre no painel: https://maxxcontrol-frontend.onrender.com/
- Menu lateral → "Banners"
- Clique em "Novo Banner"

**2. Ver Lista de Conteúdos**
- Escolha "Filme/Série"
- Clique no botão azul "📋 Ver Conteúdos Cadastrados (X)"
- Aparecerá a lista de todos os filmes/séries

**3. Buscar Conteúdo**
- Use a barra de busca para filtrar
- Digite o nome do filme/série
- Filtra em tempo real

**4. Selecionar Conteúdo**
- Clique no conteúdo desejado
- Dados preenchidos automaticamente:
  - Título
  - Ano
  - Descrição
  - Poster (imagem)
  - Rating (nota)

**5. Personalizar**
- Marque "Dublado" se for dublado
- Marque "Lançamento" se for novo
- Ajuste qualquer campo se necessário

**6. Gerar Banner**
- Clique em "Gerar Preview"
- Veja como ficou
- Clique em "Salvar Banner"

### Informações Exibidas

**Últimos Adicionados (10 mais recentes):**
- Grid de 5 colunas com capas grandes
- Rating no canto
- Hover mostra título completo
- Clique para selecionar

**Lista Completa:**
Cada item mostra:
- **Poster**: Miniatura da capa
- **Título**: Nome do filme/série
- **Tipo**: 🎬 Filme ou 📺 Série
- **Ano**: Ano de lançamento
- **Rating**: ⭐ Nota (0-10)

### Exemplo de Uso

```
1. Clique em "Novo Banner"
2. Escolha "Filme/Série"
3. Clique em "Ver Conteúdos Cadastrados"
4. Busque "Mighty Nein"
5. Clique no resultado
6. Marque "Dublado" e "Lançamento"
7. Clique em "Gerar Preview"
8. Clique em "Salvar Banner"
```

### Alternativa: Buscar no TMDB

Se o conteúdo não estiver cadastrado:
1. Use o campo "Ou buscar no TMDB"
2. Digite o nome
3. Aperte Enter
4. Dados preenchidos automaticamente

### Estrutura do Banco

```sql
CREATE TABLE conteudos (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  tipo VARCHAR(20),           -- 'filme' ou 'serie'
  titulo VARCHAR(255),
  titulo_original VARCHAR(255),
  descricao TEXT,
  poster_path VARCHAR(255),   -- Caminho do poster no TMDB
  backdrop_path VARCHAR(255),
  nota DECIMAL(3,1),          -- 0.0 a 10.0
  ano VARCHAR(4),
  generos TEXT[],
  duracao INTEGER,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);
```

### Vantagens

✅ **Últimos Adicionados**: Acesso rápido aos lançamentos
✅ Não precisa buscar no TMDB toda vez
✅ Lista todos os conteúdos cadastrados
✅ Busca rápida por nome
✅ Preview da capa
✅ Um clique para preencher tudo
✅ Economiza tempo

### Dicas

1. **Cadastre conteúdos antes**: Use a página de conteúdo para importar do TMDB
2. **Organize por tipo**: Filtre por filme ou série
3. **Mantenha atualizado**: Importe novos lançamentos regularmente
4. **Use a busca**: Mais rápido que rolar a lista

### Próximos Passos

Para cadastrar novos conteúdos:
1. Crie uma página "Conteúdos" no painel
2. Busque no TMDB
3. Importe para o banco
4. Use no gerador de banners

### Status

✅ Lista de conteúdos implementada
✅ **Últimos Adicionados** com galeria visual
✅ Busca em tempo real
✅ Seleção com um clique
✅ Preview de capas
✅ Commit: `4195d48`
✅ Push realizado
⏳ Aguardando rebuild do Render
