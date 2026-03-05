# 🔧 SOLUÇÃO FINAL - CONECTAR BANCO DE DADOS

## PROBLEMA
```
❌ Erro ao conectar no banco de dados: Tenant or user not found
```

**Causa**: Senha do banco de dados está incorreta ou não foi resetada corretamente.

---

## SOLUÇÃO DEFINITIVA

### PASSO 1: Resetar Senha do Banco no Supabase

1. **Acesse**: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/settings/database

2. **Role até "Database password"**

3. **Clique em "Reset database password"**

4. **Copie a NOVA senha gerada** (ela aparece uma única vez!)

5. **Guarde a senha** em um lugar seguro

---

### PASSO 2: Pegar Connection String com Nova Senha

1. Na mesma página, role até **"Connection string"**

2. Selecione **"URI"**

3. **Copie** a connection string completa

Ela será algo como:
```
postgresql://postgres.[PROJECT-REF]:[NOVA-SENHA]@db.mmfbirjrhrhobbnzfffe.supabase.co:5432/postgres
```

**IMPORTANTE**: A senha já vem codificada corretamente na string do Supabase!

---

### PASSO 3: Configurar no Render

1. **Acesse**: https://dashboard.render.com

2. **Clique** no serviço: **maxxcontrol-x-sistema**

3. **Vá em Environment** (menu lateral)

4. **Edite DATABASE_URL**

5. **Cole** a connection string que você copiou do Supabase

6. **Salve** (Save Changes)

---

### PASSO 4: Aguardar Redeploy

O Render vai fazer redeploy automaticamente (2-3 minutos)

---

## VERIFICAR SE DEU CERTO

Nos logs do Render, deve aparecer:

```
🐘 Usando PostgreSQL como banco de dados
✅ Banco de dados PostgreSQL conectado: 2026-02-28 ...
```

**SEM** o erro:
```
❌ Erro ao conectar no banco de dados: Tenant or user not found
```

---

## ALTERNATIVA: Usar SQLite Temporariamente

Se você quiser testar o sistema rapidamente enquanto resolve o banco:

### No Render Environment:
```
USE_SQLITE=true
```

Remova ou deixe vazio:
```
DATABASE_URL=
```

**ATENÇÃO**: Com SQLite, os dados do Supabase NÃO vão aparecer! É só para teste.

---

## RESUMO

1. ✅ Resete a senha do banco no Supabase
2. ✅ Copie a connection string do Supabase
3. ✅ Cole no Render → Environment → DATABASE_URL
4. ✅ Salve e aguarde redeploy
5. ✅ Verifique logs

---

**A SENHA ATUAL `Maxx@146390` ESTÁ INCORRETA!**

**VOCÊ PRECISA RESETAR NO SUPABASE!** 🔑
