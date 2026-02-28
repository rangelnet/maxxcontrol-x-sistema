# Popular Conteúdos de Exemplo no Supabase

## Por que os banners não aparecem?

A página de banners busca filmes/séries da tabela `conteudos`. Se ela estiver vazia, não aparece nada!

## Solução: Adicionar Conteúdos de Exemplo

### 1. Acessar o Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto: **mmfbirjrhrhobbnzfffe**
4. Clique em **SQL Editor**
5. Clique em **New Query**

### 2. Criar a Tabela (se não existir)

```sql
-- Criar tabela de conteúdos
CREATE TABLE IF NOT EXISTS conteudos (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  titulo_original VARCHAR(255),
  descricao TEXT,
  poster_path VARCHAR(255),
  backdrop_path VARCHAR(255),
  nota NUMERIC(3,1),
  ano VARCHAR(10),
  generos TEXT[],
  duracao INTEGER,
  banner_app_url TEXT,
  banner_share_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_conteudos_tmdb ON conteudos(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_conteudos_tipo ON conteudos(tipo);
CREATE INDEX IF NOT EXISTS idx_conteudos_ativo ON conteudos(ativo);
```

### 3. Inserir Filmes de Exemplo

```sql
-- Inserir 20 filmes populares com dados reais do TMDB
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, generos, duracao, ativo) VALUES

-- 1. Duna
(438631, 'filme', 'Duna', 'Dune', 'Paul Atreides, um jovem brilhante e talentoso nascido com um grande destino além de sua compreensão, deve viajar para o planeta mais perigoso do universo para garantir o futuro de seu povo.', '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg', 8.2, '2021', ARRAY['Ficção científica', 'Aventura'], 155, true),

-- 2. Homem-Aranha: Sem Volta Para Casa
(634649, 'filme', 'Homem-Aranha: Sem Volta Para Casa', 'Spider-Man: No Way Home', 'Peter Parker tem a sua identidade secreta revelada e pede ajuda ao Doutor Estranho. Quando um feitiço para reverter o evento não sai como o esperado, o Homem-Aranha e seu companheiro dos Vingadores precisam enfrentar inimigos de todo o multiverso.', '/fVzXp3NwovUlLe7fvoRynCmBPNc.jpg', '/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg', 8.4, '2021', ARRAY['Ação', 'Aventura', 'Ficção científica'], 148, true),

-- 3. The Batman
(414906, 'filme', 'The Batman', 'The Batman', 'Quando um assassino tem como alvo a elite de Gotham com uma série de maquinações sádicas, um rastro de pistas enigmáticas envia o maior detetive do mundo em uma investigação no submundo.', '/74xTEgt7R36Fpooo50r9T25onhq.jpg', '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg', 8.1, '2022', ARRAY['Crime', 'Mistério', 'Thriller'], 176, true),

-- 4. Top Gun: Maverick
(361743, 'filme', 'Top Gun: Maverick', 'Top Gun: Maverick', 'Depois de mais de 30 anos de serviço como um dos principais aviadores da Marinha, Pete "Maverick" Mitchell está onde pertence, ultrapassando os limites como um piloto de testes corajoso.', '/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', '/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg', 8.5, '2022', ARRAY['Ação', 'Drama'], 131, true),

-- 5. Avatar: O Caminho da Água
(76600, 'filme', 'Avatar: O Caminho da Água', 'Avatar: The Way of Water', 'Ambientado mais de uma década após os eventos do primeiro filme, "Avatar: O Caminho da Água" começa a contar a história da família Sully, os problemas que os seguem e as batalhas que travam para se manterem vivos.', '/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg', 7.7, '2022', ARRAY['Ficção científica', 'Aventura'], 192, true),

-- 6. Vingadores: Ultimato
(299534, 'filme', 'Vingadores: Ultimato', 'Avengers: Endgame', 'Após Thanos eliminar metade das criaturas vivas, os Vingadores têm de lidar com a perda de amigos e entes queridos. Com Tony Stark vagando perdido no espaço sem água e comida, Steve Rogers e Natasha Romanov lideram a resistência contra o titã louco.', '/q6725aR8Zs4IwGMXzZT8aC8lh41.jpg', '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', 8.3, '2019', ARRAY['Aventura', 'Ficção científica', 'Ação'], 181, true),

-- 7. Interestelar
(157336, 'filme', 'Interestelar', 'Interstellar', 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para receberem a população mundial, possibilitando a continuação da espécie.', '/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg', '/xJHokMbljvjADYdit5fK5VQsXEG.jpg', 8.4, '2014', ARRAY['Aventura', 'Drama', 'Ficção científica'], 169, true),

-- 8. Coringa
(475557, 'filme', 'Coringa', 'Joker', 'Arthur Fleck trabalha como palhaço para uma agência de talentos e, toda semana, precisa comparecer a uma agente social, devido aos seus conhecidos problemas mentais. Após ser demitido, Fleck reage mal à gozação de três homens em pleno metrô e os mata.', '/xLxgVxFWvb9hhUyCDDXxRPPnFck.jpg', '/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg', 8.2, '2019', ARRAY['Crime', 'Thriller', 'Drama'], 122, true),

-- 9. Pantera Negra
(284054, 'filme', 'Pantera Negra', 'Black Panther', 'Após a morte do rei T Chaka, o príncipe T Challa retorna a Wakanda para a cerimônia de coroação. Nela são reunidas as cinco tribos que formam o reino, mas nem todas desejam que ele se torne o novo Pantera Negra.', '/tQ8sfYEvzb0u7f7VGzO9sYVupUu.jpg', '/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg', 7.4, '2018', ARRAY['Ação', 'Aventura', 'Ficção científica'], 134, true),

-- 10. Inception
(27205, 'filme', 'A Origem', 'Inception', 'Dom Cobb é um ladrão com a rara habilidade de roubar segredos do inconsciente, obtidos durante o estado de sono. Impedido de retornar para sua família, ele recebe a oportunidade de se redimir ao realizar uma tarefa aparentemente impossível.', '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', 8.4, '2010', ARRAY['Ação', 'Ficção científica', 'Aventura'], 148, true),

-- 11. Stranger Things (Série)
(66732, 'serie', 'Stranger Things', 'Stranger Things', 'Quando um garoto desaparece, a cidade toda participa nas buscas. Mas o que encontram são segredos, forças sobrenaturais e uma menina.', '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', 8.6, '2016', ARRAY['Ficção científica', 'Mistério', 'Drama'], 50, true),

-- 12. Breaking Bad (Série)
(1396, 'serie', 'Breaking Bad', 'Breaking Bad', 'Um professor de química do ensino médio que é diagnosticado com câncer de pulmão inoperável recorre à fabricação e venda de metanfetamina para garantir o futuro financeiro de sua família.', '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', 9.5, '2008', ARRAY['Drama', 'Crime'], 47, true),

-- 13. The Witcher (Série)
(71912, 'serie', 'The Witcher', 'The Witcher', 'Geralt de Rívia, um caçador de monstros mutante, viaja em direção ao seu destino em um mundo turbulento onde as pessoas muitas vezes se mostram mais perversas que as criaturas selvagens.', '/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', '/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg', 8.0, '2019', ARRAY['Ficção científica', 'Ação', 'Aventura'], 60, true),

-- 14. Game of Thrones (Série)
(1399, 'serie', 'Game of Thrones', 'Game of Thrones', 'Sete famílias nobres lutam pelo controle da terra mítica de Westeros. Atrito entre as casas leva à guerra em grande escala. Tudo isso enquanto uma antiga força do mal desperta no extremo norte.', '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', '/suopoADq0k8YZr4dQXcU6pToj6s.jpg', 8.4, '2011', ARRAY['Ficção científica', 'Ação', 'Aventura', 'Drama'], 60, true),

-- 15. The Last of Us (Série)
(100088, 'serie', 'The Last of Us', 'The Last of Us', 'Vinte anos após a destruição da civilização moderna por um fungo, Joel é contratado para contrabandear Ellie para fora de uma zona de quarentena. O que começa como um pequeno trabalho logo se torna uma jornada brutal através dos EUA.', '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', '/hMjVvMWfbhXMI8Ry7xqJqRKgqKJ.jpg', 8.8, '2023', ARRAY['Ficção científica', 'Drama', 'Ação'], 60, true),

-- 16. Wednesday (Série)
(119051, 'serie', 'Wandinha', 'Wednesday', 'Inteligente, sarcástica e um pouco morta por dentro, Wandinha Addams investiga uma onda de assassinatos enquanto faz novos amigos — e inimigos — na Academia Nunca Mais.', '/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', '/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg', 8.5, '2022', ARRAY['Ficção científica', 'Mistério', 'Comédia'], 50, true),

-- 17. Peaky Blinders (Série)
(60574, 'serie', 'Peaky Blinders', 'Peaky Blinders', 'Uma gangue familiar de Birmingham, Inglaterra, centrada em um chefe de gangue que costura lâminas de barbear nas abas de seu boné.', '/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg', '/wiE9doxiLwq3WCGamDIOb2PqBqc.jpg', 8.6, '2013', ARRAY['Drama', 'Crime'], 60, true),

-- 18. The Mandalorian (Série)
(82856, 'serie', 'O Mandaloriano', 'The Mandalorian', 'Após a queda do Império, um pistoleiro solitário luta para sobreviver nos confins da galáxia, longe da autoridade da Nova República.', '/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', '/9ijMGlJKqcslswWUzTEwScm82Gs.jpg', 8.5, '2019', ARRAY['Ficção científica', 'Ação', 'Aventura'], 40, true),

-- 19. House of the Dragon (Série)
(94997, 'serie', 'A Casa do Dragão', 'House of the Dragon', 'A história da Casa Targaryen, 200 anos antes dos eventos de Game of Thrones.', '/z2yahl2uefxDCl0nogcRBstwruJ.jpg', '/7W0JHgY4TDHxF3OTTfKHBxXfP0h.jpg', 8.4, '2022', ARRAY['Ficção científica', 'Drama', 'Ação'], 60, true),

-- 20. The Boys (Série)
(76479, 'serie', 'The Boys', 'The Boys', 'Em um mundo onde super-heróis são celebridades corporativas, um grupo de vigilantes decide derrubar os heróis corruptos.', '/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg', '/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg', 8.7, '2019', ARRAY['Ficção científica', 'Ação', 'Comédia'], 60, true)

ON CONFLICT (tmdb_id) DO NOTHING;
```

