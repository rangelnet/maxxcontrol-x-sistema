# 🔧 ADICIONAR GIT AO PATH DO WINDOWS

## 🎯 OBJETIVO
Fazer o Git funcionar em qualquer terminal (incluindo o do Kiro)

## 📋 MÉTODO 1: REINSTALAR GIT (MAIS FÁCIL)

1. **Baixe o Git novamente:**
   - https://git-scm.com/download/windows

2. **Durante a instalação, na tela "Adjusting your PATH environment":**
   - ✅ Selecione: **"Git from the command line and also from 3rd-party software"**
   - Esta opção adiciona o Git ao PATH automaticamente

3. **Reinicie o computador** (ou pelo menos feche todos os terminais e VS Code)

4. **Teste:**
   ```powershell
   git --version
   ```

---

## 📋 MÉTODO 2: ADICIONAR MANUALMENTE AO PATH

### Passo 1: Encontrar onde o Git está instalado

Abra o PowerShell e execute:

```powershell
Get-ChildItem "C:\Program Files" -Recurse -Filter "git.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 DirectoryName
```

Provavelmente está em: `C:\Program Files\Git\cmd`

### Passo 2: Adicionar ao PATH

1. Pressione `Windows + R`
2. Digite: `sysdm.cpl`
3. Pressione Enter
4. Vá na aba **"Avançado"**
5. Clique em **"Variáveis de Ambiente"**
6. Em **"Variáveis do sistema"**, encontre **"Path"**
7. Clique em **"Editar"**
8. Clique em **"Novo"**
9. Adicione: `C:\Program Files\Git\cmd`
10. Clique em **"Novo"** novamente
11. Adicione: `C:\Program Files\Git\bin`
12. Clique em **"OK"** em todas as janelas

### Passo 3: Reiniciar

- Feche TODOS os terminais
- Feche o VS Code / Kiro
- Abra novamente

### Passo 4: Testar

```powershell
git --version
```

---

## 📋 MÉTODO 3: USAR SCRIPT POWERSHELL

Execute este comando no PowerShell como **Administrador**:

```powershell
$gitPath = "C:\Program Files\Git\cmd"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$gitPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$gitPath", "Machine")
    Write-Host "Git adicionado ao PATH! Reinicie o terminal."
} else {
    Write-Host "Git já está no PATH!"
}
```

---

## ✅ VERIFICAR SE FUNCIONOU

Após qualquer método, teste:

```powershell
git --version
```

Se aparecer a versão (ex: `git version 2.43.0`), funcionou! ✅

---

## 🚀 DEPOIS QUE FUNCIONAR

Você poderá usar Git em qualquer lugar, inclusive no terminal do Kiro!

E eu poderei executar os comandos Git diretamente para você! 😊

---

## ❓ AINDA NÃO FUNCIONA?

Se mesmo depois de adicionar ao PATH não funcionar:

1. **Reinicie o computador** (não só o terminal)
2. Verifique se o caminho está correto
3. Tente usar Git Bash (clique direito na pasta > "Git Bash Here")

---

## 💡 ALTERNATIVA RÁPIDA

Enquanto isso, você pode:

1. Usar o arquivo `EXECUTAR_PUSH_AGORA.bat` (duplo clique)
2. Ou abrir Git Bash na pasta do projeto e executar os comandos

Ambos funcionam mesmo sem o Git no PATH! 😉
