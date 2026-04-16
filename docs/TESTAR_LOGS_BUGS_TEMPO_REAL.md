# 🧪 TESTE: Sistema de Logs e Bugs em Tempo Real

## 📋 Pré-requisitos

Antes de começar, certifique-se de que:
- ✅ O painel está rodando no Render
- ✅ Você tem acesso ao painel web
- ✅ Você tem credenciais de login

---

## 🎯 TESTE 1: Verificar se a Página Existe

### Passo 1: Acessar o Painel
1. Abra o navegador
2. Acesse: `https://maxxcontrol-x-sistema.onrender.com`
3. Faça login com suas credenciais

### Passo 2: Navegar para Logs
1. No menu lateral esquerdo, procure o item **"Logs"** (ícone 📄)
2. Clique em **"Logs"**

### ✅ Resultado Esperado:
- A página deve carregar sem erros
- Você deve ver duas abas: **"Bugs"** e **"System Logs"**
- Deve haver filtros na parte superior

---

## 🎯 TESTE 2: Criar Bug de Teste via Console

### Passo 1: Abrir Console do Navegador
1. Pressione **F12** (ou Ctrl+Shift+I)
2. Vá na aba **"Console"**

### Passo 2: Executar Script de Teste
Cole e execute este código no console:

```javascript
// Criar um bug de teste
fetch('https://maxxcontrol-x-sistema.onrender.com/api/bug', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    stack_trace: 'java.lang.NullPointerException: Teste de bug em tempo real\n  at com.tvmaxx.pro.MainActivity.onCreate(MainActivity.kt:45)\n  at android.app.Activity.performCreate(Activity.java:7802)',
    modelo: 'TV Box X1 Pro',
    app_version: '2.0.0',
    device_id: null,
    severity: 'critical',
    type: 'crash',
    context: {
      screenName: 'HomeScreen',
      userAction: 'Clicou no botão Play'
    }
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Bug criado com sucesso:', data);
  alert('Bug criado! Aguarde 2 segundos e veja aparecer na tela.');
})
.catch(err => {
  console.error('❌ Erro ao criar bug:', err);
  alert('Erro ao criar bug. Verifique o console.');
});
```

### ✅ Resultado Esperado:
- Você deve ver a mensagem: **"✅ Bug criado com sucesso"** no console
- Um alerta deve aparecer dizendo que o bug foi criado

---

## 🎯 TESTE 3: Verificar Tempo Real (2 segundos)

### Passo 1: Observar a Página
1. Mantenha a página de Logs aberta
2. Certifique-se de estar na aba **"Bugs"**
3. Aguarde até **2 segundos**

### ✅ Resultado Esperado:
- Em até 2 segundos, o bug deve aparecer na lista
- O bug deve ter:
  - Badge vermelho com **"CRITICAL"**
  - Ícone 💥 (crash)
  - Modelo: **"TV Box X1 Pro"**
  - Versão: **"2.0.0"**
  - Tela: **"HomeScreen"**
  - Ação: **"Clicou no botão Play"**

---

## 🎯 TESTE 4: Testar Filtros

### Teste 4.1: Filtro por Severidade
1. No dropdown **"Todas Severidades"**, selecione **"Critical"**
2. Verifique se apenas bugs críticos aparecem

### Teste 4.2: Filtro por Tipo
1. No dropdown **"Todos Tipos"**, selecione **"Crash"**
2. Verifique se apenas crashes aparecem

### Teste 4.3: Busca por Texto
1. No campo de busca 🔍, digite: **"NullPointerException"**
2. Verifique se apenas bugs com esse texto aparecem

### Teste 4.4: Filtro por Status
1. No dropdown **"Não Resolvidos"**, selecione **"Todos"**
2. Verifique se todos os bugs aparecem (resolvidos e não resolvidos)

---

## 🎯 TESTE 5: Marcar Bug como Resolvido

### Passo 1: Resolver o Bug
1. Encontre o bug de teste que você criou
2. Clique no botão verde **"Marcar como Resolvido"**

### Passo 2: Verificar Mudança
1. O bug deve ganhar um badge verde **"✓ Resolvido"**
2. O botão "Marcar como Resolvido" deve desaparecer

### ✅ Resultado Esperado:
- O bug é marcado como resolvido instantaneamente
- A interface atualiza sem precisar recarregar a página

---

## 🎯 TESTE 6: Criar Múltiplos Bugs (Teste de Carga)

### Passo 1: Criar 5 Bugs de Uma Vez
Cole e execute este código no console:

```javascript
// Criar 5 bugs de teste com diferentes severidades
const severities = ['critical', 'error', 'warning', 'error', 'critical'];
const types = ['crash', 'navigation', 'player', 'api', 'network'];

severities.forEach((severity, index) => {
  setTimeout(() => {
    fetch('https://maxxcontrol-x-sistema.onrender.com/api/bug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        stack_trace: `Erro ${index + 1}: Teste de ${severity}`,
        modelo: `TV Box Teste ${index + 1}`,
        app_version: '2.0.0',
        device_id: null,
        severity: severity,
        type: types[index],
        context: {
          screenName: `Tela ${index + 1}`,
          userAction: `Ação ${index + 1}`
        }
      })
    })
    .then(res => res.json())
    .then(data => console.log(`✅ Bug ${index + 1} criado:`, data))
    .catch(err => console.error(`❌ Erro no bug ${index + 1}:`, err));
  }, index * 500); // Criar um bug a cada 500ms
});

console.log('🚀 Criando 5 bugs de teste...');
```

