# 🔍 Diagnóstico: Tela de Servidores IPTV Carregando Infinitamente

## ✅ Problema Identificado

A tela de Multi-Servidor IPTV fica carregando porque:

1. **Endpoint está protegido** - Requer autenticação JWT
2. **Token pode estar ausente ou expirado** - Usuário precisa estar logado

## 🎯 Solução Implementada

### Melhorias no Frontend

1. **Logs detalhados** para debug:
   ```javascript
   🔄 Carregando servidores...
   🔑 Token presente: true/false
   ✅ Servidores carregados: 3
   ```

2. **Detecção de sessão expirada**:
   - Se erro 401, redireciona automaticamente para login
   - Mostra mensagem clara: "Sessão expirada. Por favor, faça login novamente."

3. **UI de loading melhorada**:
   - Spinner animado
   - Orientação para verificar console (F12)

### Arquivos Modificados

- `web/src/pages/ServersManagement.jsx` - Logs e tratamento de erro

## 🧪 Como Testar

### Passo 1: Iniciar o Backend

```bash
cd maxxcontrol-x-sistema
npm start
```

Aguarde até ver:
```
🚀 MaxxControl X API rodando na porta 3000
✅ Banco de dados PostgreSQL conectado
```

### Passo 2: Iniciar o Frontend (em outro terminal)

```bash
cd maxxcontrol-x-sistema/web
npm run dev
```

Aguarde até ver:
```
VITE ready in XXX ms
Local: http://localhost:5173
```

### Passo 3: Fazer Login

1. Acesse: http://localhost:5173/login
2. Use as credenciais:
   - **Email**: admin@maxxcontrol.com
   - **Senha**: Admin@123
3. Clique em "Entrar"

### Passo 4: Acessar Tela de Servidores

1. No menu lateral, clique em "Multi-Servidor IPTV"
2. Abra o console do navegador (F12)
3. Verifique os logs:

**Se funcionar:**
```
🔄 Carregando servidores...
🔑 Token presente: true
✅ Servidores carregados: 3
```

**Se der erro 401:**
```
❌ Erro ao carregar servidores: Error: Request failed with status code 401
Status: 401
```
→ Faça login novamente

**Se der erro de rede:**
```
❌ Erro ao carregar servidores: Network Error
```
→ Verifique se o backend está rodando

## 🔧 Teste Manual com Script

Se o backend estiver rodando, execute:

```powershell
cd maxxcontrol-x-sistema
.\testar-servidores-iptv.ps1
```

Este script testa:
1. ✅ Health check da API
2. ✅ Servidores no banco de dados
3. ✅ Endpoint público (sem autenticação)
4. ✅ Login e obtenção de token
5. ✅ Endpoint protegido (com autenticação)

## 📊 Verificar Dados no Banco

```bash
cd maxxcontrol-x-sistema
node -e "const pool = require('./config/database'); pool.query('SELECT * FROM servers').then(res => { console.log('Servidores:', JSON.stringify(res.rows, null, 2)); pool.end(); })"
```

Deve mostrar 3 servidores:
- Servidor Brasil (prioridade 1)
- Servidor EUA (prioridade 2)
- Servidor Europa (prioridade 3)

## 🐛 Troubleshooting

### Problema: "Token presente: false"

**Causa**: Usuário não está logado

**Solução**:
1. Faça logout (se necessário)
2. Faça login novamente
3. Verifique se o token foi salvo:
   ```javascript
   // No console do navegador (F12)
   console.log('Token:', localStorage.getItem('token'))
   ```

### Problema: "Status: 401"

**Causa**: Token inválido ou expirado

**Solução**:
1. Limpe o localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Faça login novamente

### Problema: "Network Error"

**Causa**: Backend não está rodando ou URL incorreta

**Solução**:
1. Verifique se o backend está rodando na porta 3000
2. Teste o health check:
   ```bash
   curl http://localhost:3000/health
   ```

### Problema: Tabela "servers" não existe

**Causa**: Migration não foi executada

**Solução**:
```bash
cd maxxcontrol-x-sistema
node database/migrations/run-iptv-multi-server-migrations.js
```

## 📝 Próximos Passos

Após confirmar que a tela está funcionando:

1. ✅ **Task 8**: Implementar popup de gerenciamento de dispositivo
2. ✅ **Task 11-14.1**: Já implementadas no app Android
3. 🔄 **Task 14.2**: Integrar IptvMonitorWorker com FullscreenPlayerScreen
4. 🔄 **Tasks 15-20**: Continuar implementação do app Android

## 🎯 Status Atual

### Backend (100% ✅)
- ✅ Migrations executadas
- ✅ Tabela `servers` criada com 3 servidores
- ✅ Controller implementado
- ✅ Rotas registradas
- ✅ Autenticação configurada

### Frontend (95% ✅)
- ✅ Tela de Servidores implementada
- ✅ Logs de debug adicionados
- ✅ Tratamento de erro 401
- ✅ UI de loading melhorada
- ❌ Popup de gerenciamento (Task 8 pendente)

### App Android (60% ✅)
- ✅ Modelos de dados (Task 11)
- ✅ Repositório IPTV (Task 12)
- ✅ Serviço de teste (Task 13)
- ✅ WorkManager (Task 14.1)
- ❌ Integração com player (Task 14.2)
- ❌ Tasks 15-20 pendentes

## 📞 Suporte

Se o problema persistir após seguir este guia:

1. Verifique os logs do backend no terminal
2. Verifique os logs do frontend no console (F12)
3. Execute o script de teste: `.\testar-servidores-iptv.ps1`
4. Compartilhe os logs para análise
