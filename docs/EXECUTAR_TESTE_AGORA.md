# ⚡ EXECUTAR TESTE AGORA - App → Painel (Tempo Real)

## 🎯 OBJETIVO

Ver um bug do app Android aparecer no painel web em **2 segundos**.

---

## 📋 PASSO A PASSO

### 1️⃣ ABRIR O PAINEL (1 minuto)

```
1. Abra o navegador
2. Acesse: https://maxxcontrol-x-sistema.onrender.com
3. Faça login
4. Clique em "Logs" no menu lateral
5. Certifique-se de estar na aba "Bugs"
6. DEIXE ESTA JANELA ABERTA
```

✅ **Pronto?** Painel está aberto e esperando bugs.

---

### 2️⃣ ADICIONAR BOTÃO DE TESTE NO APP (3 minutos)

Abra o arquivo: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/features/homer/HomeScreen.kt`

Adicione este botão dentro da tela (pode ser no final do `Column`):

```kotlin
// BOTÃO DE TESTE - REMOVER DEPOIS
Button(
    onClick = {
        // Forçar um crash de teste
        throw RuntimeException("🧪 TESTE: Bug enviado do app para o painel!")
    },
    modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp)
) {
    Text("🐛 TESTAR BUG (Vai crashar o app)")
}
```

---

### 3️⃣ COMPILAR E INSTALAR (2 minutos)

No Android Studio:

```
1. Clique em "Build" → "Make Project" (ou Ctrl+F9)
2. Aguarde compilar
3. Clique em "Run" (ou Shift+F10)
4. Aguarde instalar no dispositivo/emulador
```

---

### 4️⃣ EXECUTAR O TESTE (30 segundos)

```
1. Abra o app no dispositivo
2. Procure o botão "🐛 TESTAR BUG"
3. Clique no botão
4. O app vai CRASHAR (isso é esperado!)
5. VOLTE IMEDIATAMENTE para o navegador com o painel
```

---

### 5️⃣ OBSERVAR O RESULTADO (2 segundos)

No painel, você deve ver:

```
┌─────────────────────────────────────────────┐
│ 💥 CRITICAL                                 │
│ crash                          agora mesmo  │
│                                             │
│ Modelo: [Seu dispositivo]                  │
│ Versão: 1.0.0                              │
│                                             │
│ ▼ Ver Stack Trace                          │
│   RuntimeException: 🧪 TESTE: Bug enviado  │
│   do app para o painel!                    │
│                                             │
│ [Marcar como Resolvido]                    │
└─────────────────────────────────────────────┘
```

---

## ✅ TESTE PASSOU SE:

- [ ] Bug apareceu em até 2 segundos
- [ ] Badge vermelho "CRITICAL" está visível
- [ ] Stack trace mostra "🧪 TESTE: Bug enviado"
- [ ] Informações do dispositivo estão corretas
- [ ] Data/hora está correta

---

## ❌ TESTE FALHOU SE:

### Problema 1: Bug não aparece após 10 segundos

**Verificar:**
1. O app tem internet?
2. O dispositivo está conectado?

**Solução:**
```
1. Abra o Logcat no Android Studio
2. Procure por "ErrorReportSyncWorker"
3. Deve mostrar: "Enviando relatório de erro"
4. Se não aparecer, o app não está enviando
```

### Problema 2: Erro no Logcat

Se você ver no Logcat:
```
E/ErrorReportSyncWorker: Failed to sync report
```

**Causa:** Token JWT inválido ou URL errada

**Solução:**
1. Faça logout no app
2. Faça login novamente
3. Tente o teste novamente

---

## 🔍 VERIFICAÇÃO TÉCNICA (OPCIONAL)

### No Android Studio (Logcat):

Procure por estas mensagens:

```
D/CrashMonitoringManager: Exception captured successfully
D/ErrorReportSyncWorker: Starting error report sync...
D/ErrorReportSyncWorker: Found 1 unsynced reports
D/ErrorReportSyncWorker: Report 1 synced successfully
```

### No Navegador (Console F12):

Procure por requisições:

```
POST /api/bug → Status 201 (Created)
GET /api/bug → Status 200 (OK)
```

---

## 🧹 LIMPAR DEPOIS DO TESTE

Após confirmar que funciona:

1. Remova o botão de teste do `HomeScreen.kt`
2. Compile novamente
3. No painel, marque o bug como "Resolvido"

---

## 📊 FLUXO COMPLETO

```
App Android (Clique no botão)
    ↓ (imediato)
RuntimeException é lançada
    ↓ (< 100ms)
GlobalExceptionHandler captura
    ↓ (< 100ms)
ErrorReportQueue salva localmente
    ↓ (< 1s)
ErrorReportSyncWorker envia para API
    ↓ (< 500ms)
POST /api/bug (Backend salva)
    ↓ (até 2s)
Painel atualiza automaticamente
    ↓
✅ BUG APARECE!
```

**Tempo total esperado:** 2-3 segundos

---

## 🎉 SUCESSO!

Se o bug apareceu no painel, o sistema está funcionando perfeitamente!

**O que isso significa:**
- ✅ App Android está capturando erros
- ✅ App está enviando para o backend
- ✅ Backend está salvando no banco
- ✅ Painel está atualizando em tempo real
- ✅ Sistema completo funcionando!

---

**Tempo total do teste:** 5-7 minutos  
**Dificuldade:** Muito fácil  
**Resultado:** Você verá o bug em tempo real! 🚀
