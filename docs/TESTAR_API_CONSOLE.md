# 🧪 TESTAR API NO CONSOLE DO NAVEGADOR

## PASSO 1: ABRIR CONSOLE

1. Acesse: https://maxxcontrol-frontend.onrender.com/login
2. Aperte **F12** (abre DevTools)
3. Clique na aba **Console**

---

## PASSO 2: FAZER LOGIN VIA CONSOLE

Cole e execute este código (substitua usuário e senha):

```javascript
// SUBSTITUA AQUI ↓
const MEU_USUARIO = 'admin';  // ← SEU USUÁRIO
const MINHA_SENHA = 'sua_senha';  // ← SUA SENHA

// Fazer login
fetch('https://maxxcontrol-x-api.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    username: MEU_USUARIO, 
    password: MINHA_SENHA 
  })
})
.then(r => r.json())
.then(data => {
  if (data.token) {
    console.log('✅ LOGIN OK!');
    console.log('Token:', data.token);
    window.TOKEN = data.token; // Salva token
  } else {
    console.error('❌ ERRO NO LOGIN:', data);
  }
});
```

### ✅ Resultado Esperado:
```
✅ LOGIN OK!
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ❌ Se der erro:
- Verifique usuário e senha
- Tente novamente

---

## PASSO 3: TESTAR ROTA list-all

Cole e execute:

```javascript
// Testar rota que lista TODOS os dispositivos
fetch('https://maxxcontrol-x-api.onrender.com/api/mac/list-all', {
  headers: { 
    'Authorization': `Bearer ${window.TOKEN}` 
  }
})
.then(r => r.json())
.then(data => {
  console.log('📱 DISPOSITIVOS:', data);
  console.log('📊 Total:', data.devices?.length || 0);
  
  // Procurar seu dispositivo
  const meuDevice = data.devices?.find(d => 
    d.mac_address === '3C:E5:B4:18:FB:1C'
  );
  
  if (meuDevice) {
    console.log('✅ SEU DISPOSITIVO ENCONTRADO:');
    console.log('   MAC:', meuDevice.mac_address);
    console.log('   Modelo:', meuDevice.modelo);
    console.log('   Status:', meuDevice.status);
    console.log('   Conexão:', meuDevice.connection_status);
  } else {
    console.log('❌ SEU DISPOSITIVO NÃO ENCONTRADO');
    console.log('   Verifique se está no Supabase');
  }
});
```

### ✅ Resultado Esperado:
```
📱 DISPOSITIVOS: { devices: [...] }
📊 Total: 1
✅ SEU DISPOSITIVO ENCONTRADO:
   MAC: 3C:E5:B4:18:FB:1C
   Modelo: (seu modelo)
   Status: ativo
   Conexão: offline
```

### ❌ Se der erro:
- **Erro 401**: Token inválido (faça login novamente)
- **Erro 404**: Rota não existe (deploy não aplicou)
- **Erro 500**: Erro no servidor
- **Total: 0**: Nenhum dispositivo no banco

---

## PASSO 4: VERIFICAR SE ROTA EXISTE

Cole e execute:

```javascript
// Testar se rota list-all existe
fetch('https://maxxcontrol-x-api.onrender.com/api/mac/list-all', {
  method: 'OPTIONS'
})
.then(r => {
  console.log('Status:', r.status);
  if (r.status === 200 || r.status === 204) {
    console.log('✅ ROTA EXISTE!');
  } else {
    console.log('❌ ROTA NÃO EXISTE (deploy não aplicou)');
  }
});
```

---

## PASSO 5: VERIFICAR DISPOSITIVO NO SUPABASE

### Opção A: Via SQL no Supabase
1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe
2. SQL Editor → New Query
3. Execute:

```sql
SELECT * FROM devices WHERE mac_address = '3C:E5:B4:18:FB:1C';
```

### Opção B: Via Table Editor
1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe
2. Table Editor → devices
3. Procure linha com MAC: 3C:E5:B4:18:FB:1C

---

## 📊 DIAGNÓSTICO COMPLETO

Cole e execute este código para diagnóstico completo:

```javascript
async function diagnostico() {
  console.log('🔍 INICIANDO DIAGNÓSTICO...\n');
  
  // 1. Testar API Health
  console.log('1️⃣ Testando API Health...');
  try {
    const health = await fetch('https://maxxcontrol-x-api.onrender.com/health');
    const healthData = await health.json();
    console.log('   ✅ API está online:', healthData);
  } catch (e) {
    console.log('   ❌ API offline:', e.message);
  }
  
  // 2. Testar rota list-all (sem token)
  console.log('\n2️⃣ Testando rota list-all (sem token)...');
  try {
    const listAll = await fetch('https://maxxcontrol-x-api.onrender.com/api/mac/list-all');
    console.log('   Status:', listAll.status);
    if (listAll.status === 401) {
      console.log('   ✅ Rota existe mas precisa de autenticação (correto!)');
    } else if (listAll.status === 404) {
      console.log('   ❌ Rota não existe (deploy não aplicou)');
    }
  } catch (e) {
    console.log('   ❌ Erro:', e.message);
  }
  
  // 3. Testar com token (se tiver)
  if (window.TOKEN) {
    console.log('\n3️⃣ Testando rota list-all (com token)...');
    try {
      const listAll = await fetch('https://maxxcontrol-x-api.onrender.com/api/mac/list-all', {
        headers: { 'Authorization': `Bearer ${window.TOKEN}` }
      });
      const data = await listAll.json();
      console.log('   ✅ Dispositivos:', data.devices?.length || 0);
      
      const meuDevice = data.devices?.find(d => d.mac_address === '3C:E5:B4:18:FB:1C');
      if (meuDevice) {
        console.log('   ✅ Seu dispositivo encontrado!');
      } else {
        console.log('   ❌ Seu dispositivo não encontrado');
      }
    } catch (e) {
      console.log('   ❌ Erro:', e.message);
    }
  } else {
    console.log('\n3️⃣ Sem token (faça login primeiro)');
  }
  
  console.log('\n✅ DIAGNÓSTICO COMPLETO!');
}

diagnostico();
```

---

## 🎯 RESUMO

1. **Faça login** (PASSO 2)
2. **Teste rota list-all** (PASSO 3)
3. **Verifique Supabase** (PASSO 5)
4. **Execute diagnóstico** (PASSO 6)

---

**EXECUTE AGORA NO CONSOLE!** 🚀
