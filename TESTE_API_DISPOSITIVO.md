# Teste Rápido da API de Dispositivos

## 1. Abra o Console do Navegador
- Vá para https://maxxcontrol-frontend.onrender.com
- Faça login
- Abra DevTools (F12)
- Vá para a aba **Console**

## 2. Cole este código no Console
```javascript
// Teste 1: Listar todos os dispositivos
fetch('/api/device/list-all', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Resposta da API:', data);
  console.log('Total de dispositivos:', data.devices?.length || 0);
  if (data.devices) {
    data.devices.forEach(d => {
      console.log(`- ${d.mac_address} (${d.modelo}) - User ID: ${d.user_id}`);
    });
  }
})
.catch(err => console.error('❌ Erro:', err));
```

## 3. Verifique a Resposta
- Se aparecer "Total de dispositivos: 0" → Banco está vazio
- Se aparecer "Total de dispositivos: 1" → Dispositivo está lá!
- Se aparecer erro → Problema de autenticação

## 4. Se o dispositivo aparecer
- Vá para a página de Dispositivos
- Atualize a página (F5)
- O dispositivo deve aparecer na tabela

## 5. Se o dispositivo NÃO aparecer
- Verifique os logs do Render:
  - Vá para https://dashboard.render.com
  - Selecione o serviço "maxxcontrol-x-sistema"
  - Vá para "Logs"
  - Procure por "Listando TODOS os dispositivos"

## MAC do seu dispositivo
```
3C:E5:B4:1B:FB:1C
```

Procure por este MAC nos logs!
