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

### 1.1 Access Token (Token de Acesso)

1. Acesse: https://supabase.com/dashboard/account/tokens
2. Clique em "Generate new token"
3. Dê um nome (ex: "GitHub Actions")
4. Copie o token gerado (você só verá uma vez!)

### 1.2 Database Password (Senha do Banco)

1. Acesse seu projeto no Supabase
2. Vá em: Settings → Database
3. Procure por "Database password" ou "Connection string"
4. Copie a senha do banco de dados

### 1.3 Project ID (ID do Projeto)

1. No dashboard do Supabase, vá em Settings → General
2. Copie o "Reference ID" (ex: `abcdefghijklmnop`)

## 🔐 Passo 2: Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em: **Settings** → **Secrets and variables** → **Actions**
3. Clique em **"New repository secret"**
4. Adicione os seguintes secrets:

### Para Produção (branch main):

| Nome do Secret | Valor | Descrição |
|----------------|-------|-----------|
| `SUPABASE_ACCESS_TOKEN` | Token gerado no passo 1.1 | Token de acesso da sua conta |
| `SUPABASE_DB_PASSWORD` | Senha do passo 1.2 | Senha do banco de dados |
| `SUPABASE_PROJECT_ID` | ID do passo 1.3 | ID de referência do projeto |

### Para Staging (branch develop) - OPCIONAL:

Se você tiver um projeto separado para staging:

| Nome do Secret | Valor | Descrição |
|----------------|-------|-----------|
| `SUPABASE_ACCESS_TOKEN_STAGING` | Token do projeto staging | Token de acesso |
| `SUPABASE_DB_PASSWORD_STAGING` | Senha do banco staging | Senha do banco |
| `SUPABASE_PROJECT_ID_STAGING` | ID do projeto staging | ID de referência |

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
   - Conectar ao Supabase
   - Aplicar todas as migrações
   - Notificar sucesso ou falha

### Verificar execução:

1. Acesse seu repositório no GitHub
2. Vá na aba **Actions**
3. Veja o status da execução (verde = sucesso, vermelho = erro)
4. Clique na execução para ver logs detalhados

## 📊 Estrutura dos Workflows

```
.github/
└── workflows/
    ├── production.yml   # Deploy para produção (branch main)
    ├── staging.yml      # Deploy para staging (branch develop)
    └── ci.yml          # Testes em pull requests
```

## ⚠️ Importante

- **Não compartilhe** os secrets com ninguém
- **Não commite** os secrets no código
- As migrações são aplicadas **na ordem alfabética** dos arquivos
- Recomenda-se nomear migrações com timestamp: `YYYYMMDD_descricao.sql`

## 🔄 Fluxo de Trabalho Recomendado

1. **Desenvolvimento local**: Teste suas migrações localmente
2. **Push para develop**: Testa no ambiente de staging (se configurado)
3. **Pull Request**: Valida código antes de mergear
4. **Merge para main**: Aplica automaticamente em produção

## 🐛 Troubleshooting

### Erro: "Authentication failed"
- Verifique se o `SUPABASE_ACCESS_TOKEN` está correto
- Gere um novo token se necessário

### Erro: "Connection refused"
- Verifique se o `SUPABASE_PROJECT_ID` está correto
- Verifique se a senha do banco está correta

### Erro: "SQL syntax error"
- Verifique a sintaxe do arquivo SQL
- Teste a migração localmente antes de fazer push

## 📚 Recursos Adicionais

- [Documentação Supabase CLI](https://supabase.com/docs/guides/cli)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Supabase Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## ✅ Checklist de Configuração

- [ ] Access Token obtido do Supabase
- [ ] Database Password copiada
- [ ] Project ID copiado
- [ ] Secrets configurados no GitHub
- [ ] Primeiro push testado
- [ ] Workflow executado com sucesso
- [ ] Migrações aplicadas no Supabase

---

**Pronto!** Agora suas migrações serão aplicadas automaticamente sempre que você fizer push para o GitHub! 🎉
