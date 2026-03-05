# 🚀 TESTE SIMPLES: App Android → Painel (Tempo Real)

## 📱 O QUE VAMOS TESTAR

Vamos fazer o app Android enviar um bug/erro e ver aparecer no painel em **até 2 segundos**.

---

## ✅ PASSO 1: Abrir o Painel

1. Abra o navegador
2. Acesse: `https://maxxcontrol-x-sistema.onrender.com`
3. Faça login
4. Clique em **"Logs"** no menu lateral
5. Certifique-se de estar na aba **"Bugs"**
6. **DEIXE ESTA PÁGINA ABERTA** (não feche!)

---

## 📱 PASSO 2: Forçar um Erro no App Android

### Opção A: Forçar Crash Manualmente (Mais Fácil)

No código do app, adicione um botão de teste que força um erro:

```kotlin
// Em qualquer tela do app (ex: HomeScreen.kt)
Button(onClick = {
    // Forçar um erro de teste
    throw RuntimeException("TESTE: Bug enviado para o painel em tempo real!")
}) {
    Text("🐛 Testar Bug")
}
```

### Opção B: Usar o Sistema de Monitoramento Existente

O app já tem o `CrashMonitoringManager` configurado. Qualquer erro não tratado será enviado automaticamente.

Para testar, adicione este código em qualquer lugar do app:

```kotlin
// Exemplo: No MainActivity.kt ou HomeScreen.kt
try {
    // Simular um erro
    val teste: String? = null
    teste!!.length // Vai dar NullPointerException
} catch (e: Exception) {
    // O GlobalExceptionHandler vai capturar e enviar automaticamente
    throw e
}
```

---

## 🎯 PASSO 3: Executar o Teste

1. **Compile e instale o app** no dispositivo/emulador
2. **Abra o app**
3. **Clique no botão de teste** (ou execute a ação que causa o erro)
4. **O app vai crashar** (isso é esperado!)
5. **Volte para o navegador** com o painel aberto

---

## ⏱️ PASSO 4: Observar o Tempo Real

### O que vai acontecer:

```
App Android (Crash)
    ↓ (imediato)
ErrorReportSyncWorker envia para API
    ↓ (< 1 segundo)
POST /api/bug (Backend salva no banco)
    ↓ (até 2 segundos)
Painel atualiza automaticamente
    ↓
✅ BUG APARECE NA TELA!
```

### Você deve ver:

- 🔴 Badge vermelho **"CRITICAL"** ou **"ERROR"**
- 💥 Ícone de crash
- Stack trace com **"TESTE: Bug enviado para o painel"**
- Modelo do dispositivo
- Versão do app
- Data/hora atual

---

## 📊 VERIFICAÇÃO RÁPIDA

### ✅ Teste passou se:
- [ ] O bug apareceu no painel em até 2 segundos
- [ ] O stack trace está completo
- [ ] As informações do dispositivo estão corretas
- [ ] A data/hora está correta

### ❌ Teste falhou se:
- [ ] Bug não apareceu após 10 segundos
- [ ] Erro 401 (Unauthorized) no console
- [ ] Painel não está atualizando

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Problema 1: Bug não aparece

**Verificar:**
1. O app tem conexão com internet?
2. A URL da API está correta no app?
3. O token JWT está válido?

**Solução:**
```kotlin
// Verificar no logcat do Android Studio
// Procure por:
"ErrorReportSyncWorker" // Deve mostrar "Enviando relatório de erro"
"MaxxControlApiService" // Deve mostrar resposta 201 (sucesso)
```

### Problema 2: Erro 401 (Unauthorized)

**Causa:** Token JWT expirado ou inválido

**Solução:**
1. Faça logout no app
2. Faça login novamente
3. Tente enviar o bug novamente

### Problema 3: Painel não atualiza

**Solução:**
1. Pressione **Ctrl+Shift+R** (hard refresh)
2. Verifique se está na aba "Bugs"
3. Limpe os filtros (botão "Limpar Filtros")

---

## 🎬 TESTE ALTERNATIVO: Enviar Bug Manualmente

Se você não quer fazer o app crashar, pode enviar um bug manualmente:

### No código do app, adicione:

```kotlin
import com.tvmaxx.pro.core.monitoring.CrashMonitoringManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

// Em qualquer lugar do app
Button(onClick = {
    CoroutineScope(Dispatchers.IO).launch {
        try {
            // Criar um erro de teste
            val exception = RuntimeException("TESTE: Bug manual do app para o painel")
            
            // Enviar para o painel
            CrashMonitoringManager.reportError(
                exception = exception,
                severity = "error",
                type = "crash",
                context = mapOf(
                    "screenName" to "TesteScreen",
                    "userAction" to "Clicou no botão de teste"
                )
            )
            
            Log.d("TESTE", "Bug enviado com sucesso!")
        } catch (e: Exception) {
            Log.e("TESTE", "Erro ao enviar bug", e)
        }
    }
}) {
    Text("📤 Enviar Bug de Teste")
}
```

---

## 📈 TESTE DE MÚLTIPLOS BUGS

Para testar se o painel aguenta vários bugs ao mesmo tempo:

```kotlin
Button(onClick = {
    CoroutineScope(Dispatchers.IO).launch {
        repeat(5) { index ->
            delay(500) // Aguarda 500ms entre cada bug
            
            val exception = RuntimeException("TESTE: Bug #${index + 1}")
            CrashMonitoringManager.reportError(
                exception = exception,
                severity = if (index % 2 == 0) "critical" else "error",
                type = "crash"
            )
        }
    }
}) {
    Text("📤 Enviar 5 Bugs")
}
```

**Resultado esperado:** Todos os 5 bugs devem aparecer no painel em até 10 segundos.

---

## ✅ CHECKLIST FINAL

- [ ] Painel está aberto e logado
- [ ] App está compilado e instalado
- [ ] App tem conexão com internet
- [ ] Forcei um erro no app
- [ ] Bug apareceu no painel em até 2 segundos
- [ ] Informações do bug estão corretas
- [ ] Consigo marcar o bug como resolvido

---

## 🎉 SUCESSO!

Se o bug apareceu no painel em até 2 segundos, o sistema está funcionando perfeitamente em tempo real!

**Próximos passos:**
- Remover os botões de teste do app
- Deixar apenas o sistema automático de captura de erros
- Monitorar bugs reais dos usuários no painel

---

**Tempo estimado do teste:** 5 minutos  
**Dificuldade:** Fácil  
**Resultado:** Você verá bugs em tempo real! 🚀
