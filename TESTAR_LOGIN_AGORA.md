# 🔍 TESTE DE LOGIN - DIAGNÓSTICO

## 1️⃣ Abra o Console do Navegador

Pressione **F12** no navegador e vá para a aba **Console**

## 2️⃣ COPIE E COLE ESTE COMANDO (use Ctrl+C para copiar):

```javascript
fetch('https://maxxcontrol-x-sistema.onrender.com/api/auth/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: 'admin@tvmaxx.com', senha: 'admin123'})}).then(r => r.json()).then(data => {console.log('RESPOSTA:', data); return data;}).catch(err => {console.error('ERRO:', err); return err;})
```

**OU use este comando formatado:**

```javascript
fetch('https://maxxcontrol-x-sistema.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@tvmaxx.com',
    senha: 'admin123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('RESPOSTA:', data);
  return data;
})
.catch(err => {
  console.error('ERRO:', err);
  return err;
})
```

## 3️⃣ Copie a resposta que aparecer no console

A resposta vai mostrar:
- ✅ Se o login funcionou: você verá `{ user: {...}, token: "...", config: {...} }`
- ❌ Se deu erro: você verá `{ error: "mensagem do erro" }`

## 4️⃣ Me envie a resposta completa

Cole aqui a resposta que apareceu no console para eu diagnosticar o problema.

---

## 📋 Credenciais que você criou:
- **Email:** `admin@tvmaxx.com`
- **Senha:** `admin123`

---

## 🔧 O que foi corrigido:

Atualizei o código do backend para usar a função `crypt()` do PostgreSQL na validação da senha, que é compatível com o hash que você criou no Supabase usando `crypt('admin123', gen_salt('bf', 10))`.

O deploy já foi feito e o Render deve estar rodando a versão atualizada.
