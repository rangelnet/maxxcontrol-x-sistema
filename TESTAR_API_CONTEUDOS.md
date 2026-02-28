# 🔍 TESTAR API DE CONTEÚDOS

## Problema
A galeria de banners não está mostrando nada.

## Possíveis Causas

1. **API não está retornando dados**
2. **Frontend não está fazendo a requisição correta**
3. **Dados não foram inseridos no banco correto**
4. **Erro de CORS ou autenticação**

## Testes para Fazer

### 1. Verificar se os dados estão no Supabase

No Supabase SQL Editor, execute:

```sql
SELECT COUNT(*) FROM conteudos;
SELECT * FROM conteudos LIMIT 5;
```

Deve retornar 20 conteúdos.

### 2. Testar a API diretamente

Abra o navegador e acesse:

```
https://maxxcontrol-x-api.onrender.com/api/content/list
```

Ou use curl:

```bash
curl https://maxxcontrol-x-api.onrender.com/api/content/list
```

**Esperado:** JSON com array de conteúdos

**Se der erro 401:** A rota precisa de autenticação

### 3. Verificar o Console do Navegador

1. Abra: https://maxxcontrol-frontend.onrender.com/banners
2. Pressione F12 (DevTools)
3. Vá na aba "Console"
4. Veja se tem erros em vermelho

**Erros comuns:**
- `401 Unauthorized` → Problema de autenticação
- `404 Not Found` → Rota não existe
- `CORS error` → Problema de CORS
- `Network error` → API offline

### 4. Verificar a aba Network

1. F12 → Aba "Network"
2. Recarregue a página (Ctrl+R)
3. Procure por requisição para `/api/content/list`
4. Clique nela e veja:
   - Status Code (deve ser 200)
   - Response (deve ter os conteúdos)

## Soluções

### Se a API retorna vazio

A rota pode estar com autenticação. Vamos remover o `authMiddleware` da rota `/list`:

**Arquivo:** `modules/content/contentRoutes.js`

Mudar de:
```javascript
router.get('/list', authMiddleware, contentController.listarConteudos);
```

Para:
```javascript
router.get('/list', contentController.listarConteudos);
```

### Se os dados não estão no Supabase

Execute novamente o SQL:
```sql
SELECT COUNT(*) FROM conteudos;
```

Se retornar 0, execute novamente o arquivo `EXECUTAR_ESTE_SQL.sql`

### Se o frontend não está chamando a API

Verifique o arquivo `BannerGenerator.jsx` na função `loadContents()`:

```javascript
const loadContents = async () => {
  try {
    const response = await api.get('/api/content/list?limit=100')
    setContents(response.data.conteudos || [])
  } catch (error) {
    console.error('Erro ao carregar conteúdos:', error)
  }
}
```

## Comandos Rápidos

### Verificar logs da API (Render)

1. Acesse: https://dashboard.render.com
2. Selecione o serviço `maxxcontrol-x-api`
3. Vá em "Logs"
4. Veja se tem erros

### Reiniciar a API

No Render Dashboard:
1. Selecione `maxxcontrol-x-api`
2. Clique em "Manual Deploy" → "Clear build cache & deploy"

## Próximos Passos

1. ✅ Execute os testes acima
2. ✅ Identifique qual é o problema
3. ✅ Me avise o resultado para eu corrigir

---

**Dica:** O mais provável é que a rota `/list` esteja com autenticação e o frontend não está enviando o token.
