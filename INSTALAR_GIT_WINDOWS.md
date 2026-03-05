# 🔧 INSTALAR E CONFIGURAR GIT NO WINDOWS

## 📥 PASSO 1: BAIXAR E INSTALAR

1. Acesse: https://git-scm.com/download/windows
2. Baixe o instalador (64-bit Git for Windows Setup)
3. Execute o instalador

## ⚙️ PASSO 2: CONFIGURAÇÕES IMPORTANTES NA INSTALAÇÃO

Durante a instalação, preste atenção nestas telas:

### Tela "Select Components"
✅ Marque: "Git Bash Here"
✅ Marque: "Git GUI Here"
✅ Marque: "Add a Git Bash Profile to Windows Terminal"

### Tela "Adjusting your PATH environment"
✅ Selecione: "Git from the command line and also from 3rd-party software"
(Esta é a opção MAIS IMPORTANTE!)

### Tela "Choosing the default editor"
✅ Selecione: "Use Visual Studio Code as Git's default editor"
(ou qualquer editor de sua preferência)

### Tela "Configuring the line ending conversions"
✅ Selecione: "Checkout Windows-style, commit Unix-style line endings"

### Demais opções
✅ Deixe as opções padrão

## 🔄 PASSO 3: REINICIAR O TERMINAL

IMPORTANTE: Após a instalação, você DEVE:

1. Fechar TODOS os terminais PowerShell abertos
2. Fechar o VS Code (se estiver usando)
3. Abrir novamente

## ✅ PASSO 4: VERIFICAR INSTALAÇÃO

Abra um novo PowerShell e execute:

```powershell
git --version
```

Deve retornar algo como: `git version 2.43.0.windows.1`

## 🔐 PASSO 5: CONFIGURAR GIT (PRIMEIRA VEZ)

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

## 🚀 PASSO 6: FAZER O PUSH

Agora sim, execute:

```powershell
cd "R:\Users\Usuario\Documents\MaxxControl\maxxcontrol-x-sistema"

git status

git add .

git commit -m "Implementar sistema completo de revendedores e clientes IPTV"

git push origin main
```

## ❌ SE AINDA NÃO FUNCIONAR

Se após reiniciar o terminal o comando `git` ainda não funcionar:

### Opção 1: Adicionar ao PATH manualmente

1. Pressione `Windows + R`
2. Digite: `sysdm.cpl` e pressione Enter
3. Vá na aba "Avançado"
4. Clique em "Variáveis de Ambiente"
5. Em "Variáveis do sistema", encontre "Path"
6. Clique em "Editar"
7. Clique em "Novo"
8. Adicione: `C:\Program Files\Git\cmd`
9. Clique em "OK" em todas as janelas
10. Reinicie o terminal

### Opção 2: Usar Git Bash

1. Clique com botão direito na pasta do projeto
2. Selecione "Git Bash Here"
3. Execute os comandos normalmente

### Opção 3: Usar caminho completo

```powershell
& "C:\Program Files\Git\bin\git.exe" --version
```

## 🎯 ALTERNATIVA: USAR GITHUB DESKTOP

Se preferir uma interface gráfica:

1. Baixe: https://desktop.github.com/
2. Instale e faça login
3. Adicione o repositório local
4. Faça commit e push pela interface

## 📞 PRECISA DE AJUDA?

Me avise qual erro está aparecendo e vou te ajudar!