### Passo 2: Observar Tempo Real
1. Aguarde enquanto os bugs são criados
2. Observe a página atualizando em tempo real

### ✅ Resultado Esperado:
- Os 5 bugs devem aparecer na lista em até 2 segundos cada
- Cada bug deve ter cores diferentes baseadas na severidade:
  - **Critical** = Vermelho
  - **Error** = Laranja
  - **Warning** = Amarelo

---

## 🎯 TESTE 7: Verificar Stack Trace Expansível

### Passo 1: Expandir Stack Trace
1. Encontre qualquer bug na lista
2. Clique em **"Ver Stack Trace"**

### ✅ Resultado Esperado:
- O stack trace deve expandir
- Deve aparecer em um bloco de código formatado
- Deve ter scroll horizontal se for muito longo

---

## 🎯 TESTE 8: Testar Aba "System Logs"

### Passo 1: Mudar para System Logs
1. Clique na aba **"System Logs"**

### Passo 2: Criar Log de Teste
Cole e execute no console:

```javascript
// Criar um log de sistema
fetch('https://maxxcontrol-x-sistema.onrender.com/api/logs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    severity: 'info',
    type: 'system',
    message: 'Sistema iniciado com sucesso - Teste de log em tempo real',
    modelo: 'TV Box X1 Pro',
    app_version: '2.0.0',
    context: {
      screenName: 'Startup',
      userAction: 'App iniciado'
    }
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Log criado:', data);
  alert('Log criado! Aguarde 2 segundos.');
})
.catch(err => console.error('❌ Erro:', err));
```

### ✅ Resultado Esperado:
- O log deve aparecer na aba "System Logs" em até 2 segundos
- Deve ter badge azul **"INFO"**
- Deve ter ícone ⚙️ (system)

---

## 🎯 TESTE 9: Verificar Atualização Automática

### Passo 1: Monitorar Network
1. Abra o DevTools (F12)
2. Vá na aba **"Network"** (Rede)
3. Filtre por **"bug"** ou **"logs"**

### Passo 2: Observar Requisições
1. Aguarde e observe as requisições
2. Você deve ver requisições GET a cada 2 segundos

### ✅ Resultado Esperado:
- Requisições GET para `/api/bug` a cada 2 segundos
- Status 200 (sucesso)
- Resposta com lista de bugs atualizada

---

## 🎯 TESTE 10: Limpar Filtros

### Passo 1: Aplicar Vários Filtros
1. Selecione **"Critical"** em severidade
2. Selecione **"Crash"** em tipo
3. Digite algo na busca

### Passo 2: Limpar Tudo
1. Clique no botão **"Limpar Filtros"** (ícone ✕)

### ✅ Resultado Esperado:
- Todos os filtros devem voltar ao padrão
- Todos os bugs devem aparecer novamente

---

## 📊 CHECKLIST FINAL

Marque cada item conforme você testa:

- [ ] Página de Logs carrega sem erros
- [ ] Consegui criar bug via console
- [ ] Bug apareceu em até 2 segundos
- [ ] Filtro por severidade funciona
- [ ] Filtro por tipo funciona
- [ ] Busca por texto funciona
- [ ] Consegui marcar bug como resolvido
- [ ] Múltiplos bugs aparecem em tempo real
- [ ] Stack trace expande corretamente
- [ ] System Logs funciona
- [ ] Atualização automática a cada 2s funciona
- [ ] Botão "Limpar Filtros" funciona

---

## ❌ PROBLEMAS COMUNS

### Problema 1: Erro 401 (Unauthorized)
**Solução**: Faça logout e login novamente

### Problema 2: Bugs não aparecem
**Solução**: 
1. Verifique se o token está válido
2. Limpe o cache (Ctrl+Shift+R)
3. Verifique se as tabelas existem no banco

### Problema 3: Página não atualiza
**Solução**:
1. Verifique a aba Network se as requisições estão sendo feitas
2. Limpe o cache do navegador
3. Recarregue a página

### Problema 4: Console mostra erro CORS
**Solução**: Isso é normal se você estiver testando localmente. Use o painel em produção.

---

## 🎉 CONCLUSÃO

Se todos os testes passaram, o sistema de Logs e Bugs está funcionando perfeitamente em tempo real!

**Tempo de atualização**: 2 segundos  
**Status**: ✅ Funcionando  
**Próximo passo**: Integrar com o app Android para receber bugs reais

---

**Data do Teste**: _____________  
**Testado por**: _____________  
**Resultado**: ✅ Passou / ❌ Falhou
