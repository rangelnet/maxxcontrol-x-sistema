# 🎬 Como Popular Conteúdos no Supabase

## ❌ PROBLEMA
A galeria de banners está vazia porque a tabela `conteudos` não tem dados.

## ✅ SOLUÇÃO
Executar o script SQL no Supabase para adicionar conteúdos de exemplo.

---

## 📋 PASSO A PASSO

### 1️⃣ Acessar o Supabase

1. Abra: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto: **mmfbirjrhrhobbnzfffe**

### 2️⃣ Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** (botão verde)

### 3️⃣ Executar o Script

**OPÇÃO A - Script Mini (5 conteúdos) - RECOMENDADO**

Copie e cole este código:

```sql
-- Popular tabela conteudos - VERSÃO MINI (5 conteúdos)
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
(66732, 'serie', 'Stranger Things', 'Stranger Things', 'Quando um garoto desaparece, a cidade toda participa nas buscas.', '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', 8.6, '2016', true)
ON CONFLICT (tmdb_id) DO NOTHING;

SELECT COUNT(*) as total_conteudos FROM conteudos;
```

Clique em **RUN** (ou pressione Ctrl+Enter)

**OPÇÃO B - Script Simples (20 conteúdos)**

Se a Opção A funcionar, você pode adicionar mais conteúdos usando o arquivo:
`populate_tmdb_simple.sql`

### 4️⃣ Verificar o Resultado

Você deve ver:

```
✅ CREATE TABLE
✅ INSERT 0 5
✅ SELECT - Mostrando: total_conteudos: 5
```

### 5️⃣ Testar a Galeria

1. Acesse: https://maxxcontrol-frontend.onrender.com/banners
2. Você deve ver 5 capas de filmes/séries
3. Clique em qualquer capa
4. Escolha o tamanho do banner
5. O banner será gerado e baixado automaticamente

---

## 🔍 VERIFICAR SE JÁ TEM CONTEÚDOS

Antes de executar, verifique se a tabela já tem dados:

```sql
SELECT COUNT(*) FROM conteudos;
```

Se retornar um número maior que 0, você já tem conteúdos!

---

## 🚨 SE DER ERRO "Failed to fetch"

Isso acontece quando o script é muito grande. Soluções:

### Solução 1: Executar em Partes

Execute cada comando separadamente:

**Passo 1 - Criar tabela:**
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

**Passo 2 - Inserir conteúdo 1:**
```sql
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, ativo) VALUES
(912649, 'filme', 'Venom: A Última Rodada', 'Venom: The Last Dance', 'Eddie e Venom estão em fuga. Caçados por seus dois mundos e com o cerco se fechando.', '/aosm8NMQ3UyoBVpSxyimorCQykC.jpg', '/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg', 6.8, '2024', true);
```

**Passo 3 - Inserir conteúdo 2:**
```sql
INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, ativo) VALUES
(558449, 'filme', 'Gladiador II', 'Gladiator II', 'Anos depois de testemunhar a morte do venerado herói Maximus.', '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', '/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg', 7.0, '2024', true);
```

E assim por diante...

### Solução 2: Usar a API

Se o SQL Editor continuar dando erro, você pode usar a API do painel:

1. Acesse: https://maxxcontrol-frontend.onrender.com/
2. Faça login
3. Vá em **Conteúdos** (se existir essa página)
4. Adicione manualmente

---

## 📊 COMANDOS ÚTEIS

### Ver todos os conteúdos:
```sql
SELECT * FROM conteudos ORDER BY criado_em DESC;
```

### Ver apenas filmes:
```sql
SELECT * FROM conteudos WHERE tipo = 'filme';
```

### Ver apenas séries:
```sql
SELECT * FROM conteudos WHERE tipo = 'serie';
```

### Deletar todos os conteúdos (cuidado!):
```sql
DELETE FROM conteudos;
```

### Deletar um conteúdo específico:
```sql
DELETE FROM conteudos WHERE tmdb_id = 912649;
```

---

## ✅ RESULTADO ESPERADO

Após executar o script, a galeria de banners deve mostrar:

**ÚLTIMAS SÉRIES ADICIONADAS:**
- Stranger Things
- The Last of Us
- A Casa do Dragão

**TODOS OS CONTEÚDOS:**
- Venom: A Última Rodada
- Gladiador II
- A Casa do Dragão
- The Last of Us
- Stranger Things

Cada capa é clicável e permite gerar banners em 6 tamanhos diferentes!

---

## 🎯 PRÓXIMOS PASSOS

Depois que os conteúdos estiverem no banco:

1. ✅ Testar a galeria de banners
2. ✅ Gerar banners em diferentes tamanhos
3. ✅ Adicionar mais conteúdos usando o script `populate_tmdb_simple.sql` (20 conteúdos)
4. 🔄 Implementar sistema de busca no TMDB para adicionar conteúdos automaticamente

---

## 📞 SUPORTE

Se continuar com problemas:

1. Verifique se está no projeto correto: **mmfbirjrhrhobbnzfffe**
2. Verifique se tem permissão de admin no Supabase
3. Tente executar os comandos um por um
4. Verifique o console do navegador (F12) para ver erros detalhados
