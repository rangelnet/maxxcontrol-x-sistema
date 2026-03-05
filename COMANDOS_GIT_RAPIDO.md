# 🚀 COMANDOS GIT - GUIA RÁPIDO

## ⚡ DEPOIS DE INSTALAR O GIT

### 1️⃣ Abrir PowerShell
- Pressione `Win + X`
- Clique em "Windows PowerShell"

### 2️⃣ Navegar para a Pasta
```powershell
cd "R:\Users\Usuario\Documents\tv-maxx\maxxcontrol-x-sistema"
```

### 3️⃣ Verificar Status
```powershell
git status
```

**Você verá:**
- Arquivos modificados (em vermelho)
- Arquivos novos (em vermelho)

### 4️⃣ Adicionar Todos os Arquivos
```powershell
git add .
```

### 5️⃣ Fazer Commit
```powershell
git commit -m "Implementar sistema de branding completo com SQLite"
```

### 6️⃣ Fazer Push
```powershell
git push origin main
```

**Se pedir usuário/senha:**
- Usuário: seu email do GitHub
- Senha: seu token de acesso pessoal (não a senha normal)

### 7️⃣ Pronto! ✅
```
Aguarde 2-3 minutos
Render fará deploy automático
```

---

## 🔑 SE PEDIR TOKEN DE ACESSO

### Criar Token:
1. Acesse: https://github.com/settings/tokens
2. Clique "Generate new token (classic)"
3. Marque: `repo` (todos os checkboxes)
4. Clique "Generate token"
5. Copie o token (começa com `ghp_...`)
6. Use como senha no git push

---

## 📋 COMANDOS COMPLETOS (COPIE E COLE)

```powershell
# 1. Navegar para a pasta
cd "R:\Users\Usuario\Documents\tv-maxx\maxxcontrol-x-sistema"

# 2. Verificar status
git status

# 3. Adicionar todos os arquivos
git add .

# 4. Fazer commit
git commit -m "Implementar sistema de branding completo com SQLite"

# 5. Fazer push
git push origin main
```

---

## ✅ CHECKLIST

- [ ] Git instalado
- [ ] PowerShell aberto
- [ ] Navegou para a pasta
- [ ] Executou `git add .`
- [ ] Executou `git commit`
- [ ] Executou `git push`
- [ ] Push bem-sucedido
- [ ] Render fazendo deploy

---

## 🎯 DEPOIS DO PUSH

### Monitorar Deploy:
1. Acesse: https://dashboard.render.com
2. Clique no projeto "maxxcontrol-x-sistema"
3. Clique em "Logs"
4. Aguarde "Your service is live 🎉"

### Testar:
```bash
# Backend
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current

# Frontend
https://maxxcontrol-frontend.onrender.com
```

---

## 🐛 PROBLEMAS COMUNS

### "git: command not found"
**Solução:** Feche e abra o PowerShell novamente

### "Permission denied"
**Solução:** Use token de acesso pessoal em vez de senha

### "fatal: not a git repository"
**Solução:** Verifique se está na pasta correta

### "Your branch is behind"
**Solução:** Execute `git pull origin main` antes do push

---

## 📞 PRECISA DE AJUDA?

Se algo der errado, me avise e eu te ajudo!

---

**Última atualização:** 26/02/2026
**Status:** ✅ PRONTO PARA USAR
