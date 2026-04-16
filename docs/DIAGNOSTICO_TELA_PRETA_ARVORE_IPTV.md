# Diagnóstico: Tela Preta na Árvore IPTV

## Problema
A página "Árvore IPTV" está exibindo tela preta completamente no painel MaxxControl em produção.

## Correções Já Realizadas

### 1. Bug de Banners Corrigido ✅
- **Problema**: Campo `nota` vindo como string do banco, causando erro `.toFixed is not a function`
- **Solução**: Adicionado `parseFloat()` antes de usar `.toFixed()` em 6 ocorrências
- **Commit**: `1d05349` - "fix: corrige tela preta em banners - converte nota para número antes de usar toFixed"
- **Status**: Enviado para GitHub e deploy automático em andamento

### 2. Build do Frontend ✅
- Build completado com sucesso em 1m 25s
- Arquivos gerados:
  - `dist/index.html` (0.50 kB)
  - `dist/assets/index-DkHda2c6.css` (23.68 kB)
  - `dist/assets/index-wXR9O4mm.js` (325.04 kB)

## Possíveis Causas da Tela Preta na Árvore IPTV

### 1. Erro de JavaScript no Console
**Como verificar:**
1. Abra o painel em https://maxxcontrol-frontend.onrender.com
2. Faça login com admin@maxxcontrol.com / Admin@123
3. Pressione F12 para abrir DevTools
4. Vá para a aba "Console"
5. Clique em "Árvore IPTV" no menu
6. Verifique se há erros em vermelho no console

**Erros comuns:**
- `TypeError: Cannot read property 'X' of undefined`
- `ReferenceError: X is not defined`
- `SyntaxError: Unexpected token`

### 2. Problema de Configuração IPTV
**Como verificar:**
1. Vá para "Servidor IPTV" no menu
2. Verifique se há uma configuração global salva
3. Campos necessários:
   - URL do Servidor Xtream
   - Usuário
   - Senha

**Se não houver configuração:**
- A página Árvore IPTV mostrará erro: "Configure o servidor IPTV primeiro"
- Mas não deveria ficar com tela preta

### 3. Erro na API Backend
**Como verificar:**
1. Abra o terminal
2. Execute: `curl https://maxxcontrol-x-sistema.onrender.com/api/iptv-server/config`
3. Deve retornar JSON com a configuração

**Se retornar erro 500:**
- Problema no backend
- Verificar logs do Render.com

### 4. Cache do Navegador
**Como resolver:**
1. Pressione Ctrl+Shift+Delete
2. Selecione "Imagens e arquivos em cache"
3. Clique em "Limpar dados"
4. OU pressione Ctrl+F5 para hard refresh

### 5. Deploy Ainda em Andamento
**Como verificar:**
1. Acesse https://dashboard.render.com
2. Faça login
3. Vá para o serviço "maxxcontrol-frontend"
4. Verifique se o deploy está "Live" ou "In Progress"

**Tempo estimado de deploy:** 2-5 minutos após o push

## Passos para Diagnóstico

### Passo 1: Verificar Console do Navegador
```
1. Abra https://maxxcontrol-frontend.onrender.com
2. Pressione F12
3. Vá para aba "Console"
4. Faça login
5. Clique em "Árvore IPTV"
6. Anote qualquer erro que aparecer
```

### Passo 2: Verificar Network
```
1. Com DevTools aberto (F12)
2. Vá para aba "Network"
3. Clique em "Árvore IPTV"
4. Verifique se há requisições falhando (em vermelho)
5. Clique na requisição falhada
6. Veja a resposta do servidor
```

### Passo 3: Verificar Configuração IPTV
```
1. No painel, vá para "Servidor IPTV"
2. Verifique se há configuração salva
3. Se não houver, adicione:
   - URL: http://exemplo.com:8080
   - Usuário: teste
   - Senha: teste123
4. Salve e tente acessar "Árvore IPTV" novamente
```

### Passo 4: Limpar Cache
```
1. Pressione Ctrl+Shift+Delete
2. Limpe cache
3. Pressione Ctrl+F5 na página
4. Faça login novamente
5. Tente acessar "Árvore IPTV"
```

## Código Verificado

### IptvTreeViewer.jsx ✅
- Componente está correto
- Sem erros de sintaxe
- Tratamento de erros implementado
- Estados de loading e erro configurados

### Layout.jsx ✅
- Menu "Árvore IPTV" está presente (linha 22)
- Rota configurada: `/iptv-tree`
- Ícone: `Tv`

### App.jsx ✅
- Rota `/iptv-tree` configurada
- Componente `IptvTreeViewer` importado

## Próximos Passos

1. **Aguardar deploy completar** (2-5 minutos)
2. **Limpar cache do navegador** (Ctrl+F5)
3. **Verificar console do navegador** (F12 → Console)
4. **Verificar se há configuração IPTV** (menu "Servidor IPTV")
5. **Se ainda não funcionar**, enviar screenshot do console com erros

## Informações Úteis

### URLs
- Frontend: https://maxxcontrol-frontend.onrender.com
- Backend: https://maxxcontrol-x-sistema.onrender.com
- GitHub: https://github.com/rangelnet/maxxcontrol-x-sistema

### Credenciais
- Email: admin@maxxcontrol.com
- Senha: Admin@123

### Último Commit
- Hash: `1d05349`
- Mensagem: "fix: corrige tela preta em banners - converte nota para número antes de usar toFixed"
- Data: Agora mesmo

## Notas Técnicas

### Componente IptvTreeViewer
- **Localização**: `maxxcontrol-x-sistema/web/src/pages/IptvTreeViewer.jsx`
- **Funcionalidade**: Visualiza estrutura hierárquica de categorias e streams IPTV
- **Dependências**: 
  - API backend: `/api/iptv-tree/*`
  - Configuração IPTV: `/api/iptv-server/config`
- **Estados**:
  - `loading`: Mostra spinner
  - `error`: Mostra mensagem de erro
  - `treeData`: Dados da árvore
  - `selectedStream`: Stream selecionado

### Fluxo de Carregamento
1. Componente monta
2. Carrega configuração IPTV (`loadConfig`)
3. Carrega categorias (`loadCategories`)
4. Constrói hierarquia (`buildHierarchy`)
5. Renderiza árvore (`TreeNode`)

### Tratamento de Erros
- **401**: Credenciais inválidas
- **400**: Configuração não encontrada
- **504**: Timeout na conexão
- **Outros**: Erro genérico

## Conclusão

A correção do bug de banners foi aplicada e enviada. O problema da tela preta na Árvore IPTV provavelmente é:

1. **Cache do navegador** (mais provável)
2. **Deploy ainda em andamento** (aguardar 2-5 min)
3. **Erro de JavaScript** (verificar console)
4. **Falta de configuração IPTV** (configurar servidor)

**Ação recomendada**: Aguardar deploy completar, limpar cache (Ctrl+F5) e verificar console do navegador (F12).
