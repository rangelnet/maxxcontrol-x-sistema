// content.js - Injetado no painel Sigma (Megga99/Primelux) v2.4
// MODO STEALTH: 100% Invisível, usando técnicas avançadas e API Rest
// Baseado no MxxControl Premium Engine

console.log('🚀 Extensão MaxxControl-Sigma Content Script carregado v2.4');

// Obter token de autenticação igual ao plugin-licensed
function getAuthToken() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (value && value.includes('|') && value.length > 50) return value;
    }
    return null;
}

function extractSigmaCustomers() {
  const extracted = [];
  
  // 1. Verificar se estamos em uma página de EDIÇÃO individual
  if (window.location.href.includes('/customers/edit/')) {
    const data = parseEditPage();
    if (data) extracted.push(data);
    return extracted;
  }

  // 2. Se for a LISTA de clientes
  const rows = document.querySelectorAll('table tbody tr');
  const cards = document.querySelectorAll('.col-lg-4 .card');
  const items = cards.length > 0 ? cards : rows;

  items.forEach((container, index) => {
    try {
      const data = parseContainer(container);
      if (data) extracted.push(data);
    } catch (err) {}
  });
  return extracted;
}

// Nova função para ler a página de edição individual
function parseEditPage() {
  try {
    // No Sigma/Megga, os campos costumam ter classes do ElementUI ou IDs específicos
    const usernameInput = document.querySelector('input[placeholder*="Usuário"], .el-input__inner[type="text"]');
    const passwordInput = document.querySelector('input[type="password"], input[placeholder*="Senha"]');
    const expireInput = document.querySelector('input[placeholder*="Vencimento"], .el-date-editor input');
    
    // Tenta pegar o ID da URL
    const idMatch = window.location.href.match(/\/edit\/([a-zA-Z0-9]+)/);
    const remote_id = idMatch ? idMatch[1] : '';

    if (usernameInput && usernameInput.value) {
      return {
        username: usernameInput.value.trim(),
        password: passwordInput ? passwordInput.value.trim() : '',
        expire_date: expireInput ? expireInput.value.trim() : '',
        remote_id: remote_id,
        panel_url: window.location.href,
        package_name: 'Atualizado via Edição',
        server_name: 'Sigma',
        max_connections: 1,
        status: 'active',
        device_mac: `SGM-${usernameInput.value.trim().substring(0,8)}`
      };
    }
  } catch (err) {
    console.error('Erro ao ler página de edição:', err);
  }
  return null;
}

function parseContainer(container) {
  let username = '';
  let remote_id = '';
  let panel_url = window.location.href;
  let expire_date = '';
  let package_name = '';
  let server_name = '';
  let max_connections = 1;
  let m3u_url = '';
  let password = '';
  let status = 'active';

  // Tentar capturar senha de atributos de dados (comum no Sigma)
  const pwEl = container.querySelector('[data-password], [data-pass], .password-field');
  if (pwEl) {
    password = pwEl.getAttribute('data-password') || pwEl.getAttribute('data-pass') || pwEl.innerText.trim();
  }

  const fullText = container.innerText;
  const editLink = container.querySelector('a[href*="/customers/edit/"]');
  if (editLink) {
    username = editLink.innerText.trim();
    const href = editLink.getAttribute('href');
    const idMatch = href.match(/\/edit\/([a-zA-Z0-9]+)/);
    if (idMatch) remote_id = idMatch[1];
  }

  const smalls = container.querySelectorAll('small');
  if (smalls.length >= 2) {
    server_name = smalls[0].innerText.trim();
    package_name = smalls[1].innerText.trim();
  }

  const connectionsMatch = fullText.match(/Conexões:\s*(\d+)/i);
  if (connectionsMatch) max_connections = parseInt(connectionsMatch[1]);

  const dateMatch = fullText.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (dateMatch) expire_date = dateMatch[1];
  
  if (fullText.toLowerCase().includes('expirad') || fullText.toLowerCase().includes('expired')) status = 'expired';

  const htmlContent = container.innerHTML;
  const m3uRegex = /(http[s]?:\/\/[^\s"'<>]+get\.php[^\s"'<>]+)/i;
  const m3uMatch = htmlContent.match(m3uRegex);

  if (m3uMatch) {
     m3u_url = m3uMatch[1].replace(/&amp;/g, '&');
     const pwMatch = m3u_url.match(/[?&]password=([^&]+)/i);
     if (pwMatch && !password) password = pwMatch[1];
  }

  if (username) {
    return {
      username, password, expire_date, remote_id, panel_url,
      package_name, server_name, max_connections, m3u_url, status,
      device_mac: `SGM-${username.substring(0,8)}`
    };
  }
  return null;
}

let lastSyncCount = 0;
let syncTimeout = null;

function triggerSync() {
  const customers = extractSigmaCustomers();
  if (customers.length === 0) return;
  if (customers.length === lastSyncCount) return;

  chrome.runtime.sendMessage({ action: 'SYNC_CUSTOMERS_PAYLOAD', data: customers }, (res) => {
    if (res?.success) lastSyncCount = customers.length;
  });
}

const observer = new MutationObserver(() => {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => triggerSync(), 3000); 
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXECUTE_RELAY_COMMAND') {
    executeLocalAction(request.command_type, request.payload)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; 
  }
});

