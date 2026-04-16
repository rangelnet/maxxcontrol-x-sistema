# 🚀 BRANDING - GUIA DE DEPLOYMENT

## 📋 CHECKLIST PRÉ-DEPLOYMENT

- ✅ Código implementado
- ✅ Banco de dados configurado
- ✅ Testes locais passando
- ✅ Variáveis de ambiente configuradas
- ✅ GitHub atualizado

---

## 🔄 PASSO 1: SINCRONIZAR COM GITHUB

### 1.1 Verificar Status

```bash
# Navegar para o diretório do projeto
cd /caminho/para/maxxcontrol-x-sistema

# Verificar status
git status
```

**Esperado:**
```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   .env
  modified:   server.js
  modified:   database/setup-sqlite.js
  modified:   web/src/App.jsx
  modified:   web/src/components/Layout.jsx
  
Untracked files:
  new file:   modules/branding/brandingController.js
  new file:   modules/branding/brandingRoutes.js
  new file:   web/src/pages/Branding.jsx
  new file:   BRANDING_SISTEMA_DETALHADO.md
  new file:   BRANDING_EXEMPLOS_PRATICOS.md
  new file:   BRANDING_DEPLOYMENT_GUIA.md
```

---

### 1.2 Adicionar Arquivos

```bash
# Adicionar todos os arquivos modificados
git add .

# Verificar o que será commitado
git status
```

---

### 1.3 Fazer Commit

```bash
git commit -m "Implementar sistema de branding completo com SQLite

- Criar controller de branding com CRUD
- Criar rotas de branding
- Criar página React de branding
- Adicionar menu item no painel
- Configurar banco de dados SQLite
- Adicionar templates pré-configurados
- Documentação completa"
```

---

### 1.4 Fazer Push

```bash
git push origin main
```

**Esperado:**
```
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 8 threads
Compressing objects: 100% (12/12), done.
Writing objects: 100% (12/12), 45.23 KiB | 5.65 MiB/s, done.
Total 12 (delta 3), reused 0 (delta 0), reused pack 0 (delta 0)
remote: Resolving deltas: 100% (3/3), done.
To https://github.com/rangelnet/maxxcontrol-x-sistema.git
   30e435a..a1b2c3d  main -> main
```

---

## 🔧 PASSO 2: VERIFICAR DEPLOYMENT NO RENDER

### 2.1 Acessar Dashboard Render

1. Acesse: https://dashboard.render.com
2. Faça login com sua conta
3. Selecione o projeto "maxxcontrol-x-sistema"

---

### 2.2 Monitorar Backend

**URL:** https://dashboard.render.com/services/srv-xxxxx

1. Clique em "Logs"
2. Aguarde o deploy começar (deve aparecer em segundos)
3. Procure por:
   ```
   ==> Cloning from https://github.com/rangelnet/maxxcontrol-x-sistema
   ==> Running build command 'npm install'
   ==> Build successful 🎉
   ==> Deploying...
   ==> Your service is live 🎉
   ```

**Tempo esperado:** 2-3 minutos

---

### 2.3 Monitorar Frontend

**URL:** https://dashboard.render.com/services/srv-xxxxx

1. Clique em "Logs"
2. Procure por:
   ```
   ==> Cloning from https://github.com/rangelnet/maxxcontrol-x-sistema
   ==> Running build command 'npm install && npm run build'
   ==> Build successful 🎉
   ==> Deploying...
   ==> Your service is live 🎉
   ```

**Tempo esperado:** 2-3 minutos

---

## ✅ PASSO 3: TESTAR EM PRODUÇÃO

### 3.1 Testar Backend

```bash
# Testar health check
curl https://maxxcontrol-x-sistema.onrender.com/health

# Esperado:
# {"status":"online","timestamp":"2026-02-26T22:50:00.000Z","service":"MaxxControl X API"}
```

---

### 3.2 Testar Endpoint de Branding

```bash
# Obter branding ativo
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current

# Esperado:
# {
#   "id": 1,
#   "banner_titulo": "TV Maxx",
#   "banner_subtitulo": "Seu Entretenimento",
#   "banner_cor_fundo": "#000000",
#   "banner_cor_texto": "#FF6A00",
#   ...
# }
```

---

### 3.3 Testar Frontend

1. Acesse: https://maxxcontrol-frontend.onrender.com
2. Faça login:
   - Email: `admin@maxxcontrol.com`
   - Senha: `Admin@123`
3. Clique em "🎨 Branding" no menu
4. Verifique se a página carrega corretamente

---

### 3.4 Testar Funcionalidade Completa

**No Painel:**
1. Altere o título para "Teste Branding"
2. Altere a cor de fundo para #FF0000
3. Altere a cor do texto para #FFFFFF
4. Clique em "Salvar Branding"
5. Aguarde confirmação

**Verificar:**
```bash
# Fazer requisição para confirmar
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current

# Deve retornar os novos valores
```

---

## 📱 PASSO 4: TESTAR NO ANDROID

### 4.1 Fazer Requisição

