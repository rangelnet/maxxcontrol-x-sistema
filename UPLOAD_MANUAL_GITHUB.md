# 📤 GUIA: Upload Manual para GitHub

## ⚠️ ARQUIVOS QUE NÃO DEVEM SER ENVIADOS

Antes de fazer upload, você precisa **EXCLUIR** ou **NÃO SELECIONAR** estes arquivos/pastas:

### 🚫 NÃO ENVIAR:
- `.env` (contém senhas e chaves secretas)
- `maxxcontrol.db` (banco de dados local)
- `node_modules/` (pasta inteira - backend)
- `web/node_modules/` (pasta inteira - frontend)
- `.git/` (se existir)
- `*.log` (arquivos de log)

---

## 📋 PASSO A PASSO - UPLOAD MANUAL

### 1️⃣ Preparar os Arquivos

**Opção A - Criar uma cópia limpa:**
1. Crie uma nova pasta: `maxxcontrol-x-upload`
2. Copie TODOS os arquivos do projeto EXCETO os listados acima
3. Use essa pasta limpa para o upload

**Opção B - Usar a pasta atual:**
1. Certifique-se de NÃO selecionar as pastas/arquivos proibidos durante o upload

---

### 2️⃣ Acessar o GitHub

1. Abra: https://github.com/rangelnet/maxxcontrol-x
2. Faça login se necessário
3. Você verá a página do repositório vazio

---

### 3️⃣ Fazer Upload dos Arquivos

**MÉTODO 1 - Upload pela Interface Web:**

1. Clique em **"Add file"** → **"Upload files"**
2. Arraste TODA a pasta do projeto (exceto os arquivos proibidos)
3. OU clique em **"choose your files"** e selecione tudo

**⚠️ IMPORTANTE:** 
- O GitHub web tem limite de 100 arquivos por vez
- Se der erro, faça em partes (veja Método 2)

4. Na caixa de commit, escreva: `Initial commit - MaxxControl X`
5. Clique em **"Commit changes"**

---

**MÉTODO 2 - Upload em Partes (se Método 1 falhar):**

**Parte 1 - Arquivos raiz:**
1. Clique em **"Add file"** → **"Upload files"**
2. Selecione apenas os arquivos da raiz:
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `render.yaml`
   - `.gitignore`
   - `.gitattributes`
   - Todos os arquivos `.md`
3. Commit: `Add root files`

**Parte 2 - Pastas do Backend:**
1. Clique em **"Add file"** → **"Upload files"**
2. Arraste as pastas:
   - `config/`
   - `database/`
   - `middlewares/`
   - `services/`
   - `websocket/`
3. Commit: `Add backend folders`

**Parte 3 - Módulos:**
1. Clique em **"Add file"** → **"Upload files"**
2. Arraste a pasta `modules/` completa
3. Commit: `Add modules`

**Parte 4 - Frontend (SEM node_modules):**
1. Clique em **"Add file"** → **"Upload files"**
2. Arraste a pasta `web/` (certifique-se de NÃO incluir `web/node_modules/`)
3. Commit: `Add frontend`

**Parte 5 - Scripts:**
1. Clique em **"Add file"** → **"Upload files"**
2. Arraste a pasta `scripts/`
3. Commit: `Add scripts`

---

### 4️⃣ Verificar o Upload

Após o upload, verifique se estes arquivos estão no GitHub:

✅ **Devem estar presentes:**
- `server.js`
- `package.json`
- `render.yaml`
- `.gitignore`
- Todas as pastas: `config/`, `database/`, `modules/`, `web/`, etc.

❌ **NÃO devem estar:**
- `.env`
- `maxxcontrol.db`
- `node_modules/`
- `web/node_modules/`

---

## 🎯 PRÓXIMOS PASSOS (Após Upload)

Quando terminar o upload, me avise e vamos:

1. ✅ Verificar se tudo foi enviado corretamente
2. 🚀 Fazer deploy no Render.com
3. 🔧 Configurar as variáveis de ambiente
4. 🌐 Colocar o sistema online

---

## 💡 DICAS

- **Conexão lenta?** Faça upload em partes (Método 2)
- **Erro de limite?** Divida em mais partes menores
- **Dúvida sobre arquivo?** Se não tem certeza, NÃO envie o `.env` e `node_modules/`

---

## 🆘 PROBLEMAS COMUNS

**"Repository name already exists"**
- Normal! O repositório já existe, você só vai adicionar arquivos nele

**"File too large"**
- Provavelmente tentou enviar `node_modules/`
- Não envie essa pasta!

**"Too many files"**
- Use o Método 2 (upload em partes)

---

## ✅ CHECKLIST FINAL

Antes de fazer deploy, confirme:

- [ ] Arquivos enviados para GitHub
- [ ] `.env` NÃO foi enviado
- [ ] `node_modules/` NÃO foi enviado
- [ ] `maxxcontrol.db` NÃO foi enviado
- [ ] Todos os arquivos `.md` foram enviados
- [ ] Pasta `web/` foi enviada (sem node_modules)
- [ ] Pasta `modules/` foi enviada completa

---

🚀 **Quando terminar, me avise que vamos para o deploy!**