### 4. Verificar se Funcionou

```sql
-- Contar quantos conteúdos foram inseridos
SELECT COUNT(*) as total FROM conteudos;

-- Listar os 10 primeiros
SELECT id, titulo, tipo, ano, nota 
FROM conteudos 
ORDER BY criado_em DESC 
LIMIT 10;
```

Deve retornar:
```
total: 20
```

### 5. Testar no Painel

1. Acesse: https://maxxcontrol-frontend.onrender.com/banners
2. Agora deve aparecer:
   - **⚡ ÚLTIMAS SÉRIES ADICIONADAS** - 10 conteúdos
   - **📚 TODOS OS CONTEÚDOS** - 20 conteúdos
3. Clique em qualquer capa para gerar banner!

## Adicionar Mais Conteúdos

### Opção 1: Via Painel (Futuro)

Você pode criar uma página no painel para adicionar conteúdos manualmente ou buscar do TMDB.

### Opção 2: Via API do TMDB

```sql
-- Exemplo: Adicionar mais um filme
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, generos, duracao, ativo) VALUES
(550, 'filme', 'Clube da Luta', 'Fight Club', 'Um funcionário de escritório insone e um fabricante de sabão formam um clube de luta clandestino que evolui para algo muito mais.', '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg', 8.4, '1999', ARRAY['Drama'], 139, true);
```

## Troubleshooting

### Erro: "duplicate key value violates unique constraint"

Significa que o `tmdb_id` já existe. Use `ON CONFLICT (tmdb_id) DO NOTHING` ou mude o ID.

### Banners ainda não aparecem

1. Verifique se a tabela tem dados:
```sql
SELECT COUNT(*) FROM conteudos;
```

2. Verifique se a API está funcionando:
```
https://maxxcontrol-x-sistema.onrender.com/api/content/list?limit=10
```

3. Abra o console do navegador (F12) e veja se há erros.

### Imagens não carregam

As imagens vêm do TMDB. Certifique-se de que os caminhos estão corretos:
- Poster: `https://image.tmdb.org/t/p/w300/CAMINHO`
- Backdrop: `https://image.tmdb.org/t/p/original/CAMINHO`

## Próximos Passos

Depois de popular os conteúdos:

1. ✅ Executar script SQL no Supabase
2. ✅ Verificar se apareceram 20 conteúdos
3. ✅ Acessar página de banners
4. ✅ Clicar em uma capa
5. ✅ Escolher tamanho e baixar!

---

**Importante**: Execute este script ANTES de usar o gerador de banners!
