# 🚀 EXECUTAR AGORA - POPULAR CONTEÚDOS

## ✅ SUA API KEY FOI CONFIGURADA!

```
TMDB_API_KEY = 7bc56e27708a9d2069fc999d44a6be0a
```

---

## ⚡ EXECUTE AGORA (3 COMANDOS)

Abra o terminal e execute:

```bash
# 1. Ir para a pasta
cd MaxxControl/maxxcontrol-x-sistema

# 2. Instalar dependências (só precisa fazer uma vez)
npm install axios @supabase/supabase-js dotenv

# 3. Executar o script
node scripts/popular-conteudos-automatico.js
```

---

## 🎬 O QUE VAI ACONTECER

O script vai:

1. ✅ Conectar no TMDB com sua API Key
2. ✅ Buscar 10 filmes populares
3. ✅ Buscar 10 séries populares
4. ✅ Inserir tudo no Supabase automaticamente
5. ✅ Mostrar progresso em tempo real

**Tempo estimado:** 1-2 minutos

---

## 📊 RESULTADO ESPERADO

```
╔════════════════════════════════════════════════════════╗
║  🎬 POPULAR CONTEÚDOS AUTOMATICAMENTE                 ║
╚════════════════════════════════════════════════════════╝

📊 Configurações:
  • TMDB API Key: 7bc56e2770...
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
  ... (mais 7 filmes)

📺 Inserindo séries no banco...
  ✓ A Casa do Dragão (2022)
  ✓ The Last of Us (2023)
  ✓ Stranger Things (2016)
  ... (mais 7 séries)

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

## 🎯 DEPOIS DE EXECUTAR

1. Acesse: https://maxxcontrol-frontend.onrender.com/banners
2. Você verá 20 capas de filmes e séries
3. Clique em qualquer capa
4. Escolha o tamanho do banner
5. Banner será gerado e baixado automaticamente!

---

## 🚨 SE DER ERRO

### Erro: "Cannot find module 'axios'"

```bash
npm install axios @supabase/supabase-js dotenv
```

### Erro: "Erro de conexão com Supabase"

Verifique se o `.env` tem as credenciais corretas do Supabase.

### Erro: "Invalid API key" (TMDB)

Sua API Key está correta! Se der esse erro, pode ser:
- Limite de requisições atingido (aguarde 10 segundos)
- API Key não ativada (verifique no TMDB)

### Script não executa

Certifique-se de estar na pasta correta:

```bash
cd MaxxControl/maxxcontrol-x-sistema
pwd  # Deve mostrar: .../MaxxControl/maxxcontrol-x-sistema
```

---

## 🔄 ALTERNATIVA: SQL MANUAL

Se o script não funcionar, use o método SQL:

1. Acesse: https://supabase.com/dashboard
2. Projeto: mmfbirjrhrhobbnzfffe
3. SQL Editor → New Query
4. Cole o código do arquivo `populate_tmdb_mini.sql`
5. Clique em RUN

**Guia:** `RESOLVER_GALERIA_VAZIA.md`

---

## 📝 COMANDOS RESUMIDOS

```bash
# Tudo em uma linha (copie e cole)
cd MaxxControl/maxxcontrol-x-sistema && npm install axios @supabase/supabase-js dotenv && node scripts/popular-conteudos-automatico.js
```

---

## ✅ CHECKLIST

- [ ] Abri o terminal
- [ ] Executei `cd MaxxControl/maxxcontrol-x-sistema`
- [ ] Executei `npm install axios @supabase/supabase-js dotenv`
- [ ] Executei `node scripts/popular-conteudos-automatico.js`
- [ ] Vi mensagem de sucesso
- [ ] Acessei a galeria de banners
- [ ] Vejo 20 capas
- [ ] Testei gerar um banner

---

## 🎉 PRONTO!

Sua API Key do TMDB está configurada e pronta para usar!

**Execute os 3 comandos acima e em 2 minutos você terá 20 conteúdos na galeria!** 🚀
