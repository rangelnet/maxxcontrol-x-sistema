import { useState, useEffect, Fragment } from 'react'
import api from '../services/api'
import {
  Ban, CheckCircle, Server, X, Save, Trash2, Download,
  RefreshCw, Package, AlertCircle, Unlock, TestTube, Eye,
  EyeOff, Copy, Wifi, WifiOff, Tv2, Signal, Activity,
  ShieldCheck, ShieldOff, ChevronLeft, ChevronRight, Search,
  MoreVertical, Link, MessageSquare, Users, Repeat, Scissors,
  ExternalLink, Share2, Edit2, Tablet, ChevronDown, ChevronUp,
  Pencil, Play, Calendar, UserCheck, Monitor, Smartphone, 
  Settings, LogIn, LayoutGrid, CalendarCheck, Power
} from 'lucide-react'
import TestApiModal from '../components/TestApiModal'

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const getServerHost = (url) => {
  if (!url) return null
  try { return new URL(url).hostname } catch { return url.length > 25 ? url.slice(0, 25) + '…' : url }
}

const formatPing = (ping) => {
  if (!ping) return { text: 'N/A', cls: 'text-zinc-500' }
  const v = parseInt(ping)
  if (v < 100) return { text: `${v}ms`, cls: 'text-emerald-400' }
  if (v < 300) return { text: `${v}ms`, cls: 'text-yellow-400' }
  return { text: `${v}ms`, cls: 'text-red-400' }
}

const formatQuality = (quality) => {
  const map = {
    excelente: { label: 'Excelente', stars: 4, cls: 'text-emerald-400' },
    boa:       { label: 'Boa',       stars: 3, cls: 'text-blue-400'    },
    regular:   { label: 'Regular',   stars: 2, cls: 'text-yellow-400'  },
    ruim:      { label: 'Ruim',      stars: 1, cls: 'text-red-400'     },
  }
  return map[quality] || { label: 'N/A', stars: 0, cls: 'text-zinc-500' }
}

const getExpireColor = (dateStr) => {
  if (!dateStr || dateStr === '—') return '#71717a'
  
  try {
    // Tenta parsear formato PT-BR (dd/mm/yyyy)
    const parts = dateStr.split('/')
    if (parts.length < 3) return '#FFA500'
    
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2].split(' ')[0])
    
    const expDate = new Date(year, month, day)
    const now = new Date()
    const diffTime = expDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '#f87171' // Vencido (Red)
    if (diffDays <= 7) return '#fbbf24' // Próximo (Yellow/Orange)
    return '#34d399' // OK (Green)
  } catch {
    return '#FFA500'
  }
}

const DaysLeftBadge = ({ dateStr }) => {
  if (!dateStr || dateStr === '—') return null;
  try {
    const parts = dateStr.split('/');
    if (parts.length < 3) return null;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2].split(' ')[0]);
    const expDate = new Date(year, month, day);
    const now = new Date();
    const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <span style={{ marginLeft:6, fontSize:9, padding:'2px 5px', borderRadius:4, background:'rgba(239,68,68,0.15)', color:'#f87171', fontWeight:800 }}>VENCIDO</span>;
    if (diffDays === 0) return <span style={{ marginLeft:6, fontSize:9, padding:'2px 5px', borderRadius:4, background:'rgba(251,191,36,0.15)', color:'#fbbf24', fontWeight:800 }}>HOJE</span>;
    if (diffDays <= 7) return <span style={{ marginLeft:6, fontSize:9, padding:'2px 5px', borderRadius:4, background:'rgba(251,191,36,0.15)', color:'#fbbf24', fontWeight:800 }}>{diffDays}d</span>;
    return <span style={{ marginLeft:6, fontSize:9, padding:'2px 5px', borderRadius:4, background:'rgba(52,211,153,0.15)', color:'#34d399', fontWeight:800 }}>+{diffDays}d</span>;
  } catch { return null; }
}

// ═══════════════════════════════════════════
// SUB-COMPONENTES
// ═══════════════════════════════════════════
const StatCard = ({ icon: Icon, label, value, color = '#FFA500', sub }) => (
  <div style={{
    background: 'rgba(17,17,17,0.7)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,165,0,0.12)',
    borderRadius: 16,
    padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: `${color}22`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 11, color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#52525b', marginTop: 3 }}>{sub}</p>}
    </div>
  </div>
)

const Badge = ({ online, blocked }) => {
  if (blocked) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', borderRadius:999, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', fontSize:11, fontWeight:700 }}>
      <ShieldOff size={11} /> BLOQUEADO
    </span>
  )
  if (online) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', borderRadius:999, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399', fontSize:11, fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 6px #34d399', animation:'pulse 1.5s infinite' }} />
      ONLINE
    </span>
  )
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', borderRadius:999, background:'rgba(113,113,122,0.15)', border:'1px solid rgba(113,113,122,0.25)', color:'#71717a', fontSize:11, fontWeight:700 }}>
      <WifiOff size={11} /> OFFLINE
    </span>
  )
}

const StatusBadge = ({ status, isTrial }) => {
  if (isTrial) return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:999, background:'rgba(217,119,6,0.15)', border:'1px solid rgba(217,119,6,0.25)', color:'#fbbf24', fontSize:11, fontWeight:800 }}><TestTube size={11} /> TESTE</span>
  
  return status === 'ativo' || status === 'active'
    ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:999, background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa', fontSize:11, fontWeight:700 }}><ShieldCheck size={11} /> ATIVO</span>
    : <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:999, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', fontSize:11, fontWeight:700 }}><Ban size={11} /> INATIVO</span>
}

const ModalBase = ({ onClose, children, maxWidth = 480 }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div style={{
      background: 'rgba(17,17,17,0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,165,0,0.18)',
      borderRadius: 20,
      padding: 28,
      width: '100%',
      maxWidth,
      boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
    }}>
      {children}
    </div>
  </div>
)

const PlanBadge = ({ letter, color, onClick, title }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      onClick && onClick();
    }}
    style={{
      width: 22, height: 22, borderRadius: 5, background: color, color: '#fff',
      fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: 'none', cursor: 'pointer', transition: 'all 0.15s', outline: 'none',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}
    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2) translateY(-2px)'}
    onMouseOut={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
    title={title}
  >
    {letter}
  </button>
)

const ModalHeader = ({ icon: Icon, title, onClose }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,165,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={18} color='#FFA500' />
      </div>
      <h2 style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{title}</h2>
    </div>
    <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#71717a', cursor:'pointer' }}>
      <X size={16} />
    </button>
  </div>
)