```java
// No Android, fazer requisição
BrandingService.fetchBranding(new BrandingService.BrandingCallback() {
    @Override
    public void onSuccess(BrandingData branding) {
        Log.d("Branding", "Título: " + branding.titulo);
        Log.d("Branding", "Cor Fundo: " + branding.corFundo);
        // Deve mostrar os valores atualizados
    }
    
    @Override
    public void onError(String error) {
        Log.e("Branding", "Erro: " + error);
    }
});
```

---

### 4.2 Verificar Aplicação

1. Abra o app Android
2. Verifique se as cores foram aplicadas
3. Verifique se o título foi atualizado
4. Verifique se o subtítulo foi atualizado

---

## 🔍 PASSO 5: VERIFICAR LOGS

### 5.1 Logs do Backend

```bash
# Acessar logs em tempo real
# https://dashboard.render.com/services/srv-xxxxx/logs

# Procurar por:
# ✅ Banco de dados SQLite conectado
# ✅ Servidor WebSocket iniciado
# ✅ MaxxControl X API rodando na porta 3001
```

---

### 5.2 Logs do Frontend

```bash
# Acessar logs em tempo real
# https://dashboard.render.com/services/srv-xxxxx/logs

# Procurar por:
# ✅ Build successful
# ✅ Your service is live
```

---

### 5.3 Logs do Navegador

1. Abra DevTools (F12)
2. Vá para "Console"
3. Procure por erros
4. Verifique requisições em "Network"

---

## 🚨 TROUBLESHOOTING DEPLOYMENT

### Problema 1: Build falha com erro de dependências

**Erro:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solução:**
```bash
# Localmente
npm install --legacy-peer-deps

# Fazer commit
git add package-lock.json
git commit -m "Fix: atualizar package-lock.json"
git push origin main
```

---

### Problema 2: Banco de dados não conecta

**Erro:**
```
❌ Erro ao conectar no banco de dados: ENOENT: no such file or directory
```

**Solução:**
1. Verificar se `USE_SQLITE=true` no `.env`
2. Verificar se `database/setup-sqlite.js` foi executado
3. Fazer push novamente

---

### Problema 3: Frontend não carrega

**Erro:**
```
Failed to fetch dynamically imported module
```

**Solução:**
```bash
# Limpar cache
rm -rf web/dist
rm -rf web/node_modules

# Reinstalar
cd web
npm install
npm run build

# Fazer commit
git add .
git commit -m "Fix: rebuild frontend"
git push origin main
```

---

### Problema 4: Endpoint retorna 404

**Erro:**
```
Cannot POST /api/branding
```

**Solução:**
1. Verificar se rota está registrada em `server.js`
2. Verificar se arquivo `modules/branding/brandingRoutes.js` existe
3. Verificar se não há erro de sintaxe

```bash
# Testar localmente
npm start

# Fazer requisição
curl http://localhost:3001/api/branding/current
```

---

### Problema 5: Autenticação falha

**Erro:**
```
{"error": "Token não fornecido"}
```

**Solução:**
1. Fazer login primeiro
2. Copiar token da resposta
3. Adicionar header: `Authorization: Bearer {token}`

---

## 📊 CHECKLIST PÓS-DEPLOYMENT

- ✅ Backend online
- ✅ Frontend online
- ✅ Endpoint `/api/branding/current` respondendo
- ✅ Página `/branding` carregando
- ✅ Formulário funcionando
- ✅ Salvamento de dados funcionando
- ✅ Android recebendo dados
- ✅ Cores sendo aplicadas no Android
- ✅ Sem erros nos logs
- ✅ Sem erros no console do navegador

---

## 🔄 ROLLBACK (Se necessário)

### Se algo der errado:

```bash
# Ver histórico de commits
git log --oneline

# Reverter para commit anterior
git revert HEAD

# Ou fazer reset (cuidado!)
git reset --hard HEAD~1

# Fazer push
git push origin main -f
```

---

## 📈 MONITORAMENTO CONTÍNUO

### Verificar Diariamente

1. **Backend Status:**
   ```bash
   curl https://maxxcontrol-x-sistema.onrender.com/health
   ```

2. **Branding Endpoint:**
   ```bash
   curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current
   ```

3. **Frontend:**
   - Acessar https://maxxcontrol-frontend.onrender.com
   - Fazer login
   - Verificar página de branding

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Fazer push para GitHub
2. ✅ Aguardar deploy automático
3. ✅ Testar em produção
4. ✅ Testar no Android
5. ✅ Documentar qualquer problema
6. ✅ Monitorar logs

---

## 📞 SUPORTE

**Se algo der errado:**

1. Verificar logs no Render Dashboard
2. Verificar console do navegador (F12)
3. Verificar logcat do Android
4. Fazer rollback se necessário
5. Contactar suporte

---

## 📝 NOTAS IMPORTANTES

- ⚠️ Não fazer push sem testar localmente
- ⚠️ Sempre fazer backup antes de mudanças grandes
- ⚠️ Verificar logs após cada deploy
- ⚠️ Testar em staging antes de produção
- ⚠️ Manter `.env` seguro (nunca fazer commit)

---

**Última atualização:** 26/02/2026
**Status:** ✅ PRONTO PARA DEPLOYMENT
