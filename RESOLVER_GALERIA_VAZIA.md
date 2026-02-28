# 🎬 RESOLVER GALERIA DE BANNERS VAZIA

## 🔴 PROBLEMA
Você está vendo a galeria vazia porque não tem conteúdos no banco de dados.

## 🟢 SOLUÇÃO RÁPIDA (3 minutos)

### 1️⃣ Abrir Supabase
```
https://supabase.com/dashboard
```
- Login → Projeto: mmfbirjrhrhobbnzfffe

### 2️⃣ Abrir SQL Editor
- Menu lateral → **SQL Editor**
- Botão verde → **New Query**

### 3️⃣ COPIAR E COLAR ESTE CÓDIGO:

```sql
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

INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, ativo) VALUES
(912649, 'filme', 'Venom: A Última Rodada', 'Venom: The Last Dance', 'Eddie e Venom estão em fuga. Caçados por seus dois mundos e com o cerco se fechando.', '/aosm8NMQ3UyoBVpSxyimorCQykC.jpg', '/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg', 6.8, '2024', true),
(558449, 'filme', 'Gladiador II', 'Gladiator II', 'Anos depois de testemunhar a morte do venerado herói Maximus.', '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', '/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg', 7.0, '2024', true),
(94997, 'serie', 'A Casa do Dragão', 'House of the Dragon', 'A história da Casa Targaryen, 200 anos antes de Game of Thrones.', '/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg', '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg', 8.4, '2022', true),
(100088, 'serie', 'The Last of Us', 'The Last of Us', 'Vinte anos após a destruição da civilização moderna por um fungo.', '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', '/hMjVvMWfbhXMI8Ry7xqJqRKgqKJ.jpg', 8.8, '2023', true),
(66732, 'serie', 'Stranger Things', 'Stranger Things', 'Quando um garoto desaparece, a cidade toda participa nas buscas.', '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', 8.6, '2016', true);
```

### 4️⃣ Clicar em RUN
- Botão verde **RUN** ou Ctrl+Enter

### 5️⃣ Verificar
```
✅ CREATE TABLE
✅ INSERT 0 5
```

### 6️⃣ Testar a Galeria
```
https://maxxcontrol-frontend.onrender.com/banners
```

Você deve ver 5 capas agora! 🎉

---

## 🚨 SE DER ERRO "Failed to fetch"

Execute UM comando por vez:

**Comando 1:**
```sql
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
```
RUN → Aguardar ✅

**Comando 2:**
```sql
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, ativo) VALUES
(912649, 'filme', 'Venom: A Última Rodada', 'Venom: The Last Dance', 'Eddie e Venom estão em fuga.', '/aosm8NMQ3UyoBVpSxyimorCQykC.jpg', '/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg', 6.8, '2024', true);
```
RUN → Aguardar ✅

**Comando 3:**
```sql
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, ativo) VALUES
(558449, 'filme', 'Gladiador II', 'Gladiator II', 'Anos depois de testemunhar a morte do venerado herói Maximus.', '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', '/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg', 7.0, '2024', true);
```
RUN → Aguardar ✅

E assim por diante...

---

## 📊 VERIFICAR SE FUNCIONOU

```sql
SELECT COUNT(*) FROM conteudos;
```

Deve retornar: **5**

```sql
SELECT titulo, tipo, ano FROM conteudos;
```

Deve mostrar:
- Venom: A Última Rodada | filme | 2024
- Gladiador II | filme | 2024
- A Casa do Dragão | serie | 2022
- The Last of Us | serie | 2023
- Stranger Things | serie | 2016

---

## 🎯 COMO USAR A GALERIA

1. Acesse: https://maxxcontrol-frontend.onrender.com/banners
2. Você verá as capas dos filmes/séries
3. **CLIQUE** em qualquer capa
4. Escolha o tamanho:
   - 📱 Cartaz (1080x1920)
   - 🖥️ Banner (1920x1080)
   - 📲 Stories (1080x1920)
   - ⬛ Post Quadrado (1080x1080)
   - 📘 Capa Facebook (820x312)
   - ▶️ Thumbnail YouTube (1280x720)
5. O banner é gerado e baixado automaticamente!

---

## 🔥 ADICIONAR MAIS CONTEÚDOS

Depois que funcionar, você pode adicionar mais 15 conteúdos usando:

**Arquivo:** `populate_tmdb_simple.sql`

Ou adicionar manualmente:

```sql
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, ativo) VALUES
(157336, 'filme', 'Interestelar', 'Interstellar', 'As reservas naturais da Terra estão chegando ao fim.', '/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg', '/xJHokMbljvjADYdit5fK5VQsXEG.jpg', 8.4, '2014', true);
```

---

## ✅ CHECKLIST

- [ ] Acessei o Supabase
- [ ] Abri o SQL Editor
- [ ] Executei o script
- [ ] Vi "INSERT 0 5"
- [ ] Acessei a galeria
- [ ] Vejo 5 capas
- [ ] Cliquei em uma capa
- [ ] Escolhi o tamanho
- [ ] Banner foi gerado e baixado

---

## 🎉 PRONTO!

Agora você tem uma galeria funcional de banners!

**Próximos passos:**
1. Adicionar mais conteúdos (até 20 com `populate_tmdb_simple.sql`)
2. Testar todos os tamanhos de banner
3. Personalizar os banners no modo "Criar Personalizado"
