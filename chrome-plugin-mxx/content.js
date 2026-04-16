// content.js - Injetado no painel Sigma (Megga99/Primelux) v2.3
// MODO STEALTH: 100% Invisível, sem botões ou mensagens na tela.

function extractSigmaCustomers() {
  const extracted = [];
  const rows = document.querySelectorAll('table tbody tr');
  const cards = document.querySelectorAll('.col-lg-4 .card');
  const items = cards.length > 0 ? cards : rows;

  items.forEach((container, index) => {
    try {
      const data = parseContainer(container);
      if (data) extracted.push(data);
    } catch (err) {
      // Silencioso em modo stealth
    }
  });
  return extracted;
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
  let password = '******';
  let status = 'active';

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
     if (pwMatch) password = pwMatch[1];
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

// Lógica de Sincronia Silenciosa
let lastSyncCount = 0;
let syncTimeout = null;

function triggerSync() {
  const customers = extractSigmaCustomers();
  if (customers.length === 0) return;

  // Evitar sync repetido se nada mudou
  if (customers.length === lastSyncCount) return;

  chrome.runtime.sendMessage({ action: 'SYNC_CUSTOMERS_PAYLOAD', data: customers }, (res) => {
    if (res?.success) {
      lastSyncCount = customers.length;
    }
  });
}

// MONITOR DE MUDANÇAS (Silencioso)
const observer = new MutationObserver(() => {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => triggerSync(), 3000); 
});

// Listener para ações remotas (Relay)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXECUTE_RELAY_COMMAND') {
    executeLocalAction(request.command_type, request.payload)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; 
  }
});

async function executeLocalAction(type, payload) {
  const remoteId = payload.customer_id || payload.remote_id;
  if (!remoteId) throw new Error('ID do cliente não fornecido');

  if (type === 'sync_account') {
    const editLink = document.querySelector(`a[href*="/edit/${remoteId}"]`);
    if (!editLink) throw new Error('Cliente não encontrado.');
    const container = editLink.closest('.card') || editLink.closest('tr');
    const data = parseContainer(container);
    await chrome.runtime.sendMessage({ action: 'SYNC_CUSTOMERS_PAYLOAD', data: [data] });
    return { status: 'success' };
  }

  const editLink = document.querySelector(`a[href*="/edit/${remoteId}"]`);
  if (!editLink) throw new Error(`Cliente ${remoteId} não está visível.`);
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
      input.value = payload.connections;
      input.dispatchEvent(new Event('input', { bubbles: true }));
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
      input.value = payload.server_name;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 500));
      const saveBtn = document.querySelector('.el-dialog__footer button.el-button--primary');
      if (saveBtn) saveBtn.click();
      return { status: 'success' };
    }
  }

  throw new Error(`Ação ${type} não implementada.`);
}

// Inicialização Silenciosa
setTimeout(() => {
  triggerSync();
  observer.observe(document.body, { childList: true, subtree: true });
}, 3000);
