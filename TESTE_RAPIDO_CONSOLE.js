// 🧪 COLE ESTE CÓDIGO NO CONSOLE DO NAVEGADOR (F12)
// Pressione F12, vá na aba "Console" e cole tudo de uma vez

console.clear();
console.log('🔍 DIAGNÓSTICO: Botão Desbloquear\n');

// Buscar dispositivos
fetch('https://maxxcontrol-frontend.onrender.com/api/device/list-all', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log(`📱 Total: ${data.devices.length} dispositivos\n`);
  
  data.devices.forEach((d, i) => {
    const statusLimpo = d.status.trim();
    const temEspacos = d.status !== statusLimpo;
    
    console.log(`[${i+1}] ${d.mac_address}`);
    console.log(`    Status: "${d.status}" ${temEspacos ? '⚠️ TEM ESPAÇOS!' : ''}`);
    console.log(`    Botão: ${d.status === 'ativo' ? '🔴 Bloquear' : '🟢 Desbloquear'}`);
    console.log('');
  });
  
  // Resumo
  const ativos = data.devices.filter(d => d.status === 'ativo').length;
  const bloqueados = data.devices.filter(d => d.status !== 'ativo').length;
  
  console.log('=== RESUMO ===');
  console.log(`Ativos: ${ativos} (devem ter botão Bloquear)`);
  console.log(`Bloqueados: ${bloqueados} (devem ter botão Desbloquear)`);
  
  if (bloqueados === 0) {
    console.log('\n⚠️ PROBLEMA: Nenhum dispositivo bloqueado encontrado!');
    console.log('Você precisa bloquear um dispositivo primeiro para ver o botão Desbloquear.');
  }
})
.catch(err => {
  console.error('❌ Erro:', err);
  console.log('\n⚠️ Verifique se você está logado no painel.');
});
