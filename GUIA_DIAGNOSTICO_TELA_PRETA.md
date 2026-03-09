# 🔍 Guia de Diagnóstico: Tela Preta no Gerador de Banners

## ✅ Verificações Já Realizadas

1. ✅ Sintaxe do arquivo BannerGenerator.jsx está correta
2. ✅ Export default está presente
3. ✅ Imports estão corretos
4. ✅ Rota está registrada no App.jsx
5. ✅ Tratamento de erro foi adicionado
6. ✅ Backend contentController.js foi corrigido

## 🎯 Próximos Passos de Diagnóstico

### PASSO 1: Verificar se o Servidor Backend Está Rodando

Abra um terminal e execute:

```bash
cd maxxcontrol-x-sistema
npm start
```

**Resultado esperado:**
```
Server running on port 3001
Database connected
```

Se o servidor NÃO estiver rodando, esse é o problema!

---

### PASSO 2: Verificar se o Frontend Está Rodando

Abra OUTRO terminal e execute:

```bash
cd maxxcontrol-x-sistema/web
npm run dev
```

**Resultado esperado:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### PASSO 3: Testar a API Diretamente

#### Opção A: Usar o arquivo de teste HTML

1. Abra o arquivo `TESTE_BANNERS_SIMPLES.html` no navegador
2. Clique nos botões de teste
3. Veja se as APIs respondem

#### Opção B: Usar o navegador

Abra estas URLs no navegador:

1. http://localhost:3001/health
   - **Esperado:** `{"status":"ok"}`

2. http://localhost:3001/api/content/list
   - **Esperado:** `{"conteudos": [...]}`

3. http://localhost:3001/api/banners/list
   - **Esperado:** `{"banners": [...]}`

Se alguma dessas URLs retornar erro 404 ou 500, o problema está no backend!

---

### PASSO 4: Verificar Console do Navegador

1. Abra http://localhost:5173/banners
2. Pressione F12 para abrir DevTools
3. Vá para a aba **Console**
4. Procure por mensagens em VERMELHO

**Erros comuns:**

❌ `Failed to fetch` → Servidor backend não está rodando
❌ `CORS policy` → Problema de CORS
❌ `404 Not Found` → Rota não existe
❌ `500 Internal Server Error` → Erro no backend
❌ `Unexpected token` → Erro de sintaxe JavaScript

---

### PASSO 5: Verificar Network Tab

1. Com DevTools aberto (F12)
2. Vá para a aba **Network**
3. Recarregue a página (Ctrl+R)
4. Procure por requisições para:
   - `/api/content/list`
   - `/api/banners/list`

**Clique em cada requisição e veja:**
- Status Code (deve ser 200)
- Response (deve ter dados JSON)
- Headers (deve ter Content-Type: application/json)

---

### PASSO 6: Verificar Logs do Servidor

No terminal onde o servidor está rodando, você deve ver:

```
GET /api/content/list?limit=100 200 50ms
GET /api/content/list?limit=10 200 30ms
GET /api/banners/list 200 20ms
```

Se ver erros como:
```
❌ Erro ao listar conteúdos: relation "conteudos" does not exist
```

Significa que a tabela não existe no banco!

---

## 🔧 Soluções para Problemas Comuns

### Problema 1: Servidor não está rodando
**Solução:**
```bash
cd maxxcontrol-x-sistema
npm start
```

### Problema 2: Tabela não existe
**Solução:**
```bash
cd maxxcontrol-x-sistema
node database/setup-supabase.js
```

### Problema 3: Porta incorreta
**Verificar:** `web/src/services/api.js`
```javascript
baseURL: 'http://localhost:3001'  // Deve ser 3001
```

### Problema 4: CORS bloqueando
**Verificar:** `server.js` deve ter:
```javascript
const cors = require('cors');
app.use(cors());
```

### Problema 5: Sem conteúdos no banco
**Solução:**
```bash
cd maxxcontrol-x-sistema
node scripts/popular-conteudos-automatico.js
```

---

## 📊 Checklist de Diagnóstico

Marque cada item conforme verifica:

- [ ] Servidor backend está rodando (porta 3001)
- [ ] Frontend está rodando (porta 5173)
- [ ] http://localhost:3001/health retorna OK
- [ ] http://localhost:3001/api/content/list retorna dados
- [ ] http://localhost:3001/api/banners/list retorna dados
- [ ] Console do navegador NÃO tem erros vermelhos
- [ ] Network tab mostra requisições com status 200
- [ ] Logs do servidor NÃO mostram erros

---

## 🆘 Se Ainda Estiver com Tela Preta

Execute este comando e me envie o resultado:

```bash
cd maxxcontrol-x-sistema
node verificar-sintaxe-banner.js
```

E também me envie:
1. Screenshot do Console (F12 → Console)
2. Screenshot do Network tab (F12 → Network)
3. Logs do terminal do servidor
4. Resultado dos testes de API (TESTE_BANNERS_SIMPLES.html)

---

## 🎯 Teste Rápido Final

Execute este comando para testar tudo de uma vez:

```powershell
# Testar se o servidor está respondendo
Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET

# Testar API de conteúdos
Invoke-WebRequest -Uri "http://localhost:3001/api/content/list" -Method GET

# Testar API de banners
Invoke-WebRequest -Uri "http://localhost:3001/api/banners/list" -Method GET
```

Se TODOS retornarem status 200, o backend está OK e o problema está no frontend.
Se algum retornar erro, o problema está no backend.
