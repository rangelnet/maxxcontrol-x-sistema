# 🔐 GERAR HASH DE SENHA CORRETO

O problema é que o hash da senha no banco não está correto para o bcrypt do sistema.

## 🎯 SOLUÇÃO: USAR O ENDPOINT DE REGISTRO

Vamos usar o endpoint de registro que já gera o hash correto automaticamente!

### Passo 1: Deletar o usuário atual

**No SQL Editor do Supabase:**
```sql
DELETE FROM users WHERE email = 'admin@maxxcontrol.com';
```

### Passo 2: Criar usuário pelo endpoint

**Abra o PowerShell e execute:**

```powershell
Invoke-RestMethod -Uri "https://maxxcontrol-x-sistema.onrender.com/api/auth/register" -Method POST -ContentType "application/json" -Body '{"nome":"Administrador","email":"admin@maxxcontrol.com","senha":"Admin@123","plano":"premium"}'
```

**OU no Console do navegador (F12):**

```javascript
fetch('https://maxxcontrol-x-sistema.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Administrador',
    email: 'admin@maxxcontrol.com',
    senha: 'Admin@123',
    plano: 'premium'
  })
})
.then(r => r.json())
.then(d => console.log('Sucesso:', d))
.catch(e => console.error('Erro:', e));
```

### Passo 3: Testar o login

Depois de criar o usuário, faça login:
- Email: `admin@maxxcontrol.com`
- Senha: `Admin@123`

---

## 🔍 SE DER ERRO 500 NO REGISTRO

O erro pode ser porque o banco não está conectado corretamente. Vamos verificar os logs:

1. Acesse o Render Dashboard
2. Clique no serviço `sistema maxxcontrol-x`
3. Clique em "Logs"
4. Procure por erros de conexão com o banco

---

## ✅ ALTERNATIVA: CRIAR HASH LOCALMENTE

Se preferir, rode o sistema localmente e crie o usuário lá:

```bash
cd R:\Users\Usuario\Documents\MaxxControl\maxxcontrol-x
npm start
```

Depois acesse `http://localhost:3001` e use o endpoint de registro.

O hash gerado será compatível com o sistema online!

---

🚀 **Tente o Passo 2 primeiro e me avise o resultado!**