// FUNÇÃO PARA CLICAR NUM ELEMENTO DOM VIA VUEJS/ELEMENT
async function typeInElInput(inputElement, text) {
  inputElement.value = text;
  inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  inputElement.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
}

async function executeLocalAction(type, payload) {
  
  // 1. CRIAR USUÁRIO OU TESTE
  if (type === 'create_user' || type === 'create_test') {
    console.log(`🤖 Iniciando criação via DOM: ${type}`);
    
    // Painel de Logs Fixo na tela
    let logPanel = document.getElementById('maxxcontrol-helper-panel');
    let logList;
    if (!logPanel) {
        logPanel = document.createElement('div');
        logPanel.id = 'maxxcontrol-helper-panel';
        logPanel.style = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999999;
            width: 320px;
            background: #111111;
            border: 2px solid #FFA500;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            font-family: Arial, sans-serif;
            color: #ffffff;
            display: flex;
            flex-direction: column;
        `;
        
        const header = document.createElement('div');
        header.style = "background: #FFA500; color: #050505; padding: 10px; font-weight: bold; font-size: 14px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;";
        header.innerText = "🚀 MaxxControl Injector";
        logPanel.appendChild(header);

        logList = document.createElement('div');
        logList.id = 'maxxcontrol-log-list';
        logList.style = "padding: 10px; max-height: 250px; overflow-y: auto; font-size: 12px; display: flex; flex-direction: column; gap: 5px;";
        logPanel.appendChild(logList);

        document.body.appendChild(logPanel);
    } else {
        logList = document.getElementById('maxxcontrol-log-list');
    }

    const debugDOM = (msg, isError = false) => {
        console.log(`🤖 MaxxControl: ${msg}`);
        const logItem = document.createElement('div');
        logItem.style = `padding: 5px; border-radius: 4px; background: ${isError ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.05)'}; border-left: 3px solid ${isError ? '#ff4444' : '#FFA500'};`;
        logItem.innerText = msg;
        logList.appendChild(logItem);
        logList.scrollTop = logList.scrollHeight; // Auto-scroll
    };

    try {
        debugDOM('Extraindo token de segurança oculto...');
        const token = getAuthToken();
        if (!token) throw new Error('Token JWT não encontrado. Faça login no Sigma.');

        debugDOM(`Buscando Server ID e Package ID... [${payload.server_name}]`);
        const resServers = await fetch('/api/servers', {
            headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
        });
        if (!resServers.ok) throw new Error('Falha ao acessar API de servidores do Sigma');
        const dataServers = await resServers.json();
        
        // Achar o server_id
        const servers = dataServers.data || [];
        const targetServer = servers.find(s => s.name.toLowerCase().includes(payload.server_name.toLowerCase()));
        if (!targetServer) throw new Error(`Servidor não encontrado no painel: ${payload.server_name}`);
        const server_id = targetServer.id;

        // Achar o package_id
        let targetPackage = null;
        if (targetServer.packages) {
             targetPackage = targetServer.packages.find(p => p.name.toLowerCase().includes(payload.package_name.toLowerCase()));
        }
        
        // Se não achou no server, busca na global
        if (!targetPackage) {
             try {
                 const resPkg = await fetch('/api/packages', {
                     headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                 });
                 if (resPkg.ok) {
                     const pkgData = await resPkg.json();
                     const allPkgs = pkgData.data || pkgData.packages || [];
                     targetPackage = allPkgs.find(p => p.name.toLowerCase().includes(payload.package_name.toLowerCase()));
                 }
             } catch(e) {}
        }
        
        // Se AINDA não achou e for Teste, tenta caçar qualquer pacote com a palavra "teste"
        if (!targetPackage && payload.is_trial) {
             debugDOM('Pacote exato não encontrado. Buscando pacote de teste alternativo...');
             if (targetServer.packages) {
                 targetPackage = targetServer.packages.find(p => p.name.toLowerCase().includes('teste') || p.name.toLowerCase().includes('test'));
             }
        }

        if (!targetPackage) {
             debugDOM(`❌ Pacote não encontrado: ${payload.package_name}`, true);
             throw new Error(`Pacote não encontrado: ${payload.package_name}`);
        }
        
        const package_id = targetPackage.id;
        
        debugDOM(`Enviando POST para Sigma via API Fantasma... [Srv: ${server_id}, Pkg: ${package_id}]`);
        
        const createRes = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                server_id: server_id,
                package_id: package_id,
                connections: payload.max_connections || 1,
                bouquets: "",
                parent_can_edit_personal_data: "YES",
                username: payload.username,
                password: payload.password
            })
        });

        if (createRes.status === 200 || createRes.status === 201) {
            const createData = await createRes.json();
            debugDOM('✅ Conta gerada com sucesso e interceptada pelo MaxxControl!');
            const m3uUrl = createData.data?.m3u_url || createData.data?.m3u_url_short || null;
            return { status: 'success', method: 'API_DIRECT', m3u_url: m3uUrl, username: payload.username, password: payload.password };
        } else {
            const errData = await createRes.json();
            throw new Error(errData.message || 'Erro do servidor Sigma ao criar conta');
        }
    } catch (err) {
        debugDOM(`❌ Erro Fatal: ${err.message}`, true);
        throw err;
    }
  }

  // 2. AÇÕES EM CONTAS EXISTENTES (Renew, Delete, Migrate)
  const remoteId = payload.customer_id || payload.remote_id;
  if (!remoteId) throw new Error('ID do cliente não fornecido para ação de edição');

  if (type === 'sync_account') {
    const editLink = document.querySelector(`a[href*="/edit/${remoteId}"]`);
    if (!editLink) throw new Error('Cliente não encontrado.');
    const container = editLink.closest('.card') || editLink.closest('tr');
    const data = parseContainer(container);
    await chrome.runtime.sendMessage({ action: 'SYNC_CUSTOMERS_PAYLOAD', data: [data] });
    return { status: 'success' };
  }

  // Se for deletar e soubermos a API, fazemos GET TOKEN e Fetch Delete (Mais limpo)
  if (type === 'delete_user') {
      const token = getAuthToken();
      if (token) {
          try {
              const res = await fetch(`${window.location.origin}/api/customers/${remoteId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) return { status: 'success', method: 'API_DIRECT' };
          } catch(e) { console.warn('Falha no delete via API, tentando DOM...', e); }
      }
  }

  // Simulação DOM para os botões do Menu do Cliente
  const editLink = document.querySelector(`a[href*="/edit/${remoteId}"]`);
  if (!editLink) throw new Error(`Cliente ${remoteId} não está visível na tela atual.`);
  const container = editLink.closest('.card') || editLink.closest('tr');

  const clickMenuAction = async (actionText) => {
    const menuBtn = container.querySelector('.el-dropdown, .btn-action, button[class*="dropdown"]');
    if (!menuBtn) throw new Error('Menu não encontrado.');
    menuBtn.click();
    await new Promise(r => setTimeout(r, 600));
    const items = document.querySelectorAll('.el-dropdown-menu__item, .dropdown-item');
    const btn = Array.from(items).find(el => el.innerText.includes(actionText));
    if (!btn) throw new Error(`Botão "${actionText}" não encontrado.`);
    btn.click();
    return true;
  };

  if (type === 'renew_user' || type === 'renew_trust') {
    await clickMenuAction(type === 'renew_user' ? 'Renovar' : 'Renovar em Confiança');
    return { status: 'success' };
  }

  if (type === 'delete_user') {
    await clickMenuAction('Excluir');
    return { status: 'success' };
  }

  if (type === 'change_connections') {
    await clickMenuAction('Alterar Conexões');
    await new Promise(r => setTimeout(r, 800));
    const input = document.querySelector('.el-dialog .el-input__inner, .modal input');
    if (input) {
      await typeInElInput(input, payload.connections);
      await new Promise(r => setTimeout(r, 300));
      const saveBtn = document.querySelector('.el-dialog__footer button.el-button--primary, .modal .btn-primary');
      if (saveBtn) saveBtn.click();
      return { status: 'success' };
    }
  }

  if (type === 'migrate_server') {
    await clickMenuAction('Migrar Servidor');
    await new Promise(r => setTimeout(r, 800));
    const input = document.querySelector('.el-dialog .el-input__inner, .modal input');
    if (input) {
      await typeInElInput(input, payload.server_name);
      await new Promise(r => setTimeout(r, 500));
      const saveBtn = document.querySelector('.el-dialog__footer button.el-button--primary');
      if (saveBtn) saveBtn.click();
      return { status: 'success' };
    }
  }

  throw new Error(`Ação ${type} não implementada no content script.`);
}

setTimeout(() => {
  triggerSync();
  observer.observe(document.body, { childList: true, subtree: true });
}, 3000);

