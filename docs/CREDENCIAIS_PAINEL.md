# 🔑 CREDENCIAIS DO PAINEL

## 📍 ONDE FAZER LOGIN
```
https://maxxcontrol-frontend.onrender.com/login
```

---

## 🔍 DESCOBRIR LOGIN E SENHA

### OPÇÃO 1: Ver no Supabase (30 segundos)

1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe
2. Clique em **Table Editor** (menu lateral)
3. Clique na tabela **users**
4. Veja a coluna **email** ← Este é o LOGIN
5. A senha você precisa lembrar (não aparece)

---

### OPÇÃO 2: Criar novo usuário (1 minuto)

1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe
2. Clique em **SQL Editor** (menu lateral)
3. Clique em **New Query**
4. Cole e execute:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (nome, email, senha_hash, plano, status)
VALUES (
  'Administrador',
  'admin@tvmaxx.com',
  crypt('admin123', gen_salt('bf', 10)),
  'premium',
  'ativo'
)
ON CONFLICT (email) DO NOTHING;

SELECT email, 'admin123' AS senha FROM users WHERE email = 'admin@tvmaxx.com';
```

**Credenciais criadas**:
```
Login: admin@tvmaxx.com
Senha: admin123
```

---

### OPÇÃO 3: Resetar senha (se esqueceu)

Execute no SQL Editor do Supabase:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE users 
SET senha_hash = crypt('admin123', gen_salt('bf', 10))
WHERE email = 'admin@tvmaxx.com';

SELECT 'Senha resetada para: admin123' AS resultado;
```

---

## ✅ FAZER LOGIN

1. Acesse: https://maxxcontrol-frontend.onrender.com/login
2. Digite:
   - **Email**: admin@tvmaxx.com
   - **Senha**: admin123
3. Clique em **Entrar**

---

## 🎯 DEPOIS DO LOGIN

1. Clique em **Dispositivos** no menu
2. Veja seu dispositivo MAC: 3C:E5:B4:18:FB:1C
3. Status: Ativo + OFFLINE

---

**EXECUTE AGORA!** 🚀
