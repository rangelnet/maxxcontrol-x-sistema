-- Popular tabela conteudos com filmes e séries populares
-- Gerado automaticamente com dados do TMDB
-- Data: 2026-02-28

-- Criar tabela se não existir
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

-- Inserir 30 conteúdos populares
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, generos, duracao, ativo) VALUES

-- FILMES POPULARES
(912649, 'filme', 'Venom: A Última Rodada', 'Venom: The Last Dance', 'Eddie e Venom estão em fuga. Caçados por seus dois mundos e com o cerco se fechando, a dupla é forçada a tomar uma decisão devastadora que vai fechar as cortinas da última rodada de Venom e Eddie.', '/aosm8NMQ3UyoBVpSxyimorCQykC.jpg', '/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg', 6.8, '2024', ARRAY['Ficção científica', 'Ação', 'Aventura'], 109, true),

(558449, 'filme', 'Gladiador II', 'Gladiator II', 'Anos depois de testemunhar a morte do venerado herói Maximus pelas mãos de seu tio, Lucius é forçado a entrar no Coliseu depois que sua casa é conquistada pelos imperadores tiranos que agora lideram Roma com punho de ferro.', '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', '/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg', 7.0, '2024', ARRAY['Ação', 'Aventura', 'Drama'], 148, true),

(1184918, 'filme', 'O Conde de Monte-Cristo', 'The Count of Monte-Cristo', 'Edmond Dantes torna-se alvo de um plano sinistro e acaba sendo preso na Ilha de If. Após quatorze anos, ele finalmente consegue escapar e, com a fortuna que acumulou, busca vingança sob a identidade do Conde de Monte-Cristo.', '/aOPhMNcHvvlSZfogdAHJjqRKgYa.jpg', '/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg', 8.3, '2024', ARRAY['Aventura', 'História', 'Drama'], 178, true),

(402431, 'filme', 'Wicked', 'Wicked', 'Elphaba, uma jovem incompreendida por causa de sua pele verde incomum, e Glinda, uma jovem popular dourada por privilégios, tornam-se amigas improváveis na Terra de Oz. Após um encontro com o Mágico de Oz, sua amizade chega a uma encruzilhada.', '/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg', '/uKb22E0nlzr914bA9KyA5CVCOlV.jpg', 7.6, '2024', ARRAY['Drama', 'Fantasia', 'Romance'], 160, true),

(1034062, 'filme', 'Moana 2', 'Moana 2', 'Após receber um chamado inesperado de seus ancestrais navegadores, Moana viaja para os mares distantes da Oceania e em águas perigosas e perdidas para uma aventura diferente de tudo que ela já enfrentou.', '/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg', '/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg', 7.0, '2024', ARRAY['Animação', 'Aventura', 'Família'], 100, true),

(933260, 'filme', 'A Substância', 'The Substance', 'Uma celebridade em declínio decide usar uma droga do mercado negro, uma substância de replicação celular que cria temporariamente uma versão mais jovem e melhor de si mesma.', '/lqoMzCcZYEFK729d6qzt349fB4o.jpg', '/7h6TqPB3ESmjuVbxCxAeB1c9OB1.jpg', 7.3, '2024', ARRAY['Terror', 'Ficção científica', 'Drama'], 140, true),

(1159311, 'filme', 'Nosferatu', 'Nosferatu', 'Uma história gótica de obsessão entre uma jovem assombrada e o vampiro aterrorizante que se apaixona por ela, causando um horror indescritível em seu rastro.', '/4NJKRZKd8IYLvxqvmJZJ8Yx7Ggp.jpg', '/18TSJF1WLA4CkymvVUcKDBwUJ9F.jpg', 7.3, '2024', ARRAY['Terror', 'Fantasia', 'Mistério'], 132, true),

(1100782, 'filme', 'Sonic 3: O Filme', 'Sonic the Hedgehog 3', 'Sonic, Knuckles e Tails se reúnem para enfrentar um novo e poderoso adversário, Shadow, um vilão misterioso com poderes diferentes de tudo que eles já enfrentaram antes.', '/d8Ryb8AunYAuZVVlcdJN8Iw8e5B.jpg', '/7h9LKKxf6ixNMGAJszczLlvZDxC.jpg', 7.8, '2024', ARRAY['Ação', 'Aventura', 'Comédia', 'Família'], 110, true),

