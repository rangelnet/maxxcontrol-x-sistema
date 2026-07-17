import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Settings, Activity, Trash2, Edit3, Monitor, Clock, CheckCircle, Search, Filter, Phone, User, CreditCard, ShoppingCart, Tag, Smartphone, Image } from 'lucide-react';
import axios from '../services/api';
import { useAuth } from '../context/AuthContext';

const FinancePlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [crmLogs, setCrmLogs] = useState([]);
  const [creditPackages, setCreditPackages] = useState([]);
  const [stats, setStats] = useState({ total_revenue: 0, total_sales: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  const allTabs = [
    { id: 'planos', label: 'Planos', perm: 'perm_planos_lista' },
    { id: 'crm', label: 'CRM', perm: 'perm_planos_crm' },
    { id: 'loja', label: 'Loja Créditos', perm: 'perm_planos_loja' },
    { id: 'gateways', label: 'Gateways', perm: 'perm_planos_gateways' },
    { id: 'apps', label: 'Apps', perm: 'perm_planos_apps' },
    { id: 'assinaturas', label: 'Assinaturas Painel', masterOnly: true }
  ];
  
  const visibleTabs = allTabs.filter(t => user?.tipo === 'admin' || user?.tipo === 'admin' || user?.role === 'admin' || (t.masterOnly !== true && user?.[t.perm] !== false));
  
  const [activeTab, setActiveTab] = useState(visibleTabs.length > 0 ? visibleTabs[0].id : 'planos');
  const [appUrl, setAppUrl] = useState('');
  const [trialHours, setTrialHours] = useState('24');
  const [savingAppUrl, setSavingAppUrl] = useState(false);
  const [appPackages, setAppPackages] = useState([]);
  const [appActivations, setAppActivations] = useState([]);
  const [showAppModal, setShowAppModal] = useState(false);
  const [editAppId, setEditAppId] = useState(null);
  const [appFormData, setAppFormData] = useState({
    name: '',
    price: '',
    duration_days: 365,
    trial_hours: 24,
    description: '',
    is_active: true
  });
  
  // Panel Subscription Plans State
  const [panelPlans, setPanelPlans] = useState([]);
  const [showPanelPlanModal, setShowPanelPlanModal] = useState(false);
  const [editPanelPlanId, setEditPanelPlanId] = useState(null);
  const [panelPlanFormData, setPanelPlanFormData] = useState({
    name: '',
    price: '',
    trial_days: 7,
    features: [],
    is_active: true
  });
  
  // Gateways de Pagamentos & Invoice Settings
  const [mpAccessToken, setMpAccessToken] = useState('');
  const [mpPublicKey, setMpPublicKey] = useState('');
  const [mpReceivePix, setMpReceivePix] = useState(true);
  const [mpReceiveBoleto, setMpReceiveBoleto] = useState(true);
  const [mpReceiveCredit, setMpReceiveCredit] = useState(true);
  const [mpStatusActive, setMpStatusActive] = useState('Ativar'); // 'Ativar' | 'Desativar'
  const [mpStatus, setMpStatus] = useState('unchecked'); // 'unchecked' | 'validating' | 'active' | 'invalid' | 'error'
  const [mpSeller, setMpSeller] = useState(null); // { nickname, email, id }
  
  // PayPal Settings
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalClientSecret, setPaypalClientSecret] = useState('');
  const [paypalStatusActive, setPaypalStatusActive] = useState('Desativar');
  const [paypalStatus, setPaypalStatus] = useState('unchecked');
  
  const [invoiceName, setInvoiceName] = useState('DIGITAL MAXX');
  const [invoiceTheme, setInvoiceTheme] = useState('#ff5400');
  const [fiscalActive, setFiscalActive] = useState('no');
  const [fiscalData, setFiscalData] = useState({ costumer_name: '', document: '', zip_code: '', street_name: '', street_number: '', neighborhood: '', city: '', federal_unit: '' });
  const [savingGateways, setSavingGateways] = useState(false);
  
  // CRM Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_days: '30',
    max_connections: '1',
    qpanel_id: '',
    sigma_package: '',
    is_active: true,
    highlight_type: 'none',
    badge_text: '',
    badge_color: '#FC5F16',
    border_color: '#FC5F16',
    button_color: '#FC5F16',
    glow_color: '#FC5F16',
    is_carousel_highlight: false,
    display_order: 0
  });

  const [creditFormData, setCreditFormData] = useState({
    name: '',
    credit_amount: '',
    price: '',
    promo_price: ''
  });
  const [editCreditId, setEditCreditId] = useState(null);

  const [panels, setPanels] = useState([]);
  const [dynamicPlans, setDynamicPlans] = useState([]);
  const [editPlanId, setEditPlanId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchPanels();
    fetchPackages();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, statsRes, crmRes, creditRes, settingsRes, appsRes, activationsRes, panelPlansRes] = await Promise.all([
        axios.get('/api/finance/plans'),
        axios.get('/api/finance/revenue/stats'),
        axios.get('/api/finance/crm'),
        axios.get('/api/finance/credit-packages'),
        axios.get('/api/settings'),
        axios.get('/api/finance/app-packages'),
        axios.get('/api/finance/app-activations'),
        axios.get('/api/finance/panel-plans')
      ]);
      setPlans(plansRes.data);
      setStats(statsRes.data);
      setCrmLogs(crmRes.data);
      setCreditPackages(creditRes.data);
      setAppPackages(appsRes.data);
      setAppActivations(activationsRes.data);
      setPanelPlans(panelPlansRes.data);
      
      const s = settingsRes.data;
      setAppUrl(s.player_app_url || 'https://maxxplayer.app');
      setTrialHours(String(s.trial_hours || '24'));
      setMpAccessToken(s.mp_access_token || '');
      setMpPublicKey(s.mp_public_key || '');
      if (s.mp_receive_pix !== undefined) setMpReceivePix(s.mp_receive_pix);
      if (s.mp_receive_boleto !== undefined) setMpReceiveBoleto(s.mp_receive_boleto);
      if (s.mp_receive_credit !== undefined) setMpReceiveCredit(s.mp_receive_credit);
      if (s.mp_status_active !== undefined) setMpStatusActive(s.mp_status_active);

      setPaypalClientId(s.paypal_client_id || '');
      setPaypalClientSecret(s.paypal_client_secret || '');
      setPaypalStatusActive(s.paypal_status_active || 'Desativar');
      
      // Auto-validar token se existir
      if (s.mp_access_token) {
        validateMpToken(s.mp_access_token);
      }

      if (s.paypal_client_id && s.paypal_client_secret) {
        validatePaypalToken(s.paypal_client_id, s.paypal_client_secret);
      }
      
      setInvoiceName(s.invoice_name || 'DIGITAL MAXX');
      setInvoiceTheme(s.invoice_theme || '#ff5400');
      setFiscalActive(s.fiscal_active || 'no');
      setFiscalData(s.fiscal_data || { costumer_name: '', document: '', zip_code: '', street_name: '', street_number: '', neighborhood: '', city: '', federal_unit: '' });

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPanels = async () => {
    try {
      const res = await axios.get('/api/iptv-plugin/panels'); // Usando a rota já existente do qPanel
      if (res.data && res.data.panels) {
        setPanels(res.data.panels);
      }
    } catch (error) {
      console.error('Erro ao buscar painéis:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await axios.get('/api/iptv-plugin/all-packages');
      if (res.data && res.data.success) {
        setDynamicPlans(res.data.packages || []);
      }
    } catch (error) {
      console.error('Erro ao buscar pacotes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: typeof formData.price === 'string' ? parseFloat(formData.price.replace(',', '.')) : formData.price,
        duration_days: parseInt(formData.duration_days),
        max_connections: parseInt(formData.max_connections),
        qpanel_id: formData.qpanel_id ? parseInt(formData.qpanel_id) : null,
        sigma_package: Array.isArray(formData.sigma_packages) ? formData.sigma_packages.join(', ') : formData.sigma_package,
        is_active: formData.is_active,
        highlight_type: formData.highlight_type,
        badge_text: formData.badge_text,
        badge_color: formData.badge_color,
        border_color: formData.border_color,
        button_color: formData.button_color,
        glow_color: formData.glow_color,
        is_carousel_highlight: formData.is_carousel_highlight,
        display_order: parseInt(formData.display_order) || 0
      };
      
      if (editPlanId) {
        await axios.put(`/api/finance/plans/${editPlanId}`, payload);
        alert('Plano atualizado com sucesso!');
      } else {
        await axios.post('/api/finance/plans', payload);
        alert('Plano criado com sucesso!');
      }
      
      setShowModal(false);
      setEditPlanId(null);
      setFormData({ name: '', price: '', duration_days: '30', max_connections: '1', qpanel_id: '', sigma_package: '', sigma_packages: [], is_active: true, highlight_type: 'none', badge_text: '', badge_color: '#FC5F16', border_color: '#FC5F16', button_color: '#FC5F16', glow_color: '#FC5F16', is_carousel_highlight: false, display_order: 0 });
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      alert('Erro ao salvar plano comercial.');
    }
  };

  const openEditModal = (plan) => {
    setEditPlanId(plan.id);
    const selectedPackages = plan.sigma_package ? plan.sigma_package.split(', ').filter(p => p) : [];
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration_days: plan.duration_days.toString(),
      max_connections: plan.max_connections.toString(),
      qpanel_id: plan.qpanel_id || '',
      sigma_package: plan.sigma_package || '',
      sigma_packages: selectedPackages,
      is_active: plan.is_active,
      highlight_type: plan.highlight_type || 'none',
      badge_text: plan.badge_text || '',
      badge_color: plan.badge_color || '#FC5F16',
      border_color: plan.border_color || '#FC5F16',
      button_color: plan.button_color || '#FC5F16',
      glow_color: plan.glow_color || '#FC5F16',
      is_carousel_highlight: plan.is_carousel_highlight || false,
      display_order: plan.display_order || 0
    });
    setShowModal(true);
  };

  const toggleSigmaPackage = (pkg) => {
    const current = formData.sigma_packages || [];
    if (current.includes(pkg)) {
      setFormData({ ...formData, sigma_packages: current.filter(p => p !== pkg) });
    } else {
      setFormData({ ...formData, sigma_packages: [...current, pkg] });
    }
  };

  const handleSaveCreditPackage = async (e) => {
    e.preventDefault();
    try {
      if (editCreditId) {
        await axios.put(`/api/finance/credit-packages/${editCreditId}`, creditFormData);
        alert("Pacote editado com sucesso!");
      } else {
        await axios.post('/api/finance/credit-packages', creditFormData);
        alert("Pacote criado com sucesso!");
      }
      setShowCreditModal(false);
      setCreditFormData({ name: '', credit_amount: '', price: '', promo_price: '' });
      setEditCreditId(null);
      fetchData();
    } catch (error) {
      alert("Erro ao salvar pacote. Verifique o console.");
      console.error(error);
    }
  };

  const openEditCreditModal = (pkg) => {
    setEditCreditId(pkg.id);
    setCreditFormData({
      name: pkg.name,
      credit_amount: pkg.credit_amount,
      price: pkg.price,
      promo_price: pkg.promo_price || ''
    });
    setShowCreditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await axios.delete(`/api/finance/plans/${id}`);
        fetchData();
      } catch (error) {
        console.error('Erro ao deletar plano:', error);
      }
    }
  };

  const handleDeleteCreditPackage = async (id) => {
    if (window.confirm("Deseja realmente apagar este pacote de créditos?")) {
      try {
        await axios.delete(`/api/finance/credit-packages/${id}`);
        fetchData();
      } catch (e) {
        alert("Erro ao deletar pacote.");
      }
    }
  };


  const handleSaveGateways = async () => {
    setSavingGateways(true);
    try {
      const payload = {
        mp_access_token: mpAccessToken,
        mp_public_key: mpPublicKey,
        mp_receive_pix: mpReceivePix,
        mp_receive_boleto: mpReceiveBoleto,
        mp_receive_credit: mpReceiveCredit,
        mp_status_active: mpStatusActive,
        paypal_client_id: paypalClientId,
        paypal_client_secret: paypalClientSecret,
        paypal_status_active: paypalStatusActive,
        invoice_name: invoiceName,
        invoice_theme: invoiceTheme,
        fiscal_active: fiscalActive,
        fiscal_data: fiscalData
      };
      await axios.post('/api/settings', payload);
      
      // Valida o token após salvar
      if (mpAccessToken) {
        await validateMpToken(mpAccessToken);
      }
      
      alert("Configurações salvas com sucesso!");
      setShowInvoiceModal(false);
    } catch (error) {
      alert("Erro ao salvar configurações de gateway.");
      console.error(error);
    } finally {
      setSavingGateways(false);
    }
  };

  const handleSaveApp = async (e) => {
    e.preventDefault();
    try {
      if (editAppId) {
        await axios.put(`/api/finance/app-packages/${editAppId}`, appFormData);
        alert("Pacote atualizado com sucesso!");
      } else {
        await axios.post('/api/finance/app-packages', appFormData);
        alert("Novo pacote criado com sucesso!");
      }
      setShowAppModal(false);
      setEditAppId(null);
      fetchData();
    } catch (error) {
      alert("Erro ao salvar pacote de aplicativo.");
    }
  };

  const handleDeleteApp = async (id) => {
    if (window.confirm("Deseja realmente excluir este plano de ativação?")) {
      try {
        await axios.delete(`/api/finance/app-packages/${id}`);
        fetchData();
      } catch (error) {
        alert("Erro ao deletar pacote.");
      }
    }
  };

  const handleSaveAppUrl = async (e) => {
    e.preventDefault();
    setSavingAppUrl(true);
    try {
      await axios.post('/api/settings/bulk', { player_app_url: appUrl, trial_hours: trialHours });
      alert("Configurações do Aplicativo atualizadas com sucesso! O Web Player, QR Code e o tempo de teste já foram atualizados.");
    } catch (error) {
      alert("Erro ao salvar as configurações do App.");
    } finally {
      setSavingAppUrl(false);
    }
  };

  const validateMpToken = async (token) => {
    if (!token || token.length < 10) {
      setMpStatus('unchecked');
      setMpSeller(null);
      return;
    }
    setMpStatus('validating');
    try {
      const res = await axios.post('/api/payments/validate-token', { access_token: token });
      if (res.data.valid) {
        setMpStatus('active');
        setMpSeller(res.data.seller);
      } else {
        setMpStatus('invalid');
        setMpSeller(null);
      }
    } catch (err) {
      setMpStatus('error');
      setMpSeller(null);
    }
  };

  const validatePaypalToken = async (clientId, clientSecret) => {
    if (!clientId || !clientSecret) return;
    setPaypalStatus('validating');
    try {
      // Endpoint que criaremos no backend para validar PayPal
      const res = await axios.post('/api/payments/validate-paypal', { client_id: clientId, client_secret: clientSecret });
      if (res.data.valid) {
        setPaypalStatus('active');
      } else {
        setPaypalStatus('invalid');
      }
    } catch (err) {
      setPaypalStatus('error');
    }
  };

  const handleDisconnectPaypal = async () => {
    if (window.confirm("Deseja desconectar o PayPal?")) {
      setSavingGateways(true);
      try {
        await axios.post('/api/settings', { paypal_client_id: '', paypal_client_secret: '', paypal_status_active: 'Desativar' });
        setPaypalClientId('');
        setPaypalClientSecret('');
        setPaypalStatusActive('Desativar');
        setPaypalStatus('unchecked');
        alert("PayPal desconectado.");
      } catch (e) { alert("Erro ao desconectar."); }
      finally { setSavingGateways(false); }
    }
  };

  const handleDisconnectMp = async () => {
    if (window.confirm("Deseja realmente desconectar sua conta do Mercado Pago?")) {
      setSavingGateways(true);
      try {
        const payload = {
          mp_access_token: '',
          mp_public_key: '',
          mp_status_active: 'Desativar'
        };
        await axios.post('/api/settings', payload);
        setMpAccessToken('');
        setMpPublicKey('');
        setMpStatusActive('Desativar');
        setMpStatus('unchecked');
        setMpSeller(null);
        alert("Mercado Pago desconectado com sucesso!");
      } catch (e) {
        alert("Erro ao desconectar.");
      } finally {
        setSavingGateways(false);
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const updateCrmStatus = async (id, status, method) => {
    try {
      await axios.put(`/api/finance/crm/${id}`, { status, payment_method: method });
      fetchData();
    } catch (e) {
      alert("Erro ao atualizar status.");
    }
  };

  const deleteCrmLog = async (id) => {
    if (window.confirm("Deseja realmente apagar este histórico de venda? Isso não cancela a conta no servidor.")) {
      try {
        await axios.delete(`/api/finance/crm/${id}`);
        fetchData();
      } catch (e) {
        alert("Erro ao deletar.");
      }
    }
  };

  const filteredCrm = crmLogs.filter(log => {
    if (searchTerm) {
      const searchableText = [
        log.client_name,
        log.app_mac_address || log.mac_address,
        log.app_username || log.username,
        log.whatsapp,
        log.plan_name,
        log.payment_method,
        log.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(searchTerm.toLowerCase())) return false;
    }
    if (filterStatus && log.status !== filterStatus) return false;
    if (filterMethod && log.payment_method !== filterMethod) return false;
    return true;
  });

  const handleSavePanelPlan = async (e) => {
    e.preventDefault();
    try {
      if (editPanelPlanId) {
        await axios.put(`/api/finance/panel-plans/${editPanelPlanId}`, panelPlanFormData);
        alert("Plano de Assinatura atualizado com sucesso!");
      } else {
        await axios.post('/api/finance/panel-plans', panelPlanFormData);
        alert("Plano de Assinatura criado com sucesso!");
      }
      setShowPanelPlanModal(false);
      setEditPanelPlanId(null);
      fetchData();
    } catch (error) {
      alert("Erro ao salvar plano de assinatura.");
      console.error(error);
    }
  };

  const openEditPanelPlanModal = (plan) => {
    setEditPanelPlanId(plan.id);
    setPanelPlanFormData({
      name: plan.name,
      price: plan.price.toString(),
      trial_days: plan.trial_days,
      features: plan.features || [],
      is_active: plan.is_active
    });
    setShowPanelPlanModal(true);
  };

  const handleDeletePanelPlan = async (id) => {
    if (window.confirm("Deseja realmente excluir este plano de assinatura do painel?")) {
      try {
        await axios.delete(`/api/finance/panel-plans/${id}`);
        fetchData();
      } catch (e) {
        alert("Erro ao deletar plano.");
      }
    }
  };

  const togglePanelFeature = (featureId) => {
    const current = panelPlanFormData.features || [];
    if (current.includes(featureId)) {
      setPanelPlanFormData({ ...panelPlanFormData, features: current.filter(f => f !== featureId) });
    } else {
      setPanelPlanFormData({ ...panelPlanFormData, features: [...current, featureId] });
    }
  };

  // Mapeamento de features disponiveis para os checkboxes
  const availableFeatures = [
    { id: 'dashboard', label: 'Dashboard & Métricas', category: 'Core' },
    { id: 'devices', label: 'Dispositivos & Logs', category: 'Core' },
    { id: 'tickets', label: 'Tickets de Suporte', category: 'Core' },
    { id: 'versions', label: 'Versões do App', category: 'Core' },
    { id: 'settings', label: 'Config. Globais', category: 'Core' },
    { id: 'finance-plans', label: 'Planos Comerciais', category: 'Financeiro' },
    { id: 'crm', label: 'Histórico CRM', category: 'Financeiro' },
    { id: 'credit-store', label: 'Loja de Créditos', category: 'Financeiro' },
    { id: 'white-label', label: 'Loja White Label', category: 'Financeiro' },
    { id: 'iptv-server', label: 'Servidor IPTV', category: 'IPTV' },
    { id: 'servers-management', label: 'Múltiplos Servidores', category: 'IPTV' },
    { id: 'playlist-manager', label: 'Gestor Playlists', category: 'IPTV' },
    { id: 'branding', label: 'Fábrica de Temas', category: 'Branding' },
    { id: 'profile-screens', label: 'Telas de Perfil', category: 'Branding' },
    { id: 'tv-manager', label: 'Gerenciar TV', category: 'Branding' },
    { id: 'sports-manager', label: 'Gerenciar Esportes', category: 'Branding' },
    { id: 'whatsapp-auto', label: 'Automação WhatsApp', category: 'Marketing' },
    { id: 'livechat', label: 'Chat Ao Vivo', category: 'Marketing' },
    { id: 'banner-generator', label: 'Gerador Banners', category: 'Marketing' },
    { id: 'game-schedule', label: 'Grade de Jogos', category: 'Marketing' },
    { id: 'agents', label: 'Agentes IA', category: 'Marketing' }
  ];

  // Botão Primário Laranja Oficial
  const btnPrimaryClass = "inline-flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs sm:text-sm font-black rounded-md transition-all shadow-[0_4px_15px_rgba(252,95,22,0.3)] hover:shadow-[0_6px_20px_rgba(252,95,22,0.5)] cursor-pointer border-none";
  const btnPrimary = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 12px', background: '#FC5F16', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 15px rgba(252,95,22,0.3)', transition: 'all 0.2s' };

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 30px)', maxWidth: '1200px', margin: '0 auto', color: '#f4f4f5', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER E DASHBOARD */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={28} color="#FC5F16" style={{ flexShrink: 0 }} /> Planos & Receitas
          </h1>
          <p style={{ color: '#71717a', margin: '5px 0 0', fontSize: 'clamp(12px, 2vw, 15px)' }}>
            Gerencie os planos comerciais da TV MAXX e acompanhe o faturamento
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          {activeTab === 'assinaturas' && (
            <button onClick={() => { setEditPanelPlanId(null); setPanelPlanFormData({ name: '', price: '', trial_days: 7, features: [], is_active: true }); setShowPanelPlanModal(true); }} className={btnPrimaryClass}>
              <Plus size={18} /> Novo Plano de Painel
            </button>
          )}
          {activeTab === 'planos' && (
            <button onClick={() => { setEditPlanId(null); setFormData({ name: '', price: '', duration_days: '30', max_connections: '1', qpanel_id: '', sigma_package: '', sigma_packages: [], is_active: true }); setShowModal(true); }} className={btnPrimaryClass}>
              <Plus size={18} /> Novo Plano
            </button>
          )}
          {activeTab === 'loja' && (
            <button onClick={() => { setEditCreditId(null); setCreditFormData({ name: '', credit_amount: '', price: '', promo_price: '' }); setShowCreditModal(true); }} className={btnPrimaryClass}>
              <Plus size={18} /> Novo Pacote
            </button>
          )}
        </div>
      </div>

      {/* ABAS */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', borderBottom: '1px solid #27272a', paddingBottom: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {visibleTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-md font-black cursor-pointer border-none transition-all transform active:scale-95 whitespace-nowrap text-xs sm:text-sm ${activeTab === tab.id ? 'bg-brand-500/10 text-brand-500' : 'bg-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '10px', marginBottom: '10px' }}>
        <div style={{ background: 'rgba(252,95,22,0.1)', border: '1px solid rgba(252,95,22,0.3)', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: '#FC5F16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(252,95,22,0.4)' }}>
            <Activity size={30} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#FC5F16', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Receita do Mês</p>
            <h2 style={{ margin: '4px 0 0', fontSize: '19px', fontWeight: '900', color: '#fff' }}>
              {formatCurrency(stats.total_revenue)}
            </h2>
          </div>
        </div>

        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={30} color="#10b981" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Vendas Realizadas</p>
            <h2 style={{ margin: '4px 0 0', fontSize: '19px', fontWeight: '900', color: '#fff' }}>
              {stats.total_sales}
            </h2>
          </div>
        </div>
      </div>

      {activeTab === 'planos' && (
        <>
          {/* LISTA DE PLANOS */}
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="#FC5F16" /> Planos Comerciais Ativos
          </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#71717a' }}>Carregando planos...</div>
      ) : plans.length === 0 ? (
        <div style={{ background: '#18181b', borderRadius: '10px', padding: '40px', textAlign: 'center', border: '1px dashed #3f3f46' }}>
          <DollarSign size={48} color="#3f3f46" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#f4f4f5' }}>Nenhum plano cadastrado</h3>
          <p style={{ margin: 0, color: '#a1a1aa' }}>Crie o seu primeiro plano comercial para começar a vender.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '10px' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor='#FC5F16'} onMouseOut={e => e.currentTarget.style.borderColor='#27272a'}>
              {!plan.is_active && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '8px', fontWeight: '800' }}>INATIVO</div>
              )}
              <h3 style={{ margin: '0 0 15px', fontSize: '16px', fontWeight: '900', color: '#fff' }}>{plan.name}</h3>
              <div style={{ fontSize: '19px', fontWeight: '900', color: '#FC5F16', marginBottom: '10px' }}>
                {formatCurrency(plan.price)}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', fontSize: '14px', fontWeight: '600' }}>
                  <Clock size={16} color="#FC5F16" /> Duração: <span style={{ color: '#fff' }}>{plan.duration_days} Dias</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', fontSize: '14px', fontWeight: '600' }}>
                  <Monitor size={16} color="#FC5F16" /> Telas: <span style={{ color: '#fff' }}>{plan.max_connections} Conexões</span>
                </div>
                {plan.sigma_package && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', fontSize: '14px', fontWeight: '600' }}>
                    <Settings size={16} color="#FC5F16" /> Pacote: <span style={{ color: '#fff', fontSize: '11px', background: '#27272a', padding: '2px 6px', borderRadius: '4px' }}>{plan.sigma_package}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '20px', borderTop: '1px solid #27272a' }}>
                <button onClick={() => openEditModal(plan)} className="flex-1 bg-dark-700 hover:bg-dark-600 active:scale-95 text-white py-1.5 rounded-md font-bold border border-white/5 transition-all flex items-center justify-center gap-2">
                  <Edit3 size={16} /> Editar
                </button>
                <button onClick={() => handleDelete(plan.id)} className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-md transition-all active:scale-95 flex items-center justify-center border border-red-500/20">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {activeTab === 'crm' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
            <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#FC5F16" /> Histórico de Clientes (CRM)
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '150px' }}>
                <Search size={16} color="#a1a1aa" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '10px 10px 10px 35px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              </div>
              
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', flex: '1 1 120px', minWidth: '120px' }}>
                <option value="">Status</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>

              <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', flex: '1 1 120px', minWidth: '120px' }}>
                <option value="">Método</option>
                <option value="PIX">PIX</option>
                <option value="Cartão">Cartão</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cortesia">Cortesia</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#09090b', borderBottom: '1px solid #27272a' }}>
                  <th style={{ padding: '8px 12px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Cliente</th>
                  <th style={{ padding: '8px 12px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>MAC</th>
                  <th style={{ padding: '8px 12px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Usuário</th>
                  <th style={{ padding: '8px 12px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Senha</th>
                  <th style={{ padding: '8px 12px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Plano</th>
                  <th style={{ padding: '8px 12px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Financeiro</th>
                  <th style={{ padding: '8px 12px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Data / Hora</th>
                  <th style={{ padding: '8px 12px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrm.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>Nenhum registro encontrado no CRM.</td>
                  </tr>
                ) : (
                  filteredCrm.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #27272a', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{log.client_name || 'Desconhecido'}</div>
                        {log.whatsapp ? (
                           <a href={`https://wa.me/${log.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#34d399', textDecoration: 'none', fontWeight: '700' }}>
                             <Phone size={12} /> {log.whatsapp}
                           </a>
                        ) : (
                           <span style={{ fontSize: '11px', color: '#71717a' }}>Sem contato</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '800', color: '#fff', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          {log.app_mac_address || log.mac_address || 'Sem MAC'}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '800', color: '#fff', fontSize: '13px', wordBreak: 'break-word' }}>
                          {log.app_username || log.username || 'Sem usuário'}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '800', color: '#FC5F16', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          {log.app_password || log.password || 'Sem senha'}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontSize: '13px', color: '#e4e4e7', fontWeight: '600' }}>{log.plan_name || 'Avulso/Excluído'}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '900', color: '#FC5F16', fontSize: '14px' }}>{formatCurrency(log.amount)}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 6px', background: '#27272a', borderRadius: '4px', color: '#a1a1aa', fontWeight: '700' }}>{log.payment_method}</span>
                          <span style={{ 
                            fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase',
                            background: log.status === 'pago' ? 'rgba(52,211,153,0.1)' : log.status === 'pendente' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                            color: log.status === 'pago' ? '#34d399' : log.status === 'pendente' ? '#fbbf24' : '#ef4444' 
                          }}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#a1a1aa', fontSize: '13px' }}>
                        {formatDate(log.created_at)}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           <select 
                             value={log.status} 
                             onChange={e => updateCrmStatus(log.id, e.target.value, log.payment_method)}
                             style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '6px', padding: '4px', fontSize: '11px', outline: 'none', cursor: 'pointer' }}
                           >
                             <option value="pago">Marcar Pago</option>
                             <option value="pendente">Pendente</option>
                             <option value="cancelado">Cancelado</option>
                           </select>
                           <button onClick={() => deleteCrmLog(log.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                             <Trash2 size={14} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'loja' && (
        <>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} color="#FC5F16" /> Configuração da Loja de Créditos
          </h2>
          <p style={{ color: '#a1a1aa', marginBottom: '10px' }}>Configure aqui os pacotes de créditos que seus revendedores poderão comprar. Quanto maior a escala, maior o desconto que você pode oferecer.</p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#71717a' }}>Carregando pacotes...</div>
          ) : creditPackages.length === 0 ? (
            <div style={{ background: '#18181b', borderRadius: '10px', padding: '40px', textAlign: 'center', border: '1px dashed #3f3f46' }}>
              <CreditCard size={48} color="#3f3f46" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#f4f4f5' }}>Nenhum pacote de crédito</h3>
              <p style={{ margin: 0, color: '#a1a1aa' }}>Crie o seu primeiro pacote para a loja de revendedores.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '10px' }}>
              {creditPackages.map((pkg) => {
                 const hasPromo = pkg.promo_price && pkg.promo_price > 0;
                 const activePrice = hasPromo ? pkg.promo_price : pkg.price;
                 const costPerCredit = (activePrice / pkg.credit_amount).toFixed(2);
                 return (
                  <div key={pkg.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor='#FC5F16'} onMouseOut={e => e.currentTarget.style.borderColor='#27272a'}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'rgba(252, 95, 22, 0.1)', width: '100px', height: '100px', borderRadius: '50%', filter: 'blur(30px)' }}></div>
                    
                    {hasPromo && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} /> PROMOÇÃO
                      </div>
                    )}

                    <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '900', color: '#fff' }}>{pkg.name}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '19px', fontWeight: '900', color: '#FC5F16' }}>
                        {formatCurrency(activePrice)}
                      </div>
                      {hasPromo && (
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#71717a', textDecoration: 'line-through' }}>
                          {formatCurrency(pkg.price)}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', background: '#09090b', padding: '15px', borderRadius: '10px', border: '1px solid #27272a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa', fontSize: '14px', fontWeight: '700' }}>
                        <span><CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#FC5F16' }} /> Créditos</span>
                        <span style={{ color: '#fff', fontSize: '16px', fontWeight: '900' }}>{pkg.credit_amount}</span>
                      </div>
                      <div style={{ height: '1px', background: '#27272a' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa', fontSize: '13px', fontWeight: '600' }}>
                        <span>Custo Unitário</span>
                        <span style={{ color: '#34d399' }}>R$ {costPerCredit} / un</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #27272a' }}>
                      <button onClick={() => openEditCreditModal(pkg)} style={{ flex: 1, background: '#27272a', border: '1px solid #3f3f46', color: '#fff', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                        <Edit3 size={16} /> Editar
                      </button>
                      <button onClick={() => handleDeleteCreditPackage(pkg.id)} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                        <Trash2 size={16} /> Remover
                      </button>
                    </div>
                  </div>
                 )
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'assinaturas' && (
        <>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={20} color="#FC5F16" /> Planos de Assinatura do Painel (SaaS)
          </h2>
          <p style={{ color: '#a1a1aa', marginBottom: '10px' }}>
            Crie os pacotes de mensalidade que seus revendedores deverão pagar para acessar o painel. Você pode restringir quais ferramentas eles terão acesso dependendo do plano escolhido.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#71717a' }}>Carregando pacotes de assinatura...</div>
          ) : panelPlans.length === 0 ? (
            <div style={{ background: '#18181b', borderRadius: '10px', padding: '40px', textAlign: 'center', border: '1px dashed #3f3f46' }}>
              <Monitor size={48} color="#3f3f46" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#f4f4f5' }}>Nenhum pacote de assinatura criado</h3>
              <p style={{ margin: 0, color: '#a1a1aa' }}>Crie pacotes (ex: Básico, Elite) para começar a cobrar pela plataforma.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '10px' }}>
              {panelPlans.map((pkg) => {
                 return (
                  <div key={pkg.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor='#FC5F16'} onMouseOut={e => e.currentTarget.style.borderColor='#27272a'}>
                    {!pkg.is_active && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '8px', fontWeight: '800' }}>INATIVO</div>
                    )}
                    <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '900', color: '#fff' }}>{pkg.name}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '19px', fontWeight: '900', color: '#FC5F16' }}>
                        {formatCurrency(pkg.price)}
                      </div>
                      <span style={{ color: '#71717a', fontSize: '12px' }}>/ mês</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', background: '#09090b', padding: '15px', borderRadius: '10px', border: '1px solid #27272a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa', fontSize: '14px', fontWeight: '700' }}>
                        <span><Clock size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#FC5F16' }} /> Período Grátis</span>
                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: '900' }}>{pkg.trial_days} Dias</span>
                      </div>
                      <div style={{ height: '1px', background: '#27272a' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa', fontSize: '13px', fontWeight: '600' }}>
                        <span>Ferramentas Liberadas</span>
                        <span style={{ color: '#34d399' }}>{pkg.features?.length || 0} de {availableFeatures.length}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #27272a' }}>
                      <button onClick={() => openEditPanelPlanModal(pkg)} style={{ flex: 1, background: '#27272a', border: '1px solid #3f3f46', color: '#fff', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                        <Edit3 size={16} /> Editar
                      </button>
                      <button onClick={() => handleDeletePanelPlan(pkg.id)} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                        <Trash2 size={16} /> Remover
                      </button>
                    </div>
                  </div>
                 )
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL NOVO PLANO DE ASSINATURA */}
      {showPanelPlanModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '10px' }}>
          <div style={{ background: '#18181b', border: '1px solid #FC5F16', borderRadius: '10px', width: '100%', maxWidth: '700px', padding: 'clamp(16px, 3vw, 30px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 25px', fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {editPanelPlanId ? <Edit3 size={24} color="#FC5F16" /> : <Plus size={24} color="#FC5F16" />} 
              {editPanelPlanId ? 'Editar Plano de Assinatura' : 'Criar Plano de Assinatura'}
            </h2>
            
            <form onSubmit={handleSavePanelPlan} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Nome do Pacote (SaaS)</label>
                  <input required type="text" placeholder="Ex: PLANO ELITE" value={panelPlanFormData.name} onChange={e => setPanelPlanFormData({...panelPlanFormData, name: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Preço Mensal (R$)</label>
                  <input required type="number" step="0.01" placeholder="99.90" value={panelPlanFormData.price} onChange={e => setPanelPlanFormData({...panelPlanFormData, price: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Dias Grátis (Trial)</label>
                  <input required type="number" placeholder="7" value={panelPlanFormData.trial_days} onChange={e => setPanelPlanFormData({...panelPlanFormData, trial_days: parseInt(e.target.value)})} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '900', color: '#fff' }}>Ferramentas Inclusas (Checkboxes)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                  {availableFeatures.map(feat => {
                    const isChecked = panelPlanFormData.features.includes(feat.id);
                    return (
                      <div 
                        key={feat.id} 
                        onClick={() => togglePanelFeature(feat.id)}
                        style={{ 
                          background: isChecked ? 'rgba(252, 95, 22, 0.1)' : '#09090b', 
                          border: isChecked ? '1px solid #FC5F16' : '1px solid #27272a', 
                          padding: '10px', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: isChecked ? 'none' : '1px solid #52525b', background: isChecked ? '#FC5F16' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isChecked && <CheckCircle size={14} color="#fff" />}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: isChecked ? '#fff' : '#a1a1aa', fontWeight: isChecked ? '700' : '500' }}>{feat.label}</div>
                          <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase' }}>{feat.category}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', background: '#09090b', padding: '15px', borderRadius: '10px', border: '1px solid #27272a' }}>
                <input type="checkbox" id="panelPlanActive" checked={panelPlanFormData.is_active} onChange={e => setPanelPlanFormData({...panelPlanFormData, is_active: e.target.checked})} style={{ accentColor: '#FC5F16', width: '18px', height: '18px' }} />
                <label htmlFor="panelPlanActive" style={{ fontSize: '14px', fontWeight: '700', color: '#fff', cursor: 'pointer' }}>Plano Ativo (Visível para compra)</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowPanelPlanModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #3f3f46', color: '#fff', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 2, padding: '10px', background: '#FC5F16', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 15px rgba(252,95,22,0.4)' }}>Salvar Plano</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO PLANO COMERCIAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '10px' }}>
          <div style={{ background: '#111111', border: '1px solid rgba(252,95,22,0.5)', borderRadius: '10px', width: '100%', maxWidth: '1100px', padding: '10px', boxShadow: '0 0 40px rgba(252,95,22,0.15)', maxHeight: '95vh', overflowY: 'auto', position: 'relative' }}>
            
            {/* Botão Fechar */}
            <button onClick={() => { setShowModal(false); setEditPlanId(null); }} style={{ position: 'absolute', top: '30px', right: '30px', background: '#18181b', border: '1px solid #27272a', color: '#a1a1aa', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3f3f46'; }} onMouseOut={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = '#27272a'; }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Header do Modal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(252,95,22,0.1)', border: '1px solid rgba(252,95,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FC5F16' }}>
                {editPlanId ? <Edit3 size={24} /> : <Plus size={24} />}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#fff' }}>{editPlanId ? 'Editar Plano' : 'Criar Novo Plano'}</h2>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#a1a1aa' }}>Configure um novo plano para seus clientes</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                
                {/* Coluna Esquerda (Formulário) */}
                <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Bloco 1: Informações do Plano */}
                  <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(252,95,22,0.1)', color: '#FC5F16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>1</span>
                      Informações do Plano
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '2 1 200px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Nome do Plano</label>
                          <div style={{ position: 'relative' }}>
                            <Tag size={16} color="#FC5F16" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                            <input required type="text" placeholder="Ex: TV Maxx Premium Mensal" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '14px 14px 14px 40px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Preço (R$)</label>
                          <div style={{ position: 'relative' }}>
                            <DollarSign size={16} color="#FC5F16" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                            <input required type="number" step="0.01" placeholder="35.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '14px 14px 14px 40px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        <div style={{ flex: '1 1 150px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Duração (Dias)</label>
                          <div style={{ position: 'relative' }}>
                            <Clock size={16} color="#FC5F16" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                            <select required value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} style={{ padding: '14px 14px 14px 40px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', appearance: 'none' }}>
                              <option value="1">1 Dia (Teste)</option>
                              <option value="30">30 Dias (Mensal)</option>
                              <option value="90">90 Dias (Trimestral)</option>
                              <option value="180">180 Dias (Semestral)</option>
                              <option value="365">365 Dias (Anual)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Conexões (Telas)</label>
                          <div style={{ position: 'relative' }}>
                            <Monitor size={16} color="#FC5F16" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                            <input required type="number" min="1" max="10" value={formData.max_connections} onChange={e => setFormData({...formData, max_connections: e.target.value})} style={{ padding: '14px 14px 14px 40px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Painel Vinculado</label>
                          <div style={{ position: 'relative' }}>
                            <Settings size={16} color="#FC5F16" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                            <select value={formData.qpanel_id} onChange={e => setFormData({...formData, qpanel_id: e.target.value})} style={{ padding: '14px 14px 14px 40px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', appearance: 'none' }}>
                              <option value="">Qualquer Painel</option>
                              {panels.map(p => (
                                <option key={p.id} value={p.id}>{p.panel_name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Bloco 2: Pacotes */}
                    <div style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', minWidth: '280px' }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(252,95,22,0.1)', color: '#FC5F16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>2</span>
                        Pacotes no Painel Sigma
                      </h3>
                      <p style={{ margin: '0 0 15px', fontSize: '12px', color: '#a1a1aa' }}>Selecione um ou mais pacotes para este plano</p>
                      
                      <div style={{ 
                        background: '#09090b', 
                        border: '1px solid #27272a', 
                        borderRadius: '10px', 
                        padding: '10px', 
                        height: '220px', 
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#FC5F16 #09090b'
                      }}>
                        {[...new Set([...dynamicPlans, ...[
                            "01 MÊS IPTV - COMPLETO C/ ADULTO",
                            "01 MÊS IPTV - COMPLETO S/ ADULTO",
                            "1 MES - COMPLETO",
                            "1 Mês - Somente Canais",
                            "03 MESES IPTV - COMPLETO C/ ADULTO",
                            "03 MESES IPTV - COMPLETO S/ ADULTO",
                            "1 ANO IPTV - COMPLETO C/ ADULTO",
                            "1 ANO IPTV - COMPLETO S/ ADULTO",
                            "1 Ano - Somente Canais"
                        ]])].map(p => {
                          const isSelected = (formData.sigma_packages || []).includes(p);
                          return (
                            <div 
                              key={p} 
                              onClick={() => toggleSigmaPackage(p)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                padding: '10px', 
                                borderRadius: '10px', 
                                background: isSelected ? 'rgba(252,95,22,0.1)' : 'transparent',
                                border: isSelected ? '1px solid rgba(252,95,22,0.3)' : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ 
                                width: '18px', 
                                height: '18px', 
                                borderRadius: '4px', 
                                border: isSelected ? 'none' : '2px solid #3f3f46',
                                background: isSelected ? '#FC5F16' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {isSelected && <CheckCircle size={14} color="#fff" />}
                              </div>
                              <span style={{ fontSize: '11px', color: isSelected ? '#fff' : '#a1a1aa', fontWeight: isSelected ? '800' : '500' }}>{p}</span>
                            </div>
                          );
                        })}
                      </div>
                      <p style={{ fontSize: '12px', color: '#FC5F16', marginTop: '12px', fontWeight: '700' }}>
                        {formData.sigma_packages?.length || 0} pacotes selecionados
                      </p>
                    </div>

                    {/* Bloco 3: Destaque Visual */}
                    <div style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', minWidth: '280px' }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(252,95,22,0.1)', color: '#FC5F16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>3</span>
                        Destaque Visual no App
                      </h3>
                      <p style={{ margin: '0 0 15px', fontSize: '12px', color: '#a1a1aa' }}>Personalize como este plano será exibido no app</p>
                      
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: '#a1a1aa' }}>Tipo de Destaque</label>
                          <div style={{ position: 'relative' }}>
                            <Image size={14} color="#FC5F16" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                            <select value={formData.highlight_type} onChange={e => setFormData({...formData, highlight_type: e.target.value})} style={{ padding: '10px 10px 10px 34px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box', appearance: 'none' }}>
                              <option value="none">Nenhum</option>
                              <option value="mais_popular">Mais Popular</option>
                              <option value="promocao">Promoção</option>
                              <option value="destaque">Destaque</option>
                              <option value="custo_beneficio">Melhor Custo-benefício</option>
                              <option value="recomendado">Plano Recomendado</option>
                              <option value="plano_ativo">Plano Ativo</option>
                              <option value="oferta_especial">Oferta Especial</option>
                              <option value="premium">Premium</option>
                              <option value="familia">Família</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: '#a1a1aa' }}>Texto da Tag</label>
                          <div style={{ position: 'relative' }}>
                            <Tag size={14} color="#FC5F16" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                            <input type="text" placeholder="Ex: MAIS POPULAR" value={formData.badge_text} onChange={e => setFormData({...formData, badge_text: e.target.value})} style={{ padding: '10px 10px 10px 34px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '700', color: '#a1a1aa' }}>Cor Tag</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#09090b', padding: '6px 8px', borderRadius: '8px', border: '1px solid #27272a' }}>
                            <input type="color" value={formData.badge_color} onChange={e => setFormData({...formData, badge_color: e.target.value})} style={{ width: '16px', height: '16px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                            <span style={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}>HEX</span>
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '700', color: '#a1a1aa' }}>Cor Borda</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#09090b', padding: '6px 8px', borderRadius: '8px', border: '1px solid #27272a' }}>
                            <input type="color" value={formData.border_color} onChange={e => setFormData({...formData, border_color: e.target.value})} style={{ width: '16px', height: '16px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                            <span style={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}>HEX</span>
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '700', color: '#a1a1aa' }}>Cor Botão</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#09090b', padding: '6px 8px', borderRadius: '8px', border: '1px solid #27272a' }}>
                            <input type="color" value={formData.button_color} onChange={e => setFormData({...formData, button_color: e.target.value})} style={{ width: '16px', height: '16px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                            <span style={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}>HEX</span>
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '700', color: '#a1a1aa' }}>Cor Brilho</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#09090b', padding: '6px 8px', borderRadius: '8px', border: '1px solid #27272a' }}>
                            <input type="color" value={formData.glow_color} onChange={e => setFormData({...formData, glow_color: e.target.value})} style={{ width: '16px', height: '16px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                            <span style={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}>HEX</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#09090b', padding: '10px', borderRadius: '10px', border: '1px solid #27272a' }}>
                          <input type="checkbox" id="isCarouselHighlight" checked={formData.is_carousel_highlight} onChange={e => setFormData({...formData, is_carousel_highlight: e.target.checked})} style={{ accentColor: '#FC5F16', width: '16px', height: '16px' }} />
                          <label htmlFor="isCarouselHighlight" style={{ fontSize: '11px', fontWeight: '700', color: '#fff', cursor: 'pointer', margin: 0 }}>Destacar no Carrossel</label>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#09090b', padding: '8px 10px', borderRadius: '10px', border: '1px solid #27272a' }}>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: '#fff', margin: 0, flex: 1 }}>Ordem Exibição:</label>
                          <input type="number" min="0" value={formData.display_order} onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})} style={{ width: '40px', padding: '4px', background: '#18181b', border: '1px solid #3f3f46', borderRadius: '6px', color: '#fff', outline: 'none', textAlign: 'center', fontSize: '12px' }} />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Coluna Direita (Resumo e Botões) */}
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Card de Resumo */}
                  <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} color="#FC5F16" /> Resumo do Plano
                    </h3>
                    <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#a1a1aa' }}>Prévia das principais informações</p>
                    
                    <div style={{ background: '#09090b', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid #27272a', marginBottom: '10px' }}>
                      <div style={{ fontSize: '14px', color: '#FC5F16', fontWeight: '900', marginBottom: '4px' }}>R$ <span style={{ fontSize: '19px' }}>{formData.price || '0.00'}</span></div>
                      <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{formData.duration_days} Dias</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '13px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '8px' }}><Monitor size={14} color="#FC5F16" /> Conexões (Telas)</span>
                        <span style={{ fontSize: '14px', color: '#fff', fontWeight: '800' }}>{formData.max_connections || '1'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '13px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={14} color="#FC5F16" /> Painel Vinculado</span>
                        <span style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>{formData.qpanel_id ? panels.find(p => p.id == formData.qpanel_id)?.panel_name : 'Qualquer Painel'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '13px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart size={14} color="#FC5F16" /> Pacotes Selecionados</span>
                        <span style={{ fontSize: '14px', color: '#fff', fontWeight: '800' }}>{formData.sigma_packages?.length || 0}</span>
                      </div>
                    </div>

                    <div style={{ background: '#09090b', borderRadius: '10px', padding: '10px', border: `1px solid ${formData.border_color || '#27272a'}`, boxShadow: `0 0 20px ${(formData.glow_color || '#FC5F16')}20`, position: 'relative' }}>
                      <p style={{ margin: '0 0 15px', fontSize: '12px', color: '#a1a1aa', textAlign: 'center' }}>Prévia do Destaque</p>
                      
                      <div style={{ 
                        background: formData.button_color || '#FC5F16', 
                        color: '#fff', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        textAlign: 'center', 
                        fontWeight: '900',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: `0 4px 15px ${(formData.button_color || '#FC5F16')}60`
                      }}>
                        <Tag size={16} /> {formData.badge_text || 'MAIS POPULAR'}
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* Botões de Ação na parte inferior */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditPlanId(null); }} style={{ padding: '16px 40px', background: 'transparent', border: '1px solid #3f3f46', color: '#fff', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e => e.currentTarget.style.background = '#27272a'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '16px 40px', background: 'linear-gradient(90deg, #FC5F16 0%, #ff7a3a 100%)', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 25px rgba(252,95,22,0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  {editPlanId ? 'Salvar Alterações' : 'Salvar Plano'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO PACOTE DE CRÉDITOS */}
      {showCreditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px' }}>
          <div style={{ background: '#111111', border: '1px solid #27272a', borderRadius: '10px', width: '100%', maxWidth: '500px', padding: 'clamp(16px, 3vw, 30px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard color="#FC5F16" size={28} /> Novo Pacote
            </h2>
            
            <form onSubmit={handleSaveCreditPackage}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Nome do Pacote *</label>
                  <input required type="text" placeholder="Ex: Pacote Básico 10 Créditos" value={creditFormData.name} onChange={e => setCreditFormData({...creditFormData, name: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Quantidade de Créditos *</label>
                  <input required type="number" placeholder="Ex: 10" value={creditFormData.credit_amount} onChange={e => setCreditFormData({...creditFormData, credit_amount: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Preço Normal (R$) *</label>
                    <input required type="number" step="0.01" placeholder="Ex: 150.00" value={creditFormData.price} onChange={e => setCreditFormData({...creditFormData, price: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Preço Promo (Opcional)</label>
                    <input type="number" step="0.01" placeholder="Ex: 130.00" value={creditFormData.promo_price} onChange={e => setCreditFormData({...creditFormData, promo_price: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px dashed #FC5F16', borderRadius: '10px', color: '#FC5F16', outline: 'none', width: '100%' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setShowCreditModal(false); setEditCreditId(null); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #27272a', background: 'transparent', color: '#fff', fontWeight: '800', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: '#FC5F16', color: '#fff', fontWeight: '800', cursor: 'pointer' }}>
                  Salvar Pacote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TELA DE GATEWAYS DE PAGAMENTOS */}
      {activeTab === 'gateways' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0 }}>
              Gateways de pagamentos <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 'normal' }}>1.1.0</span>
            </h2>
            <p style={{ color: '#a1a1aa', marginTop: '8px' }}>Integre sua conta bancária e receba pagamentos dos seus clientes via PIX ou Cartão.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
            <button onClick={() => setShowInvoiceModal(true)} style={{ ...btnPrimary, background: '#18181b', border: '1px solid #FC5F16', color: '#FC5F16', boxShadow: 'none' }}>
              <Settings size={18} /> Configurações da fatura
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {/* Card Mercado Pago Simplificado (Estilo Print) */}
            <div style={{ 
              background: '#18181b', 
              border: mpStatus === 'active' ? '1px solid #009ee3' : '1px solid #27272a', 
              borderRadius: '10px', 
              overflow: 'hidden', 
              transition: 'all 0.3s ease',
              boxShadow: mpStatus === 'active' ? '0 0 20px rgba(0, 158, 227, 0.15)' : 'none'
            }}>
              <div style={{ 
                padding: '20px 24px', 
                background: mpStatus === 'active' ? 'linear-gradient(90deg, #009ee3 0%, #111 100%)' : '#27272a', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    background: '#fff', 
                    padding: '5px 10px', 
                    borderRadius: '6px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    <span style={{ color: '#009ee3', fontWeight: '900', fontSize: '14px', letterSpacing: '-1px' }}>Mercado</span>
                    <span style={{ color: '#111', fontWeight: '900', fontSize: '14px', letterSpacing: '-1px' }}>pago</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fff' }}>Gateway Oficial</h3>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mpStatus === 'active' && (
                    <div style={{ 
                      background: '#fff', 
                      color: '#009ee3', 
                      padding: '4px 10px', 
                      borderRadius: '10px', 
                      fontSize: '10px', 
                      fontWeight: '900',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <div style={{ width: '6px', height: '6px', background: '#009ee3', borderRadius: '50%' }} />
                      CONFIGURADO
                    </div>
                  )}
                  <span style={{ fontSize: '11px', fontWeight: '700', color: mpStatus === 'active' ? '#fff' : '#a1a1aa' }}>
                    {mpStatus === 'active' ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              {mpStatus === 'active' && mpSeller && (
                <div style={{ 
                  padding: '10px 24px', 
                  background: 'rgba(0,158,227,0.1)', 
                  borderBottom: '1px solid rgba(0,158,227,0.2)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={14} color="#009ee3" />
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>{mpSeller.nickname}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#009ee3', fontWeight: '700' }}>Verificado ✓</span>
                </div>
              )}

              <div style={{ padding: '10px' }}>
                {/* Linha Principal: Access Token e Status */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Informe o Access Token de sua conta *</label>
                    <input 
                      type="text" 
                      value={mpAccessToken} 
                      onChange={e => setMpAccessToken(e.target.value)} 
                      placeholder="APP_USR-..." 
                      style={{ width: '100%', padding: '10px', background: 'transparent', border: mpStatus === 'active' ? '1px solid #009ee3' : '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Status *</label>
                    <select 
                      value={mpStatusActive}
                      onChange={e => setMpStatusActive(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'transparent', border: mpStatus === 'active' ? '1px solid #009ee3' : '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="Ativar" style={{background: '#18181b'}}>Ativar</option>
                      <option value="Desativar" style={{background: '#18181b'}}>Desativar</option>
                    </select>
                  </div>
                </div>

                {/* Métodos de Recebimento */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', padding: '15px', background: '#09090b', borderRadius: '10px', border: mpStatus === 'active' ? '1px solid rgba(0,158,227,0.3)' : '1px solid #27272a' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={mpReceivePix} onChange={e => setMpReceivePix(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#009ee3' }} />
                    <span style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: '600' }}>PIX</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={mpReceiveBoleto} onChange={e => setMpReceiveBoleto(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#009ee3' }} />
                    <span style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: '600' }}>Boleto</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={mpReceiveCredit} onChange={e => setMpReceiveCredit(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#009ee3' }} />
                    <span style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: '600' }}>Cartão</span>
                  </label>
                </div>

                {/* Chave Pública (Configuração 2 / Avançada) */}
                <div style={{ marginTop: '10px' }}>
                  <details>
                    <summary style={{ fontSize: '12px', color: '#71717a', cursor: 'pointer', fontWeight: '700', marginBottom: '10px' }}>Configuração 2 (Public Key - Opcional para Checkout Pro)</summary>
                    <input 
                      type="text" 
                      value={mpPublicKey} 
                      onChange={e => setMpPublicKey(e.target.value)} 
                      placeholder="APP_USR-..." 
                      style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', outline: 'none' }} 
                    />
                  </details>
                </div>

                {/* Botões de Ação */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                  <button 
                    onClick={handleSaveGateways} 
                    disabled={savingGateways} 
                    style={{ ...btnPrimary, flex: 1, height: '50px', justifyContent: 'center', background: 'transparent', border: '1px solid #FC5F16', color: '#FC5F16', boxShadow: 'none' }}
                  >
                    {savingGateways ? 'Aguarde...' : 'Salvar'}
                  </button>
                  <button 
                    onClick={handleDisconnectMp}
                    disabled={savingGateways || !mpAccessToken}
                    style={{ flex: 1, height: '50px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Desconectar
                  </button>
                  <button 
                    onClick={() => validateMpToken(mpAccessToken)} 
                    disabled={mpStatus === 'validating' || !mpAccessToken} 
                    style={{ width: '100px', height: '50px', background: '#27272a', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '800', cursor: 'pointer' }}
                  >
                    {mpStatus === 'validating' ? '...' : 'Testar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Card PayPal Premium */}
            <div style={{ 
              background: '#18181b', 
              border: paypalStatus === 'active' ? '1px solid #003087' : '1px solid #27272a', 
              borderRadius: '10px', 
              overflow: 'hidden', 
              transition: 'all 0.3s ease',
              boxShadow: paypalStatus === 'active' ? '0 0 20px rgba(0, 48, 135, 0.15)' : 'none'
            }}>
              <div style={{ 
                padding: '20px 24px', 
                background: paypalStatus === 'active' ? 'linear-gradient(90deg, #003087 0%, #009cde 100%)' : '#27272a', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    background: '#fff', 
                    padding: '5px 12px', 
                    borderRadius: '6px', 
                    display: 'flex', 
                    alignItems: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    <span style={{ color: '#003087', fontWeight: '900', fontSize: '14px', fontStyle: 'italic' }}>Pay</span>
                    <span style={{ color: '#009cde', fontWeight: '900', fontSize: '14px', fontStyle: 'italic' }}>Pal</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fff' }}>Pagamentos Globais</h3>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '8px', height: '8px', borderRadius: '50%', 
                    background: paypalStatus === 'active' ? '#22c55e' : paypalStatus === 'validating' ? '#facc15' : '#71717a'
                  }} />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>
                    {paypalStatus === 'active' ? 'ATIVO' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '10px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Client ID (Production) *</label>
                  <input 
                    type="text" 
                    value={paypalClientId} 
                    onChange={e => setPaypalClientId(e.target.value)} 
                    placeholder="Abc123xyz..." 
                    style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none' }} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Client Secret *</label>
                    <input 
                      type="password" 
                      value={paypalClientSecret} 
                      onChange={e => setPaypalClientSecret(e.target.value)} 
                      placeholder="••••••••••••" 
                      style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Status *</label>
                    <select 
                      value={paypalStatusActive}
                      onChange={e => setPaypalStatusActive(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="Ativar" style={{background: '#18181b'}}>Ativar</option>
                      <option value="Desativar" style={{background: '#18181b'}}>Desativar</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleSaveGateways} disabled={savingGateways} style={{ ...btnPrimary, flex: 1, height: '50px', justifyContent: 'center', background: 'transparent', border: '1px solid #003087', color: '#003087', boxShadow: 'none' }}>
                    {savingGateways ? '...' : 'Salvar'}
                  </button>
                  <button onClick={handleDisconnectPaypal} disabled={savingGateways || !paypalClientId} style={{ flex: 1, height: '50px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                    Desconectar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'apps' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Seção 1: Configuração da URL */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={24} color="#FC5F16" /> Configuração do Aplicativo
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#f4f4f5', marginBottom: '10px', display: 'block', textTransform: 'uppercase' }}>URL de Login do App</label>
                <input 
                  type="url" 
                  value={appUrl} 
                  onChange={e => setAppUrl(e.target.value)} 
                  placeholder="https://maxxplayer.app" 
                  style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff', outline: 'none', marginBottom: '10px', fontSize: '15px' }} 
                />
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#f4f4f5', marginBottom: '10px', display: 'block', textTransform: 'uppercase' }}>Tempo de Teste (Horas)</label>
                <select
                  value={trialHours}
                  onChange={e => setTrialHours(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff', outline: 'none', marginBottom: '10px', fontSize: '15px' }}
                >
                  <option value="1">01 Hora</option>
                  <option value="2">02 Horas</option>
                  <option value="6">06 Horas</option>
                  <option value="12">12 Horas</option>
                  <option value="24">24 Horas</option>
                </select>
                <button 
                  onClick={handleSaveAppUrl} 
                  disabled={savingAppUrl} 
                  style={{ ...btnPrimary, width: '100%', padding: '10px' }}
                >
                  {savingAppUrl ? 'Salvando...' : 'Salvar Configurações do App'}
                </button>
              </div>

              <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '10px', fontWeight: '600' }}>Preview do QR Code</p>
                {appUrl ? (
                  <div style={{ padding: '8px', background: '#fff', borderRadius: '10px' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(appUrl)}&size=120x120&bgcolor=FFFFFF&color=000000`} alt="QR Code" style={{ width: '120px', height: '120px' }} />
                  </div>
                ) : <div style={{ height: '136px', display: 'flex', alignItems: 'center', color: '#71717a' }}>Insira uma URL</div>}
              </div>
            </div>
          </div>

          {/* Seção 2: Planos de Ativação (Dispositivo/MAC) */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={24} color="#FC5F16" /> Planos de Ativação por MAC
              </h2>
              <button 
                onClick={() => {
                  setEditAppId(null);
                  setAppFormData({ name: '', price: '', duration_days: 365, trial_hours: 24, description: '', is_active: true });
                  setShowAppModal(true);
                }}
                style={{ ...btnPrimary, padding: '10px 18px', fontSize: '13px' }}
              >
                <Plus size={18} /> Novo Plano
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
              {appPackages.map(pkg => (
                <div key={pkg.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#fff' }}>{pkg.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <div style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(252,95,22,0.1)', color: '#FC5F16', fontSize: '12px', fontWeight: '800' }}>
                        {pkg.duration_days} DIAS
                      </div>
                      <div style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: '12px', fontWeight: '800' }}>
                        TESTE {pkg.trial_hours || 24}H
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ background: '#09090b', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #27272a' }}>
                    <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '700', textTransform: 'uppercase' }}>Valor da Ativação</span>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>{formatCurrency(pkg.price)}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => {
                        setEditAppId(pkg.id);
                        setAppFormData({ ...pkg });
                        setShowAppModal(true);
                      }}
                      style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #27272a', color: '#fff', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Editar Plano
                    </button>
                    <button 
                      onClick={() => handleDeleteApp(pkg.id)}
                      style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '10px', cursor: 'pointer' }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção 3: Histórico de Ativações por MAC */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={24} color="#FC5F16" /> Histórico de Vendas por MAC
            </h2>
            <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #27272a', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase' }}>Data</th>
                      <th style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase' }}>App / Plano</th>
                      <th style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase' }}>Endereço MAC</th>
                      <th style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase' }}>Valor</th>
                      <th style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appActivations.map(act => (
                      <tr key={act.id} style={{ borderBottom: '1px solid #27272a' }}>
                        <td style={{ padding: '8px 12px', fontSize: '14px', color: '#f4f4f5' }}>{act.date_formatted}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{act.package_name || 'Ativação Direta'}</div>
                          <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{act.type === 'pix' ? 'PIX' : 'Cartão'}</div>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <code style={{ background: '#09090b', padding: '4px 8px', borderRadius: '6px', color: '#FC5F16', fontSize: '13px' }}>{act.mac_address || 'N/A'}</code>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '800', color: '#fff' }}>{formatCurrency(act.amount)}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', background: act.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)', color: act.status === 'approved' ? '#22c55e' : '#eab308' }}>
                            {act.status === 'approved' ? 'Aprovado' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {appActivations.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>Nenhuma ativação realizada até o momento.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAÇÕES DE GATEWAY (Antigo bloco de gateways) */}
      {activeTab === 'gateways' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          {/* ... (O código anterior de gateways já está aqui, apenas confirmando a estrutura) */}
        </div>
      )}

      {/* MODAL CONFIGURAÇÕES DA FATURA */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', padding: '10px' }}>
          <div style={{ background: '#18181b', width: '100%', maxWidth: '700px', borderRadius: '10px', border: '1px solid #27272a', padding: 'clamp(16px, 3vw, 30px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '900', color: '#fff' }}>Configurar Fatura e Checkout</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Nome do Negócio</label>
                <input 
                  type="text" value={invoiceName} onChange={e => setInvoiceName(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Tema do Checkout</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#FC5F16', '#714eae', '#00aeff', '#66ff00', '#ff0054'].map(color => (
                    <div 
                      key={color} 
                      onClick={() => setInvoiceTheme(color)}
                      style={{ 
                        width: '40px', height: '40px', borderRadius: '8px', background: color, cursor: 'pointer',
                        border: invoiceTheme === color ? '3px solid #fff' : 'none',
                        boxShadow: invoiceTheme === color ? `0 0 15px ${color}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid #27272a', paddingTop: '20px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '800', color: '#fff' }}>Dados pré-definidos (Opcional)</h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '10px' }}>Ative para preencher os dados fiscais automaticamente no checkout, evitando que o cliente final precise digitar CEP e CPF.</p>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Ativar dados padrão</label>
                  <select 
                    value={fiscalActive} onChange={e => setFiscalActive(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  >
                    <option value="no">Não</option>
                    <option value="yes">Sim</option>
                  </select>
                </div>

                {fiscalActive === 'yes' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px' }}>
                    <input type="text" placeholder="Nome Completo Fictício" value={fiscalData.costumer_name} onChange={e => setFiscalData({...fiscalData, costumer_name: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff' }} />
                    <input type="text" placeholder="CPF Válido" value={fiscalData.document} onChange={e => setFiscalData({...fiscalData, document: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff' }} />
                    <input type="text" placeholder="CEP" value={fiscalData.zip_code} onChange={e => setFiscalData({...fiscalData, zip_code: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff' }} />
                    <input type="text" placeholder="Rua" value={fiscalData.street_name} onChange={e => setFiscalData({...fiscalData, street_name: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff' }} />
                    <input type="text" placeholder="Número" value={fiscalData.street_number} onChange={e => setFiscalData({...fiscalData, street_number: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff' }} />
                    <input type="text" placeholder="Bairro" value={fiscalData.neighborhood} onChange={e => setFiscalData({...fiscalData, neighborhood: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff' }} />
                    <input type="text" placeholder="Cidade" value={fiscalData.city} onChange={e => setFiscalData({...fiscalData, city: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff' }} />
                    <input type="text" placeholder="Estado (Ex: SP)" value={fiscalData.federal_unit} onChange={e => setFiscalData({...fiscalData, federal_unit: e.target.value})} style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff' }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
              <button onClick={() => setShowInvoiceModal(false)} style={{ padding: '7px 12px', background: 'transparent', color: '#a1a1aa', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleSaveGateways} disabled={savingGateways} style={btnPrimary}>
                {savingGateways ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRO DE APP */}
      {showAppModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '10px' }}>
           <div style={{ background: '#18181b', width: '100%', maxWidth: '500px', borderRadius: '10px', border: '1px solid #27272a', padding: 'clamp(20px, 4vw, 40px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', animation: 'zoomIn 0.3s', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 30px', fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: 'rgba(252,95,22,0.1)', borderRadius: '10px' }}>
                   <Smartphone size={24} color="#FC5F16" />
                </div>
                {editAppId ? 'Editar Plano' : 'Novo Plano de Ativação'}
              </h2>

              <form onSubmit={handleSaveApp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Nome do Plano</label>
                    <input 
                      type="text" placeholder="Ex: Pacote de ativação por 1 ano" value={appFormData.name}
                      onChange={e => setAppFormData({...appFormData, name: e.target.value})}
                      style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '15px' }} 
                      required
                    />
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                       <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Preço Único (R$)</label>
                       <input 
                         type="number" step="0.01" value={appFormData.price}
                         onChange={e => setAppFormData({...appFormData, price: e.target.value})}
                         style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '15px' }} 
                         required
                       />
                    </div>
                    <div>
                       <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Duração (Dias)</label>
                       <input 
                         type="number" value={appFormData.duration_days}
                         onChange={e => setAppFormData({...appFormData, duration_days: e.target.value})}
                         style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '15px' }} 
                         required
                       />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Tempo de Teste (Horas)</label>
                    <select
                      value={appFormData.trial_hours}
                      onChange={e => setAppFormData({...appFormData, trial_hours: e.target.value})}
                      style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '15px' }}
                    >
                      <option value="1">01 Hora</option>
                      <option value="2">02 Horas</option>
                      <option value="6">06 Horas</option>
                      <option value="12">12 Horas</option>
                      <option value="24">24 Horas</option>
                    </select>
                  </div>

                 <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Descrição (Opcional)</label>
                    <textarea 
                      value={appFormData.description}
                      onChange={e => setAppFormData({...appFormData, description: e.target.value})}
                      style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '14px', minHeight: '80px', resize: 'none' }} 
                    />
                 </div>

                 <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setShowAppModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'transparent', border: '1px solid #27272a', color: '#a1a1aa', fontWeight: '800', cursor: 'pointer' }}>Cancelar</button>
                    <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#FC5F16', border: 'none', color: '#fff', fontWeight: '900', cursor: 'pointer' }}>Salvar Plano</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default FinancePlans;