const DeviceInfo = ({ device }) => (
  <div style={{ background:'rgba(5,5,5,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
    <p style={{ fontSize:10, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Dispositivo</p>
    <p style={{ fontFamily:'monospace', fontSize:13, color:'#FFA500', fontWeight:700 }}>{device?.mac_address}</p>
    <p style={{ fontSize:12, color:'#71717a', marginTop:2 }}>{device?.modelo}</p>
  </div>
)

const FormField = ({ label, children }) => (
  <div>
    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{label}</label>
    {children}
  </div>
)

const inputStyle = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, 
  color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color .2s, background-color .2s',
}

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '8px 10px',
  background: 'transparent',
  border: 'none',
  borderRadius: 8,
  color: '#a1a1aa',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    background: 'rgba(255,165,0,0.1)',
    color: '#fff'
  }
}

// ═══════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════
const Devices = () => {
  const [devices, setDevices]               = useState([])
  const [filteredDevices, setFilteredDevices] = useState([])
  const [searchTerm, setSearchTerm]         = useState('')
  const [loading, setLoading]               = useState(true)
  const [refreshing, setRefreshing]         = useState(false)
  const [lastUpdate, setLastUpdate]         = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showIptvModal, setShowIptvModal]   = useState(false)
  const [showTestApiModal, setShowTestApiModal] = useState(false)
  const [showAppsModal, setShowAppsModal]   = useState(false)
  const [showSendApkModal, setShowSendApkModal] = useState(false)
  const [iptvConfig, setIptvConfig]         = useState({ xtream_url:'', xtream_username:'', xtream_password:'' })
  const [apps, setApps]                     = useState([])
  const [appsLoading, setAppsLoading]       = useState(false)
  const [newAppUrl, setNewAppUrl]           = useState('')
  const [newAppName, setNewAppName]         = useState('')
  const [saving, setSaving]                 = useState(false)
  const [itemsPerPage, setItemsPerPage]     = useState(50)
  const [currentPage, setCurrentPage]       = useState(1)
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [toast, setToast]                   = useState(null)
  
  // ── Controle de Visão (Devices Físicos vs Clientes Painel) ──
  const [viewMode, setViewMode]             = useState('unified') // 'unified', 'devices' ou 'clients'
  const [panelClients, setPanelClients]     = useState([])
  const [expandedClients, setExpandedClients] = useState({})
  
  const [unifiedList, setUnifiedList]       = useState([])
  const [isMobile, setIsMobile]             = useState(window.innerWidth < 768)
  const [copiedId, setCopiedId]             = useState(null)
  
  const [newConnections, setNewConnections] = useState(1);
  const [targetServer, setTargetServer] = useState('');
  const [relayProcessing, setRelayProcessing] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editForm, setEditForm] = useState({ username: '', password: '', expire_date: '', max_connections: 1, package_name: '' });
  const [newClientForm, setNewClientForm] = useState({ server_name: '', username: '', password: '', package_name: '', months: 1, max_connections: 1 });

  // Cores do Sigma Pro (Fiel ao Print)
  const colors = {
    gray: '#2d2e32',
    blue: '#1e40af',
    yellow: '#B18E00',
    purple: '#7e22ce',
    green: '#15803d',
    red: '#be123c',
    action: '#1d4ed8',
    orange: '#FFA500',
    cyan: '#0891b2',
    teal: '#0d9488',
    indigo: '#4f46e5',
    pink: '#db2777'
  };

  const GridActionButton = ({ icon: Icon, color, onClick, title, label, size = 42 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
      <button 
        onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
        title={title}
        style={{
          width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: color, border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 4px 12px ${color}33`,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
          e.currentTarget.style.boxShadow = `0 8px 20px ${color}55`;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${color}33`;
        }}
      >
        <Icon size={size * 0.45} />
      </button>
      {label && <span style={{ fontSize: 9, color: '#71717a', fontWeight: 600, textAlign: 'center', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{label}</span>}
    </div>
  );

  const SigmaActionButton = ({ icon: Icon, color, onClick, title }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}
      title={title}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: `0 4px 12px ${color}33`,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
        e.currentTarget.style.boxShadow = `0 6px 16px ${color}55`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${color}33`;
      }}
    >
      <Icon size={16} />
    </button>
  );

  const generateReminder = (acc) => {
    const msg = `Olá! Passando para lembrar que seu acesso IPTV (${acc.username}) vence em ${acc.expire_date}. Gostaria de renovar? 🚀`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const sendRemoteAction = async (accountId, type, remoteId, panelUrl, extraPayload = {}) => {
    if (!remoteId) {
      alert("⚠️ Ops! Este cliente não tem um 'ID Remoto' sincronizado. Sincronize a página do painel primeiro.");
      return;
    }

    setRelayProcessing(p => ({ ...p, [accountId]: true }));
    try {
      // 1. Criar o comando no servidor
      const res = await api.post('/api/iptv-plugin/relay-command', {
        command_type: type,
        payload: { customer_id: remoteId, account_id: accountId, ...extraPayload },
        panel_url: panelUrl
      });
      
      if (!res.data.success) throw new Error(res.data.error);

      // 2. Polling de resultado
      const cmdId = res.data.command_id;
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if (attempts > 12) { // 60 segundos de timeout
          clearInterval(interval);
          setRelayProcessing(p => ({ ...p, [accountId]: false }));
          showToast("Timeout: A extensão demorou muito para responder.", "error");
          return;
        }

        try {
          const pollRes = await api.get(`/api/iptv-plugin/relay-result/${cmdId}`);
          if (pollRes.data.status === 'done') {
            clearInterval(interval);
            setRelayProcessing(p => ({ ...p, [accountId]: false }));
            showToast("Ação realizada com sucesso via Extensão!", "success");
            loadClients(); // Recarrega para ver se mudou a data etc
          } else if (pollRes.data.status === 'error') {
            clearInterval(interval);
            setRelayProcessing(p => ({ ...p, [accountId]: false }));
            showToast("Erro na Extensão: " + pollRes.data.error_message, "error");
          }
        } catch (e) { /* ignorar erro de rede no polling */ }
      }, 5000);

    } catch (err) {
      setRelayProcessing(p => ({ ...p, [accountId]: false }));
      showToast("Erro ao enviar comando: " + (err.response?.data?.error || err.message), "error");
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const copyToClipboard = (text, label = "Item") => {
    if (!text) return showToast("Nada para copiar!", "error");
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copiado!`, "success");
    }).catch(() => {
      showToast("Erro ao copiar", "error");
    });
  };

  // ── Carregar Dispositivos ou Clientes ──────────────────────
  useEffect(() => {
    // Carregamento Inicial Unificado
    const initLoad = async () => {
      setLoading(true);
      await Promise.all([loadDevices(), loadClients()]);
      setLoading(false);
    };
    initLoad();

    const interval = setInterval(() => loadDevices(), 8000);
    
    const wsHost = import.meta.env.MODE === 'production'
      ? 'wss://maxxcontrol-x-sistema.onrender.com'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    const ws = new WebSocket(wsHost)

    ws.onopen = () => {
      const token = localStorage.getItem('token')
      if (token) ws.send(JSON.stringify({ type: 'auth', token }))
    }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'device:test-api-updated') {
          setDevices(prev => prev.map(d => d.id === data.data.device_id ? { ...d, test_api_url: data.data.test_api_url } : d))
        }
        if (data.type === 'device:iptv-updated') {
          setDevices(prev => prev.map(d => d.id === data.data.device_id
            ? { ...d, current_iptv_server_url: data.data.xtream_url, current_iptv_username: data.data.xtream_username }
            : d))
        }
        if (data.type === 'device:test-credentials-updated') {
          setDevices(prev => prev.map(d => d.id === data.data.device_id
            ? { ...d, server: data.data.server, username: data.data.username, ping: data.data.ping, quality: data.data.quality }
            : d))
        }
      } catch {}
    }
    return () => { clearInterval(interval); ws.close() }
  }, [])

  // ── Lógica de Unificação (Merge) ────────────────
  useEffect(() => {
    // 1. Mapear dispositivos
    const list = devices.map(dev => {
      // Encontrar contas do Sigma vinculadas a este MAC
      const linkedAccounts = panelClients.find(pc => 
        pc.username === dev.current_iptv_username || 
        (pc.accounts && pc.accounts.some(acc => acc.device_mac === dev.mac_address))
      );
      
      return {
        type: 'device',
        id: `dev-${dev.id}`,
        data: dev,
        sigmaAccounts: linkedAccounts ? (linkedAccounts.accounts || []) : []
      };
    });

    // 2. Adicionar clientes do painel "Órfãos" (que não estão em nenhum device físico)
    const orphans = panelClients.filter(pc => {
      const isLinked = devices.some(dev => 
        dev.current_iptv_username === pc.username ||
        (pc.accounts && pc.accounts.some(acc => acc.device_mac === dev.mac_address))
      );
      return !isLinked;
    }).map(pc => ({
      type: 'sigma_only',
      id: `sigma-${pc.username}`,
      data: pc,
      sigmaAccounts: pc.accounts || []
    }));

    setUnifiedList([...list, ...orphans]);
  }, [devices, panelClients]);

  // ── Filtro de busca unificado ──────────────────
  useEffect(() => {
    let list = unifiedList;
    
    // Filtro de Categoria (Rápido)
    if (viewMode === 'devices') list = list.filter(i => i.type === 'device');
    if (viewMode === 'clients') list = list.filter(i => i.type === 'sigma_only');

    if (statusFilter !== 'all') {
      list = list.filter(item => {
        if (item.type === 'device') {
          if (statusFilter === 'online') return item.data.connection_status === 'online';
          if (statusFilter === 'active') return item.data.status === 'ativo' || item.data.status === 'active';
          if (statusFilter === 'expired') return item.data.status === 'inativo' || item.data.status === 'expired' || item.data.status === 'desativado';
          return false;
        } else {
          const accounts = item.sigmaAccounts || [];
          if (accounts.length === 0) return false;
          if (statusFilter === 'active') return accounts.some(a => a.status === 'active' || a.status === 'ativo');
          if (statusFilter === 'expired') return accounts.some(a => a.status !== 'active' && a.status !== 'ativo');
          if (statusFilter === 'trial') return accounts.some(a => a.is_trial || a.package_name?.toLowerCase().includes('teste'));
          return false;
        }
      });
    }

    if (!searchTerm.trim()) { 
      setFilteredDevices(list); 
      return 
    }
    const t = searchTerm.toLowerCase();
    
    setFilteredDevices(list.filter(item => {
      if (item.type === 'device') {
        const d = item.data;
        return d.mac_address?.toLowerCase().includes(t) ||
               d.modelo?.toLowerCase().includes(t) ||
               d.ip?.toLowerCase().includes(t) ||
               d.current_iptv_username?.toLowerCase().includes(t);
      } else {
        const c = item.data;
        return c.username?.toLowerCase().includes(t) ||
               (c.sigmaAccounts && c.sigmaAccounts.some(a => a.device_mac?.toLowerCase().includes(t)));
      }
    }));
  }, [searchTerm, unifiedList, viewMode]);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  // ── API ────────────────────────────────────────
  const loadDevices = async () => {
    try {
      const r = await api.get('/api/device/list-all')
      setDevices(r.data.devices)
      setLastUpdate(new Date())
    } catch {}
  }

  const loadClients = async () => {
    try {
      const r = await api.get('/api/iptv-plugin/qpanel-grouped-accounts')
      setPanelClients(r.data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const blockDevice = async (id) => {
    if (!confirm('Deseja bloquear este dispositivo?')) return
    try { await api.post('/api/device/block', { device_id: id }); loadDevices(); showToast('Dispositivo bloqueado!') }
    catch { showToast('Erro ao bloquear', 'error') }
  }

  const unblockDevice = async (id) => {
    if (!confirm('Deseja desbloquear este dispositivo?')) return
    try { await api.post('/api/device/unblock', { device_id: id }); loadDevices(); showToast('Dispositivo desbloqueado!') }
    catch { showToast('Erro ao desbloquear', 'error') }
  }

  const deleteDevice = async (id, mac) => {
    if (!confirm(`Excluir permanentemente o dispositivo ${mac}?\n\nTodos os dados serão removidos.`)) return
    try {
      await api.delete(`/api/device/delete/${id}`)
      showToast('Dispositivo excluído!')
      loadDevices()
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao excluir', 'error')
    }
  }

  const openIptvModal = async (device) => {
    setSelectedDevice(device); setShowIptvModal(true)
    try {
      const r = await api.get(`/api/iptv-server/device/${device.id}`)
      setIptvConfig(r.data.xtream_url ? r.data : { xtream_url:'', xtream_username:'', xtream_password:'' })
    } catch { setIptvConfig({ xtream_url:'', xtream_username:'', xtream_password:'' }) }
  }

  const saveIptvConfig = async () => {
    setSaving(true)
    try { await api.post(`/api/iptv-server/device/${selectedDevice.id}`, iptvConfig); showToast('Configuração salva!'); setShowIptvModal(false) }
    catch { showToast('Erro ao salvar', 'error') }
    finally { setSaving(false) }
  }

  const deleteIptvConfig = async () => {
    if (!confirm('Remover configuração específica? O dispositivo usará a configuração global.')) return
    try { await api.delete(`/api/iptv-server/device/${selectedDevice.id}`); showToast('Configuração removida!'); setShowIptvModal(false) }
    catch { showToast('Erro ao remover', 'error') }
  }

  const openAppsModal = async (device) => {
    setSelectedDevice(device); setShowAppsModal(true); loadApps(device.id)
  }

  const loadApps = async (deviceId) => {
    setAppsLoading(true)
    try { const r = await api.get(`/api/apps/device/${deviceId}`); setApps(r.data.apps) }
    catch { setApps([]) }
    finally { setAppsLoading(false) }
  }

  const uninstallApp = async (pkg) => {
    if (!confirm('Desinstalar este app?')) return
    try { await api.post('/api/apps/uninstall', { device_id: selectedDevice.id, package_name: pkg }); showToast('Comando enviado!'); loadApps(selectedDevice.id) }
    catch { showToast('Erro ao desinstalar', 'error') }
  }

  const sendApk = async () => {
    if (!newAppUrl.trim() || !newAppName.trim()) { showToast('Preencha URL e nome', 'error'); return }
    setSaving(true)
    try { await api.post('/api/apps/send-apk', { device_id: selectedDevice.id, app_name: newAppName, app_url: newAppUrl }); showToast('Comando enviado!'); setShowSendApkModal(false); setNewAppUrl(''); setNewAppName('') }
    catch { showToast('Erro ao enviar APK', 'error') }
    finally { setSaving(false) }
  }


  // ── Paginação ──────────────────────────────────
  const totalPages  = Math.ceil(filteredDevices.length / itemsPerPage)
  const startIndex  = (currentPage - 1) * itemsPerPage
  const paginatedDevices = filteredDevices.slice(startIndex, startIndex + itemsPerPage)

  // ── Stats ──
  const onlineCount   = devices.filter(d => d.connection_status === 'online').length
  const totalTvs      = devices.length
  
  // Stats do Sigma (Contas IPTV Reais)
  const allAccounts   = panelClients.reduce((acc, curr) => [...acc, ...(curr.accounts || [])], [])
  const sigmaActive   = allAccounts.filter(a => a.status === 'active' || a.status === 'ativo').length
  const sigmaTests    = allAccounts.filter(a => a.is_trial || a.package_name?.toLowerCase().includes('teste')).length
  const sigmaAssinantes = sigmaActive - sigmaTests

  const formatLastUpdate = () => {
    if (!lastUpdate) return ''
    const diff = Math.floor((new Date() - lastUpdate) / 1000)
    if (diff < 10) return 'agora mesmo'
    if (diff < 60) return `há ${diff}s`
    if (diff < 3600) return `há ${Math.floor(diff/60)}min`
    return lastUpdate.toLocaleTimeString('pt-BR')
  }

  // ── Styles compartilhados ──────────────────────
  const btnPrimary = {
    display:'flex', alignItems:'center', gap:6, padding:'8px 18px',
    background:'linear-gradient(135deg, #fbbf24, #f59e0b)', border:'none',
    borderRadius:9, color:'#000', fontSize:12, fontWeight:800, cursor:'pointer',
    boxShadow:'0 4px 12px rgba(251,191,36,0.2)', whiteSpace:'nowrap',
    transition: 'all 0.2s'
  }
  const btnGhost = {
    display:'flex', alignItems:'center', gap:6, padding:'8px 16px',
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:9, color:'#d4d4d8', fontSize:12, fontWeight:700, cursor:'pointer',
    whiteSpace:'nowrap',
    transition: 'all 0.2s'
  }

  // ══════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ══════════════════════════════════════════════════
  return (
    <div style={{ position:'relative' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:'fixed', top:24, right:24, zIndex:200,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
          backdropFilter:'blur(12px)', border:`1px solid ${toast.type==='error'?'rgba(239,68,68,0.4)':'rgba(16,185,129,0.4)'}`,
          borderRadius:12, padding:'12px 20px', color:'#fff', fontSize:13, fontWeight:700,
          boxShadow:'0 12px 30px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:8,
          animation:'fadeIn .25s ease',
        }}>
          {toast.type === 'error' ? <X size={16}/> : <CheckCircle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:16, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', marginBottom:4, display:'flex', alignItems:'center', gap:10 }}>
            <Tv2 size={26} color='#FFA500' />
            Gestão de Aparelhos e Clientes
          </h1>
          <p style={{ fontSize:12, color:'#52525b' }}>
            {lastUpdate ? `Atualizado ${formatLastUpdate()}` : 'Carregando...'}
            {' · '}
            <span style={{ color:'#FFA500' }}>{filteredDevices.length} registros</span>
          </p>
          
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop: 12, flexWrap:'wrap' }}>
            <div style={{ display:'flex', background:'rgba(0,0,0,0.3)', borderRadius:10, padding:3 }}>
              {['unified', 'devices', 'clients'].map(m => (
                <button 
                  key={m}
                  onClick={() => setViewMode(m)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none',
                    background: viewMode === m ? 'rgba(255,165,0,0.15)' : 'transparent',
                    color: viewMode === m ? '#FFA500' : '#71717a', cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                  {m === 'unified' ? 'Tudo' : m === 'devices' ? 'Só TVs' : 'Só Painel'}
                </button>
              ))}
            </div>
            
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
            
            <div style={{ display:'flex', gap:6 }}>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'active', label: 'Ativos' },
                { id: 'expired', label: 'Vencidos' },
                { id: 'trial', label: 'Testes' },
                { id: 'online', label: 'Online' }
              ].map(f => (
                 <button 
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    background: statusFilter === f.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${statusFilter === f.id ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                    color: statusFilter === f.id ? '#60a5fa' : '#71717a', cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={() => setShowNewClientModal(true)} style={btnPrimary}>
            <Users size={15} /> + Novo Cliente
          </button>
          {/* Busca */}
          <div style={{ position:'relative', width: isMobile ? '100%' : 'auto' }}>
            <Search size={15} color='#52525b' style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              style={{ ...inputStyle, paddingLeft:34, paddingRight: searchTerm ? 34 : 14, width: isMobile ? '100%' : 240 }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#71717a', cursor:'pointer', display:'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
          {/* Refresh */}
          <button onClick={() => loadDevices(true)} disabled={refreshing} style={btnGhost}>
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Atualizando…' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14, marginBottom:24 }}>
        <StatCard icon={Tv2}        label="TVs Físicas"  value={totalTvs}    color="#FFA500" sub={`${onlineCount} Online agora`} />
        <StatCard icon={Users}      label="Assinantes"   value={sigmaAssinantes} color="#60a5fa" sub="Contas Ativas Sigma" />
        <StatCard icon={TestTube}   label="Testes"       value={sigmaTests}      color="#fbbf24" sub="Contas Experimentais" />
        <StatCard icon={Activity}   label="Total Geral"  value={totalTvs + allAccounts.length} color="#34d399" sub="Ecossistema Maxx" />
      </div>

      {/* ── Tabela ── */}
      <div style={{
        background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)',
        border:'1px solid rgba(255,165,0,0.1)', borderRadius:16,
        overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.35)',
      }}>
        {/* Barra superior da tabela */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, color:'#71717a' }}>Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
              style={{ ...inputStyle, width:'auto', padding:'5px 10px', fontSize:12 }}
            >
              {[10,20,50,100,200].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span style={{ fontSize:12, color:'#52525b' }}>por página</span>
          </div>
          <div style={{ fontSize:12, color:'#52525b', display: 'flex', alignItems: 'center', gap: 10 }}>
            {Object.values(relayProcessing).some(v => v) && (
              <span style={{ display:'flex', alignItems:'center', gap:6, color:'#fbbf24', fontSize:11, fontWeight:800, background:'rgba(251,191,36,0.15)', padding:'4px 10px', borderRadius:8 }}>
                <RefreshCw size={12} className="rotate" /> PROCESSANDO...
              </span>
            )}
            {searchTerm && <span style={{ color:'#FFA500', marginRight:8 }}>{filteredDevices.length} resultado(s)</span>}
            Pág. {currentPage}/{Math.max(totalPages,1)}
          </div>
        </div>

        {/* Corpo do Painel Unificado */}
        <div style={{ flex:1, overflow:'auto' }}>
          {isMobile ? (
            <div style={{ display:'flex', flexDirection:'column', gap:16, padding: '16px 0' }}>
              {paginatedDevices.map((item) => {
                if (item.type === 'device') {
                   const device = item.data;
                   return (
                     <div key={item.id} style={{ background:'rgba(17,17,17,0.85)', border:'1px solid rgba(255,165,0,0.12)', borderRadius:20, overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.5)' }}>
                       <div style={{ padding: 20 }}>
                         <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16 }}>
                            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                              <div style={{ width:48, height:48, borderRadius:12, background:'rgba(255,165,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Tv2 size={24} color="#FFA500" />
                              </div>
                              <div>
                                <p style={{ fontSize:15, fontWeight:900, color:'#fff' }}>{device.modelo || 'Android Device'}</p>
                                <p style={{ fontSize:11, color:'#71717a', fontFamily:'monospace' }}>{device.mac_address}</p>
                              </div>
                            </div>
                            <StatusBadge status={device.status} />
                         </div>
                         
                         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom: 16 }}>
                            <button onClick={() => openAppsModal(device)} style={{ ...btnGhost, justifyContent:'center', background: 'rgba(30,64,175,0.15)', borderColor: 'rgba(30,64,175,0.3)', color: '#60a5fa' }}>
                              <Package size={14} /> GERENCIAR APPS
                            </button>
                            <button onClick={() => openIptvModal(device)} style={{ ...btnGhost, justifyContent:'center', background: 'rgba(177,142,0,0.15)', borderColor: 'rgba(177,142,0,0.3)', color: '#fbbf24' }}>
                              <Server size={14} /> CONFIG IPTV
                            </button>
                         </div>

                         <div style={{ display:'flex', justifyContent:'center', marginBottom: 16 }}>
                            <button onClick={() => { setSelectedDevice(device); setShowTestApiModal(true); }} style={{ ...btnGhost, color:'#c084fc', borderColor:'rgba(168,85,247,0.3)', background:'rgba(168,85,247,0.15)', width:'100%', justifyContent:'center' }}>
                              <TestTube size={14} /> WEBHOOK DE TESTES
                            </button>
                         </div>

                         <div style={{ display:'flex', justifyContent:'center' }}>
                            <button onClick={() => deleteDevice(device.id, device.mac_address)} style={{ ...btnGhost, color:'#ef4444', borderColor:'rgba(239,68,68,0.2)', width:'100%', justifyContent:'center' }}>
                              <Trash2 size={14} /> REMOVER DISPOSITIVO DO SISTEMA
                            </button>
                         </div>
                       </div>
                     </div>
                   );
                } else {
                  const client = item.data;
                  return (
                    <div key={item.id} style={{ display:'flex', flexDirection:'column', gap:16, width: '100%' }}>
                      {client.accounts?.map((acc) => (
                        <div key={acc.id} style={{ background:'#09090b', border:'1px solid #1a1b1e', borderRadius:16, padding: '16px', boxShadow:'0 10px 40px rgba(0,0,0,0.8)', overflow:'hidden' }}>
                          {/* Header Premium - ID em Azul */}
                          <div style={{ marginBottom: 16 }}>
                            <h2 style={{ fontSize: 18, color: '#3b82f6', fontWeight: 600, marginBottom: 4 }}>{acc.id || '621634247'}</h2>
                            <h3 style={{ fontSize: 16, color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                               {acc.server_name || 'PRIMELUX SERVER'} 💎
                            </h3>
                            <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>{acc.package_name || 'ANUAL C/ ADULTOS'}</p>
                            <p style={{ fontSize: 15, color: '#475569', fontWeight: 500 }}>{acc.username}</p>
                          </div>

                          {/* Datas com Borda Tracejada */}
                          <div style={{ padding: '12px 16px', border: '1px dashed #2d2e32', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                               <p style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>Vencimento</p>
                               <p style={{ fontSize: 15, color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center' }}>{acc.expire_date} <DaysLeftBadge dateStr={acc.expire_date} /></p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                               <p style={{ fontSize: 11, color: '#4b5563', fontWeight: 500 }}>Criado em</p>
                               <p style={{ fontSize: 11, color: '#4b5563', fontWeight: 500 }}>{formatDate(acc.created_at)}</p>
                            </div>
                          </div>

                          {/* Bar de Status - Botões Outlined */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div style={{ border: '1px solid #064e3b', borderRadius: 8, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: 14, fontWeight: 500 }}>Ativo</div>
                            <div style={{ border: '1px solid #2e1065', borderRadius: 8, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', fontSize: 14, fontWeight: 500 }}>IPTV</div>
                          </div>

                          {/* Info Plano - Borda Pontilhada */}
                          <div style={{ padding: '12px 16px', border: '1px dotted #2d2e32', borderRadius: 8, marginBottom: 16 }}>
                            <p style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>Plano: R$ 300,00</p>
                            <p style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>Conexões: {acc.max_connections || 2}</p>
                          </div>

                          {/* Botão Principal Verde (Geralmente Renovação ou Ação Global) */}
                          <button 
                            onClick={() => sendRemoteAction(acc.id, 'renew_user', acc.remote_id, acc.panel_url)}
                            style={{ width: '100%', height: 48, background: '#059669', border: 'none', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <LayoutGrid size={20} color="#fff" />
                          </button>

                          {/* Grade de Ações - Borda Pontilhada em volta de tudo */}
                          <div style={{ border: '1px dotted #2d2e32', borderRadius: 12, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(5,5,5,0.2)' }}>
                             {/* Row 1: 4 icons */}
                             <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                               <GridActionButton icon={Pencil} color="#475569" label="Editar" size={48} onClick={() => { setSelectedAccount(acc); setEditForm({ username: acc.username, password: acc.password || '', expire_date: acc.expire_date || '', max_connections: acc.max_connections || 1, package_name: acc.package_name || '' }); setShowEditModal(true); }} />
                               <GridActionButton icon={Monitor} color="#2563eb" label="Playlist" size={48} onClick={() => {}} />
                               <GridActionButton icon={CalendarCheck} color="#B18E00" label="Renovar" size={48} onClick={() => sendRemoteAction(acc.id, 'renew_user', acc.remote_id, acc.panel_url)} />
                               <GridActionButton icon={Calendar} color="#B18E00" label="Renovar em Confiança" size={48} onClick={() => sendRemoteAction(acc.id, 'renew_trust', acc.remote_id, acc.panel_url)} />
                             </div>

                             {/* Row 2: 5 icons */}
                             <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                               <GridActionButton icon={UserCheck} color="#7c3aed" label="Área do Cliente" size={44} onClick={() => acc.panel_url && window.open(acc.panel_url, '_blank')} />
                               <GridActionButton icon={RefreshCw} color="#059669" label="Sincronizar com Servidor" size={44} onClick={() => sendRemoteAction(acc.id, 'sync_account', acc.remote_id, acc.panel_url)} />
                               <GridActionButton icon={Repeat} color="#7c3aed" label="Migrar Servidor" size={44} onClick={() => { setSelectedAccount(acc); setShowMigrateModal(true); }} />
                               <GridActionButton icon={Users} color="#2563eb" label="Alterar Conexões" size={44} onClick={() => { setSelectedAccount(acc); setShowConnectionsModal(true); }} />
                               <GridActionButton icon={AppWindow} color="#7c3aed" label="Ativar Aplicativo" size={44} onClick={() => {}} />
                             </div>

                             {/* Row 3: 3 icons (M, S, P) - Large font */}
                             <div style={{ display: 'flex', justifyContent: 'center', gap: 30 }}>
                               <div style={{ textAlign: 'center' }}>
                                 <button onClick={() => copyToClipboard(acc.m3u_url, 'M3U Plus')} style={{ width: 54, height: 54, background: '#B18E00', border: 'none', borderRadius: 8, color: '#fff', fontSize: 24, fontWeight: 700, cursor: 'pointer' }}>M</button>
                                 <p style={{ fontSize: 9, color: '#71717a', marginTop: 6, fontWeight: 600 }}>Copiar M3U</p>
                               </div>
                               <div style={{ textAlign: 'center' }}>
                                 <button onClick={() => copyToClipboard(acc.m3u_url?.replace('get.php', 'siptv.php'), 'SIptv')} style={{ width: 54, height: 54, background: '#059669', border: 'none', borderRadius: 8, color: '#fff', fontSize: 24, fontWeight: 700, cursor: 'pointer' }}>S</button>
                                 <p style={{ fontSize: 9, color: '#71717a', marginTop: 6, fontWeight: 600 }}>Copiar M3U Curta</p>
                               </div>
                               <div style={{ textAlign: 'center' }}>
                                 <button onClick={() => {
                                    const pUrl = acc.player_url || (acc.panel_url ? `${acc.panel_url.replace('/panel/', '/player/')}` : '');
                                    if (pUrl) window.open(pUrl, '_blank'); else showToast('Player indisponível', 'error');
                                 }} style={{ width: 54, height: 54, background: '#2563eb', border: 'none', borderRadius: 8, color: '#fff', fontSize: 24, fontWeight: 700, cursor: 'pointer' }}>P</button>
                                 <p style={{ fontSize: 9, color: '#71717a', marginTop: 6, fontWeight: 600 }}>Copiar Playlist</p>
                               </div>
                             </div>

                             {/* Row 4: 4 icons */}
                             <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                               <GridActionButton icon={MessageSquare} color="#059669" label="Lembrete de Renovação" size={44} onClick={() => generateReminder(acc)} />
                               <GridActionButton icon={Power} color="#059669" label="Ativo" size={44} onClick={() => sendRemoteAction(acc.id, acc.status === 'active' ? 'disable_user' : 'enable_user', acc.remote_id, acc.panel_url)} />
                               <GridActionButton icon={Trash2} color="#be123c" label="Excluir" size={44} onClick={() => sendRemoteAction(acc.id, 'delete_user', acc.remote_id, acc.panel_url)} />
                               <GridActionButton icon={MoreVertical} color="#2563eb" label="Ações" size={44} onClick={() => setActiveMenu(acc.id)} />
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
            <thead>
              <tr style={{ position:'sticky', top:0, zIndex:10, background:'#050505' }}>
                <th style={{ padding:'12px 14px', textAlign:'left', fontSize:10, color:'#52525b', textTransform:'uppercase', fontWeight:900 }}>Usuário / Dispositivo</th>
                <th style={{ padding:'12px 14px', textAlign:'left', fontSize:10, color:'#52525b', textTransform:'uppercase', fontWeight:900 }}>Servidor / IP</th>
                <th style={{ padding:'12px 14px', textAlign:'left', fontSize:10, color:'#52525b', textTransform:'uppercase', fontWeight:900 }}>Vencimento</th>
                <th style={{ padding:'12px 14px', textAlign:'left', fontSize:10, color:'#52525b', textTransform:'uppercase', fontWeight:900 }}>Situação</th>
                <th style={{ padding:'12px 14px', textAlign:'left', fontSize:10, color:'#52525b', textTransform:'uppercase', fontWeight:900 }}>Detalhes</th>
                <th style={{ padding:'12px 14px', textAlign:'right', fontSize:10, color:'#52525b', textTransform:'uppercase', fontWeight:900 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding:60, textAlign:'center' }}><RefreshCw size={24} className="rotate" color="#60a5fa" /></td></tr>
              ) : paginatedDevices.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:60, textAlign:'center', color:'#52525b' }}>Nenhum registro encontrado.</td></tr>
              ) : (
                paginatedDevices.map((item) => {
                  const isExpanded = expandedClients[item.id];
                  if (item.type === 'device') {
                    const device = item.data;
                    return (
                      <Fragment key={item.id}>
                        <tr onClick={() => setExpandedClients(p => ({...p,[item.id]:!p[item.id]}))} 
                          style={{ cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background 0.2s' }} 
                          onMouseOver={e=>e.currentTarget.style.background='rgba(59,130,246,0.04)'}
                          onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'12px 14px' }}>
                             <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                               <Tv2 size={24} color="#FFA500" />
                               <div>
                                 <div style={{ fontWeight:800, color:'#e4e4e7' }}>{device.modelo || 'Android Device'}</div>
                                 <div style={{ fontSize:10, color:'#71717a' }}>MAC: {device.mac_address}</div>
                               </div>
                               {item.sigmaAccounts.length > 0 && (
                                 <span style={{ fontSize:9, background:'rgba(59,130,246,0.2)', color:'#60a5fa', padding:'2px 6px', borderRadius:4, fontWeight:900 }}>{item.sigmaAccounts.length} CONTAS</span>
                               )}
                             </div>
                          </td>
                          <td style={{ padding:'12px 14px' }}>
                             <div style={{ color:'#e4e4e7', fontSize:12 }}>{device.ip || '—'}</div>
                             <div style={{ fontSize:10, color:'#52525b' }}>{device.versao_app || 'v1.0'}</div>
                          </td>
                          <td style={{ padding:'12px 14px' }}>
                             <div style={{ color:'#a1a1aa', fontSize:12 }}>{formatDate(device.ultimo_acesso)}</div>
                             <div style={{ fontSize:10, color:'#52525b' }}>Último Acesso</div>
                          </td>
                          <td style={{ padding:'12px 14px' }}><StatusBadge status={device.status} /></td>
                          <td style={{ padding:'12px 14px' }}>
                             <div style={{ display:'flex', gap:4 }}>
                               <SigmaActionButton color={colors.purple} icon={TestTube} onClick={(e) => { e.stopPropagation(); setSelectedDevice(device); setShowTestApiModal(true); }} title="Webhook Testes" />
                               <SigmaActionButton color={colors.blue} icon={Package} onClick={(e) => { e.stopPropagation(); openAppsModal(device) }} title="Apps" />
                               <SigmaActionButton color={colors.yellow} icon={Server} onClick={(e) => { e.stopPropagation(); openIptvModal(device) }} title="Config" />
                             </div>
                          </td>
                          <td style={{ padding:'12px 14px', textAlign:'right' }}>
                             <SigmaActionButton color={colors.red} icon={Trash2} onClick={(e) => { e.stopPropagation(); deleteDevice(device.id, device.mac_address) }} title="Excluir" />
                          </td>
                        </tr>
                        {/* Sub-Contas Sigma logadas nesta TV (Layout Sigma Pro) */}
                        {isExpanded && item.sigmaAccounts.map((acc) => (
                          <tr key={acc.id} style={{ background: 'rgba(5,5,5,0.4)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '12px 14px 12px 48px' }}>
                               <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 13 }}>{acc.username}</div>
                               <div style={{ color: '#52525b', fontSize: 10, marginTop: 2 }}>{acc.server_name}</div>
                               <div style={{ color: '#71717a', fontSize: 10, fontFamily: 'monospace' }}>{acc.device_mac}</div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                               <div style={{ color: '#a1a1aa', fontSize: 12, display: 'flex', alignItems: 'center' }}>{acc.expire_date} <DaysLeftBadge dateStr={acc.expire_date} /></div>
                               <div style={{ color: '#52525b', fontSize: 10, marginTop: 4 }}>Controle Remoto Disponível</div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                 <StatusBadge status={acc.status} isTrial={acc.is_trial || acc.package_name?.toLowerCase().includes('teste')} />
                                 <div style={{ color: '#a78bfa', fontSize: 10, fontWeight: 700 }}>{acc.package_name || 'IPTV'}</div>
                                 <div style={{ color: '#52525b', fontSize: 9 }}>Criado em: {acc.created_at || '—'}</div>
                               </div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                               <div style={{ color: '#71717a', fontSize: 12 }}>Conexões: {acc.max_connections || 1}</div>
                            </td>
                            <td colSpan={2} style={{ padding: '12px 14px', position: 'relative' }}>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                 <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                   {relayProcessing[acc.id] ? (
                                     <div style={{ color: '#fbbf24', fontSize: 10, fontWeight: 900, marginRight: 10 }}>PROCESSANDO...</div>
                                   ) : (
                                     <>
                                       <SigmaActionButton color={colors.yellow} icon={ShieldCheck} 
                                           onClick={() => sendRemoteAction(acc.id, 'renew_trust', acc.remote_id, acc.panel_url)} title="Renovar Confiança" />
                                       <SigmaActionButton color={colors.purple} icon={Users} 
                                           onClick={() => { setSelectedAccount(acc); setNewConnections(acc.max_connections || 1); setShowConnectionsModal(true); }} title="Alterar Conexões" />
                                        <SigmaActionButton color={colors.green} icon={RefreshCw} 
                                           onClick={() => sendRemoteAction(acc.id, 'sync_account', acc.remote_id, acc.panel_url)} title="Forçar Sincronia" />
                                        <SigmaActionButton color={colors.purple} icon={Repeat} 
                                           onClick={() => { setSelectedAccount(acc); setShowMigrateModal(true); }} title="Migrar" />
                                        <SigmaActionButton color={colors.red} icon={Trash2} 
                                           onClick={() => sendRemoteAction(acc.id, 'delete_user', acc.remote_id, acc.panel_url)} title="Excluir" />
                                        
                                        <button 
                                          onClick={() => setActiveMenu(activeMenu === acc.id ? null : acc.id)}
                                          style={{
                                            padding: '4px 10px', background: colors.action, border: 'none', borderRadius: 6,
                                            color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer', marginLeft: 6
                                          }}>
                                          Ações
                                        </button>

                                        {activeMenu === acc.id && (
                                          <>
                                            <div onClick={() => setActiveMenu(null)} style={{ position:'fixed', inset:0, zIndex:100 }} />
                                            <div style={{ position:'absolute', top:'100%', right:0, marginTop:8, background:'#111', border:'1px solid #333', borderRadius:10, padding:6, width:200, zIndex:101, boxShadow: '0 10px 30px #000' }}>
                                              <button style={dropdownItemStyle} onClick={() => { setActiveMenu(null); copyToClipboard(acc.m3u_url, 'M3U'); }}><Link size={14}/> Copiar M3U</button>
                                              <button style={dropdownItemStyle} onClick={() => { setActiveMenu(null); copyToClipboard(`${acc.username}:${acc.password || 'senha_oculta'}`, 'Credenciais'); }}><Copy size={14}/> Copiar Credenciais</button>
                                              <button style={dropdownItemStyle} onClick={() => { setActiveMenu(null); generateReminder(acc); }}><MessageSquare size={14}/> Lembrete WhatsApp</button>
                                            </div>
                                          </>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                             </td>
                           </tr>
                         ))}
                      </Fragment>
                    );
                  } else {
                    const client = item.data;
                    return (
                      <Fragment key={item.id}>
                        <tr onClick={() => setExpandedClients(p => ({...p,[item.id]:!p[item.id]}))}
                          style={{ cursor:'pointer', background:'rgba(126,34,206,0.02)', borderBottom:'1px solid rgba(126,34,206,0.05)', transition:'background 0.2s' }}
                          onMouseOver={e=>e.currentTarget.style.background='rgba(126,34,206,0.05)'}
                          onMouseOut={e=>e.currentTarget.style.background='rgba(126,34,206,0.02)'}>
                           <td style={{ padding:'12px 14px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                 <Users size={24} color="#7c3aed" />
                                 <div>
                                   <div style={{ fontWeight:800, color:'#e4e4e7' }}>{client.username}</div>
                                   <div style={{ fontSize:9, background:'rgba(124,58,237,0.2)', color:'#a78bfa', padding:'1px 6px', borderRadius:4, width:'fit-content', marginTop:2 }}>CONTA SIGMA (EXTERNA)</div>
                                 </div>
                              </div>
                           </td>
                           <td style={{ padding:'12px 14px' }}>
                              <div style={{ color:'#a78bfa', fontSize:11, fontWeight:700 }}>{client.accounts?.[0]?.server_name || 'Sigma Panel'}</div>
                              <div style={{ fontSize:10, color:'#52525b' }}>{client.accounts?.length || 0} Servidor(es)</div>
                           </td>
                           <td style={{ padding:'12px 14px' }}>
                              <div style={{ color:'#a1a1aa', fontSize:12, display: 'flex', alignItems: 'center' }}>{client.accounts?.[0]?.expire_date || '—'} <DaysLeftBadge dateStr={client.accounts?.[0]?.expire_date} /></div>
                           </td>
                           <td><div style={{ color:'#a78bfa', fontSize:10, fontWeight:900, border:'1px solid rgba(124,58,237,0.4)', width:'fit-content', padding:'1px 6px', borderRadius:4 }}>IPTV</div></td>
                           <td style={{ padding:'12px 14px' }}>
                              <div style={{ display:'flex', gap:4 }}>
                                 <SigmaActionButton color={colors.blue} icon={Tablet} onClick={(e) => { e.stopPropagation(); }} title="Apps/Dispositivos" />
                                 <SigmaActionButton color={colors.green} icon={RefreshCw} onClick={(e) => { e.stopPropagation(); loadClients(); }} title="Sincronizar" />
                              </div>
                           </td>
                           <td style={{ padding:'12px 14px', textAlign:'right' }}>
                              <SigmaActionButton color={colors.red} icon={Trash2} onClick={(e) => { e.stopPropagation(); }} title="Excluir" />
                           </td>
                        </tr>
                        {/* Sub-Contas Detalhadas para Clientes Sigma (Ações de volta!) */}
                        {isExpanded && client.accounts?.map((acc) => (
                           <tr key={acc.id} style={{ background: 'rgba(5,5,5,0.7)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '16px 14px 16px 48px' }}>
                                 <div style={{ color: '#60a5fa', fontWeight: 900, fontSize: 13, marginBottom: 2 }}>ID: {acc.id}</div>
                                 <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, textTransform:'uppercase' }}>{acc.server_name || 'IPTV'}</div>
                                 <div style={{ color: '#71717a', fontSize: 11, marginTop: 4, fontFamily: 'monospace' }}>{acc.username}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                 <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center' }}>{acc.expire_date} <DaysLeftBadge dateStr={acc.expire_date} /></div>
                                 <div style={{ color: '#52525b', fontSize: 10, marginTop: 4 }}>Criado: {formatDate(acc.created_at)}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                 <StatusBadge status={acc.status} isTrial={acc.is_trial || acc.package_name?.toLowerCase().includes('teste')} />
                                 <div style={{ color: '#a78bfa', fontSize: 10, fontWeight: 900, border:'1px solid rgba(124,58,237,0.3)', width:'fit-content', padding:'1px 5px', borderRadius:4, marginTop:6 }}>IPTV</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                 <div style={{ color: '#e4e4e7', fontSize: 12, fontWeight: 700 }}>Conexões: {acc.max_connections || 1}</div>
                                 <div style={{ color: '#71717a', fontSize: 11, marginTop: 4 }}>{acc.package_name || 'Standard'}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                 <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => copyToClipboard(acc.m3u_url, 'M3U')} style={{ width:24, height:24, borderRadius:6, background:colors.yellow, color:'#fff', fontSize:10, fontWeight:900, border:'none', cursor:'pointer' }}>M</button>
                                    <button onClick={() => copyToClipboard(acc.m3u_url?.replace('get.php', 'siptv.php'), 'SIptv')} style={{ width:24, height:24, borderRadius:6, background:colors.green, color:'#fff', fontSize:10, fontWeight:900, border:'none', cursor:'pointer' }}>S</button>
                                    <button onClick={() => {
                                       const pUrl = acc.player_url || (acc.panel_url ? `${acc.panel_url.replace('/panel/', '/player/')}` : '');
                                       if (pUrl) window.open(pUrl, '_blank'); else showToast('Player indisponível', 'error');
                                    }} style={{ width:24, height:24, borderRadius:6, background:colors.blue, color:'#fff', fontSize:10, fontWeight:900, border:'none', cursor:'pointer' }}>P</button>
                                 </div>
                              </td>
                              <td style={{ padding: '12px 14px', position: 'relative' }}>
                                 <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                                    {relayProcessing[acc.id] ? (
                                       <div style={{ color: '#fbbf24', fontSize: 10, fontWeight: 900, marginRight: 15 }}>PROCESSANDO...</div>
                                    ) : (
                                       <>
                                          <SigmaActionButton color={colors.blue} icon={Pencil} onClick={() => { setSelectedAccount(acc); setEditForm({ username: acc.username, password: acc.password || '', expire_date: acc.expire_date || '', max_connections: acc.max_connections || 1, package_name: acc.package_name || '' }); setShowEditModal(true); }} title="Editar" />
                                          <SigmaActionButton color={colors.yellow} icon={CalendarCheck} onClick={() => sendRemoteAction(acc.id, 'renew_user', acc.remote_id, acc.panel_url)} title="Renovar" />
                                          <SigmaActionButton color={colors.purple} icon={LogIn} onClick={() => acc.panel_url && window.open(acc.panel_url, '_blank')} title="Área do Cliente" />
                                          <SigmaActionButton color={colors.green} icon={RefreshCw} onClick={() => sendRemoteAction(acc.id, 'sync_account', acc.remote_id, acc.panel_url)} title="Sincronizar" />
                                          <SigmaActionButton color={colors.red} icon={Trash2} onClick={() => sendRemoteAction(acc.id, 'delete_user', acc.remote_id, acc.panel_url)} title="Excluir" />
                                          
                                          <button 
                                             onClick={() => setActiveMenu(activeMenu === acc.id ? null : acc.id)}
                                             style={{ padding: '6px 14px', background: colors.action, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(29,78,216,0.3)' }}
                                             onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                             onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                          >
                                             Ações
                                          </button>

                                          {activeMenu === acc.id && (
                                             <>
                                                <div onClick={() => setActiveMenu(null)} style={{ position:'fixed', inset:0, zIndex:100 }} />
                                                <div style={{ position:'absolute', top:'100%', right:0, marginTop:10, background:'#111', border:'1.5px solid #333', borderRadius:14, padding:8, width:200, zIndex:101, boxShadow: '0 15px 40px #000' }}>
                                                   <button style={dropdownItemStyle} onClick={() => { setActiveMenu(null); generateReminder(acc); }}><MessageSquare size={14}/> Lembrete WhatsApp</button>
                                                   <button style={dropdownItemStyle} onClick={() => { setActiveMenu(null); setSelectedAccount(acc); setShowMigrateModal(true); }}><Repeat size={14}/> Migrar Servidor</button>
                                                   <button style={dropdownItemStyle} onClick={() => { setActiveMenu(null); setSelectedAccount(acc); setShowConnectionsModal(true); }}><Users size={14}/> Alterar Conexões</button>
                                                   <button style={dropdownItemStyle} onClick={() => { setActiveMenu(null); sendRemoteAction(acc.id, acc.status === 'active' ? 'disable_user' : 'enable_user', acc.remote_id, acc.panel_url); }}><Power size={14}/> {acc.status === 'active' ? 'Desativar' : 'Ativar'}</button>
                                                </div>
                                             </>
                                          )}
                                       </>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                      </Fragment>
                    );
                  }
                })
              )}
            </tbody>
          </table>
        )}
      </div>
        {/* Paginação */}
        {totalPages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1}
              style={{ ...btnGhost, opacity: currentPage===1 ? 0.4 : 1 }}>
              <ChevronLeft size={15}/> Anterior
            </button>
            <div style={{ display:'flex', gap:6 }}>
              {[...Array(totalPages)].map((_,i) => {
                const p = i+1
                const visible = p===1 || p===totalPages || (p>=currentPage-2 && p<=currentPage+2)
                if (!visible) return (p===currentPage-3||p===currentPage+3) ? <span key={p} style={{ color:'#52525b', alignSelf:'center', fontSize:12 }}>…</span> : null
                return (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    style={{ width:32, height:32, borderRadius:8, border:'1px solid', cursor:'pointer', fontSize:12, fontWeight:700,
                      borderColor: currentPage===p ? '#FFA500' : 'rgba(255,255,255,0.08)',
                      background: currentPage===p ? 'rgba(255,165,0,0.15)' : 'transparent',
                      color: currentPage===p ? '#FFA500' : '#71717a',
                    }}>
                    {p}
                  </button>
                )
              })}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages}
              style={{ ...btnGhost, opacity: currentPage===totalPages ? 0.4 : 1 }}>
              Próxima <ChevronRight size={15}/>
            </button>
          </div>
        )}
      </div>

      {/* ════ MODAL IPTV ════ */}
      {showIptvModal && (
        <ModalBase onClose={() => setShowIptvModal(false)}>
          <ModalHeader icon={Server} title="Configurar Servidor IPTV" onClose={() => setShowIptvModal(false)} />
          <DeviceInfo device={selectedDevice} />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <FormField label="URL do Servidor">
              <input style={inputStyle} value={iptvConfig.xtream_url}
                onChange={e => setIptvConfig({...iptvConfig,xtream_url:e.target.value})}
                placeholder="http://servidor.com:8080" />
            </FormField>
            <FormField label="Usuário">
              <input style={inputStyle} value={iptvConfig.xtream_username}
                onChange={e => setIptvConfig({...iptvConfig,xtream_username:e.target.value})}
                placeholder="usuario" />
            </FormField>
            <FormField label="Senha">
              <input style={inputStyle} type="password" value={iptvConfig.xtream_password}
                onChange={e => setIptvConfig({...iptvConfig,xtream_password:e.target.value})}
                placeholder="senha" />
            </FormField>
            <p style={{ fontSize:11, color:'#52525b', textAlign:'center' }}>Se não configurar, usará o servidor global.</p>
            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <button onClick={saveIptvConfig} disabled={saving} style={{ ...btnPrimary, flex:1, justifyContent:'center', opacity:saving?0.7:1 }}>
                <Save size={15}/> {saving ? 'Salvando…' : 'Salvar'}
              </button>
              {iptvConfig.xtream_url && (
                <button onClick={deleteIptvConfig} style={{ ...btnGhost, color:'#f87171', borderColor:'rgba(239,68,68,0.25)' }}>
                  <Trash2 size={15}/>
                </button>
              )}
            </div>
          </div>
        </ModalBase>
      )}

      {/* ════ MODAL APPS ════ */}
      {showAppsModal && (
        <ModalBase onClose={() => setShowAppsModal(false)} maxWidth={600}>
          <ModalHeader icon={Package} title="Gerenciar Apps" onClose={() => setShowAppsModal(false)} />
          <DeviceInfo device={selectedDevice} />
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <button onClick={() => loadApps(selectedDevice.id)} style={btnGhost}><RefreshCw size={14}/> Atualizar</button>
            <button onClick={() => setShowSendApkModal(true)} style={{ ...btnPrimary }}><Download size={14}/> Enviar APK</button>
          </div>
          <div style={{ maxHeight:340, overflowY:'auto' }}>
            {appsLoading ? (
              <div style={{ textAlign:'center', padding:32, color:'#52525b' }}>Carregando apps...</div>
            ) : apps.length===0 ? (
              <div style={{ textAlign:'center', padding:32, color:'#52525b' }}>Nenhum app encontrado</div>
            ) : (
              <>
                {apps.filter(a=>!a.is_system).length>0 && (
                  <div style={{ marginBottom:16 }}>
                    <p style={{ fontSize:11, color:'#71717a', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Apps Instalados</p>
                    {apps.filter(a=>!a.is_system).map(app => (
                      <div key={app.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, marginBottom:6 }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:'#e4e4e7', marginBottom:2 }}>{app.app_name}</p>
                          <p style={{ fontFamily:'monospace', fontSize:10, color:'#52525b' }}>{app.package_name}</p>
                        </div>
                        <button onClick={() => uninstallApp(app.package_name)}
                          style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#f87171' }}>
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {apps.filter(a=>a.is_system).length>0 && (
                  <div>
                    <p style={{ fontSize:11, color:'#71717a', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                      <AlertCircle size={12} color='#fbbf24'/> Apps do Sistema
                    </p>
                    {apps.filter(a=>a.is_system).map(app => (
                      <div key={app.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'rgba(255,255,255,0.02)', borderRadius:10, marginBottom:6, opacity:0.7 }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:'#a1a1aa', marginBottom:2 }}>{app.app_name}</p>
                          <p style={{ fontFamily:'monospace', fontSize:10, color:'#3f3f46' }}>{app.package_name}</p>
                        </div>
                        <span style={{ fontSize:10, padding:'3px 8px', background:'rgba(251,191,36,0.12)', color:'#fbbf24', borderRadius:999, fontWeight:700 }}>SISTEMA</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ModalBase>
      )}

      {/* ════ MODAL ENVIAR APK ════ */}
      {showSendApkModal && (
        <ModalBase onClose={() => setShowSendApkModal(false)}>
          <ModalHeader icon={Download} title="Enviar APK" onClose={() => setShowSendApkModal(false)} />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <FormField label="Nome do App">
              <input style={inputStyle} value={newAppName} onChange={e=>setNewAppName(e.target.value)} placeholder="Ex: YouTube" />
            </FormField>
            <FormField label="URL do APK">
              <input style={inputStyle} value={newAppUrl} onChange={e=>setNewAppUrl(e.target.value)} placeholder="https://exemplo.com/app.apk" />
            </FormField>
            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <button onClick={sendApk} disabled={saving} style={{ ...btnPrimary, flex:1, justifyContent:'center', opacity:saving?0.7:1 }}>
                <Download size={15}/> {saving ? 'Enviando…' : 'Enviar'}
              </button>
              <button onClick={() => setShowSendApkModal(false)} style={{ ...btnGhost, flex:1, justifyContent:'center' }}>Cancelar</button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* ════ MODAL TEST API ════ */}
      {showTestApiModal && (
        <TestApiModal device={selectedDevice} onClose={() => setShowTestApiModal(false)} onSave={() => loadDevices(true)} />
      )}

      {/* ════ MODAL ALTERAR CONEXOES ════ */}
      {showConnectionsModal && (
        <ModalBase onClose={() => setShowConnectionsModal(false)}>
          <ModalHeader icon={Users} title="Alterar Conexões" onClose={() => setShowConnectionsModal(false)} />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:12, color:'#a1a1aa' }}>Digite a nova quantidade de conexões simultâneas para <strong>{selectedAccount?.username}</strong>.</p>
            <FormField label="Quantidade">
              <input style={inputStyle} type="number" min="1" max="10" value={newConnections}
                onChange={e => setNewConnections(e.target.value)} />
            </FormField>
            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <button 
                onClick={() => {
                  setShowConnectionsModal(false);
                  sendRemoteAction(selectedAccount.id, 'change_connections', selectedAccount.remote_id, selectedAccount.panel_url, { connections: newConnections });
                }}
                style={{ ...btnPrimary, flex:1, justifyContent:'center' }}>
                <Save size={15}/> Alterar Agora
              </button>
              <button onClick={() => setShowConnectionsModal(false)} style={{ ...btnGhost, flex:1 }}>Cancelar</button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* ════ MODAL MIGRAR SERVIDOR ════ */}
      {showMigrateModal && (
        <ModalBase onClose={() => setShowMigrateModal(false)}>
          <ModalHeader icon={Repeat} title="Migrar Servidor" onClose={() => setShowMigrateModal(false)} />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:12, color:'#a1a1aa' }}>Escolha o servidor de destino para a conta <strong>{selectedAccount?.username}</strong>.</p>
            <FormField label="Nome do Servidor (Exatamente como no Sigma)">
              <input style={inputStyle} value={targetServer}
                onChange={e => setTargetServer(e.target.value)} placeholder="Ex: MEGA NOVELAS 4K" />
            </FormField>
            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <button 
                onClick={() => {
                  if (!targetServer) return alert("Digite o nome do servidor!");
                  setShowMigrateModal(false);
                  sendRemoteAction(selectedAccount.id, 'migrate_server', selectedAccount.remote_id, selectedAccount.panel_url, { server_name: targetServer });
                }}
                style={{ ...btnPrimary, flex:1, justifyContent:'center' }}>
                <CheckCircle size={15}/> Migrar Agora
              </button>
              <button onClick={() => setShowMigrateModal(false)} style={{ ...btnGhost, flex:1 }}>Cancelar</button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* ════ MODAL EDITAR CLIENTE ════ */}
      {showEditModal && (
        <ModalBase onClose={() => setShowEditModal(false)}>
          <ModalHeader icon={Pencil} title="Editar Cliente" onClose={() => setShowEditModal(false)} />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:12, color:'#a1a1aa', marginBottom:4 }}>Editando conta de <strong>{selectedAccount?.username}</strong> no servidor {selectedAccount?.server_name}</p>
            
            <FormField label="Nova Senha (deixe em branco para não alterar)">
              <input style={inputStyle} value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="********" />
            </FormField>
            
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <FormField label="Vencimento (DD/MM/YYYY)">
                <input style={inputStyle} value={editForm.expire_date} onChange={e => setEditForm({...editForm, expire_date: e.target.value})} placeholder="31/12/2025" />
              </FormField>
              <FormField label="Nº Conexões">
                <input style={inputStyle} type="number" min="1" value={editForm.max_connections} onChange={e => setEditForm({...editForm, max_connections: Number(e.target.value)})} />
              </FormField>
            </div>
            
            <FormField label="Pacote / Plano">
              <input style={inputStyle} value={editForm.package_name} onChange={e => setEditForm({...editForm, package_name: e.target.value})} placeholder="Nome do pacote" />
            </FormField>
            
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  sendRemoteAction(selectedAccount.id, 'edit_user', selectedAccount.remote_id, selectedAccount.panel_url, editForm);
                }}
                style={{ ...btnPrimary, flex:1, justifyContent:'center' }}>
                <Save size={15}/> Salvar Alterações
              </button>
              <button onClick={() => setShowEditModal(false)} style={{ ...btnGhost, flex:1 }}>Cancelar</button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* ════ MODAL NOVO CLIENTE ════ */}
      {showNewClientModal && (
        <ModalBase onClose={() => setShowNewClientModal(false)}>
          <ModalHeader icon={Users} title="Novo Cliente" onClose={() => setShowNewClientModal(false)} />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:12, color:'#a1a1aa', marginBottom:4 }}>Criar nova conta em um dos painéis Sigma conectados.</p>
            
            <FormField label="Servidor de Destino (Painel)">
              <input style={inputStyle} value={newClientForm.server_name} onChange={e => setNewClientForm({...newClientForm, server_name: e.target.value})} placeholder="Ex: MEGA NOVELAS 4K" />
            </FormField>
            
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <FormField label="Usuário">
                <input style={inputStyle} value={newClientForm.username} onChange={e => setNewClientForm({...newClientForm, username: e.target.value})} placeholder="usuario123" />
              </FormField>
              <FormField label="Senha">
                <input style={inputStyle} value={newClientForm.password} onChange={e => setNewClientForm({...newClientForm, password: e.target.value})} placeholder="senha123" />
              </FormField>
            </div>
            
            <FormField label="Pacote / Plano Base">
              <input style={inputStyle} value={newClientForm.package_name} onChange={e => setNewClientForm({...newClientForm, package_name: e.target.value})} placeholder="Ex: PACOTE COMPLETO" />
            </FormField>
            
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <FormField label="Duração (Meses)">
                <input style={inputStyle} type="number" min="1" value={newClientForm.months} onChange={e => setNewClientForm({...newClientForm, months: Number(e.target.value)})} />
              </FormField>
              <FormField label="Conexões">
                <input style={inputStyle} type="number" min="1" value={newClientForm.max_connections} onChange={e => setNewClientForm({...newClientForm, max_connections: Number(e.target.value)})} />
              </FormField>
            </div>
            
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button 
                onClick={() => {
                  if (!newClientForm.server_name || !newClientForm.username || !newClientForm.password) return showToast("Preencha servidor, usuário e senha", "error");
                  setShowNewClientModal(false);
                  sendRemoteAction('new', 'create_user', 'new', null, newClientForm);
                  setNewClientForm({ server_name: '', username: '', password: '', package_name: '', months: 1, max_connections: 1 });
                }}
                style={{ ...btnPrimary, flex:1, justifyContent:'center' }}>
                <CheckCircle size={15}/> Criar Conta
              </button>
              <button onClick={() => setShowNewClientModal(false)} style={{ ...btnGhost, flex:1 }}>Cancelar</button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* CSS global da página */}
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}

export default Devices
