# Diagnóstico: Tela Preta no Gerador de Banners

## Problema
A página de Banners continua exibindo tela preta mesmo após correções.

## Verificações Necessárias

### 1. Verificar Console do Navegador
Abra o DevTools (F12) e vá para a aba Console. Procure por:
- Erros JavaScript (vermelho)
- Erros de rede (Network tab)
- Mensagens de erro da API

### 2. Testar Endpoints da API

#### Teste 1: Listar Conteúdos
```bash
curl http://localhost:3001/api/content/list
```

Ou no navegador:
```
http://localhost:3001/api/content/list
```

**Resposta esperada:**
```json
{
  "conteudos": [...]
}
```

#### Teste 2: Listar Banners
```bash
curl http://localhost:3001/api/banners/list
```

**Resposta esperada:**
```json
{
  "banners": [...]
}
```

### 3. Verificar se o Servidor Está Rodando

```bash
# No diretório maxxcontrol-x-sistema
npm start
```

Deve mostrar:
```
Server running on port 3001
```

### 4. Verificar Banco de Dados

#### Verificar se a tabela conteudos existe:
```sql
SELECT * FROM conteudos LIMIT 5;
```

#### Verificar se a tabela banners existe:
```sql
SELECT * FROM banners LIMIT 5;
```

### 5. Verificar Logs do Servidor

Quando acessar a página de Banners, o servidor deve mostrar:
```
GET /api/content/list?limit=100
GET /api/content/list?limit=10
GET /api/banners/list
```

Se houver erro, verá:
```
❌ Erro ao listar conteúdos: [mensagem de erro]
```

## Possíveis Causas

### Causa 1: Servidor não está rodando
**Solução:** Iniciar o servidor com `npm start`

### Causa 2: Porta incorreta
**Verificar:** O frontend está tentando conectar em `http://localhost:3001`?
**Arquivo:** `web/src/services/api.js`

### Causa 3: Tabela não existe
**Solução:** Executar migrations
```bash
node database/setup-supabase.js
```

### Causa 4: CORS bloqueando requisições
**Sintoma:** Erro no console: "CORS policy"
**Solução:** Verificar configuração CORS no server.js

### Causa 5: Erro JavaScript não capturado
**Sintoma:** Tela preta sem mensagem de erro
**Solução:** Adicionar error boundary no React

### Causa 6: Rota não registrada
**Verificar:** server.js tem as rotas registradas?
```javascript
app.use('/api/content', require('./modules/content/contentRoutes'));
app.use('/api/banners', require('./modules/banners/bannerRoutes'));
```

## Passos de Diagnóstico

1. **Abrir DevTools (F12)**
   - Ir para aba Console
   - Ir para aba Network
   - Recarregar a página

2. **Verificar erros no Console**
   - Se houver erro JavaScript, anotar a mensagem completa
   - Se houver erro de rede, verificar status code (404, 500, etc)

3. **Verificar Network tab**
   - Procurar requisições para `/api/content/list` e `/api/banners/list`
   - Verificar status code (200 = OK, 404 = não encontrado, 500 = erro servidor)
   - Clicar na requisição e ver a resposta

4. **Verificar logs do servidor**
   - Terminal onde o servidor está rodando
   - Procurar por erros ou mensagens de log

## Teste Rápido

Execute este comando para testar se a API está funcionando:

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/api/content/list" -Method GET
```

Se retornar erro 404 ou 500, o problema está no backend.
Se retornar 200 com dados, o problema está no frontend.

## Próximos Passos

Após executar os testes acima, forneça:
1. Mensagens de erro do console do navegador
2. Status code das requisições (Network tab)
3. Logs do servidor
4. Resultado dos testes de API

Com essas informações, poderei identificar a causa exata do problema.
