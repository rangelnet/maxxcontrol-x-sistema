# Diagnóstico Completo - Tela Preta no Gerador de Banners

## Problema
A página de Banners continua com tela preta mesmo após correções.

## Checklist de Verificação

### 1. Backend está rodando?
```bash
# Verificar se o servidor está online
curl http://localhost:3000/health

# Deve retornar:
# {"status":"online","timestamp":"...","service":"MaxxControl X API"}
```

### 2. API de conteúdos está respondendo?
```bash
# Testar endpoint de listagem
curl http://localhost:3000/api/content/list?limit=10

# Deve retornar JSON com array de conteúdos
```

### 3. Banco de dados tem conteúdos?
```sql
-- Executar no Supabase SQL Editor
SELECT COUNT(*) FROM conteudos WHERE ativo = true;
SELECT id, titulo, nota, poster_path FROM conteudos WHERE ativo = true LIMIT 5;
```

### 4. Frontend está buildado?
```bash
cd web
npm run build
```

### 5. Console do navegador mostra erros?
- Abrir DevTools (F12)
- Ir na aba Console
- Recarregar a página
- Copiar TODOS os erros que aparecem

### 6. Network tab mostra requisições falhando?
- Abrir DevTools (F12)
- Ir na aba Network
- Recarregar a página
- Verificar se `/api/content/list` retorna 200 OK
- Verificar o conteúdo da resposta

## Possíveis Causas

### Causa 1: Backend não está rodando
**Solução**: Iniciar o backend
```bash
npm start
# ou
npm run dev
```

### Causa 2: Banco de dados vazio
**Solução**: Importar conteúdos do TMDB
```bash
node scripts/popular-conteudos-automatico.js
```

### Causa 3: Erro de CORS
**Sintoma**: Console mostra erro de CORS
**Solução**: Verificar se CORS está habilitado no server.js (já está)

### Causa 4: Erro de SQL no backend
**Sintoma**: Backend retorna erro 500
**Solução**: Verificar logs do servidor

### Causa 5: Frontend não buildado
**Solução**: Fazer build do frontend
```bash
cd web
npm run build
```

### Causa 6: Cache do navegador
**Solução**: Limpar cache
- Ctrl + Shift + Delete
- Ou Ctrl + F5 para hard reload

## Script de Teste Rápido

Execute este script para testar tudo:

```bash
# 1. Testar health check
echo "=== TESTANDO HEALTH CHECK ==="
curl http://localhost:3000/health

# 2. Testar API de conteúdos
echo -e "\n\n=== TESTANDO API DE CONTEÚDOS ==="
curl http://localhost:3000/api/content/list?limit=5

# 3. Verificar se servidor está rodando
echo -e "\n\n=== VERIFICANDO PROCESSOS ==="
netstat -ano | findstr :3000
```

## Próximos Passos

1. Execute o script de teste acima
2. Copie TODOS os outputs
3. Abra o navegador em http://localhost:3000/banners
4. Abra o Console (F12)
5. Copie TODOS os erros do console
6. Me envie todas essas informações

## Correção Aplicada

Já foi corrigido o erro `.toFixed()` no arquivo `BannerGenerator.jsx`:
- Substituído `content.nota.toFixed(1)` por `(content.nota || 0).toFixed(1)`
- Isso previne erro quando `nota` é `null` ou `undefined`

## Verificação Final

Se ainda estiver com tela preta, o problema NÃO é o `.toFixed()`.
Precisamos verificar:
1. Se o backend está retornando dados
2. Se há outros erros JavaScript no console
3. Se o build do frontend está atualizado
