# 🚀 Alternativa SEM Git - Upload Manual

Se não quiser instalar Git, você pode fazer upload manual:

## Opção 1: GitHub Desktop (MAIS FÁCIL)

1. Baixe: https://desktop.github.com/
2. Instale e faça login
3. File → Add Local Repository
4. Selecione a pasta: `R:\Users\Usuario\Documents\MaxxControl`
5. Clique em "Publish repository"
6. Pronto! Código no GitHub

---

## Opção 2: Upload via Web (GitHub.com)

1. Acesse: https://github.com/rangelnet/maxxcontrol-x
2. Clique em "uploading an existing file"
3. Arraste TODOS os arquivos da pasta
4. Commit changes
5. Pronto!

⚠️ **Atenção:** NÃO faça upload do arquivo `.env` (tem senhas!)

---

## Opção 3: VS Code (se tiver instalado)

1. Abra a pasta no VS Code
2. Clique no ícone de Source Control (Ctrl+Shift+G)
3. Clique em "Initialize Repository"
4. Clique em "Publish to GitHub"
5. Selecione público ou privado
6. Pronto!

---

## 📋 Arquivos para NÃO fazer upload

- `.env` (contém senhas!)
- `node_modules/` (muito grande)
- `maxxcontrol.db` (banco local)
- `*.log` (logs)

O arquivo `.gitignore` já está configurado para ignorar esses arquivos automaticamente.

---

## 🚀 Depois do Upload

Siga o arquivo `DEPLOY_RENDER.md` para fazer o deploy!
