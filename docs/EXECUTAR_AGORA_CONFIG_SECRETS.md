# ⚡ EXECUTAR AGORA - Configurar Secrets Automaticamente

## 🎯 Passo 1: Gerar Token do GitHub (30 segundos)

1. Acesse: https://github.com/settings/tokens/new?scopes=repo&description=GitHub%20Actions%20Secrets

2. Você verá uma página com:
   - **Note**: "GitHub Actions Secrets" (já preenchido)
   - **Expiration**: Escolha "No expiration" ou "90 days"
   - **Select scopes**: A opção "repo" já está marcada ✅

3. Role até o final e clique em **"Generate token"**

4. **COPIE O TOKEN** (você só verá uma vez!)
   - Exemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🚀 Passo 2: Executar o Script (10 segundos)

Abra o terminal nesta pasta e execute:

```bash
node configure-github-secrets.js SEU_TOKEN_AQUI
```

Substitua `SEU_TOKEN_AQUI` pelo token que você copiou.

**Exemplo:**
```bash
node configure-github-secrets.js ghp_1234567890abcdefghijklmnopqrstuvwxyz
```

## ✅ Resultado Esperado

Você verá:

```
🚀 Configurando secrets do GitHub Actions...

🔑 Obtendo chave pública do repositório...
   ✅ Chave pública obtida

📝 Criando secrets...

   Criando SUPABASE_ACCESS_TOKEN...
   ✅ SUPABASE_ACCESS_TOKEN criado

   Criando SUPABASE_PROJECT_REF...
   ✅ SUPABASE_PROJECT_REF criado

🎉 Configuração concluída!

📊 Verifique em: https://github.com/rangelnet/maxxcontrol-x-sistema/settings/secrets/actions
```

## 🎊 Pronto!

Depois disso, **TODAS** as suas alterações em `database/migrations/` serão aplicadas automaticamente no Supabase quando você fizer push!

---

## 🐛 Se der erro

### Erro: "Bad credentials"
- O token está incorreto ou expirou
- Gere um novo token e tente novamente

### Erro: "Not Found"
- Verifique se você tem acesso ao repositório
- Verifique se o token tem permissão "repo"

### Erro: "Resource not accessible by integration"
- O token precisa ter permissão "repo" completa
- Gere um novo token com a permissão correta
