# Testar Endpoint de Servidores IPTV

## Problema Identificado

A tela de Multi-Servidor IPTV fica carregando infinitamente.

## Diagnóstico Realizado

✅ **Tabela `servers` existe** - 3 servidores cadastrados
✅ **Rotas registradas no server.js** - `/api/iptv` está configurado
✅ **Controller implementado** - `listAllServers()` funciona
✅ **Frontend configurado** - Axios com interceptor de token

⚠️ **Possível causa**: Token JWT não está sendo enviado ou está inválido

## Como Testar

### 1. Verificar se o usuário está logado

Abra o console do navegador (F12) e execute:

```javascript
console.log('Token:', localStorage.getItem('token'))
```

Se retornar `null`, o usuário não está logado.

### 2. Fazer login no painel

1. Acesse: http://localhost:3000/login
2. Use as credenciais:
   - Email: admin@maxxcontrol.com
   - Senha: Admin@123
3. Após login, verifique se o token foi salvo:

```javascript
console.log('Token após login:', localStorage.getItem('token'))
```

### 3. Testar endpoint diretamente

Com o token em mãos, teste via curl:

```bash
# Substitua SEU_TOKEN_AQUI pelo token do localStorage
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:3000/api/iptv/servers/all
```

Deve retornar:

```json
[
  {
    "id": 1,
    "name": "Servidor Brasil",
    "url": "http://servidor1.exemplo.com:8080",
    "region": "Brasil",
    "priority": 1,
    "status": "ativo",
    "users": 0,
    "created_at": "2026-03-15T00:07:10.378Z"
  },
  ...
]
```

### 4. Verificar logs do console

Após as melhorias implementadas, o console mostrará:

```
🔄 Carregando servidores...
🔑 Token presente: true
✅ Servidores carregados: 3
```

Se aparecer erro 401:

```
❌ Erro ao carregar servidores: Error: Request failed with status code 401
Status: 401
```

Significa que o token está inválido ou expirado. Faça login novamente.

## Melhorias Implementadas

1. **Logs detalhados** no `loadServers()`:
   - Verifica se token está presente
   - Mostra quantidade de servidores carregados
   - Exibe detalhes do erro (status, mensagem)

2. **Tratamento de erro 401**:
   - Detecta sessão expirada
   - Redireciona automaticamente para login

3. **Loading melhorado**:
   - Spinner animado
   - Mensagem orientando verificar console

## Próximos Passos

Se o problema persistir após fazer login:

1. Verificar se o middleware de autenticação está funcionando
2. Verificar se o JWT_SECRET está configurado no .env
3. Verificar logs do backend para erros de autenticação

## Teste Rápido (PowerShell)

```powershell
# Testar se o endpoint está respondendo (sem autenticação)
curl http://localhost:3000/api/iptv/servers

# Deve retornar apenas servidores ativos (público)
```

## Verificar Banco de Dados

```bash
cd maxxcontrol-x-sistema
node -e "const pool = require('./config/database'); pool.query('SELECT * FROM servers').then(res => { console.log('Servidores:', res.rows); pool.end(); })"
```
