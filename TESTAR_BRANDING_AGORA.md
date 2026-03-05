# 🧪 TESTAR BRANDING AGORA

## ⚡ Quick Start (5 minutos)

### Passo 1: Acessar o Painel
1. Abra: https://maxxcontrol-frontend.onrender.com
2. Faça login:
   - Email: `admin@maxxcontrol.com`
   - Senha: `Admin@123`

### Passo 2: Ir para Branding
1. Clique em "🎨 Branding" no menu lateral
2. Você deve ver o formulário de branding

### Passo 3: Alterar Cores
1. Altere a **Cor Primária** para: `#FF0000` (vermelho)
2. Altere a **Cor de Fundo** para: `#FFFF00` (amarelo)
3. Altere a **Cor do Texto** para: `#000000` (preto)
4. Clique em "Salvar Branding"

### Passo 4: Verificar Mudanças
1. Abra DevTools (F12)
2. Vá para "Console"
3. Execute:
```javascript
console.log(JSON.parse(localStorage.getItem('config')))
```

**Esperado:** Deve retornar as cores atualizadas

---

## 📱 Testar no App Android

### Passo 1: Compilar APK
```bash
cd TV-MAXX-PRO-Android
./gradlew assembleDebug
```

### Passo 2: Instalar
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Passo 3: Fazer Login
1. Abra o app
2. Faça login com: admin@maxxcontrol.com / Admin@123
3. Verifique se as cores foram aplicadas

### Passo 4: Verificar Mudanças
```bash
adb logcat | grep -E "Branding|Color"
```

---

## ✅ Checklist de Validação

- [ ] Painel carrega sem erros
- [ ] Login funciona
- [ ] Página de branding carrega
- [ ] Formulário responde aos cliques
- [ ] Cores são alteradas no preview
- [ ] Salvamento funciona
- [ ] App recebe as cores atualizadas
- [ ] Sem erros no console
- [ ] Sem erros no logcat

---

## 🎯 Resultado Esperado

Se tudo funcionar:

✅ **Branding dinâmico está 100% operacional!**

- Painel controla cores
- App recebe cores automaticamente
- Sem necessidade de republish
- Sistema pronto para produção

---

## 🐛 Troubleshooting

### Problema: Página de branding não carrega
**Solução:**
1. Verificar se está logado
2. Verificar console (F12) para erros
3. Recarregar página (F5)

### Problema: Salvamento não funciona
**Solução:**
1. Verificar se backend está online
2. Verificar se token é válido
3. Verificar console para erros

### Problema: App não recebe cores
**Solução:**
1. Fechar e reabrir app
2. Verificar se branding foi salvo no painel
3. Verificar logcat para erros

---

**Tempo Total:** ~10 minutos

