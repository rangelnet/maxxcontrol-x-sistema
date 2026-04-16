const MXXCONTROL_API = 'http://localhost:3001/api/iptv-plugin'; 

async function reportToMxxcontrol(endpoint, payload) {
  try {
    const res = await fetch(`${MXXCONTROL_API}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    try { return JSON.parse(text); } catch (e) { 
      return { success: false, error: 'API: ' + text.substring(0, 30) }; 
    }
  } catch (err) {
    return { success: false, error: 'Erro Rede: ' + err.message };
  }
}

// Ouve as mensagens do content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'SYNC_CUSTOMERS_PAYLOAD') {
    reportToMxxcontrol('relay-sync-customers', {
      panel_id: 1, 
      customers: message.data
    }).then(res => sendResponse(res));
    return true; 
  }
});

// ============================================
// SISTEMA DE RELAY (Controle Remoto)
// ============================================

let isPolling = false;

async function pollCommands() {
  if (isPolling) return;
  isPolling = true;

  try {
    const res = await fetch(`${MXXCONTROL_API}/relay-pending`);
    if (!res.ok) throw new Error('Falha no polling');
    
    const data = await res.json();
    if (data.commands && data.commands.length > 0) {
      console.log(`🔌 [MXX] Encontrados ${data.commands.length} comandos pendentes`);
      
      for (const cmd of data.commands) {
        await executeCommand(cmd);
      }
    }
  } catch (err) {
    console.warn('[MXX] Erro no polling Relay:', err.message);
  } finally {
    isPolling = false;
  }
}

async function executeCommand(cmd) {
  try {
    // 1. Achar a aba certa (baseado na panel_url enviada ou qualquer aba do painel)
    const tabs = await chrome.tabs.query({});
    let targetTab = null;
    
    if (cmd.panel_url) {
      const targetHost = new URL(cmd.panel_url).hostname;
      targetTab = tabs.find(t => t.url && t.url.includes(targetHost));
    } else {
      targetTab = tabs.find(t => t.url && (t.url.includes('primelux') || t.url.includes('mega')));
    }

    if (!targetTab) {
      throw new Error('Aba do painel não encontrada ou fechada.');
    }

    // 2. Enviar para o Content Script da aba
    const response = await chrome.tabs.sendMessage(targetTab.id, {
      action: 'EXECUTE_RELAY_COMMAND',
      command_type: cmd.command_type,
      payload: cmd.payload
    });

    // 3. Reportar Sucesso
    await reportToMxxcontrol('relay-result', {
      command_id: cmd.id,
      status: response.success ? 'done' : 'error',
      result: response.result || null,
      error_message: response.error || null
    });

  } catch (err) {
    await reportToMxxcontrol('relay-result', {
      command_id: cmd.id,
      status: 'error',
      error_message: err.message
    });
  }
}

// Iniciar Polling usando Alarms (Essencial para Manifest V3)
chrome.alarms.create('mxx_relay_poll', { periodInMinutes: 0.1 }); // Tentativa de polling frequente (aprox cada 6s em dev)

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'mxx_relay_poll') {
    pollCommands();
  }
});

// Execução imediata ao carregar
pollCommands();

console.log('✅ [MXX] Background Service Ativado v2.1 (Alarms Mode)');
