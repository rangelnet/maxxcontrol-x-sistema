# 👤 CRIAR USUÁRIO ADMIN NO SUPABASE

## PASSO 1: ACESSAR SUPABASE SQL EDITOR

```
https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/editor
```

1. Clique em **SQL Editor** no menu lateral
2. Clique em **New Query**

---

## PASSO 2: EXECUTAR SQL PARA CRIAR ADMIN

Cole e execute este SQL:

```sql
-- Criar usuário admin
-- Senha: admin123 (você pode mudar depois)

INSERT INTO users (nome, email, senha_hash, plano, status)
VALUES (
  'Administrador',
  'admin@tvmaxx.com',
  '$2b$10$rZ5L5YxGxGxGxGxGxGxGxOK5L5YxGxGxGxGxGxGxGxGxGxGxGxGxG',
  'premium',
  'ativo'
)
ON CONFLICT (email) DO NOTHING;

-- Ver usuário criado
SELECT id, nome, email, plano, status, criado_em 
FROM users 
WHERE email = 'admin@tvmaxx.com';
```

---

## 📝 CREDENCIAIS DE LOGIN

Depois de executar o SQL acima, use estas credenciais:

```
URL: https://maxxcontrol-frontend.onrender.com/login

Usuário: admin@tvmaxx.com
Senha: admin123
```

---

## ⚠️ IMPORTANTE: HASH DE SENHA

O hash acima é um exemplo. Para criar um hash real da senha, você tem 2 opções:

### OPÇÃO 1: Usar Node.js (Recomendado)

Execute no terminal:

```bash
cd MaxxControl/maxxcontrol-x-sistema
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

Copie o hash gerado e use no SQL acima.

### OPÇÃO 2: Criar via API

Execute no Console do Navegador (F12):

```javascript
fetch('https://maxxcontrol-x-api.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Administrador',
    email: 'admin@tvmaxx.com',
    senha: 'admin123',
    plano: 'premium'
  })
})
.then(r => r.json())
.then(data => console.log('Usuário criado:', data));
```

---

## ✅ VERIFICAR SE USUÁRIO FOI CRIADO

Execute no Supabase SQL Editor:

```sql
SELECT * FROM users WHERE email = 'admin@tvmaxx.com';
```

### Resultado Esperado:
```
id | nome           | email              | plano   | status
1  | Administrador  | admin@tvmaxx.com   | premium | ativo
```

---

## 🧪 TESTAR LOGIN

### Opção 1: Via Painel
```
https://maxxcontrol-frontend.onrender.com/login

Email: admin@tvmaxx.com
Senha: admin123
```

### Opção 2: Via Console (F12)
```javascript
fetch('https://maxxcontrol-x-api.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin@tvmaxx.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => {
  if (data.token) {
    console.log('✅ LOGIN OK!');
    console.log('Token:', data.token);
  } else {
    console.log('❌ ERRO:', data);
  }
});
```

---

## 🔐 MUDAR SENHA DEPOIS

Depois de fazer login, você pode mudar a senha no painel ou via SQL:

```sql
-- Gerar novo hash (substitua 'nova_senha' pela senha desejada)
-- Execute no Node.js:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('nova_senha', 10).then(hash => console.log(hash));"

-- Atualizar senha no banco
UPDATE users 
SET senha_hash = 'COLE_O_HASH_AQUI'
WHERE email = 'admin@tvmaxx.com';
```

---

## 📊 RESUMO

1. ✅ Execute SQL no Supabase para criar usuário
2. ✅ Use credenciais: admin@tvmaxx.com / admin123
3. ✅ Faça login no painel
4. ✅ Acesse página Dispositivos
5. ✅ Veja seu dispositivo MAC: 3C:E5:B4:18:FB:1C

---

**EXECUTE AGORA NO SUPABASE!** 🚀
