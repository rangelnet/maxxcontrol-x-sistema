-- Popular tabela conteudos - VERSÃO MINI (5 conteúdos)
-- Execute este script no Supabase SQL Editor
-- Se der erro "Failed to fetch", execute linha por linha

-- Parte 1: Criar tabela (se não existir)
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

-- Parte 2: Inserir 5 conteúdos populares
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, ativo) VALUES
(912649, 'filme', 'Venom: A Última Rodada', 'Venom: The Last Dance', 'Eddie e Venom estão em fuga. Caçados por seus dois mundos e com o cerco se fechando.', '/aosm8NMQ3UyoBVpSxyimorCQykC.jpg', '/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg', 6.8, '2024', true),
(558449, 'filme', 'Gladiador II', 'Gladiator II', 'Anos depois de testemunhar a morte do venerado herói Maximus.', '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', '/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg', 7.0, '2024', true),
(94997, 'serie', 'A Casa do Dragão', 'House of the Dragon', 'A história da Casa Targaryen, 200 anos antes de Game of Thrones.', '/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg', '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg', 8.4, '2022', true),
(100088, 'serie', 'The Last of Us', 'The Last of Us', 'Vinte anos após a destruição da civilização moderna por um fungo.', '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', '/hMjVvMWfbhXMI8Ry7xqJqRKgqKJ.jpg', 8.8, '2023', true),
(66732, 'serie', 'Stranger Things', 'Stranger Things', 'Quando um garoto desaparece, a cidade toda participa nas buscas.', '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', 8.6, '2016', true)
ON CONFLICT (tmdb_id) DO NOTHING;

-- Verificar resultado
SELECT COUNT(*) as total_conteudos FROM conteudos;
SELECT * FROM conteudos ORDER BY criado_em DESC;
