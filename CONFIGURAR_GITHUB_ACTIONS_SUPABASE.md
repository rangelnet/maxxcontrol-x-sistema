# 🚀 Configurar GitHub Actions + Supabase

## ✅ O que foi criado

Foram criados 3 workflows do GitHub Actions para automatizar a aplicação de migrações no Supabase:

1. **production.yml** - Aplica migrações quando você faz push para `main`
2. **staging.yml** - Aplica migrações quando você faz push para `develop`
3. **ci.yml** - Valida código em pull requests

## 📋 Pré-requisitos

Você precisa ter:
- Conta no GitHub com o repositório configurado
- Projeto no Supabase (produção e/ou staging)
- Acesso às configurações do repositório no GitHub

## 🔑 Passo 1: Obter credenciais do Supabase

### 1.1 Access Token (Token de API)

**Você já tem o token:**
```
sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0
```

Este é o token de API do Supabase que permite ao GitHub Actions conectar e executar comandos.

### 1.2 Project Reference ID

1. Acesse seu projeto no Supabase
2. Vá em: **Settings → General**
3. Copie o **"Reference ID"** (exemplo: `abcdefghijklmnop`)

## 🔐 Passo 2: Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub: https://github.com/rangelnet/maxxcontrol-x-sistema
2. Vá em: **Settings** → **Secrets and variables** → **Actions**
3. Clique em **"New repository secret"**
4. Adicione os seguintes secrets:

### Para Produção (branch main):

| Nome do Secret | Valor | Descrição |
|----------------|-------|-----------|
| `SUPABASE_ACCESS_TOKEN` | `sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0` | Token de API do Supabase |
| `SUPABASE_PROJECT_REF` | [seu project reference ID] | ID de referência do projeto |

### Para Staging (branch develop) - OPCIONAL:

Se você tiver um projeto separado para staging:

| Nome do Secret | Valor | Descrição |
|----------------|-------|-----------|
| `SUPABASE_ACCESS_TOKEN_STAGING` | Token do projeto staging | Token de API |
| `SUPABASE_PROJECT_REF_STAGING` | ID do projeto staging | ID de referência |

## 🎯 Passo 3: Como usar

### Aplicar migrações automaticamente:

1. **Crie ou modifique** um arquivo SQL em `database/migrations/`
2. **Faça commit** das alterações:
   ```bash
   git add database/migrations/
   git commit -m "feat: adicionar nova migração"
   ```
3. **Faça push** para o GitHub:
   ```bash
   git push origin main
   ```
4. O GitHub Actions irá **automaticamente**:
   - Detectar as mudanças em `database/migrations/`
   - Conectar ao Supabase usando o token
   - Aplicar todas as migrações
   - Notificar sucesso ou falha

### Verificar execução:

1. Acesse: https://github.com/rangelnet/maxxcontrol-x-sistema/actions
2. Veja o status da execução (verde = sucesso, vermelho = erro)
3. Clique na execução para ver logs detalhados

## 📊 Estrutura dos Workflows

```
.github/
└── workflows/
    ├── production.yml   # Deploy para produção (branch main)
    ├── staging.yml      # Deploy para staging (branch develop)
    └── ci.yml          # Testes em pull requests
```

## ⚠️ Importante

- **Não compartilhe** o token de API publicamente
- **Não commite** o token no código
- As migrações são aplicadas **na ordem alfabética** dos arquivos
- Recomenda-se nomear migrações com timestamp: `YYYYMMDD_descricao.sql`

## 🔄 Fluxo de Trabalho Recomendado

1. **Desenvolvimento local**: Teste suas migrações localmente
2. **Push para develop**: Testa no ambiente de staging (se configurado)
3. **Pull Request**: Valida código antes de mergear
4. **Merge para main**: Aplica automaticamente em produção

## 🐛 Troubleshooting

### Erro: "Authentication failed"
- Verifique se o `SUPABASE_ACCESS_TOKEN` está correto no GitHub Secrets
- Token atual: `sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0`

### Erro: "Project not found"
- Verifique se o `SUPABASE_PROJECT_REF` está correto
- Confirme o Reference ID no dashboard do Supabase

### Erro: "SQL syntax error"
- Verifique a sintaxe do arquivo SQL
- Teste a migração localmente antes de fazer push

## 📚 Recursos Adicionais

- [Documentação Supabase CLI](https://supabase.com/docs/guides/cli)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Supabase Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## ✅ Checklist de Configuração

- [ ] Token de API copiado: `sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0`
- [ ] Project Reference ID obtido do Supabase
- [ ] Secret `SUPABASE_ACCESS_TOKEN` configurado no GitHub
- [ ] Secret `SUPABASE_PROJECT_REF` configurado no GitHub
- [ ] Primeiro push testado
- [ ] Workflow executado com sucesso
- [ ] Migrações aplicadas no Supabase

---

**Pronto!** Agora suas migrações serão aplicadas automaticamente sempre que você fizer push para o GitHub! 🎉
