const CONFIGURED_MXXCONTROL_API = '__MXXCONTROL_API_BASE__';
const MXXCONTROL_API =
  CONFIGURED_MXXCONTROL_API && CONFIGURED_MXXCONTROL_API !== '__MXXCONTROL_API_BASE__'
    ? CONFIGURED_MXXCONTROL_API
    : 'http://localhost:3001/api/iptv-plugin';
const EXTENSION_VERSION = '1.1.0';
let heartbeatInterval = null;

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

async function sendHeartbeat(reason = 'alive') {
  try {
    await reportToMxxcontrol('extension-heartbeat', {
      version: EXTENSION_VERSION,
      runtime_id: chrome.runtime?.id || null,
      api_base: MXXCONTROL_API,
      reason,
      user_agent: navigator.userAgent,
      sent_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[MXX] Heartbeat falhou:', err.message);
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
    const res = await fetch(`${MXXCONTROL_API}/relay-poll`);
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
    // 1. Achar TODAS as abas de sites (Bomba Atômica)
    const tabs = await chrome.tabs.query({});
    let sigmaTabs = tabs.filter(t => t.url && t.url.startsWith('http'));

    if (cmd.panel_url) {
      try {
        const targetHost = new URL(cmd.panel_url).hostname;
        sigmaTabs = sigmaTabs.filter(t => t.url.includes(targetHost));
      } catch (e) {}
    }

    // Limpeza preventiva de nomes de servidores (remover espaços chatos)
    if (cmd.payload && cmd.payload.server_name) {
      cmd.payload.server_name = cmd.payload.server_name.trim();
    }

    if (sigmaTabs.length === 0) {
      throw new Error('Nenhuma aba de site encontrada aberta no navegador.');
    }

    console.log(`📡 [MXX] Disparando comando ${cmd.command_type} para ${sigmaTabs.length} abas (Broadcast)`);

    let finalResponse = { success: false, error: 'Nenhum painel compatível processou o comando.' };
    let availableInTabs = [];
    
    // 2. Tentar em todas as abas até uma ter sucesso
    for (const tab of sigmaTabs) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: injectedExecution,
          args: [cmd.command_type, cmd.payload, tab.url]
        });

        const res = results[0]?.result;
        
        if (res && res.success) {
          finalResponse = res;
          finalResponse.debug_info = `Processado pela aba: ${tab.url}`;
          break; // Sucesso! 
        } else if (res && res.available_names) {
          availableInTabs.push(`${new URL(tab.url).hostname}: [${res.available_names.join(', ')}]`);
        } else if (res && res.error && !res.ignored) {
          finalResponse.error = res.error;
        }
      } catch (e) {}
    }

    if (!finalResponse.success && availableInTabs.length > 0) {
      finalResponse.error = `Servidor "${cmd.payload.server_name}" não encontrado. Disponíveis nas abas: ${availableInTabs.join(' | ')}`;
    }

    // 3. Reportar Resultado Final
    await reportToMxxcontrol('relay-result', {
      command_id: cmd.id,
      status: finalResponse.success ? 'done' : 'error',
      result: finalResponse.result || null,
      error_message: finalResponse.success ? null : finalResponse.error,
      debug_info: finalResponse.debug_info || 'Varredura de Broadcast finalizada'
    });

  } catch (err) {
    console.error('[MXX] Falha no Broadcast:', err);
    await reportToMxxcontrol('relay-result', {
      command_id: cmd.id,
      status: 'error',
      error_message: err.message
    });
  }
}

/**
 * Esta função é injetada e executada NO CONTEXTO DA PÁGINA (Sigma)
 * Pode acessar localStorage, fetch local, etc.
 */
