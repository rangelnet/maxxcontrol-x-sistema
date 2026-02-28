# 🚀 POPULAR CONTEÚDOS AUTOMATICAMENTE

## 🎯 O QUE FAZ

Este script busca filmes e séries populares direto do TMDB e insere automaticamente no Supabase!

**Vantagens:**
- ✅ Não precisa copiar e colar SQL
- ✅ Busca conteúdos atualizados do TMDB
- ✅ Insere direto no banco
- ✅ Mostra progresso em tempo real
- ✅ Usa o token TMDB que já temos

---

## 📋 REQUISITOS

1. Node.js instalado
2. Dependências instaladas (`npm install`)
3. Arquivo `.env` configurado

---

## ⚡ USO RÁPIDO

### Opção 1: Executar Direto

```bash
cd MaxxControl/maxxcontrol-x-sistema
node scripts/popular-conteudos-automatico.js
```

### Opção 2: Via NPM

```bash
cd MaxxControl/maxxcontrol-x-sistema
npm run popular-conteudos
```

---

## 🎬 O QUE VAI ACONTECER

```
╔════════════════════════════════════════════════════════╗
║  🎬 POPULAR CONTEÚDOS AUTOMATICAMENTE                 ║
╚════════════════════════════════════════════════════════╝

📊 Configurações:
  • TMDB API Key: c1869e578c...
  • Supabase URL: https://mmfbirjrhrhobbnzfffe.supabase.co

🔌 Testando conexão com Supabase...
  ✓ Conexão estabelecida!

📽️  Buscando 10 filmes populares no TMDB...
  ✓ Página 1/1 carregada

📺 Buscando 10 séries populares no TMDB...
  ✓ Página 1/1 carregada

📽️  Inserindo filmes no banco...
  ✓ Venom: A Última Rodada (2024)
  ✓ Gladiador II (2024)
  ✓ Wicked (2024)
  ✓ Moana 2 (2024)
  ✓ A Substância (2024)
  ✓ Sonic 3: O Filme (2024)
  ✓ Mufasa: O Rei Leão (2024)
  ✓ Interestelar (2014)
  ✓ Coringa (2019)
  ✓ A Origem (2010)

📺 Inserindo séries no banco...
  ✓ A Casa do Dragão (2022)
  ✓ The Last of Us (2023)
  ✓ Stranger Things (2016)
  ✓ Breaking Bad (2008)
  ✓ The Witcher (2019)
  ✓ Game of Thrones (2011)
  ✓ Wandinha (2022)
  ✓ O Mandaloriano (2019)
  ✓ The Boys (2019)
  ✓ Euphoria (2019)

╔════════════════════════════════════════════════════════╗
║  ✅ PROCESSO CONCLUÍDO!                               ║
╚════════════════════════════════════════════════════════╝

📊 Resumo:
  • Filmes inseridos: 10/10
  • Séries inseridas: 10/10
  • Total: 20 conteúdos

📚 Total de conteúdos no banco: 20

🎉 Acesse a galeria de banners:
   https://maxxcontrol-frontend.onrender.com/banners
```

---

## ⚙️ CONFIGURAÇÃO

### 1. Verificar .env

O arquivo `.env` deve ter:

```env
# Supabase
SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
SUPABASE_KEY=sb_publishable_oUowKSGxGtxiy96we_bSvA_KZ-9aSROB

# TMDB
TMDB_API_KEY=c1869e578c74a007f3521d9609a56285
```

### 2. Instalar Dependências

```bash
cd MaxxControl/maxxcontrol-x-sistema
npm install axios @supabase/supabase-js dotenv
```

---

## 🎛️ PERSONALIZAR

### Mudar Quantidade de Conteúdos

Edite o arquivo `scripts/popular-conteudos-automatico.js`:

```javascript
// Linha ~150
const filmes = await buscarFilmesPopulares(10);  // Mude para 20, 30, etc
const series = await buscarSeriesPopulares(10);  // Mude para 20, 30, etc
```

### Usar Token do Projeto "next"

Se você tem o token do TMDB no projeto "next", copie e cole no `.env`:

```env
TMDB_API_KEY=SEU_TOKEN_AQUI
```

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### Erro: "Cannot find module 'axios'"

```bash
npm install axios @supabase/supabase-js dotenv
```

### Erro: "Erro de conexão com Supabase"

Verifique se o `SUPABASE_KEY` está correto no `.env`

### Erro: "Invalid API key" (TMDB)

O token TMDB está inválido. Pegue um novo em:
https://www.themoviedb.org/settings/api

### Script não faz nada

Verifique se está na pasta correta:

```bash
cd MaxxControl/maxxcontrol-x-sistema
pwd  # Deve mostrar: .../MaxxControl/maxxcontrol-x-sistema
```

---

## 📊 COMPARAÇÃO: SQL vs Script

### Método SQL (Manual)
- ❌ Precisa copiar e colar código
- ❌ Dados podem estar desatualizados
- ❌ Pode dar erro "Failed to fetch"
- ❌ Não mostra progresso
- ✅ Mais rápido (se funcionar)

### Método Script (Automático)
- ✅ Busca dados atualizados do TMDB
- ✅ Insere automaticamente
- ✅ Mostra progresso em tempo real
- ✅ Trata erros automaticamente
- ❌ Precisa Node.js instalado

---

## 🎯 QUANDO USAR CADA MÉTODO

### Use o SQL (populate_tmdb_mini.sql)
- Se você quer testar rápido
- Se não tem Node.js instalado
- Se quer apenas 5 conteúdos

### Use o Script (popular-conteudos-automatico.js)
- Se quer conteúdos atualizados
- Se quer popular muitos conteúdos (20+)
- Se quer automatizar o processo
- Se tem Node.js instalado

---

## 🔄 ATUALIZAR CONTEÚDOS

Para atualizar com novos filmes/séries populares:

```bash
node scripts/popular-conteudos-automatico.js
```

O script usa `upsert`, então:
- Conteúdos novos → Inseridos
- Conteúdos existentes → Atualizados

---

## 📝 ADICIONAR AO PACKAGE.JSON

Adicione este script no `package.json`:

```json
{
  "scripts": {
    "popular-conteudos": "node scripts/popular-conteudos-automatico.js"
  }
}
```

Depois use:

```bash
npm run popular-conteudos
```

---

## 🎉 RESULTADO

Após executar, você terá:

✅ 20 conteúdos populares no banco
✅ Galeria de banners funcionando
✅ Dados atualizados do TMDB
✅ Imagens em alta qualidade

**Acesse:**
https://maxxcontrol-frontend.onrender.com/banners

---

## 💡 DICAS

1. Execute o script periodicamente para manter conteúdos atualizados
2. Aumente a quantidade para ter mais opções na galeria
3. O script não duplica conteúdos (usa `tmdb_id` único)
4. Você pode executar várias vezes sem problemas

---

## 🔗 ARQUIVOS RELACIONADOS

- `scripts/popular-conteudos-automatico.js` - Script principal
- `scripts/populate-tmdb-content.js` - Script antigo (gera SQL)
- `database/migrations/populate_tmdb_mini.sql` - SQL manual (5 conteúdos)
- `database/migrations/populate_tmdb_simple.sql` - SQL manual (20 conteúdos)

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Executar o script
2. ✅ Verificar galeria de banners
3. ✅ Gerar alguns banners de teste
4. 🔄 Adicionar mais conteúdos se necessário
5. 🔄 Configurar execução automática (cron job)