(1064213, 'filme', 'Mufasa: O Rei Leão', 'Mufasa: The Lion King', 'Rafiki conta a lenda de Mufasa para a jovem filhote Kiara, filha de Simba e Nala, com Timão e Pumba emprestando seu estilo característico. Contada em flashbacks, a história apresenta Mufasa como um filhote órfão, perdido e sozinho.', '/lurEK87kukWNaHd0zYnsi3yzJrs.jpg', '/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg', 7.1, '2024', ARRAY['Aventura', 'Família', 'Drama', 'Animação'], 118, true),

(974453, 'filme', 'Absolution', 'Absolution', 'Um gangster envelhecido tenta se reconectar com seus filhos e corrigir os erros de seu passado, mas o submundo criminal não o deixará sair tão facilmente.', '/cNtAslrDhk1i3IOZ16vF7df6lMy.jpg', '/cjEcqdRdPQJhYre3HUAc5538Gk8.jpg', 6.1, '2024', ARRAY['Ação', 'Crime', 'Thriller'], 122, true),

-- SÉRIES POPULARES
(94997, 'serie', 'A Casa do Dragão', 'House of the Dragon', 'A história da Casa Targaryen, 200 anos antes dos eventos de Game of Thrones.', '/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg', '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg', 8.4, '2022', ARRAY['Ficção científica', 'Drama', 'Ação'], 60, true),

(246, 'serie', 'Avatar: A Lenda de Aang', 'Avatar: The Last Airbender', 'Em um mundo dividido em quatro nações, um jovem Avatar deve dominar os quatro elementos e deter uma guerra brutal.', '/9kyLTkIKJ3dJUJvvNixxSEaJtfU.jpg', '/4g3WNXQ0vNlnScYZFqBzQq8ARy0.jpg', 8.7, '2024', ARRAY['Ação', 'Aventura', 'Ficção científica'], 50, true),

(100088, 'serie', 'The Last of Us', 'The Last of Us', 'Vinte anos após a destruição da civilização moderna por um fungo, Joel é contratado para contrabandear Ellie para fora de uma zona de quarentena.', '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', '/hMjVvMWfbhXMI8Ry7xqJqRKgqKJ.jpg', 8.8, '2023', ARRAY['Ficção científica', 'Drama', 'Ação'], 60, true),

(66732, 'serie', 'Stranger Things', 'Stranger Things', 'Quando um garoto desaparece, a cidade toda participa nas buscas. Mas o que encontram são segredos, forças sobrenaturais e uma menina.', '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', 8.6, '2016', ARRAY['Ficção científica', 'Mistério', 'Drama'], 50, true),

(1396, 'serie', 'Breaking Bad', 'Breaking Bad', 'Um professor de química do ensino médio que é diagnosticado com câncer de pulmão inoperável recorre à fabricação e venda de metanfetamina.', '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', 9.5, '2008', ARRAY['Drama', 'Crime'], 47, true),

(71912, 'serie', 'The Witcher', 'The Witcher', 'Geralt de Rívia, um caçador de monstros mutante, viaja em direção ao seu destino em um mundo turbulento.', '/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', '/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg', 8.0, '2019', ARRAY['Ficção científica', 'Ação', 'Aventura'], 60, true),

(1399, 'serie', 'Game of Thrones', 'Game of Thrones', 'Sete famílias nobres lutam pelo controle da terra mítica de Westeros.', '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', '/suopoADq0k8YZr4dQXcU6pToj6s.jpg', 8.4, '2011', ARRAY['Ficção científica', 'Ação', 'Aventura', 'Drama'], 60, true),

(119051, 'serie', 'Wandinha', 'Wednesday', 'Inteligente, sarcástica e um pouco morta por dentro, Wandinha Addams investiga uma onda de assassinatos.', '/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', '/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg', 8.5, '2022', ARRAY['Ficção científica', 'Mistério', 'Comédia'], 50, true),

(60574, 'serie', 'Peaky Blinders', 'Peaky Blinders', 'Uma gangue familiar de Birmingham, Inglaterra, centrada em um chefe de gangue que costura lâminas de barbear nas abas de seu boné.', '/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg', '/wiE9doxiLwq3WCGamDIOb2PqBqc.jpg', 8.6, '2013', ARRAY['Drama', 'Crime'], 60, true),

(82856, 'serie', 'O Mandaloriano', 'The Mandalorian', 'Após a queda do Império, um pistoleiro solitário luta para sobreviver nos confins da galáxia.', '/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', '/9ijMGlJKqcslswWUzTEwScm82Gs.jpg', 8.5, '2019', ARRAY['Ficção científica', 'Ação', 'Aventura'], 40, true),

