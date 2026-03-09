# 🔥 TESTE DO SERVIDOR DE PRODUÇÃO (RENDER.COM)

## URLs de Produção

- **Backend**: https://maxxcontrol-x-sistema.onrender.com
- **Frontend**: https://maxxcontrol-frontend.onrender.com
- **Painel Banners**: https://maxxcontrol-x-sistema.onrender.com/banners

---

## ✅ PASSO 1: Testar se o servidor está online

Abra este link no navegador:
```
https://maxxcontrol-x-sistema.onrender.com/health
```

**Deve retornar**:
```json
{"status":"online","timestamp":"...","service":"MaxxControl X API"}
```

Se retornar erro ou não carregar, o servidor do Render está com problema.

---

## ✅ PASSO 2: Testar API de conteúdos

Abra este link no navegador:
```
https://maxxcontrol-x-sistema.onrender.com/api/content/list?limit=5
```

**Deve retornar** JSON com array de conteúdos:
```json
{
  "conteudos": [
    {
      "id": 1,
      "titulo": "Nome do Filme",
      "nota": 8.5,
      "poster_path": "/caminho.jpg",
      ...
    }
  ]
}
```

---

## ✅ PASSO 3: Abrir o Console do Navegador

1. Abra: https://maxxcontrol-x-sistema.onrender.com/banners
2. Pressione **F12** (ou Ctrl+Shift+I)
3. Vá na aba **Console**
4. Recarregue a página (**Ctrl+F5**)
5. **COPIE TODOS OS ERROS** que aparecerem em vermelho

---

## ✅ PASSO 4: Verificar Network Tab

1. Com o DevTools aberto (F12)
2. Vá na aba **Network**
3. Recarregue a página (Ctrl+F5)
4. Procure por requisições para `/api/content/list`
5. Clique nela e veja:
   - **Status**: Deve ser 200 OK
   - **Response**: Deve ter JSON com conteúdos

Se o status for 500, 404, ou outro erro, copie a resposta.

---

## 🔍 POSSÍVEIS PROBLEMAS NO RENDER

### Problema 1: Servidor "dormindo"
O Render coloca servidores gratuitos para dormir após inatividade.

**Solução**: Aguarde 30-60 segundos após acessar a URL pela primeira vez. O servidor vai "acordar".

### Problema 2: Build desatualizado
O frontend pode estar com build antigo (sem as correções do `.toFixed()`).

**Solução**: Forçar novo deploy no Render:
1. Vá no dashboard do Render
2. Clique em "Manual Deploy" > "Deploy latest commit"

### Problema 3: Banco de dados vazio
O Supabase pode não ter conteúdos.

**Solução**: Popular o banco via script (precisa rodar localmente conectado ao Supabase).

### Problema 4: Erro de CORS
O frontend pode estar tentando acessar de origem diferente.

**Sintoma**: Console mostra erro de CORS
**Solução**: Verificar configuração de CORS no server.js (já está configurado)

---

## 📋 CHECKLIST DE DIAGNÓSTICO

Execute estes testes e me envie os resultados:

- [ ] `/health` retorna status online?
- [ ] `/api/content/list` retorna JSON com conteúdos?
- [ ] Quantos conteúdos foram retornados?
- [ ] Console do navegador mostra algum erro?
- [ ] Network tab mostra requisições falhando?
- [ ] Qual é o erro EXATO que aparece no console?

---

## 🎯 PRÓXIMO PASSO

**Me envie**:
1. Screenshot ou texto do erro do Console (F12)
2. Resposta da URL `/api/content/list`
3. Se o `/health` está funcionando

Com essas informações vou identificar o problema real!