async function injectedExecution(type, payload, currentUrl) {
    function getAuthToken() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            if (value && value.includes('|') && value.length > 50) return value;
        }
        return null;
    }

    const normalize = (str) => {
        if (!str) return '';
        // Remove emojis, acentos, pontuação e o 's' no final (para bater Megga vs Megga's)
        return str.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/[^a-z0-9]/g, '') // Remove tudo que não é letra/número
            .replace(/s$/, ''); // Remove 's' no final
    };

    try {
        const token = getAuthToken();
        if (!token) return { success: false, ignored: true }; // Ignora abas sem login

        if (type === 'sync_servers') {
            const internalLogs = [];
            const logInfo = (msg) => {
                internalLogs.push(msg);
                console.log(`[MXX-DEBUG] ${msg}`);
            };

            try {
                // Pegar Servidores
                let servers = [];
                const srvRes = await fetch('/api/servers', {
                    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                });
                if (srvRes.ok) {
                    const data = await srvRes.json();
                    servers = data.data || data.servers || [];
                }

                // Pegar Pacotes
                let packages = [];
                const pkgRes = await fetch('/api/packages', {
                    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                });
                if (pkgRes.ok) {
                    const data = await pkgRes.json();
                    packages = data.data || data.packages || [];
                }

                // Pegar Configurações Gerais (Nome do Painel)
                let panelName = new URL(currentUrl).hostname;
                try {
                    const cfgRes = await fetch('/api/settings', {
                        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                    });
                    if (cfgRes.ok) {
                        const data = await cfgRes.json();
                        panelName = data.data?.app_name || data.data?.site_name || panelName;
                    }
                } catch (e) {}

                // Playlist DNS Recovery (Busca DNS escondido através das playlists de clientes)
                try {
                    let missingDnsServers = servers.filter(s => (!s.dns && !s.domain));
                    if (missingDnsServers.length > 0) {
                        logInfo(`Iniciando Recovery para ${missingDnsServers.length} servidores sem DNS.`);
                        let cRes = await fetch('/api/customers?per_page=100', {
                            headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                        });
                        
                        // Fallback para painéis onde o usuário é revendedor (Reseller)
                        if (!cRes.ok) {
                            logInfo(`Falha em /api/customers (Status: ${cRes.status}). Tentando /api/reseller/customers...`);
                            cRes = await fetch('/api/reseller/customers?per_page=100', {
                                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                            });
                        }

                        if (cRes.ok) {
                            const cData = await cRes.json();
                            let customers = [];
                            if (Array.isArray(cData)) customers = cData;
                            else if (Array.isArray(cData.data)) customers = cData.data;
                            else if (cData.data && Array.isArray(cData.data.data)) customers = cData.data.data;
                            else if (Array.isArray(cData.customers)) customers = cData.customers;
                            
                            logInfo(`Clientes encontrados na API: ${customers.length}`);

                            for (const s of missingDnsServers) {
                                let cust = customers.find(c => String(c.server_id) === String(s.id) || (c.server && String(c.server.id) === String(s.id)));
                                
                                // Fallback brutal: se não achar um cliente exato desse servidor, pega o primeiro cliente que existir no painel
                                if (!cust && customers.length > 0) {
                                    cust = customers[0];
                                    logInfo(`Sem cliente exato para ${s.name}. Usando fallback (Genérico).`);
                                }

                                if (cust) {
                                    const identifier = cust.hash || cust.id;
                                    logInfo(`Baixando playlist do cliente: ${identifier} para o servidor ${s.name}...`);
                                    
                                    const pRes = await fetch(`/api/customers/${identifier}/playlist`, {
                                        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                                    });
                                    if (pRes.ok) {
                                        const pData = await pRes.json();
                                        const playlist = pData.data || pData;
                                        
                                        const rawText = JSON.stringify(playlist);
                                        logInfo(`Conteúdo bruto da Playlist/Template JSON: ${rawText.substring(0, 150)}...`);
                                        
                                        // A API não retorna um objeto, ela retorna os Templates de WhatsApp! A DNS está escondida no texto.
                                        const urlRegex = /https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?/g;
                                        const foundUrls = rawText.match(urlRegex) || [];
                                        
                                        // Filtramos links que sabemos que não são a DNS raiz
                                        const ignoredWords = ['wa.me', 'localhost', 'baixaki', 'smarters', 'webplays', 'api.whatsapp', 't.me', 'bit.ly', 'is.gd'];
                                        
                                        let finalDns = '';
                                        for (const u of foundUrls) {
                                            if (!ignoredWords.some(ig => u.toLowerCase().includes(ig))) {
                                                finalDns = u;
                                                break; // Pega a primeira DNS válida
                                            }
                                        }

                                        if (finalDns) {
                                            s.dns = finalDns;
                                            logInfo(`🏆 DNS RESGATADA DO TEXTO DO WHATSAPP: ${s.dns}`);
                                        } else {
                                            logInfo(`Match de Regex Falhou. URLs encontradas: ${foundUrls.join(', ')}`);
                                        }
                                    } else {
                                        logInfo(`Falha GET Playlist. Status: ${pRes.status}`);
                                    }
                                } else {
                                    logInfo(`Nenhum cliente disponível no painel inteiro para sugar a DNS.`);
                                }
                            }
                        } else {
                            logInfo(`Falha ao obter clientes. Status Final: ${cRes.status}`);
                        }
                    }
                } catch (e) {
                    logInfo(`Erro fatal no bloco de Recovery: ${e.message}`);
                }

                return {
                    success: true,
                    result: {
                        panel_name: panelName,
                        panel_url: currentUrl,
                        debug_logs: internalLogs,
                        servers: servers.map(s => ({
                            id: s.id,
                            name: s.name,
                            dns: s.dns || s.domain || '',
                            status: s.status,
                            packages: packages.filter(p => !p.server_id || Number(p.server_id) === Number(s.id))
                        }))
                    }
                };
            } catch (e) {
                return { success: false, error: e.message };
            }
        }

        if (type === 'create_user' || type === 'create_test') {
            let servers = [];
            const endpoints = ['/api/servers', '/api/reseller/servers'];
            
            for (const endpoint of endpoints) {
                try {
                    const res = await fetch(endpoint, {
                        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const found = data.data || data.servers || [];
                        if (found.length > 0) servers = [...servers, ...found];
                    }
                } catch (e) {}
            }
            
            if (servers.length === 0) return { success: false, ignored: true };

            const searchName = normalize(payload.server_name);
            const searchDns = (payload.server_dns || payload.dns || '').toLowerCase();

            const targetSrv = servers.find(s => {
                const sNameFull = (s.name || '').toLowerCase();
                const sNameNorm = normalize(s.name);
                const sDns = (s.dns || s.domain || '').toLowerCase();
                if (searchDns && sDns && (sDns.includes(searchDns) || searchDns.includes(sDns))) return true;
                if (sNameNorm.includes(searchName) || searchName.includes(sNameNorm)) return true;
                if (sNameFull.includes(payload.server_name.toLowerCase())) return true;
                return false;
            });
            
            if (!targetSrv) {
                return { 
                    success: false, 
                    ignored: true, 
                    available_names: servers.map(s => s.name).slice(0, 10) 
                };
            }

            const searchPkg = normalize(payload.package_name);
            let targetPkg = null;
            if (targetSrv.packages) {
                targetPkg = targetSrv.packages.find(p => normalize(p.name).includes(searchPkg) || searchPkg.includes(normalize(p.name)));
            }

            if (!targetPkg) {
                try {
                    const resPkg = await fetch('/api/packages', {
                        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                    });
                    if (resPkg.ok) {
                        const rawPkg = await resPkg.text();
                        try {
                            const dataPkg = JSON.parse(rawPkg);
                            const allPkgs = dataPkg.data || dataPkg.packages || [];
                            targetPkg = allPkgs.find(p => normalize(p.name).includes(searchPkg) || searchPkg.includes(normalize(p.name)));
                        } catch (e) {}
                    }
                } catch (e) {}
            }

            if (!targetPkg && payload.is_trial) {
                targetPkg = (targetSrv.packages || []).find(p => p.name.toLowerCase().includes('teste') || p.name.toLowerCase().includes('test'));
            }

            if (!targetPkg) throw new Error(`Pacote "${payload.package_name}" não encontrado.`);

            const resCreate = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                    server_id: targetSrv.id,
                    package_id: targetPkg.id,
                    username: payload.username,
                    password: payload.password,
                    connections: payload.max_connections || 1
                })
            });

            if (resCreate.ok) {
                const finalData = await resCreate.json();
                return { success: true, result: finalData.data };
            } else {
                const rawErr = await resCreate.text();
                let errMsg = `Erro Sigma (${resCreate.status})`;
                try {
                    const jsonErr = JSON.parse(rawErr);
                    errMsg = jsonErr.message || jsonErr.error || errMsg;
                } catch (e) { errMsg = rawErr.substring(0, 150); }
                throw new Error(errMsg);
            }
        }
        
        if (type === 'delete_user') {
            const token = getAuthToken();
            if (!token) return { success: false, ignored: true };
            const res = await fetch(`/api/customers/${payload.customer_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            return { success: res.ok };
        }

        return { success: false, ignored: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// ============================================
// SISTEMA DE RELAY E KEEP-ALIVE
// ============================================

const POLL_INTERVAL_MS = 3000;
let pollingInterval = null;

function startPolling() {
  if (pollingInterval) return;
  pollingInterval = setInterval(pollCommands, POLL_INTERVAL_MS);
  pollCommands();
}

function startHeartbeat() {
  if (heartbeatInterval) return;
  sendHeartbeat('startup');
  heartbeatInterval = setInterval(() => {
    sendHeartbeat('interval');
  }, 30000);
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ MaxxControl Injector: Service Worker instalado.');
  chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 });
  startPolling();
  startHeartbeat();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 });
  startPolling();
  startHeartbeat();
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'keepAlive') {
    if (!pollingInterval) {
      startPolling();
    }
    sendHeartbeat('alarm');
  }
});

startPolling();
startHeartbeat();

console.log('✅ [MXX] Background Service Ativado v2.2 (Fast Polling Mode)');
