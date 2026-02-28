-- Popular tabela conteudos - VERSÃO SIMPLES
-- Execute este script no Supabase SQL Editor

-- Parte 1: Criar tabela
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
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parte 2: Inserir 10 filmes populares
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, ativo) VALUES
(912649, 'filme', 'Venom: A Última Rodada', 'Venom: The Last Dance', 'Eddie e Venom estão em fuga. Caçados por seus dois mundos e com o cerco se fechando.', '/aosm8NMQ3UyoBVpSxyimorCQykC.jpg', '/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg', 6.8, '2024', true),
(558449, 'filme', 'Gladiador II', 'Gladiator II', 'Anos depois de testemunhar a morte do venerado herói Maximus.', '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', '/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg', 7.0, '2024', true),
(402431, 'filme', 'Wicked', 'Wicked', 'Elphaba, uma jovem incompreendida por causa de sua pele verde incomum.', '/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg', '/uKb22E0nlzr914bA9KyA5CVCOlV.jpg', 7.6, '2024', true),
(1034062, 'filme', 'Moana 2', 'Moana 2', 'Após receber um chamado inesperado de seus ancestrais navegadores.', '/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg', '/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg', 7.0, '2024', true),
(933260, 'filme', 'A Substância', 'The Substance', 'Uma celebridade em declínio decide usar uma droga do mercado negro.', '/lqoMzCcZYEFK729d6qzt349fB4o.jpg', '/7h6TqPB3ESmjuVbxCxAeB1c9OB1.jpg', 7.3, '2024', true),
(1100782, 'filme', 'Sonic 3: O Filme', 'Sonic the Hedgehog 3', 'Sonic, Knuckles e Tails se reúnem para enfrentar um novo adversário.', '/d8Ryb8AunYAuZVVlcdJN8Iw8e5B.jpg', '/7h9LKKxf6ixNMGAJszczLlvZDxC.jpg', 7.8, '2024', true),
(1064213, 'filme', 'Mufasa: O Rei Leão', 'Mufasa: The Lion King', 'Rafiki conta a lenda de Mufasa para a jovem filhote Kiara.', '/lurEK87kukWNaHd0zYnsi3yzJrs.jpg', '/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg', 7.1, '2024', true),
(157336, 'filme', 'Interestelar', 'Interstellar', 'As reservas naturais da Terra estão chegando ao fim.', '/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg', '/xJHokMbljvjADYdit5fK5VQsXEG.jpg', 8.4, '2014', true),
(475557, 'filme', 'Coringa', 'Joker', 'Arthur Fleck trabalha como palhaço para uma agência de talentos.', '/xLxgVxFWvb9hhUyCDDXxRPPnFck.jpg', '/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg', 8.2, '2019', true),
(27205, 'filme', 'A Origem', 'Inception', 'Dom Cobb é um ladrão com a rara habilidade de roubar segredos.', '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', 8.4, '2010', true)
ON CONFLICT (tmdb_id) DO NOTHING;

-- Parte 3: Inserir 10 séries populares
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, ativo) VALUES
(94997, 'serie', 'A Casa do Dragão', 'House of the Dragon', 'A história da Casa Targaryen, 200 anos antes de Game of Thrones.', '/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg', '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg', 8.4, '2022', true),
(100088, 'serie', 'The Last of Us', 'The Last of Us', 'Vinte anos após a destruição da civilização moderna por um fungo.', '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', '/hMjVvMWfbhXMI8Ry7xqJqRKgqKJ.jpg', 8.8, '2023', true),
(66732, 'serie', 'Stranger Things', 'Stranger Things', 'Quando um garoto desaparece, a cidade toda participa nas buscas.', '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', 8.6, '2016', true),
(1396, 'serie', 'Breaking Bad', 'Breaking Bad', 'Um professor de química diagnosticado com câncer recorre à metanfetamina.', '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', 9.5, '2008', true),
(71912, 'serie', 'The Witcher', 'The Witcher', 'Geralt de Rívia, um caçador de monstros mutante.', '/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', '/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg', 8.0, '2019', true),
(1399, 'serie', 'Game of Thrones', 'Game of Thrones', 'Sete famílias nobres lutam pelo controle de Westeros.', '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', '/suopoADq0k8YZr4dQXcU6pToj6s.jpg', 8.4, '2011', true),
(119051, 'serie', 'Wandinha', 'Wednesday', 'Wandinha Addams investiga uma onda de assassinatos.', '/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', '/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg', 8.5, '2022', true),
(82856, 'serie', 'O Mandaloriano', 'The Mandalorian', 'Um pistoleiro solitário luta para sobreviver nos confins da galáxia.', '/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', '/9ijMGlJKqcslswWUzTEwScm82Gs.jpg', 8.5, '2019', true),
(76479, 'serie', 'The Boys', 'The Boys', 'Um grupo de vigilantes decide derrubar os heróis corruptos.', '/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg', '/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg', 8.7, '2019', true),
(85552, 'serie', 'Euphoria', 'Euphoria', 'Estudantes do ensino médio navegam por drogas, sexo e identidade.', '/3Q0hd3heuWwDWpwcDkhQOA6TYWI.jpg', '/oKt4J3TFjWirVwBqoHyIvv5IImd.jpg', 8.4, '2019', true)
ON CONFLICT (tmdb_id) DO NOTHING;

-- Verificar resultado
SELECT COUNT(*) as total_conteudos FROM conteudos;
SELECT tipo, COUNT(*) as quantidade FROM conteudos GROUP BY tipo;
