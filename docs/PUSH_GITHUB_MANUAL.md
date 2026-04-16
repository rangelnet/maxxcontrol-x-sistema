# 📤 FAZER PUSH PARA GITHUB - GUIA MANUAL

## ⚠️ GIT NÃO ESTÁ INSTALADO

Você tem 3 opções:

---

## OPÇÃO 1: USAR GITHUB DESKTOP (Recomendado - Mais Fácil)

### Passo 1: Baixar GitHub Desktop
- Acesse: https://desktop.github.com
- Clique em "Download for Windows"
- Instale

### Passo 2: Abrir GitHub Desktop
- Abra o aplicativo
- Clique em "File" → "Clone Repository"
- Cole: `https://github.com/rangelnet/maxxcontrol-x-sistema`
- Escolha a pasta: `R:\Users\Usuario\Documents\tv-maxx\maxxcontrol-x-sistema`
- Clique "Clone"

### Passo 3: Fazer Commit
1. GitHub Desktop vai detectar as mudanças automaticamente
2. Na aba "Changes", você verá todos os arquivos modificados
3. Escreva a mensagem:
   ```
   Implementar sistema de branding completo com SQLite
   ```
4. Clique "Commit to main"

### Passo 4: Fazer Push
1. Clique em "Push origin"
2. Aguarde o upload
3. Pronto! ✅

---

## OPÇÃO 2: USAR GITHUB WEB (Mais Rápido)

### Passo 1: Acessar GitHub
- Acesse: https://github.com/rangelnet/maxxcontrol-x-sistema
- Faça login

### Passo 2: Upload de Arquivos
1. Clique em "Add file" → "Upload files"
2. Selecione os arquivos novos:
   - `modules/branding/brandingController.js`
   - `modules/branding/brandingRoutes.js`
   - `web/src/pages/Branding.jsx`
   - Todos os `BRANDING_*.md`

3. Clique "Commit changes"

### Passo 3: Editar Arquivos Modificados
1. Para cada arquivo modificado:
   - Clique no arquivo
   - Clique no ícone de lápis (Edit)
   - Copie o conteúdo novo
   - Cole no editor
   - Clique "Commit changes"

**Arquivos a modificar:**
- `.env`
- `server.js`
- `database/setup-sqlite.js`
- `web/src/App.jsx`
- `web/src/components/Layout.jsx`

---

## OPÇÃO 3: INSTALAR GIT (Mais Profissional)

### Passo 1: Baixar Git
- Acesse: https://git-scm.com/download/win
- Clique em "Click here to download"
- Instale com as opções padrão

### Passo 2: Abrir PowerShell
- Pressione `Win + X`
- Clique em "Windows PowerShell"

### Passo 3: Navegar para a Pasta
```powershell
cd "R:\Users\Usuario\Documents\tv-maxx\maxxcontrol-x-sistema"
```

### Passo 4: Fazer Commit
```powershell
git add .
git commit -m "Implementar sistema de branding completo com SQLite"
```

### Passo 5: Fazer Push
```powershell
git push origin main
```

### Passo 6: Pronto!
```
Aguarde o upload
Render fará deploy automático
```

---

## 🎯 QUAL OPÇÃO ESCOLHER?

| Opção | Facilidade | Tempo | Recomendado |
|-------|-----------|-------|------------|
| GitHub Desktop | ⭐⭐⭐⭐⭐ | 5 min | ✅ SIM |
| GitHub Web | ⭐⭐⭐ | 15 min | Sim |
| Git CLI | ⭐⭐ | 10 min | Não |

**Recomendação:** Use GitHub Desktop (Opção 1)

---

## 📋 ARQUIVOS A FAZER PUSH

### Novos Arquivos
```
✅ modules/branding/brandingController.js
✅ modules/branding/brandingRoutes.js
✅ web/src/pages/Branding.jsx
✅ BRANDING_SISTEMA_DETALHADO.md
✅ BRANDING_EXEMPLOS_PRATICOS.md
✅ BRANDING_DEPLOYMENT_GUIA.md
✅ BRANDING_FAQ_REFERENCIA.md
✅ BRANDING_RESUMO_EXECUTIVO.md
✅ BRANDING_INDICE_COMPLETO.md
✅ BRANDING_GUIA_VISUAL.md
✅ BRANDING_CHECKLIST_IMPLEMENTACAO.md
✅ BRANDING_COMECE_AQUI.md
✅ PUSH_GITHUB_MANUAL.md
```

### Arquivos Modificados
```
✅ .env (USE_SQLITE=true)
✅ server.js (rota de branding)
✅ database/setup-sqlite.js (tabelas)
✅ web/src/App.jsx (import e rota)
✅ web/src/components/Layout.jsx (menu)
```

---

## ✅ CHECKLIST FINAL

- [ ] Escolhi uma opção (1, 2 ou 3)
- [ ] Instalei/abri a ferramenta
- [ ] Fiz o commit
- [ ] Fiz o push
- [ ] Verifiquei no GitHub
- [ ] Render fez deploy automático
- [ ] Testei em produção

---

## 🚀 DEPOIS DO PUSH

### Render fará deploy automático:
1. Backend (~2-3 minutos)
2. Frontend (~2-3 minutos)

### Testar:
```bash
# Backend
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current

# Frontend
https://maxxcontrol-frontend.onrender.com
```

---

## 🆘 PROBLEMAS?

### "Não consigo fazer login no GitHub"
- Verifique sua senha
- Use token de acesso pessoal se necessário

### "Arquivo já existe"
- GitHub vai pedir para sobrescrever
- Clique "Yes" ou "Overwrite"

### "Erro de permissão"
- Verifique se você é colaborador do repositório
- Peça acesso ao dono

### "Render não fez deploy"
- Aguarde 5 minutos
- Verifique os logs em https://dashboard.render.com

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Consulte BRANDING_DEPLOYMENT_GUIA.md
2. Verifique os logs do Render
3. Procure no FAQ

---

**Última atualização:** 26/02/2026
**Status:** ✅ PRONTO PARA FAZER PUSH
