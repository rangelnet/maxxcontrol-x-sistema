# 🔑 CRIAR LOGIN E SENHA - 2 MINUTOS

## PASSO 1: ABRIR SUPABASE

```
https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/editor
```

---

## PASSO 2: CLICAR EM "SQL EDITOR"

No menu lateral esquerdo, clique em **SQL Editor**

---

## PASSO 3: CLICAR EM "NEW QUERY"

Botão verde no canto superior direito

---

## PASSO 4: COLAR E EXECUTAR ESTE SQL

```sql
-- Criar extensão para hash de senha
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar usuário admin
INSERT INTO users (nome, email, senha_hash, plano, status)
VALUES (
  'Administrador',
  'admin@tvmaxx.com',
  crypt('admin123', gen_salt('bf', 10)),
  'premium',
  'ativo'
)
ON CONFLICT (email) DO UPDATE 
SET senha_hash = crypt('admin123', gen_salt('bf', 10));

-- Ver resultado
SELECT id, nome, email, plano, status FROM users;
```

---

## PASSO 5: CLICAR EM "RUN" (ou apertar Ctrl+Enter)

---

## ✅ PRONTO! SUAS CREDENCIAIS:

```
URL: https://maxxcontrol-frontend.onrender.com/login

Email: admin@tvmaxx.com
Senha: admin123
```

---

## 🎯 AGORA FAÇA LOGIN

1. Acesse: https://maxxcontrol-frontend.onrender.com/login
2. Digite:
   - **Email**: admin@tvmaxx.com
   - **Senha**: admin123
3. Clique em **Entrar**
4. Clique em **Dispositivos** no menu
5. Veja seu dispositivo MAC: 3C:E5:B4:18:FB:1C

---

## 🔐 MUDAR SENHA DEPOIS (OPCIONAL)

Se quiser mudar a senha, execute no Supabase:

```sql
UPDATE users 
SET senha_hash = crypt('SUA_NOVA_SENHA', gen_salt('bf', 10))
WHERE email = 'admin@tvmaxx.com';
```

---

**EXECUTE AGORA!** 🚀

**TEMPO TOTAL: 2 MINUTOS** ⏱️