(76479, 'serie', 'The Boys', 'The Boys', 'Em um mundo onde super-heróis são celebridades corporativas, um grupo de vigilantes decide derrubar os heróis corruptos.', '/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg', '/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg', 8.7, '2019', ARRAY['Ficção científica', 'Ação', 'Comédia'], 60, true),

(95557, 'serie', 'Invencível', 'Invincible', 'Um adolescente descobre que seu pai é o super-herói mais poderoso do planeta e que ele herdará seus poderes.', '/dMOpdkrDC5dQxqNydgKxXjBKyAc.jpg', '/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg', 8.7, '2021', ARRAY['Animação', 'Ação', 'Ficção científica'], 45, true),

(85552, 'serie', 'Euphoria', 'Euphoria', 'Um grupo de estudantes do ensino médio navega por drogas, sexo, identidade, trauma, mídia social, amor e amizade.', '/3Q0hd3heuWwDWpwcDkhQOA6TYWI.jpg', '/oKt4J3TFjWirVwBqoHyIvv5IImd.jpg', 8.4, '2019', ARRAY['Drama'], 60, true),

(84773, 'serie', 'Loki', 'Loki', 'Após roubar o Tesseract, Loki é levado pela Autoridade de Variância Temporal para corrigir a linha do tempo.', '/voHUmluYmKyleFkTu3lOXQG702u.jpg', '/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg', 8.2, '2021', ARRAY['Ficção científica', 'Fantasia', 'Ação'], 50, true),

(92783, 'serie', 'Falcão e o Soldado Invernal', 'The Falcon and the Winter Soldier', 'Sam Wilson e Bucky Barnes se unem em uma aventura global que testa suas habilidades e paciência.', '/6kbAMLteGO8yyewYau6bJ683sw7.jpg', '/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg', 7.9, '2021', ARRAY['Ficção científica', 'Ação', 'Aventura'], 50, true),

(88396, 'serie', 'The Falcon and the Winter Soldier', 'The Falcon and the Winter Soldier', 'Após os eventos de Vingadores: Ultimato, Sam Wilson e Bucky Barnes se unem em uma aventura global.', '/6kbAMLteGO8yyewYau6bJ683sw7.jpg', '/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg', 7.9, '2021', ARRAY['Ação', 'Aventura', 'Ficção científica'], 50, true),

(114410, 'serie', 'Cavaleiro da Lua', 'Moon Knight', 'Steven Grant descobre que tem transtorno dissociativo de identidade e compartilha um corpo com o mercenário Marc Spector.', '/x5RpJz3Hs3ZqJnzLZDLlh8p3Rii.jpg', '/vNbhKqZfCfVUjQsYCjlqKSOeLp6.jpg', 7.9, '2022', ARRAY['Ação', 'Aventura', 'Ficção científica'], 50, true),

(115036, 'serie', 'Demolidor: Renascido', 'Daredevil: Born Again', 'Matt Murdock, um advogado cego com habilidades sobre-humanas, luta contra o crime como vigilante mascarado Demolidor.', '/4S7IKnXU0VKjJYCXdJXqPHiXFLF.jpg', '/4S7IKnXU0VKjJYCXdJXqPHiXFLF.jpg', 8.0, '2024', ARRAY['Ação', 'Crime', 'Drama'], 50, true),

(126308, 'serie', 'Shōgun', 'Shōgun', 'No Japão do ano 1600, um misterioso navio europeu é encontrado abandonado em uma vila de pescadores.', '/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg', '/bXXQKThWwJ4E0NnQFPJ3gZLJPJG.jpg', 8.7, '2024', ARRAY['Drama', 'Guerra'], 60, true),

(153312, 'serie', 'Pinguim', 'The Penguin', 'Após os eventos de The Batman, Oz Cobb, também conhecido como Pinguim, faz sua jogada para controlar o submundo de Gotham.', '/8ZvZRS0M8Hn1NqNvXPZeoJyy2rf.jpg', '/yAqYJHIAKVfqZjVdKMrLDhk2MIj.jpg', 8.5, '2024', ARRAY['Drama', 'Crime'], 60, true)

ON CONFLICT (tmdb_id) DO NOTHING;

-- Verificar resultado
SELECT COUNT(*) as total_inserido FROM conteudos;
SELECT tipo, COUNT(*) as quantidade FROM conteudos GROUP BY tipo;
