import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Edit2, Trash2, Power, PowerOff, Shield, Link2, KeyRound, ShoppingCart, History, QrCode, X, CheckCircle, MessageCircle, Zap, Loader2, CreditCard, Smartphone, Key, RefreshCw, FileJson, Globe, HelpCircle, ChevronRight, Layout, List, Activity } from 'lucide-react';

const Resale = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMasterOrUnlimited = user && (user.tipo === 'admin' || (user.plano && String(user.plano).toLowerCase().includes('ilimitado')));
  
  const canResellers = user?.tipo === 'admin' || user?.perm_revenda_lista !== false;
  const canShop = user?.tipo === 'admin' || user?.perm_revenda_shop !== false;
  const canApps = user?.tipo === 'admin' || user?.perm_revenda_apps !== false;
  const canLogs = user?.tipo === 'admin' || user?.perm_revenda_logs !== false;

  const initialTab = location.hash === '#shop' ? 'shop' : (canResellers ? 'resellers' : (canShop ? 'shop' : (canApps ? 'apps' : '')));
  const [activeTab, setActiveTab] = useState(initialTab); // 'resellers' | 'shop' | 'apps' | 'logs'
  
  useEffect(() => {
    if (location.hash === '#shop' && canShop) {
      setActiveTab('shop');
    }
  }, [location.hash, canShop]);

  const [deviceSession, setDeviceSession] = useState(null);
  const [deviceLoginMode, setDeviceLoginMode] = useState('mac'); // 'mac' | 'code'
  const [deviceCode, setDeviceCode] = useState('');
  const [deviceLoginForm, setDeviceLoginForm] = useState({ mac: '', key: '' });
  const [devicePlaylists, setDevicePlaylists] = useState([]);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [playlistFormData, setPlaylistFormData] = useState({ name: '', type: 'url', content: '' });
  const [migrationForm, setMigrationForm] = useState({ oldMac: '', newMac: '', key: '' });
  const [dnsForm, setDnsForm] = useState({ mac: '', dns: '' });
  
  const [apps, setApps] = useState([]);
  const [activationForm, setActivationForm] = useState({ mac: '', appId: '', type: 'monthly' });
  
  // States - Resellers
  const [revendedores, setRevendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States - Modals
  const [showModal, setShowModal] = useState(false); // Reseller CRUD Modal
  const [showPixModal, setShowPixModal] = useState(false); // Pix Checkout Modal
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [checkoutMethod, setCheckoutMethod] = useState('pix'); // 'pix' | 'card'
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    doc: ''
  });

  const [editandoRevendedor, setEditandoRevendedor] = useState(null);
  const [formData, setFormData] = useState({ 
    nome: '', email: '', senha: '', telefone: '', empresa: '', 
    limite_dispositivos: 10, creditos: 0, plano_revenda: 'Revenda', ativo: true,
    provider_code: '', dns_url: '', test_api_urls: [''],
    perm_dashboard: true, perm_dispositivos: true, perm_carteira: false, perm_revenda: false, perm_planos: false, perm_assinatura: false, perm_jogos: false, perm_banners: false, perm_chat: false, perm_agentes: false,
    perm_iptv: true, perm_plugin: true, perm_arvore: false, 
    perm_api: false, perm_branding: false, perm_galeria: false, perm_whitelabel: false, perm_whatsapp: false, perm_versoes: false, perm_config: false, perm_tickets: true,
    perm_dispositivos_lista: true, perm_dispositivos_logs: true,
    perm_device_resumo: true, perm_device_assinatura: true, perm_device_tv: true, perm_device_apps: true, perm_device_credenciais: true, perm_device_futebol: true, perm_device_acoes: true,
    perm_revenda_lista: false, perm_revenda_shop: false, perm_revenda_apps: false, perm_revenda_logs: false,
    perm_planos_lista: false, perm_planos_crm: false, perm_planos_loja: false, perm_planos_apps: false, perm_planos_gateways: false,
    perm_banners_gen: false, perm_banners_themes: false,
    perm_api_config: false, perm_api_monitor: false,
    perm_iptv_global: true, perm_iptv_mapping: true, perm_iptv_servers: true,
    perm_whatsapp_bulk: false, perm_whatsapp_flow: false,
    perm_tickets_abertos: true, perm_tickets_fechados: true,
    perm_whitelabel_geral: false, perm_whitelabel_planos: false, perm_whitelabel_aparencia: false, perm_whitelabel_pagamento: false
  });

  // Mocks Finanças
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState(null);

  // States - Créditos 2FA
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({ revendedor_id: '', nome: '', quantidade: 5 });
  const [tfaMode, setTfaMode] = useState(false);
  const [tfaCode, setTfaCode] = useState('');

  const [creditPackages, setCreditPackages] = useState([]);

  // States - Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => { 
    carregarRevendedores(); 
    carregarHistorico();
    carregarPacotesCreditos();
    carregarApps();
    if (isMasterOrUnlimited) {
      carregarLogs();
    }
  }, [isMasterOrUnlimited]);

  const carregarLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('/api/resale/logs');
      setAuditLogs(res.data.logs);
    } catch (e) {
      console.error('Erro ao carregar logs:', e);
    } finally {
      setLogsLoading(false);
    }
  };

  const carregarApps = async () => {
    try {
      const res = await api.get('/api/finance/app-packages');
      setApps(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const carregarPacotesCreditos = async () => {
    try {
      const response = await api.get('/api/finance/credit-packages');
      setCreditPackages(response.data);
    } catch (err) {
      console.error('Erro ao carregar pacotes de créditos:', err);
    }
  };

  const carregarHistorico = async () => {
    try {
      setHistoryLoading(true);
      const response = await api.get('/api/payments/history');
      setHistory(response.data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // --- Funções CRUD Revendedores ---
  const carregarRevendedores = async () => {
    try {
      const response = await api.get('/api/resale/resellers');
      setRevendedores(response.data);
    } catch (error) {
      console.error('Erro ao carregar revendedores:', error);
      // Removido o mock 'João Silva' fantasma para não gerar confusão de login
    } finally { setLoading(false); }
  };

  const generateProviderCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleOpenNew = () => {
    resetForm();
    setFormData(prev => ({ ...prev, provider_code: generateProviderCode() }));
    setShowModal(true);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoRevendedor) await api.put(`/api/resale/resellers/${editandoRevendedor.id}`, formData);
      else await api.post('/api/resale/resellers', formData);
      setShowModal(false); resetForm(); carregarRevendedores();
    } catch (error) {
       console.error('Erro ao salvar revendedor:', error);
       alert(error.response?.data?.error || 'Erro ao salvar revendedor.');
       setShowModal(false); resetForm();
    }
  };

  const handleEdit = (revendedor) => {
    setEditandoRevendedor(revendedor);
    setFormData({ 
      nome: revendedor.nome, email: revendedor.email, senha: revendedor.senha || '', telefone: revendedor.telefone || '', 
      empresa: revendedor.empresa || '', limite_dispositivos: revendedor.limite_dispositivos,
      creditos: revendedor.creditos || 0, plano_revenda: revendedor.plano_revenda || 'Revenda', ativo: revendedor.ativo,
      provider_code: revendedor.provider_code || '', dns_url: revendedor.dns_url || '', test_api_urls: Array.isArray(revendedor.test_api_urls) && revendedor.test_api_urls.length > 0 ? revendedor.test_api_urls : [''],
      perm_dashboard: revendedor.perm_dashboard ?? true, perm_dispositivos: revendedor.perm_dispositivos ?? true, perm_carteira: revendedor.perm_carteira ?? false, perm_revenda: revendedor.perm_revenda ?? false, perm_planos: revendedor.perm_planos ?? false, perm_assinatura: revendedor.perm_assinatura ?? false, perm_jogos: revendedor.perm_jogos ?? false, perm_banners: revendedor.perm_banners ?? false, perm_chat: revendedor.perm_chat ?? false, perm_agentes: revendedor.perm_agentes ?? false,
      perm_iptv: revendedor.perm_iptv ?? true, perm_plugin: revendedor.perm_plugin ?? true, perm_arvore: revendedor.perm_arvore ?? false,
      perm_api: revendedor.perm_api ?? false, perm_branding: revendedor.perm_branding ?? false, perm_galeria: revendedor.perm_galeria ?? false, perm_whitelabel: revendedor.perm_whitelabel ?? false, perm_whatsapp: revendedor.perm_whatsapp ?? false, perm_versoes: revendedor.perm_versoes ?? false, perm_config: revendedor.perm_config ?? false, perm_tickets: revendedor.perm_tickets ?? true,
      perm_dispositivos_lista: revendedor.perm_dispositivos_lista ?? true, perm_dispositivos_logs: revendedor.perm_dispositivos_logs ?? true,
      perm_revenda_lista: revendedor.perm_revenda_lista ?? false, perm_revenda_shop: revendedor.perm_revenda_shop ?? false, perm_revenda_apps: revendedor.perm_revenda_apps ?? false, perm_revenda_logs: revendedor.perm_revenda_logs ?? false,
      perm_planos_lista: revendedor.perm_planos_lista ?? false, perm_planos_crm: revendedor.perm_planos_crm ?? false, perm_planos_loja: revendedor.perm_planos_loja ?? false, perm_planos_apps: revendedor.perm_planos_apps ?? false, perm_planos_gateways: revendedor.perm_planos_gateways ?? false,
      perm_banners_gen: revendedor.perm_banners_gen ?? false, perm_banners_themes: revendedor.perm_banners_themes ?? false,
      perm_api_config: revendedor.perm_api_config ?? false, perm_api_monitor: revendedor.perm_api_monitor ?? false,
      perm_iptv_global: revendedor.perm_iptv_global ?? true, perm_iptv_mapping: revendedor.perm_iptv_mapping ?? true, perm_iptv_servers: revendedor.perm_iptv_servers ?? true,
      perm_whatsapp_bulk: revendedor.perm_whatsapp_bulk ?? false, perm_whatsapp_flow: revendedor.perm_whatsapp_flow ?? false,
      perm_tickets_abertos: revendedor.perm_tickets_abertos ?? true, perm_tickets_fechados: revendedor.perm_tickets_fechados ?? true,
      perm_whitelabel_geral: revendedor.perm_whitelabel_geral ?? false, perm_whitelabel_planos: revendedor.perm_whitelabel_planos ?? false, perm_whitelabel_aparencia: revendedor.perm_whitelabel_aparencia ?? false, perm_whitelabel_pagamento: revendedor.perm_whitelabel_pagamento ?? false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir revendedor?')) return;
    try { await api.delete(`/api/resale/resellers/${id}`); carregarRevendedores(); } 
    catch (error) { console.error('Erro', error); }
  };

  const handleToggleStatus = async (id, ativo) => {
    try { await api.patch(`/api/resale/resellers/${id}/toggle-status`, { ativo: !ativo }); carregarRevendedores(); } 
    catch (error) { console.error('Erro', error); }
  };

  const resetForm = () => {
    setEditandoRevendedor(null);
    setFormData({ 
      nome: '', email: '', senha: '', telefone: '', empresa: '', 
      limite_dispositivos: 10, creditos: 0, plano_revenda: 'Revenda', ativo: true,
      provider_code: '', dns_url: '', test_api_urls: [''],
      perm_dashboard: true, perm_dispositivos: true, perm_carteira: false, perm_revenda: false, perm_planos: false, perm_assinatura: false, perm_jogos: false, perm_banners: false, perm_chat: false, perm_agentes: false,
      perm_iptv: true, perm_plugin: true, perm_arvore: false, 
      perm_api: false, perm_branding: false, perm_galeria: false, perm_whitelabel: false, perm_whatsapp: false, perm_versoes: false, perm_config: false, perm_tickets: true,
      perm_dispositivos_lista: true, perm_dispositivos_logs: true,
      perm_revenda_lista: false, perm_revenda_shop: false, perm_revenda_apps: false, perm_revenda_logs: false,
      perm_planos_lista: false, perm_planos_crm: false, perm_planos_loja: false, perm_planos_apps: false, perm_planos_gateways: false,
      perm_banners_gen: false, perm_banners_themes: false,
      perm_api_config: false, perm_api_monitor: false,
      perm_iptv_global: true, perm_iptv_mapping: true, perm_iptv_servers: true,
      perm_whatsapp_bulk: false, perm_whatsapp_flow: false,
      perm_tickets_abertos: true, perm_tickets_fechados: true,
      perm_whitelabel_geral: false, perm_whitelabel_planos: false, perm_whitelabel_aparencia: false, perm_whitelabel_pagamento: false
    });
  };

  // --- Funções Shop ---
  const handleSendCredits = async (e) => {
    if (e) e.preventDefault();
    setPaymentLoading(true);
    try {
      const response = await api.post('/api/resale/credits/send', {
        revendedor_id: transferData.revendedor_id,
        quantidade: transferData.quantidade,
        tfa_code: tfaCode
      });

      if (response.data.require2FA) {
        setTfaMode(true);
        return;
      }

      alert(response.data.message);
      setShowTransferModal(false);
      setTfaMode(false);
      setTfaCode('');
      carregarRevendedores();
      carregarHistorico();
    } catch (error) {
       alert(error.response?.data?.error || 'Erro ao enviar créditos');
    } finally {
       setPaymentLoading(false);
    }
  }

  // --- Funções Shop ---
  const handleGeneratePix = async (pkg) => {
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const response = await api.post('/api/payments/pix', {
        package_id: pkg.id,
        credits: pkg.credits,
        amount: pkg.price,
        mac_address: pkg.mac_address || null,
        app_id: pkg.app_id || null
      });
      setPaymentData(response.data);
    } catch (err) {
      setPaymentError('Erro ao gerar PIX. Tente novamente.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCardCheckout = async (e) => {
    if (e) e.preventDefault();
    setPaymentLoading(true);
    setPaymentError('');

    try {
      const response = await api.post('/api/payments/card', {
        ...cardForm,
        package_id: selectedPackage.id,
        credits: selectedPackage.credits,
        amount: selectedPackage.price,
        mac_address: selectedPackage.mac_address || null,
        app_id: selectedPackage.app_id || null
      });

      if (response.data.status === 'approved') {
        setPaymentData({ status: 'approved' });
        carregarHistorico();
        carregarRevendedores();
      } else {
        setPaymentError(`Pagamento ${response.data.status}: ${response.data.status_detail || 'Verifique os dados'}`);
      }
    } catch (err) {
      setPaymentError(err.response?.data?.error || 'Erro ao processar cartão.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCheckout = (pkg) => {
      setSelectedPackage(pkg);
      setShowPixModal(true);
      setPaymentError('');
      setPaymentData(null);
      setCheckoutMethod('pix');
      handleGeneratePix(pkg);
  };

  // --- Funções Estratégicas (Dispositivos) ---
  const handleDeviceLogin = async (e) => {
    if (e) e.preventDefault();
    setPaymentLoading(true);
    try {
      let response;
      if (deviceLoginMode === 'mac') {
        response = await api.post('/api/mac/device-login', { 
          mac_address: deviceLoginForm.mac, 
          device_key: deviceLoginForm.key 
        });
      } else {
        response = await api.post('/api/mac/login-by-code', { code: deviceCode });
      }
      
      setDeviceSession(response.data);
      carregarDevicePlaylists(response.data.mac_address);
      if (response.data.first_login) {
        alert(`Bem-vindo! Sua chave de acesso gerada é: ${response.data.device_key}. Guarde-a para futuros acessos.`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao fazer login no dispositivo.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const carregarDevicePlaylists = async (mac) => {
    try {
      const res = await api.get(`/api/mac/playlists/${mac}`);
      setDevicePlaylists(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePlaylist = async (e) => {
    if (e) e.preventDefault();
    try {
      await api.post('/api/mac/playlists/save', {
        mac_address: deviceSession.mac_address,
        ...playlistFormData
      });
      setShowPlaylistForm(false);
      setPlaylistFormData({ name: '', type: 'url', content: '' });
      carregarDevicePlaylists(deviceSession.mac_address);
    } catch (e) {
      alert('Erro ao salvar playlist');
    }
  };

  const handleMigrateLicense = async (e) => {
    if (e) e.preventDefault();
    setPaymentLoading(true);
    try {
      const res = await api.post('/api/mac/migrate-license', {
        old_mac: migrationForm.oldMac,
        new_mac: migrationForm.newMac,
        device_key: migrationForm.key
      });
      alert(res.data.message);
      setMigrationForm({ oldMac: '', newMac: '', key: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Erro na migração');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleUpdateDNS = async (e) => {
    if (e) e.preventDefault();
    setPaymentLoading(true);
    try {
      const res = await api.post('/api/mac/update-dns', {
        mac_address: dnsForm.mac,
        dns_url: dnsForm.dns
      });
      alert(res.data.message);
      setDnsForm({ mac: '', dns: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao atualizar DNS');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Polling de pagamento (a cada 5 seg)
  useEffect(() => {
    let intervalId;
    if (showPixModal && paymentData && paymentData.payment_id) {
       intervalId = setInterval(async () => {
          try {
             const res = await api.get(`/api/payments/status/${paymentData.payment_id}`);
             if (res.data.status === 'approved') {
                 setPaymentData(prev => ({...prev, status: 'approved'}));
                 carregarHistorico();
                 carregarRevendedores();
                 clearInterval(intervalId);
             }
          } catch(e) {}
       }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [showPixModal, paymentData]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-xl text-zinc-500 animate-pulse"><i className="fas fa-circle-notch fa-spin mr-3"></i> Carregando Painel...</div></div>;

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar text-zinc-100">
      
      {/* HEADER DE SEÇÃO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
            <Shield className="w-8 h-8 text-orange-500" /> Sistema de Revenda VIP
          </h1>
          <p className="text-zinc-400 mt-1 flex items-center">
             Gerencie clientes, controle acesso e <span className="text-yellow-500 ml-1 font-semibold">compre créditos.</span>
          </p>
        </div>
        
        {/* TABS DE NAVEGAÇÃO */}
        <div className="flex bg-dark-900 border border-dark-700 rounded-lg p-1 overflow-x-auto max-w-full custom-scrollbar whitespace-nowrap">
            {canResellers && (
              <button onClick={() => setActiveTab('resellers')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-md transition-all transform active:scale-95 shrink-0 ${activeTab === 'resellers' ? 'bg-dark-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <Users className="w-4 h-4" /> Revendedores
              </button>
            )}
            {canShop && (
              <button onClick={() => setActiveTab('shop')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-md transition-all transform active:scale-95 shrink-0 ${activeTab === 'shop' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'text-zinc-500 hover:text-yellow-500/50'}`}>
                  <ShoppingCart className="w-4 h-4" /> Loja de Créditos
              </button>
            )}
            {canApps && (
              <button onClick={() => setActiveTab('apps')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-md transition-all transform active:scale-95 shrink-0 ${activeTab === 'apps' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 'text-zinc-500 hover:text-blue-500/50'}`}>
                  <Smartphone className="w-4 h-4" /> Ativação de Apps
              </button>
            )}
            {(isMasterOrUnlimited || canLogs) && (
              <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-md transition-all transform active:scale-95 shrink-0 ${activeTab === 'logs' ? 'bg-brand-500/20 text-brand-500 border border-brand-500/30' : 'text-zinc-500 hover:text-brand-500/50'}`}>
                  <Activity className="w-4 h-4" /> Logs de Atividades
              </button>
            )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA: REVENDEDORES E DNS */}
      {/* ========================================================================= */}
      {activeTab === 'resellers' && (
      <div>
        <div className="flex justify-end mb-4">
            <button onClick={handleOpenNew} className="bg-orange-600 hover:bg-orange-500 active:scale-95 text-white px-5 py-2.5 rounded-lg font-black flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 border border-orange-500/50">
            <Plus className="w-5 h-5 flex-shrink-0" /> Criar Revendedor
            </button>
        </div>
        <div className="glass-effect rounded-2xl border border-dark-700 shadow-xl bg-dark-800/60 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-dark-700">
                <thead className="bg-dark-900/50">
                    <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Perfil & Contato</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Acessos & Créditos</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Integração DNS</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                    {revendedores.map((revendedor) => (
                    <tr key={revendedor.id} className="hover:bg-dark-700/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-dark-900 border border-dark-600 flex items-center justify-center text-zinc-300 font-bold">
                                    {(revendedor.nome || 'R').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{revendedor.nome || 'Sem Nome'}</div>
                                    <div className="text-xs text-zinc-500">{revendedor.email || 'Sem Email'}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                            <div className="bg-dark-900 inline-flex flex-col px-3 py-1.5 rounded-lg border border-dark-600">
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs text-zinc-500 font-bold uppercase mr-3">Acessos</span>
                                    <div><span className="text-sm font-bold text-white">{revendedor.dispositivos_ativos || 0}</span><span className="text-xs text-zinc-500 mx-1">/</span><span className="text-sm text-zinc-400">{revendedor.limite_dispositivos}</span></div>
                                </div>
                                <div className="w-full bg-dark-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                    <div className={`h-full ${(revendedor.dispositivos_ativos / revendedor.limite_dispositivos) > 0.8 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(((revendedor.dispositivos_ativos || 0) / revendedor.limite_dispositivos) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-yellow-500/10 inline-flex items-center justify-between px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                <span className="text-xs text-yellow-600 font-bold uppercase mr-3">Créditos App</span>
                                <span className="text-sm font-bold text-yellow-500 flex items-center gap-1.5"><i className="fas fa-coins text-[10px]"></i> {revendedor.creditos || 0}</span>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1.5">
                                <div className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-400 px-2 py-1 rounded-md border border-brand-500/20 w-fit cursor-help font-mono" title="Provider Code">
                                    <KeyRound className="w-3.5 h-3.5" /> <span className="text-xs font-bold">{revendedor.provider_code || '---'}</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 max-w-[150px] truncate" title={revendedor.dns_url}>
                                    <Link2 className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{revendedor.dns_url || 'Sem DNS Vinculado'}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleToggleStatus(revendedor.id, revendedor.ativo)} className={`px-3 py-1 inline-flex text-xs font-bold rounded-full transition-all border transform active:scale-90 ${revendedor.ativo ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                            {revendedor.ativo ? 'ATIVO' : 'BLOQUEADO'}
                        </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setTransferData({revendedor_id: revendedor.id, nome: revendedor.nome, quantidade: 5}); setShowTransferModal(true); }}
                                    className="h-8 px-3 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-dark-900 border border-yellow-500/20 flex items-center gap-1.5 transition-all active:scale-95 text-[10px] font-black uppercase">
                                    <Plus className="w-3.5 h-3.5" /> Adicionar Créditos
                                </button>
                                <button onClick={() => handleEdit(revendedor)} className="h-8 w-8 rounded-lg bg-dark-700 text-zinc-300 hover:text-white hover:bg-orange-500/80 border border-dark-600 flex items-center justify-center transition-all active:scale-90"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(revendedor.id)} className="h-8 w-8 rounded-lg bg-dark-700 text-zinc-300 hover:text-white hover:bg-red-600/80 border border-dark-600 flex items-center justify-center transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {revendedores.length === 0 && (
                <div className="text-center py-16 bg-dark-900/30">
                    <Shield className="mx-auto h-16 w-16 text-zinc-600 opacity-50 mb-3" />
                    <h3 className="text-lg font-bold text-white">Nenhum revendedor cadastrado</h3>
                    <button onClick={handleOpenNew} className="mt-5 bg-orange-600/10 text-orange-500 px-6 py-2 rounded-lg font-bold border border-orange-500/30">Criar Primeiro Revendedor</button>
                </div>
                )}
            </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* ABA: LOJA DE CRÉDITOS */}
      {/* ========================================================================= */}
      {activeTab === 'shop' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
        
        {/* PARTE 1: VITRINE DE PACOTES (Lado Esquerdo/Ocupa 2/3) */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="text-yellow-500 w-5 h-5"/> Compre Mais Créditos</h2>
            <p className="text-zinc-400 text-sm">Selecione o pacote desejado. Quanto maior a escala, maior o seu desconto de revenda.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                {creditPackages.map(pkg => (
                    <div key={pkg.id} className="glass-effect rounded-2xl border border-dark-700 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] transition-all bg-gradient-to-br from-dark-800 to-dark-900 p-6 flex flex-col items-center text-center relative overflow-hidden group">
                        
                        {/* Brilho hover */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-yellow-500/20 transition-all"></div>

                        {/* Ícone ou Badge de Desconto Baseado no Valor */}
                        {pkg.promo_price && (
                            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow shadow-red-600/30 uppercase">
                                Promocional
                            </span>
                        )}

                        <h3 className="text-4xl font-black text-white mt-2 group-hover:scale-110 transition-transform origin-bottom">{pkg.credit_amount}</h3>
                        <p className="text-xs font-bold tracking-widest text-zinc-500 mt-1 uppercase">{pkg.name || 'Créditos'}</p>
                        
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent my-4"></div>

                        {pkg.promo_price ? (
                           <>
                             <div className="text-sm font-bold text-zinc-500 line-through">R$ {parseFloat(pkg.price).toFixed(2).replace('.',',')}</div>
                             <div className="text-2xl font-bold text-white">R$ {parseFloat(pkg.promo_price).toFixed(2).replace('.',',')}</div>
                             <p className="text-[10px] text-yellow-500 mt-1 mb-5">R$ {(parseFloat(pkg.promo_price) / pkg.credit_amount).toFixed(2).replace('.',',')} / unidade</p>
                             <button onClick={() => handleCheckout({ id: pkg.id, credits: pkg.credit_amount, price: pkg.promo_price })} className="w-full py-2.5 rounded-lg bg-red-600/80 text-white font-black border border-red-500/50 hover:bg-red-500 transition-all transform active:scale-95 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
                               <ShoppingCart className="w-4 h-4" /> Comprar Agora
                             </button>
                           </>
                        ) : (
                           <>
                             <div className="text-2xl font-bold text-white mt-4">R$ {parseFloat(pkg.price).toFixed(2).replace('.',',')}</div>
                             <p className="text-[10px] text-yellow-500 mt-1 mb-5">R$ {(parseFloat(pkg.price) / pkg.credit_amount).toFixed(2).replace('.',',')} / unidade</p>
                             <button onClick={() => handleCheckout({ id: pkg.id, credits: pkg.credit_amount, price: pkg.price })} className="w-full py-2.5 rounded-lg bg-dark-700 text-zinc-300 font-black border border-dark-600 group-hover:bg-yellow-500 group-hover:text-dark-900 group-hover:border-yellow-500 transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2">
                               <ShoppingCart className="w-4 h-4" /> Comprar Agora
                             </button>
                           </>
                        )}

                    </div>
                ))}
            </div>
            <p className="text-xs text-zinc-500 text-center mt-6">Compras confirmadas caem no seu saldo automaticamente em até 5 segundos via PIX.</p>
        </div>

        {/* PARTE 2: HISTÓRICO DE COMPRAS (Lado Direito/Ocupa 1/3) */}
        <div className="lg:col-span-1">
            <div className="glass-effect rounded-2xl border border-dark-700 bg-dark-800/80 p-5 sticky top-24">
                <h2 className="text-lg font-bold flex items-center justify-between border-b border-dark-700 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <History className="text-orange-500 w-5 h-5"/> Extrato de Créditos
                    </div>
                    <button onClick={carregarHistorico} className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300">
                        <Zap className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                    </button>
                </h2>

                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {historyLoading ? (
                        <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-zinc-600" /></div>
                    ) : history.map((trx, idx) => (
                        <div key={idx} 
                             onClick={() => { setSelectedTrx(trx); setShowReceiptModal(true); }}
                             className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex flex-col hover:border-orange-500/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[10px] font-mono text-zinc-500">#{trx.payment_id?.substring(0,8) || trx.id}</div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    trx.status === 'approved' 
                                    ? (trx.type === 'pix' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20')
                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                }`}>
                                    {trx.type === 'pix' ? 'PIX' : 'BÔNUS'} {trx.status === 'approved' ? '✓' : '...'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-1">
                                <div className="flex items-center gap-2">
                                    <div className={`rounded px-2 py-1 flex items-center border ${trx.type === 'pix' ? 'bg-green-500/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
                                        <i className={`fas fa-coins ${trx.type === 'pix' ? 'text-green-500' : 'text-orange-500'} text-[10px] mr-1.5`}></i>
                                        <span className="font-bold text-white text-sm">{trx.credits}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-white font-bold">{trx.type === 'manual' ? 'CORTESIA' : `R$ ${trx.amount}`}</span>
                                    <span className="block text-[10px] text-zinc-500">{trx.date} às {trx.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {history.length === 0 && !historyLoading && (
                        <div className="text-center py-10 opacity-50">
                            <ShoppingCart className="mx-auto h-10 w-10 text-zinc-600 mb-2" />
                            <p className="text-xs text-zinc-400">Nenhuma movimentação encontrada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
      )}

      {/* ========================================================================= */}
      {/* ABA: LOGS DE ATIVIDADES (AUDITORIA) */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && isMasterOrUnlimited && (
      <div className="animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="text-brand-500 w-5 h-5"/> Logs de Auditoria</h2>
           <button onClick={carregarLogs} className="bg-dark-800 hover:bg-dark-700 text-zinc-300 px-4 py-2 rounded-lg font-bold border border-dark-600 transition-colors flex items-center gap-2 text-sm">
              <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} /> Atualizar
           </button>
        </div>
        <div className="glass-effect rounded-2xl border border-dark-700 shadow-xl bg-dark-800/60 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-dark-700">
                <thead className="bg-dark-900/50">
                    <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider w-48">Data e Hora</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider w-48">Usuário</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider w-48">Ação</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Detalhes</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider w-32">IP</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                    {logsLoading ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">
                                <Loader2 className="animate-spin mx-auto text-brand-500 mb-2 w-6 h-6" />
                                Carregando registros...
                            </td>
                        </tr>
                    ) : auditLogs.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">
                                <Shield className="mx-auto h-8 w-8 text-dark-600 mb-2" />
                                Nenhum log registrado ainda.
                            </td>
                        </tr>
                    ) : auditLogs.map((log) => {
                        const dateObj = new Date(log.created_at);
                        const dataStr = dateObj.toLocaleDateString('pt-BR');
                        const horaStr = dateObj.toLocaleTimeString('pt-BR');
                        
                        return (
                            <tr key={log.id} className="hover:bg-dark-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400 font-mono">
                                    <span className="text-zinc-300 font-bold">{dataStr}</span> às {horaStr}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-white bg-dark-900 px-2.5 py-1 rounded-md border border-dark-600">{log.user_name || `ID: ${log.user_id}`}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">{log.action}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-300">
                                    {log.details}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-zinc-500">
                                    {log.ip_address || 'N/A'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                </table>
            </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CRIAR/EDITAR REVENDEDOR */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-effect relative w-full max-w-2xl shadow-2xl rounded-2xl border border-dark-700 bg-dark-900/90 p-1 flex flex-col max-h-[90vh]">
            <div className="px-5 py-3 border-b border-dark-700 bg-dark-800/50 flex justify-between items-center rounded-t-2xl shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Shield className="w-5 h-5 text-orange-500" /> {editandoRevendedor ? 'Atualizar Revendedor & DNS' : 'Nova Franquia de Revenda'}
              </h3>
              <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-5 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-5">
                <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Nome Completo *</label><input type="text" required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" /></div>
                <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Nome da Empresa</label><input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" /></div>
                <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Email (Painel Web) *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" /></div>
                <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Senha de Acesso {editandoRevendedor ? '(Deixe em branco para não alterar)' : '*'}</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            required={!editandoRevendedor} 
                            value={formData.senha} 
                            onChange={(e) => setFormData({ ...formData, senha: e.target.value })} 
                            className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 font-mono" 
                            placeholder={editandoRevendedor ? "******** (Inalterada)" : "********"}
                        />
                        <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    </div>
                </div>
                <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Telefone/WhatsApp</label><input type="text" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" /></div>
              </div>


              <div className="bg-dark-800/80 rounded-xl p-5 border border-brand-500/30 mb-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                  <h4 className="text-sm font-bold text-brand-400 mb-4 flex items-center gap-2"><Link2 className="w-4 h-4" /> Integração DNS Local (Redundância)</h4>
                  <div className="grid grid-cols-1 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Provider Code (Identificação do App)</label>
                          <div className="relative">
                              <input type="text" maxLength={8} required value={formData.provider_code} onChange={(e) => setFormData({ ...formData, provider_code: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-brand-400 font-mono font-bold text-lg rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand-500" />
                              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                          </div>
                      </div>
                      
                      <div className="space-y-3">
                          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">URLs de Teste (DNS do Revendedor)</label>
                          {formData.test_api_urls.map((url, index) => (
                              <div key={index} className="flex gap-2 group/url">
                                  <div className="relative flex-1">
                                      <input 
                                          type="url" 
                                          placeholder="http://dns-revenda:8080"
                                          value={url} 
                                          onChange={(e) => {
                                              const newUrls = [...formData.test_api_urls];
                                              newUrls[index] = e.target.value;
                                              setFormData({ ...formData, test_api_urls: newUrls, dns_url: newUrls[0] });
                                          }} 
                                          className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500 text-sm" 
                                      />
                                      <Globe className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
                                  </div>
                                  {formData.test_api_urls.length > 1 && (
                                      <button 
                                          type="button" 
                                          onClick={() => {
                                              const newUrls = formData.test_api_urls.filter((_, i) => i !== index);
                                              setFormData({ ...formData, test_api_urls: newUrls, dns_url: newUrls[0] || '' });
                                          }}
                                          className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 rounded-lg border border-red-500/20 transition-all"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  )}
                              </div>
                          ))}
                          <button 
                              type="button" 
                              onClick={() => setFormData({ ...formData, test_api_urls: [...formData.test_api_urls, ''] })}
                              className="w-full py-2 border border-dashed border-dark-600 rounded-lg text-zinc-500 hover:text-brand-400 hover:border-brand-500/50 hover:bg-brand-500/5 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                          >
                              <Plus className="w-4 h-4" /> Adicionar Outro Servidor de Teste
                          </button>
                      </div>
                  </div>
              </div>

              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-600 mb-5 max-h-[220px] overflow-y-auto custom-scrollbar">
                  <h4 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2 sticky top-0 bg-dark-800/90 py-1 backdrop-blur-sm z-10"><Shield className="w-4 h-4 text-zinc-400" /> Permissões de Acesso Ao Menu</h4>
                  <div className="space-y-4">
                      <div>
                          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-dark-700 pb-1">Principal</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                             {[
                                { label: 'Dashboard', field: 'perm_dashboard', color: 'bg-orange-500' },
                                { label: 'Dispositivos', field: 'perm_dispositivos', color: 'bg-orange-500', 
                                  subItems: [
                                    { label: 'Lista', field: 'perm_dispositivos_lista', color: 'bg-orange-500' },
                                    { label: 'Logs & Bugs', field: 'perm_dispositivos_logs', color: 'bg-orange-500' },
                                    { label: 'Resumo', field: 'perm_device_resumo', color: 'bg-orange-500' },
                                    { label: 'Assinatura', field: 'perm_device_assinatura', color: 'bg-orange-500' },
                                    { label: 'Ger. Dispositivo', field: 'perm_device_tv', color: 'bg-orange-500' },
                                    { label: 'Apps', field: 'perm_device_apps', color: 'bg-orange-500' },
                                    { label: 'Credenciais', field: 'perm_device_credenciais', color: 'bg-orange-500' },
                                    { label: 'Futebol', field: 'perm_device_futebol', color: 'bg-orange-500' },
                                    { label: 'Ações Rápidas', field: 'perm_device_acoes', color: 'bg-orange-500' }
                                  ]
                                },
                                { label: 'Minha Carteira', field: 'perm_carteira', color: 'bg-orange-500' },
                                { label: 'Revenda', field: 'perm_revenda', color: 'bg-orange-500',
                                  subItems: [
                                    { label: 'Revendedores', field: 'perm_revenda_lista', color: 'bg-orange-500' },
                                    { label: 'Loja', field: 'perm_revenda_shop', color: 'bg-orange-500' },
                                    { label: 'Apps', field: 'perm_revenda_apps', color: 'bg-orange-500' },
                                    { label: 'Logs', field: 'perm_revenda_logs', color: 'bg-orange-500' }
                                  ]
                                },
                                { label: 'Planos & Receitas', field: 'perm_planos', color: 'bg-orange-500',
                                  subItems: [
                                    { label: 'Planos', field: 'perm_planos_lista', color: 'bg-orange-500' },
                                    { label: 'CRM', field: 'perm_planos_crm', color: 'bg-orange-500' },
                                    { label: 'Loja', field: 'perm_planos_loja', color: 'bg-orange-500' },
                                    { label: 'Apps', field: 'perm_planos_apps', color: 'bg-orange-500' },
                                    { label: 'Gateways', field: 'perm_planos_gateways', color: 'bg-orange-500' }
                                  ]
                                },
                                { label: 'Assinar Painel', field: 'perm_assinatura', color: 'bg-orange-500' },
                                { label: 'Grade de Jogos', field: 'perm_jogos', color: 'bg-brand-500' },
                                { label: 'Gerador Banners', field: 'perm_banners', color: 'bg-orange-500',
                                  subItems: [
                                    { label: 'Gerador', field: 'perm_banners_gen', color: 'bg-orange-500' },
                                    { label: 'Temas', field: 'perm_banners_themes', color: 'bg-orange-500' }
                                  ]
                                },
                                { label: 'Chat Ao Vivo', field: 'perm_chat', color: 'bg-brand-500' },
                                { label: 'Agentes IA', field: 'perm_agentes', color: 'bg-orange-500' }
                             ].map(item => (
                                <div key={item.field} className="flex flex-col gap-1">
                                  <label className="flex items-center justify-between bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-lg cursor-pointer hover:border-brand-500/50 transition">
                                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate mr-2" title={item.label}>{item.label}</span>
                                      <div className="relative flex-shrink-0">
                                          <input type="checkbox" className="sr-only" checked={formData[item.field]} onChange={(e) => setFormData({...formData, [item.field]: e.target.checked})} />
                                          <div className={`block w-6 h-3.5 rounded-full transition-colors ${formData[item.field] ? item.color : 'bg-dark-600'}`}></div>
                                          <div className={`dot absolute left-0.5 top-0.5 bg-white w-2.5 h-2.5 rounded-full transition-transform ${formData[item.field] ? 'transform translate-x-2.5' : ''}`}></div>
                                      </div>
                                  </label>
                                  {formData[item.field] && item.subItems && (
                                    <div className="pl-4 border-l border-dark-700 ml-2 space-y-1 mt-1">
                                      {item.subItems.map(sub => (
                                        <label key={sub.field} className="flex items-center justify-between bg-dark-900/50 border border-dark-700/50 px-2 py-1 rounded-md cursor-pointer hover:border-brand-500/30 transition">
                                            <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider truncate mr-2">{sub.label}</span>
                                            <div className="relative flex-shrink-0">
                                                <input type="checkbox" className="sr-only" checked={formData[sub.field]} onChange={(e) => setFormData({...formData, [sub.field]: e.target.checked})} />
                                                <div className={`block w-5 h-3 rounded-full transition-colors ${formData[sub.field] ? sub.color : 'bg-dark-600'}`}></div>
                                                <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${formData[sub.field] ? 'transform translate-x-2' : ''}`}></div>
                                            </div>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                             ))}
                          </div>
                      </div>
                      <div>
                          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-dark-700 pb-1">IPTV & Servidores</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                             {[
                                { label: 'Servidor IPTV', field: 'perm_iptv', color: 'bg-green-500',
                                  subItems: [
                                    { label: 'Global', field: 'perm_iptv_global', color: 'bg-green-500' },
                                    { label: 'Mapping', field: 'perm_iptv_mapping', color: 'bg-green-500' },
                                    { label: 'Servidores', field: 'perm_iptv_servers', color: 'bg-green-500' }
                                  ]
                                },
                                { label: 'Plugin Unificado', field: 'perm_plugin', color: 'bg-green-500' },
                                { label: 'Árvore IPTV', field: 'perm_arvore', color: 'bg-green-500' }
                             ].map(item => (
                                <div key={item.field} className="flex flex-col gap-1">
                                  <label className="flex items-center justify-between bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-lg cursor-pointer hover:border-brand-500/50 transition">
                                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate mr-2" title={item.label}>{item.label}</span>
                                      <div className="relative flex-shrink-0">
                                          <input type="checkbox" className="sr-only" checked={formData[item.field]} onChange={(e) => setFormData({...formData, [item.field]: e.target.checked})} />
                                          <div className={`block w-6 h-3.5 rounded-full transition-colors ${formData[item.field] ? item.color : 'bg-dark-600'}`}></div>
                                          <div className={`dot absolute left-0.5 top-0.5 bg-white w-2.5 h-2.5 rounded-full transition-transform ${formData[item.field] ? 'transform translate-x-2.5' : ''}`}></div>
                                      </div>
                                  </label>
                                  {formData[item.field] && item.subItems && (
                                    <div className="pl-4 border-l border-dark-700 ml-2 space-y-1 mt-1">
                                      {item.subItems.map(sub => (
                                        <label key={sub.field} className="flex items-center justify-between bg-dark-900/50 border border-dark-700/50 px-2 py-1 rounded-md cursor-pointer hover:border-brand-500/30 transition">
                                            <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider truncate mr-2">{sub.label}</span>
                                            <div className="relative flex-shrink-0">
                                                <input type="checkbox" className="sr-only" checked={formData[sub.field]} onChange={(e) => setFormData({...formData, [sub.field]: e.target.checked})} />
                                                <div className={`block w-5 h-3 rounded-full transition-colors ${formData[sub.field] ? sub.color : 'bg-dark-600'}`}></div>
                                                <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${formData[sub.field] ? 'transform translate-x-2' : ''}`}></div>
                                            </div>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                             ))}
                          </div>
                      </div>
                      <div>
                          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-dark-700 pb-1">Ferramentas & Extras</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                             {[
                                { label: 'APIs', field: 'perm_api', color: 'bg-purple-500',
                                  subItems: [
                                    { label: 'Config', field: 'perm_api_config', color: 'bg-purple-500' },
                                    { label: 'Monitor', field: 'perm_api_monitor', color: 'bg-purple-500' }
                                  ]
                                },
                                { label: 'Branding & Banners', field: 'perm_branding', color: 'bg-purple-500' },
                                { label: 'Minha Galeria', field: 'perm_galeria', color: 'bg-blue-500' },
                                { label: 'White Label', field: 'perm_whitelabel', color: 'bg-yellow-500',
                                  subItems: [
                                    { label: 'Geral', field: 'perm_whitelabel_geral', color: 'bg-yellow-500' },
                                    { label: 'Planos', field: 'perm_whitelabel_planos', color: 'bg-yellow-500' },
                                    { label: 'Aparência', field: 'perm_whitelabel_aparencia', color: 'bg-yellow-500' },
                                    { label: 'Pagamento', field: 'perm_whitelabel_pagamento', color: 'bg-yellow-500' }
                                  ]
                                },
                                { label: 'Automação WPP', field: 'perm_whatsapp', color: 'bg-green-500',
                                  subItems: [
                                    { label: 'Em Massa', field: 'perm_whatsapp_bulk', color: 'bg-green-500' },
                                    { label: 'MaxxFlow', field: 'perm_whatsapp_flow', color: 'bg-green-500' }
                                  ]
                                },
                                { label: 'Versões', field: 'perm_versoes', color: 'bg-zinc-500' },
                                { label: 'Configurações', field: 'perm_config', color: 'bg-red-500' },
                                { label: 'Tickets de Suporte', field: 'perm_tickets', color: 'bg-cyan-500',
                                  subItems: [
                                    { label: 'Abertos', field: 'perm_tickets_abertos', color: 'bg-cyan-500' },
                                    { label: 'Fechados', field: 'perm_tickets_fechados', color: 'bg-cyan-500' }
                                  ]
                                }
                             ].map(item => (
                                <div key={item.field} className="flex flex-col gap-1">
                                  <label className="flex items-center justify-between bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-lg cursor-pointer hover:border-brand-500/50 transition">
                                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate mr-2" title={item.label}>{item.label}</span>
                                      <div className="relative flex-shrink-0">
                                          <input type="checkbox" className="sr-only" checked={formData[item.field]} onChange={(e) => setFormData({...formData, [item.field]: e.target.checked})} />
                                          <div className={`block w-6 h-3.5 rounded-full transition-colors ${formData[item.field] ? item.color : 'bg-dark-600'}`}></div>
                                          <div className={`dot absolute left-0.5 top-0.5 bg-white w-2.5 h-2.5 rounded-full transition-transform ${formData[item.field] ? 'transform translate-x-2.5' : ''}`}></div>
                                      </div>
                                  </label>
                                  {formData[item.field] && item.subItems && (
                                    <div className="pl-4 border-l border-dark-700 ml-2 space-y-1 mt-1">
                                      {item.subItems.map(sub => (
                                        <label key={sub.field} className="flex items-center justify-between bg-dark-900/50 border border-dark-700/50 px-2 py-1 rounded-md cursor-pointer hover:border-brand-500/30 transition">
                                            <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider truncate mr-2">{sub.label}</span>
                                            <div className="relative flex-shrink-0">
                                                <input type="checkbox" className="sr-only" checked={formData[sub.field]} onChange={(e) => setFormData({...formData, [sub.field]: e.target.checked})} />
                                                <div className={`block w-5 h-3 rounded-full transition-colors ${formData[sub.field] ? sub.color : 'bg-dark-600'}`}></div>
                                                <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${formData[sub.field] ? 'transform translate-x-2' : ''}`}></div>
                                            </div>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                             ))}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-5 border-t border-dark-700 pt-5">
                <div>
                  {isMasterOrUnlimited && (
                    <label className="flex items-center cursor-pointer mb-2">
                      <span className="text-xs font-bold text-brand-400 mr-2 uppercase">Painel Ilimitado?</span>
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={formData.plano_revenda === 'Ilimitado'} onChange={(e) => setFormData({ ...formData, plano_revenda: e.target.checked ? 'Ilimitado' : 'Revenda', limite_dispositivos: e.target.checked ? 999999 : 10, creditos: e.target.checked ? 0 : formData.creditos })} />
                        <div className={`block w-10 h-5 rounded-full transition-colors ${formData.plano_revenda === 'Ilimitado' ? 'bg-brand-500' : 'bg-dark-600'}`}></div>
                        <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${formData.plano_revenda === 'Ilimitado' ? 'transform translate-x-5' : ''}`}></div>
                      </div>
                    </label>
                  )}
                  {formData.plano_revenda !== 'Ilimitado' && (
                    <>
                      <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Limite de Acessos *</label>
                      <input type="number" required min="1" value={formData.limite_dispositivos} onChange={(e) => setFormData({ ...formData, limite_dispositivos: parseInt(e.target.value) })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" />
                    </>
                  )}
                </div>
                
                {formData.plano_revenda !== 'Ilimitado' ? (
                   <div><label className="block text-xs font-bold w-full text-yellow-500 mb-1.5 uppercase"><i className="fas fa-coins"></i> Créditos Iniciais *</label><input type="number" required min="0" value={formData.creditos} onChange={(e) => setFormData({ ...formData, creditos: parseInt(e.target.value) || 0 })} className="w-full bg-dark-900 border border-yellow-500/30 text-yellow-500 font-bold rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-500" /></div>
                ) : (
                   <div></div>
                )}
                <div className="flex items-center justify-start sm:justify-end">
                  <label className="flex items-center cursor-pointer mt-2 sm:mt-5">
                    <span className="mr-3 text-sm font-bold text-white">Ativo</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} />
                      <div className={`block w-10 h-5 md:w-12 md:h-6 rounded-full transition-colors ${formData.ativo ? 'bg-green-500' : 'bg-dark-600'}`}></div>
                      <div className={`dot absolute left-0.5 top-0.5 md:left-1 md:top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.ativo ? 'transform translate-x-5 md:translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>
              </div>


              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-dark-700 sticky bottom-0 bg-dark-900/95 py-2 backdrop-blur-sm z-10">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-5 py-2.5 bg-dark-700 hover:bg-dark-600 active:scale-95 text-zinc-300 font-black rounded-lg border border-dark-600 transition-all">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-black rounded-lg shadow border border-orange-500/50 flex items-center gap-2 transition-all"><Shield className="w-4 h-4" /> Salvar Configurações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CHECKOUT PIX */}
      {/* ========================================================================= */}
      {showPixModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-effect relative w-full max-w-sm shadow-2xl rounded-2xl border border-dark-700 bg-dark-900 p-1">
            <button onClick={() => { 
                setShowPixModal(false); 
                setPaymentData(null); 
                setCardForm({ number: '', expiry: '', cvv: '', name: '', doc: '' });
            }} className="absolute z-10 top-3 right-3 w-8 h-8 flex items-center justify-center bg-dark-800 text-zinc-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 rounded-full transition-all border border-dark-600">
                <X className="w-4 h-4" />
            </button>

            <div className="p-6 pb-2 text-center text-white mt-2">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Pague R$ {parseFloat(selectedPackage.price).toFixed(2).replace('.',',')}</h3>
                <p className="text-sm text-zinc-400 mt-1">E receba <strong className="text-yellow-500">{selectedPackage.credits} Créditos</strong> na hora!</p>
            </div>
            
            <div className="flex px-6 gap-2 mb-2">
                <button 
                  onClick={() => { 
                    setCheckoutMethod('pix'); 
                    setPaymentError(''); 
                    if (!paymentData) handleGeneratePix(selectedPackage);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                    checkoutMethod === 'pix' 
                    ? 'bg-green-500/10 border-green-500/50 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                    : 'bg-dark-800 border-dark-700 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                    <QrCode size={14} /> PIX
                </button>
                <button 
                  onClick={() => { 
                    setCheckoutMethod('card'); 
                    setPaymentError(''); 
                    setPaymentData(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                    checkoutMethod === 'card' 
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'bg-dark-800 border-dark-700 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                    <CreditCard size={14} /> CARTÃO
                </button>
            </div>
            
            <div className="p-6 pt-2 text-center">
                {paymentLoading && (
                   <div className="py-10 text-zinc-500 flex flex-col items-center">
                      <i className="fas fa-circle-notch fa-spin text-3xl mb-3 text-orange-500"></i>
                      <p className="text-sm">Processando {checkoutMethod === 'pix' ? 'PIX' : 'Cartão'}...</p>
                   </div>
                )}

                {paymentError && (
                   <div className="py-5 px-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mb-4 text-xs font-bold">
                       {paymentError}
                   </div>
                )}

                {checkoutMethod === 'pix' && paymentData && paymentData.status !== 'approved' && !paymentError && !paymentLoading && (
                  <>
                    <div className="bg-white rounded-xl p-4 flex justify-center mb-4">
                        <img src={`data:image/png;base64,${paymentData.qr_code_base64}`} alt="QR Code Pix" className="rounded-lg shadow-sm w-48 h-48" />
                    </div>
                    
                    <button onClick={() => { navigator.clipboard.writeText(paymentData.qr_code); alert('PIX Copiado!'); }} className="w-full bg-dark-800 text-zinc-300 border border-dark-600 py-3 rounded-lg font-mono text-xs flex items-center justify-center gap-2 hover:bg-dark-700 transition-colors uppercase tracking-wider mb-4">
                        <i className="far fa-copy"></i> Copiar Código PIX
                    </button>

                    <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest border-t border-dark-700 pt-3 flex items-center justify-center gap-2">
                        <i className="fas fa-circle-notch fa-spin"></i> Aguardando Pagamento...
                    </p>
                  </>
                )}

                {checkoutMethod === 'card' && !paymentData && !paymentLoading && (
                  <form onSubmit={handleCardCheckout} className="space-y-3 text-left">
                     <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Número do Cartão</label>
                        <input 
                          type="text" 
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 transition-colors"
                          value={cardForm.number}
                          onChange={e => setCardForm({...cardForm, number: e.target.value})}
                          required
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Validade</label>
                           <input 
                             type="text" 
                             placeholder="MM/AA"
                             className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 transition-colors"
                             value={cardForm.expiry}
                             onChange={e => setCardForm({...cardForm, expiry: e.target.value})}
                             required
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">CVV</label>
                           <input 
                             type="text" 
                             placeholder="123"
                             className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 transition-colors"
                             value={cardForm.cvv}
                             onChange={e => setCardForm({...cardForm, cvv: e.target.value})}
                             required
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Nome no Cartão</label>
                        <input 
                          type="text" 
                          placeholder="COMO ESTÁ NO CARTÃO"
                          className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 transition-colors uppercase"
                          value={cardForm.name}
                          onChange={e => setCardForm({...cardForm, name: e.target.value})}
                          required
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">CPF do Titular</label>
                        <input 
                          type="text" 
                          placeholder="000.000.000-00"
                          className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 transition-colors"
                          value={cardForm.doc}
                          onChange={e => setCardForm({...cardForm, doc: e.target.value})}
                          required
                        />
                     </div>
                     
                     <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 mt-4 flex items-center justify-center gap-2">
                        <Shield size={16} /> Finalizar Compra
                     </button>
                  </form>
                )}

                {paymentData && paymentData.status === 'approved' && (
                  <div className="py-5 text-green-500">
                    <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-500 animate-bounce" />
                    <h3 className="text-xl font-bold mb-2">Pagamento Aprovado!</h3>
                    <p className="text-sm text-zinc-300">Seus créditos já foram adicionados na conta.</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA: ATIVAÇÃO DE APPS (MAXX PLAYER) */}
      {/* ========================================================================= */}
      {activeTab === 'apps' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500 pb-20">
           <div className="glass-effect rounded-[2rem] p-8 border border-dark-700 bg-dark-900/50 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Smartphone className="w-7 h-7 text-blue-500" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white">Ativar Aplicativo</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Liberação instantânea via MAC Address</p>
                 </div>
              </div>

              <div className="space-y-6 flex-1">
                 <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">1. Endereço MAC do Dispositivo</label>
                    <input 
                      type="text" 
                      placeholder="00:11:22:AA:BB:CC"
                      value={activationForm.mac}
                      onChange={e => setActivationForm({...activationForm, mac: e.target.value.toUpperCase()})}
                      className="w-full bg-dark-800 border-2 border-dark-700 rounded-2xl px-6 py-4 text-white focus:border-blue-500 transition-all outline-none font-mono text-xl placeholder:text-zinc-700"
                    />
                    <div className="flex items-center gap-2 mt-3 px-1">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                        <p className="text-[10px] text-zinc-500 font-bold italic">O MAC fica no canto inferior direito da tela inicial do App.</p>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">2. Selecione o Aplicativo</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       {apps.length === 0 ? (
                           <div className="col-span-full py-4 text-center text-zinc-600 text-xs italic">Nenhum app configurado pelo administrador.</div>
                       ) : apps.map(app => (
                          <button 
                            key={app.id}
                            onClick={() => setActivationForm({...activationForm, appId: app.id})}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${activationForm.appId === app.id ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-dark-800 border-dark-700 text-zinc-500 hover:border-dark-600'}`}
                          >
                             <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center overflow-hidden border border-white/5">
                                {app.logo_url ? <img src={app.logo_url} className="w-full h-full object-cover" /> : <Smartphone size={24} />}
                             </div>
                             <span className="text-[11px] font-black truncate w-full text-center uppercase tracking-tighter">{app.app_name}</span>
                          </button>
                       ))}
                    </div>
                 </div>

                 {activationForm.appId && (
                    <div className="animate-in slide-in-from-top-4 duration-300">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">3. Escolha a Vigência</label>
                       <div className="flex gap-3">
                          <button 
                            onClick={() => setActivationForm({...activationForm, type: 'monthly'})}
                            className={`flex-1 p-5 rounded-2xl border-2 transition-all flex flex-col items-center relative overflow-hidden ${activationForm.type === 'monthly' ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_20px_rgba(255,165,0,0.1)]' : 'bg-dark-800 border-dark-700 text-zinc-500'}`}
                          >
                             <span className="text-[9px] font-black uppercase tracking-widest mb-1">PLANO MENSAL</span>
                             <span className="text-xl font-black tracking-tighter">R$ {parseFloat(apps.find(a => a.id === activationForm.appId)?.monthly_price || 0).toFixed(2)}</span>
                             {activationForm.type === 'monthly' && <div className="absolute top-0 right-0 w-6 h-6 bg-orange-500 flex items-center justify-center rounded-bl-xl"><CheckCircle size={10} color="#fff" /></div>}
                          </button>
                          <button 
                            onClick={() => setActivationForm({...activationForm, type: 'yearly'})}
                            className={`flex-1 p-5 rounded-2xl border-2 transition-all flex flex-col items-center relative overflow-hidden ${activationForm.type === 'yearly' ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_20px_rgba(255,165,0,0.1)]' : 'bg-dark-800 border-dark-700 text-zinc-500'}`}
                          >
                             <span className="text-[9px] font-black uppercase tracking-widest mb-1">PLANO ANUAL</span>
                             <span className="text-xl font-black tracking-tighter">R$ {parseFloat(apps.find(a => a.id === activationForm.appId)?.yearly_price || 0).toFixed(2)}</span>
                             {activationForm.type === 'yearly' && <div className="absolute top-0 right-0 w-6 h-6 bg-orange-500 flex items-center justify-center rounded-bl-xl"><CheckCircle size={10} color="#fff" /></div>}
                          </button>
                       </div>
                    </div>
                 )}
              </div>

              <button 
                disabled={!activationForm.mac || !activationForm.appId}
                onClick={() => {
                   const app = apps.find(a => a.id === activationForm.appId);
                   const price = activationForm.type === 'monthly' ? app.monthly_price : app.yearly_price;
                   handleCheckout({ 
                     id: `APP_${app.id}_${activationForm.type}`, 
                     name: `Ativação ${app.app_name} (${activationForm.type === 'monthly' ? 'Mensal' : 'Anual'}) - MAC: ${activationForm.mac}`,
                     price: price,
                     credits: 0,
                     mac_address: activationForm.mac,
                     app_id: app.id
                   });
                }}
                className={`w-full py-5 mt-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${(!activationForm.mac || !activationForm.appId) ? 'bg-dark-800 text-zinc-600 cursor-not-allowed border border-dark-700' : 'bg-orange-500 text-white shadow-[0_10px_30px_rgba(255,165,0,0.2)] hover:scale-[1.02] active:scale-95 hover:bg-orange-400'}`}
              >
                 ATIVAR AGORA NO MAC
              </button>

              {/* FAQ ESTRATÉGICO */}
              <div className="mt-12 border-t border-dark-700 pt-8">
                 <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                    <HelpCircle className="text-orange-500" /> Perguntas Frequentes
                 </h3>
                 <div className="space-y-4">
                    {[
                      { q: 'O que é o MAC Address?', a: 'É o código único da sua TV. Você encontra ele no canto inferior direito do app MAXX PLAYER.' },
                      { q: 'A liberação é automática?', a: 'Sim! Após a confirmação do PIX, sua TV é liberada instantaneamente pelo nosso servidor.' },
                      { q: 'Posso transferir para outra TV?', a: 'Sim, use a ferramenta de "Migração" na aba de Ferramentas usando sua chave de acesso.' }
                    ].map((faq, i) => (
                       <details key={i} className="group bg-dark-800/50 rounded-2xl border border-dark-700 overflow-hidden">
                          <summary className="p-4 cursor-pointer font-bold text-sm text-zinc-300 flex justify-between items-center hover:bg-dark-700/50 transition-colors list-none">
                             {faq.q}
                             <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                          </summary>
                          <div className="p-4 pt-0 text-xs text-zinc-500 leading-relaxed border-t border-dark-700/50">
                             {faq.a}
                          </div>
                       </details>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-6">
              <div className="glass-effect rounded-[2rem] p-8 border border-dark-700 bg-dark-900/30 flex flex-col h-full">
                 <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center justify-between">
                    Histórico de Ativações
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">{history.filter(t => t.mac_address).length} TOTAL</span>
                 </h3>
                 
                 <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {history.filter(t => t.mac_address).length === 0 ? (
                        <div className="text-center py-20 opacity-30">
                            <History size={40} className="mx-auto mb-3" />
                            <p className="text-xs font-bold">Nenhuma ativação encontrada.</p>
                        </div>
                    ) : history.filter(t => t.mac_address).map((trx, i) => (
                        <div key={i} className="bg-dark-800 border border-dark-700 rounded-2xl p-4 hover:border-blue-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-blue-500">
                                        <Smartphone size={16} />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-black text-white block uppercase tracking-tighter truncate max-w-[120px]">{trx.mac_address}</span>
                                        <span className="text-[9px] text-zinc-500 font-bold">{trx.date} às {trx.time}</span>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${trx.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                    {trx.status === 'approved' ? 'ATIVO ✓' : 'PENDENTE'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-dark-700 pt-3">
                                <span className="text-[9px] text-zinc-400 font-bold uppercase truncate max-w-[150px]">{trx.package_name || 'Ativação MAXX'}</span>
                                <span className="text-xs font-black text-white">R$ {trx.amount}</span>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}


      {/* MODAL 3: RECIBO PREMIUM */}
      {showReceiptModal && selectedTrx && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in zoom-in duration-200">
              <div className="w-full max-w-[320px] bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-5">
                  <div className={`p-6 text-center ${selectedTrx.type === 'pix' ? 'bg-green-500' : 'bg-orange-500'} relative`}>
                      <button onClick={() => setShowReceiptModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <CheckCircle className={`w-10 h-10 ${selectedTrx.type === 'pix' ? 'text-green-500' : 'text-orange-500'}`} />
                      </div>
                      <h3 className="text-white font-black text-xl tracking-tighter">RECIBO DE CRÉDITO</h3>
                      <p className="text-white/80 text-[10px] uppercase font-bold tracking-widest mt-1">TV MAXX PRO — {selectedTrx.status === 'approved' ? 'AUTENTICADO' : 'PENDENTE'}</p>
                  </div>

                  <div className="p-8 space-y-6 bg-zinc-50">
                      <div className="text-center">
                          <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Total Recebido</div>
                          <div className="text-4xl font-black text-zinc-900 tracking-tighter">{selectedTrx.credits} <span className="text-lg">CRÉDITOS</span></div>
                      </div>

                      <div className="space-y-3 border-t border-dashed border-zinc-300 pt-5">
                          <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">Método</span>
                              <span className="text-xs font-black text-zinc-700">{selectedTrx.type === 'pix' ? 'Mercado Pago (PIX)' : 'Transferência Manual'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">Data</span>
                              <span className="text-xs font-black text-zinc-700">{selectedTrx.date} às {selectedTrx.time}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Valor Pago</span>
                            <span className="text-xs font-black text-zinc-700">{selectedTrx.type === 'manual' ? 'BÔNUS/AJUSTE' : `R$ ${selectedTrx.amount}`}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">ID Operação</span>
                              <span className="text-[9px] font-mono font-bold text-zinc-500">{selectedTrx.payment_id || `MANUAL-${selectedTrx.id}`}</span>
                          </div>
                      </div>

                      <div className="pt-4 text-center">
                          <div className="w-12 h-1 bg-zinc-200 mx-auto rounded-full mb-4"></div>
                          <p className="text-[9px] text-zinc-400 leading-relaxed px-4 italic">
                              Este documento serve como comprovante de entrega de créditos digitais no ecossistema TV MAXX PRO.
                          </p>
                      </div>

                      <button onClick={() => window.print()} className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl">
                          IMPRIMIR RECIBO
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL 4: TRANSFERÊNCIA SEGURA (2FA) */}
      {showTransferModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-sm glass-effect rounded-[2.5rem] border border-white/10 p-8 shadow-2xl overflow-hidden relative">
                  {!tfaMode ? (
                      <form onSubmit={handleSendCredits} className="space-y-6">
                          <div className="text-center">
                              <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20 rotate-3">
                                  <Shield className="w-8 h-8" />
                              </div>
                              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Enviar Créditos</h3>
                              <p className="text-xs text-zinc-500 mt-2">Você está prestes a transferir créditos para <br/><strong className="text-white">{transferData.nome}</strong></p>
                          </div>

                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Quantidade de Créditos</label>
                              <div className="relative">
                                  <input 
                                      type="number" 
                                      min="1"
                                      value={transferData.quantidade}
                                      onChange={(e) => setTransferData({...transferData, quantidade: e.target.value})}
                                      className="w-full bg-dark-900 border-2 border-dark-700 focus:border-orange-500 rounded-2xl py-4 px-6 text-2xl font-black text-white outline-none transition-all"
                                  />
                                  <span className="absolute right-6 top-5 text-orange-500 font-black tracking-tighter">CRED</span>
                              </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                              <button type="button" onClick={() => setShowTransferModal(false)} className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-white transition">Cancelar</button>
                              <button type="submit" className="flex-3 bg-orange-600 hover:bg-orange-500 text-white font-black py-4 px-8 rounded-2xl text-sm transition-all shadow-lg active:scale-95">CONTINUAR</button>
                          </div>
                      </form>
                  ) : (
                      <form onSubmit={handleSendCredits} className="space-y-6 animate-in slide-in-from-right-4">
                          <div className="text-center">
                              <div className="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
                                  <MessageCircle className="w-8 h-8 animate-pulse" />
                              </div>
                              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Confirmação VIP</h3>
                              <p className="text-xs text-zinc-500 mt-2">Um código de segurança foi enviado ao seu <br/><strong className="text-brand-500">Telegram</strong> para autorizar o envio.</p>
                          </div>

                          <div className="space-y-2 text-center">
                              <input 
                                  type="text" 
                                  maxLength={6}
                                  placeholder="000000"
                                  value={tfaCode}
                                  onChange={(e) => setTfaCode(e.target.value.replace(/\D/g,''))}
                                  className="w-full bg-dark-900 border-2 border-brand-500/30 focus:border-brand-500 rounded-3xl py-5 text-center text-4xl font-mono font-black text-white tracking-[0.4em] outline-none transition-all placeholder:text-zinc-800"
                              />
                              <button type="button" onClick={() => setTfaMode(false)} className="text-[10px] text-zinc-600 hover:text-white transition">Errei o código? Voltar</button>
                          </div>

                          <button 
                            type="submit" 
                            disabled={tfaCode.length !== 6 || paymentLoading}
                            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-black py-5 rounded-[1.5rem] text-sm shadow-xl shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                              {paymentLoading ? <Loader2 className="animate-spin" /> : 'AUTORIZAR TRANSFERÊNCIA'}
                          </button>
                      </form>
                  )}
              </div>
          </div>
      )}

      <div className="h-16 md:h-0"></div>
    </div>
  );
};

export default Resale;
