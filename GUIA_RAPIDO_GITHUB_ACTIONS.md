# ⚡ Guia Rápido - GitHub Actions + Supabase

## 🎯 O que isso faz?

Sempre que você fizer alterações em arquivos SQL dentro de `database/migrations/` e fizer push para o GitHub, as migrações serão **automaticamente aplicadas** no Supabase.

## 🚀 Configuração em 3 Passos

### 1️⃣ Obter Credenciais do Supabase

Acesse seu projeto no Supabase e copie:

```
✅ Access Token: https://supabase.com/dashboard/account/tokens
✅ Database Password: Settings → Database
✅ Project ID: Settings → General → Reference ID
```

### 2️⃣ Adicionar Secrets no GitHub

1. Vá em: **Repositório → Settings → Secrets and variables → Actions**
2. Clique em **"New repository secret"**
3. Adicione estes 3 secrets:

```
Nome: SUPABASE_ACCESS_TOKEN
Valor: [seu token]

Nome: SUPABASE_DB_PASSWORD
Valor: [sua senha do banco]

Nome: SUPABASE_PROJECT_ID
Valor: [seu project ID]
```

### 3️⃣ Testar

Faça qualquer alteração em `database/migrations/` e:

```bash
git add database/migrations/
git commit -m "test: testar deploy automático"
git push origin main
```

Vá em **Actions** no GitHub e veja a mágica acontecer! ✨

## 📊 Status dos Workflows

Depois de configurar, você verá:

- ✅ **Verde** = Migrações aplicadas com sucesso
- ❌ **Vermelho** = Erro (veja os logs para detalhes)
- 🟡 **Amarelo** = Em execução

## 🔄 Fluxo Automático

```
Você edita SQL → Commit → Push → GitHub Actions → Supabase atualizado!
```

## ⚠️ Importante

- Configure os secrets **antes** de fazer push
- Não compartilhe os secrets com ninguém
- As migrações são aplicadas em ordem alfabética

## 📚 Documentação Completa

Para mais detalhes, veja: `CONFIGURAR_GITHUB_ACTIONS_SUPABASE.md`

---

**Pronto!** Configuração completa em menos de 5 minutos! 🎉
