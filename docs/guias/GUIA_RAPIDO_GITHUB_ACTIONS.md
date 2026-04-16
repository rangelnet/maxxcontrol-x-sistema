# ⚡ Guia Rápido - GitHub Actions + Supabase

## 🎯 O que isso faz?

Sempre que você fizer alterações em arquivos SQL dentro de `database/migrations/` e fizer push para o GitHub, as migrações serão **automaticamente aplicadas** no Supabase.

## 🚀 Configuração em 2 Passos

### 1️⃣ Obter Project Reference ID do Supabase

Acesse seu projeto no Supabase:

```
✅ Settings → General → Reference ID
```

Copie o Reference ID (exemplo: `abcdefghijklmnop`)

### 2️⃣ Adicionar Secrets no GitHub

1. Vá em: https://github.com/rangelnet/maxxcontrol-x-sistema/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Adicione estes 2 secrets:

```
Nome: SUPABASE_ACCESS_TOKEN
Valor: sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0

Nome: SUPABASE_PROJECT_REF
Valor: [seu project reference ID]
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
- Não compartilhe o token de API publicamente
- As migrações são aplicadas em ordem alfabética

## 📚 Documentação Completa

Para mais detalhes, veja: `CONFIGURAR_GITHUB_ACTIONS_SUPABASE.md`

---

**Pronto!** Configuração completa em menos de 5 minutos! 🎉
