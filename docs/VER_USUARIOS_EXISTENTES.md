# 👥 VER USUÁRIOS EXISTENTES NO SUPABASE

## VERIFICAR SE JÁ TEM USUÁRIO CRIADO

### PASSO 1: Acessar Supabase
```
https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe
```

### PASSO 2: Clicar em "Table Editor"
No menu lateral esquerdo

### PASSO 3: Clicar na tabela "users"

### PASSO 4: Ver todos os usuários

Você verá uma tabela com:
- id
- nome
- email ← **ESTE É O LOGIN**
- senha_hash
- plano
- status
- criado_em

---

## OU VIA SQL

### Abrir SQL Editor e executar:

```sql
SELECT 
  id,
  nome,
  email,
  plano,
  status,
  criado_em
FROM users
ORDER BY criado_em DESC;
```

---

## ❌ SE NÃO TIVER NENHUM USUÁRIO

Você precisa criar um. Execute este SQL no Supabase:

```sql
-- Criar extensão para hash
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar usuário admin
INSERT INTO users (nome, email, senha_hash, plano, status)
VALUES (
  'Administrador',
  'admin@tvmaxx.com',
  crypt('admin123', gen_salt('bf', 10)),
  'premium',
  'ativo'
);

-- Ver resultado
SELECT id, nome, email, plano FROM users;
```

**Credenciais criadas**:
- Email: admin@tvmaxx.com
- Senha: admin123

---

## ✅ SE JÁ TIVER USUÁRIO

Use o **email** como login e a senha que você definiu quando criou.

**Exemplo**:
- Se o email for: `admin@tvmaxx.com`
- Login: `admin@tvmaxx.com`
- Senha: (a senha que você definiu)

---

**VERIFIQUE AGORA NO SUPABASE!** 🚀
