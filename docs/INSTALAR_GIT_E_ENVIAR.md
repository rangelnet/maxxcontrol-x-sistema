# 🔧 INSTALAR GIT E ENVIAR CÓDIGO

## 📥 PASSO 1: BAIXAR E INSTALAR GIT

**1. Baixe o Git para Windows:**
```
https://git-scm.com/download/win
```

**2. Execute o instalador**
- Clique em "Next" em tudo
- Deixe as opções padrão
- Clique em "Install"
- Clique em "Finish"

---

## ✅ PASSO 2: VERIFICAR SE INSTALOU

**1. Abra o PowerShell ou CMD**
- Pressione `Windows + R`
- Digite: `powershell`
- Pressione Enter

**2. Digite:**
```bash
git --version
```

Deve aparecer algo como: `git version 2.43.0`

---

## 🔐 PASSO 3: CONFIGURAR GIT

**No PowerShell, digite estes comandos (um por vez):**

```bash
git config --global user.name "Seu Nome"
```

```bash
git config --global user.email "seu-email@exemplo.com"
```

(Use o mesmo email da sua conta do GitHub)

---

## 📤 PASSO 4: ENVIAR PASTA WEB PARA O GITHUB

**1. Navegue até a pasta do projeto:**
```bash
cd R:\Users\Usuario\Documents\MaxxControl\maxxcontrol-x
```

**2. Inicialize o Git (se ainda não foi feito):**
```bash
git init
```

**3. Adicione o repositório remoto:**
```bash
git remote add origin https://github.com/rangelnet/maxxcontrol-x-sistema.git
```

**4. Baixe as mudanças do GitHub:**
```bash
git pull origin main
```

**5. Adicione a pasta web:**
```bash
git add web/
```

**6. Faça o commit:**
```bash
git commit -m "Add web folder"
```

**7. Envie para o GitHub:**
```bash
git push origin main
```

**8. O GitHub vai pedir suas credenciais:**
- Username: `rangelnet`
- Password: Use um **Personal Access Token** (não a senha normal)

---

## 🔑 CRIAR TOKEN DO GITHUB (SE PEDIR SENHA)

**1. Acesse:**
```
https://github.com/settings/tokens
```

**2. Clique em "Generate new token" → "Generate new token (classic)"**

**3. Configure:**
- Note: `MaxxControl Deploy`
- Expiration: `90 days`
- Marque: `repo` (todas as opções de repo)

**4. Clique em "Generate token"**

**5. COPIE O TOKEN** (você não vai ver ele de novo!)

**6. Use esse token como senha quando o Git pedir**

---

## 🚀 DEPOIS DE ENVIAR

**1. Verifique no GitHub:**
```
https://github.com/rangelnet/maxxcontrol-x-sistema
```

A pasta `web/` deve aparecer lá!

**2. Volte ao Render:**
- Clique em "Manual Deploy" → "Deploy latest commit"

**3. Aguarde o deploy (3-5 minutos)**

---

## 🆘 PROBLEMAS COMUNS

### "git: command not found"
- Feche e abra o PowerShell novamente
- Ou reinicie o computador

### "Permission denied"
- Use o Personal Access Token como senha
- Não use a senha normal do GitHub

### "fatal: not a git repository"
- Certifique-se de estar na pasta correta
- Execute `git init` primeiro

### "Updates were rejected"
```bash
git pull origin main --rebase
git push origin main
```

---

## 💡 ALTERNATIVA RÁPIDA - GITHUB DESKTOP

Se preferir interface gráfica:

**1. Baixe o GitHub Desktop:**
```
https://desktop.github.com/
```

**2. Instale e faça login**

**3. Clique em "Add" → "Add existing repository"**

**4. Selecione a pasta:**
```
R:\Users\Usuario\Documents\MaxxControl\maxxcontrol-x
```

**5. Clique em "Commit to main"**

**6. Clique em "Push origin"**

Pronto! Muito mais fácil! 😊

---

🚀 **Me avise quando terminar a instalação que eu te ajudo com os próximos passos!**
