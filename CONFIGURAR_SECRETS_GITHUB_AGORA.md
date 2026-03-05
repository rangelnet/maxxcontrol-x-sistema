# 🔐 Configurar Secrets no GitHub - AGORA

## ⚡ Ação Imediata

Você precisa adicionar 2 secrets no GitHub para ativar o deploy automático de migrações.

## 📋 Informações que você já tem:

### ✅ Token de API do Supabase:
```
sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0
```

### ❓ Project Reference ID:
Você precisa pegar isso no Supabase (veja abaixo)

---

## 🎯 Passo a Passo

### 1. Obter Project Reference ID

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Settings** (ícone de engrenagem) → **General**
4. Procure por **"Reference ID"**
5. Copie o ID (exemplo: `abcdefghijklmnop`)

### 2. Adicionar Secrets no GitHub

1. Acesse: https://github.com/rangelnet/maxxcontrol-x-sistema/settings/secrets/actions

2. Clique em **"New repository secret"**

3. **Primeiro Secret:**
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Secret: `sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0`
   - Clique em **"Add secret"**

4. Clique em **"New repository secret"** novamente

5. **Segundo Secret:**
   - Name: `SUPABASE_PROJECT_REF`
   - Secret: [cole o Reference ID que você copiou]
   - Clique em **"Add secret"**

### 3. Verificar

Depois de adicionar os 2 secrets, você deve ver:

```
✅ SUPABASE_ACCESS_TOKEN
✅ SUPABASE_PROJECT_REF
```

---

## 🧪 Testar o Deploy Automático

Depois de configurar os secrets, teste:

```bash
# Crie um arquivo de teste
echo "-- Teste de migração automática" > database/migrations/test_auto_deploy.sql

# Commit e push
git add database/migrations/test_auto_deploy.sql
git commit -m "test: testar deploy automático de migrações"
git push origin main
```

Depois vá em: https://github.com/rangelnet/maxxcontrol-x-sistema/actions

Você verá o workflow executando! 🚀

---

## ✅ Checklist

- [ ] Acessei o Supabase e copiei o Reference ID
- [ ] Adicionei o secret `SUPABASE_ACCESS_TOKEN`
- [ ] Adicionei o secret `SUPABASE_PROJECT_REF`
- [ ] Testei com um push
- [ ] Vi o workflow executar no GitHub Actions

---

## 🎉 Resultado

Depois de configurar, **TODAS** as suas alterações em `database/migrations/` serão aplicadas automaticamente no Supabase quando você fizer push para `main`!

Não precisa mais executar migrações manualmente! 🎊
