import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Settings, Activity, Trash2, Edit3, Monitor, Clock, CheckCircle, Search, Filter, Phone, User, CreditCard, ShoppingCart, Tag, Smartphone, Image } from 'lucide-react';
import axios from 'axios';

const FinancePlans = () => {
  const [plans, setPlans] = useState([]);
  const [crmLogs, setCrmLogs] = useState([]);
  const [creditPackages, setCreditPackages] = useState([]);
  const [stats, setStats] = useState({ total_revenue: 0, total_sales: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [activeTab, setActiveTab] = useState('planos'); // 'planos' | 'crm' | 'loja' | 'apps' | 'gateways'
  const [appPackages, setAppPackages] = useState([]);
  const [showAppModal, setShowAppModal] = useState(false);
  const [appFormData, setAppFormData] = useState({
    app_name: '',
    logo_url: '',
    monthly_price: '',
    yearly_price: '',
    description: '',
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
    is_active: true
  });

  const [creditFormData, setCreditFormData] = useState({
    name: '',
    credit_amount: '',
    price: '',
    promo_price: ''
  });

  const [panels, setPanels] = useState([]);
  const [dynamicPlans, setDynamicPlans] = useState([]);

  useEffect(() => {
    fetchData();
    fetchPanels();
    fetchPackages();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, statsRes, crmRes, creditRes, settingsRes, appsRes] = await Promise.all([
        axios.get('/api/finance/plans'),
        axios.get('/api/finance/revenue/stats'),
        axios.get('/api/finance/crm'),
        axios.get('/api/finance/credit-packages'),
        axios.get('/api/settings'),
        axios.get('/api/finance/app-packages')
      ]);
      setPlans(plansRes.data);
      setStats(statsRes.data);
      setCrmLogs(crmRes.data);
      setCreditPackages(creditRes.data);
      setAppPackages(appsRes.data);
      
      const s = settingsRes.data;
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
        ...formData,
        price: parseFloat(formData.price.replace(',', '.')),
        duration_days: parseInt(formData.duration_days),
        max_connections: parseInt(formData.max_connections),
        qpanel_id: formData.qpanel_id ? parseInt(formData.qpanel_id) : null,
        sigma_package: formData.sigma_package || null
      };
      
      await axios.post('/api/finance/plans', payload);
      setShowModal(false);
      setFormData({ name: '', price: '', duration_days: '30', max_connections: '1', qpanel_id: '', sigma_package: '', is_active: true });
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      alert('Erro ao salvar plano comercial.');
    }
  };

  const handleSaveCreditPackage = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/finance/credit-packages', creditFormData);
      alert("Pacote de créditos criado com sucesso!");
      setShowCreditModal(false);
      setCreditFormData({ name: '', credit_amount: '', price: '', promo_price: '' });
      fetchData();
    } catch (error) {
      alert("Erro ao salvar pacote. Verifique o console.");
      console.error(error);
    }
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

  const handleSaveApp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/finance/app-packages', appFormData);
      fetchData();
      setShowAppModal(false);
      setAppFormData({ app_name: '', logo_url: '', monthly_price: '', yearly_price: '', description: '', is_active: true });
    } catch (e) {
      alert("Erro ao salvar pacote de app.");
    }
  };

  const handleDeleteApp = async (id) => {
    if (window.confirm("Deseja realmente deletar este pacote de ativação?")) {
      try {
        await axios.delete(`/api/finance/app-packages/${id}`);
        fetchData();
      } catch (e) {
        alert("Erro ao deletar pacote de app.");
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
    if (searchTerm && !log.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterStatus && log.status !== filterStatus) return false;
    if (filterMethod && log.payment_method !== filterMethod) return false;
    return true;
  });

  // Botão Primário Laranja Oficial
  const btnPrimaryClass = "inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-black rounded-xl transition-all shadow-[0_4px_15px_rgba(252,95,22,0.3)] hover:shadow-[0_6px_20px_rgba(252,95,22,0.5)] cursor-pointer border-none";

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', color: '#f4f4f5', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER E DASHBOARD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={32} color="#FC5F16" /> Planos & Receitas
          </h1>
          <p style={{ color: '#71717a', margin: '5px 0 0', fontSize: '15px' }}>
            Gerencie os planos comerciais da TV MAXX e acompanhe o faturamento
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'planos' && (
            <button onClick={() => setShowModal(true)} className={btnPrimaryClass}>
              <Plus size={18} /> Novo Plano
            </button>
          )}
          {activeTab === 'loja' && (
            <button onClick={() => setShowCreditModal(true)} className={btnPrimaryClass}>
              <Plus size={18} /> Novo Pacote
            </button>
          )}
        </div>
      </div>

      {/* ABAS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #27272a', paddingBottom: '15px' }}>
        {[
          { id: 'planos', label: 'Planos Comerciais' },
          { id: 'crm', label: 'CRM de Vendas' },
          { id: 'loja', label: 'Loja de Créditos' },
          { id: 'gateways', label: 'Gateways de Pagamentos' },
          { id: 'apps', label: 'Ativação de Apps' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-black cursor-pointer border-none transition-all transform active:scale-95 ${activeTab === tab.id ? 'bg-brand-500/10 text-brand-500' : 'bg-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'rgba(252,95,22,0.1)', border: '1px solid rgba(252,95,22,0.3)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: '#FC5F16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(252,95,22,0.4)' }}>
            <Activity size={30} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#FC5F16', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Receita do Mês</p>
            <h2 style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: '900', color: '#fff' }}>
              {formatCurrency(stats.total_revenue)}
            </h2>
          </div>
        </div>

        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={30} color="#10b981" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Vendas Realizadas</p>
            <h2 style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: '900', color: '#fff' }}>
              {stats.total_sales}
            </h2>
          </div>
        </div>
      </div>

      {activeTab === 'planos' && (
        <>
          {/* LISTA DE PLANOS */}
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="#FC5F16" /> Planos Comerciais Ativos
          </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#71717a' }}>Carregando planos...</div>
      ) : plans.length === 0 ? (
        <div style={{ background: '#18181b', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px dashed #3f3f46' }}>
          <DollarSign size={48} color="#3f3f46" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#f4f4f5' }}>Nenhum plano cadastrado</h3>
          <p style={{ margin: 0, color: '#a1a1aa' }}>Crie o seu primeiro plano comercial para começar a vender.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor='#FC5F16'} onMouseOut={e => e.currentTarget.style.borderColor='#27272a'}>
              {!plan.is_active && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '8px', fontWeight: '800' }}>INATIVO</div>
              )}
              <h3 style={{ margin: '0 0 15px', fontSize: '20px', fontWeight: '900', color: '#fff' }}>{plan.name}</h3>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#FC5F16', marginBottom: '20px' }}>
                {formatCurrency(plan.price)}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
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
                <button className="flex-1 bg-dark-700 hover:bg-dark-600 active:scale-95 text-white py-2.5 rounded-lg font-bold border border-white/5 transition-all flex items-center justify-center gap-2">
                  <Edit3 size={16} /> Editar
                </button>
                <button onClick={() => handleDelete(plan.id)} className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all active:scale-95 flex items-center justify-center border border-red-500/20">
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#FC5F16" /> Histórico de Clientes (CRM)
            </h2>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#a1a1aa" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '10px 10px 10px 35px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              </div>
              
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none' }}>
                <option value="">Status (Todos)</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado/Reembolsado</option>
              </select>

              <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} style={{ padding: '10px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fff', outline: 'none' }}>
                <option value="">Método (Todos)</option>
                <option value="PIX">PIX</option>
                <option value="Cartão">Cartão</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cortesia">Cortesia</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#09090b', borderBottom: '1px solid #27272a' }}>
                  <th style={{ padding: '15px 20px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Cliente</th>
                  <th style={{ padding: '15px 20px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Plano</th>
                  <th style={{ padding: '15px 20px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Financeiro</th>
                  <th style={{ padding: '15px 20px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Data / Hora</th>
                  <th style={{ padding: '15px 20px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrm.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>Nenhum registro encontrado no CRM.</td>
                  </tr>
                ) : (
                  filteredCrm.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #27272a', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{log.client_name || 'Desconhecido'}</div>
                        {log.whatsapp ? (
                           <a href={`https://wa.me/${log.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#34d399', textDecoration: 'none', fontWeight: '700' }}>
                             <Phone size={12} /> {log.whatsapp}
                           </a>
                        ) : (
                           <span style={{ fontSize: '11px', color: '#71717a' }}>Sem contato</span>
                        )}
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ fontSize: '13px', color: '#e4e4e7', fontWeight: '600' }}>{log.plan_name || 'Avulso/Excluído'}</div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
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
                      <td style={{ padding: '15px 20px', color: '#a1a1aa', fontSize: '13px' }}>
                        {formatDate(log.created_at)}
                      </td>
                      <td style={{ padding: '15px 20px' }}>
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
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} color="#FC5F16" /> Configuração da Loja de Créditos
          </h2>
          <p style={{ color: '#a1a1aa', marginBottom: '30px' }}>Configure aqui os pacotes de créditos que seus revendedores poderão comprar. Quanto maior a escala, maior o desconto que você pode oferecer.</p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#71717a' }}>Carregando pacotes...</div>
          ) : creditPackages.length === 0 ? (
            <div style={{ background: '#18181b', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px dashed #3f3f46' }}>
              <CreditCard size={48} color="#3f3f46" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#f4f4f5' }}>Nenhum pacote de crédito</h3>
              <p style={{ margin: 0, color: '#a1a1aa' }}>Crie o seu primeiro pacote para a loja de revendedores.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {creditPackages.map((pkg) => {
                 const hasPromo = pkg.promo_price && pkg.promo_price > 0;
                 const activePrice = hasPromo ? pkg.promo_price : pkg.price;
                 const costPerCredit = (activePrice / pkg.credit_amount).toFixed(2);
                 return (
                  <div key={pkg.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor='#FC5F16'} onMouseOut={e => e.currentTarget.style.borderColor='#27272a'}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'rgba(252, 95, 22, 0.1)', width: '100px', height: '100px', borderRadius: '50%', filter: 'blur(30px)' }}></div>
                    
                    {hasPromo && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} /> PROMOÇÃO
                      </div>
                    )}

                    <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '900', color: '#fff' }}>{pkg.name}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: '#FC5F16' }}>
                        {formatCurrency(activePrice)}
                      </div>
                      {hasPromo && (
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#71717a', textDecoration: 'line-through' }}>
                          {formatCurrency(pkg.price)}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px', background: '#09090b', padding: '15px', borderRadius: '12px', border: '1px solid #27272a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa', fontSize: '14px', fontWeight: '700' }}>
                        <span><CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#FC5F16' }} /> Créditos</span>
                        <span style={{ color: '#fff', fontSize: '18px', fontWeight: '900' }}>{pkg.credit_amount}</span>
                      </div>
                      <div style={{ height: '1px', background: '#27272a' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa', fontSize: '13px', fontWeight: '600' }}>
                        <span>Custo Unitário</span>
                        <span style={{ color: '#34d399' }}>R$ {costPerCredit} / un</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #27272a' }}>
                      <button onClick={() => handleDeleteCreditPackage(pkg.id)} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                        <Trash2 size={16} /> Remover Pacote
                      </button>
                    </div>
                  </div>
                 )
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL NOVO PLANO */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#18181b', border: '1px solid #FC5F16', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h2 style={{ margin: '0 0 25px', fontSize: '24px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Plus size={24} color="#FC5F16" /> Criar Novo Plano
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Nome do Plano</label>
                <input required type="text" placeholder="Ex: TV Maxx Premium Mensal" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', outline: 'none', width: '100%' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Preço (R$)</label>
                  <input required type="number" step="0.01" placeholder="35.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', outline: 'none', width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Duração (Dias)</label>
                  <select required value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', outline: 'none', width: '100%' }}>
                    <option value="1">1 Dia (Teste)</option>
                    <option value="30">30 Dias (Mensal)</option>
                    <option value="90">90 Dias (Trimestral)</option>
                    <option value="180">180 Dias (Semestral)</option>
                    <option value="365">365 Dias (Anual)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Conexões (Telas)</label>
                  <input required type="number" min="1" max="10" value={formData.max_connections} onChange={e => setFormData({...formData, max_connections: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', outline: 'none', width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Painel Vinculado</label>
                  <select value={formData.qpanel_id} onChange={e => setFormData({...formData, qpanel_id: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', outline: 'none', width: '100%' }}>
                    <option value="">Qualquer Painel</option>
                    {panels.map(p => (
                      <option key={p.id} value={p.id}>{p.panel_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Pacote no Painel Sigma (Vinculação Opcional mas recomendada)</label>
                <select value={formData.sigma_package} onChange={e => setFormData({...formData, sigma_package: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', outline: 'none', width: '100%' }}>
                  <option value="">Não vincular a pacote específico</option>
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
                  ]])].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 bg-transparent border border-white/10 hover:border-white/20 active:scale-95 text-white font-black rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-2 py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black rounded-xl shadow-[0_4px_15px_rgba(252,95,22,0.3)] transition-all">Salvar Plano</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO PACOTE DE CRÉDITOS */}
      {showCreditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#111111', border: '1px solid #27272a', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard color="#FC5F16" size={28} /> Novo Pacote
            </h2>
            
            <form onSubmit={handleSaveCreditPackage}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Nome do Pacote *</label>
                  <input required type="text" placeholder="Ex: Pacote Básico 10 Créditos" value={creditFormData.name} onChange={e => setCreditFormData({...creditFormData, name: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', outline: 'none', width: '100%' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Quantidade de Créditos *</label>
                  <input required type="number" placeholder="Ex: 10" value={creditFormData.credit_amount} onChange={e => setCreditFormData({...creditFormData, credit_amount: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', outline: 'none', width: '100%' }} />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Preço Normal (R$) *</label>
                    <input required type="number" step="0.01" placeholder="Ex: 150.00" value={creditFormData.price} onChange={e => setCreditFormData({...creditFormData, price: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', outline: 'none', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#a1a1aa' }}>Preço Promo (Opcional)</label>
                    <input type="number" step="0.01" placeholder="Ex: 130.00" value={creditFormData.promo_price} onChange={e => setCreditFormData({...creditFormData, promo_price: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px dashed #FC5F16', borderRadius: '12px', color: '#FC5F16', outline: 'none', width: '100%' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowCreditModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #27272a', background: 'transparent', color: '#fff', fontWeight: '800', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: '#FC5F16', color: '#fff', fontWeight: '800', cursor: 'pointer' }}>
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
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
              Gateways de pagamentos <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 'normal' }}>1.1.0</span>
            </h2>
            <p style={{ color: '#a1a1aa', marginTop: '8px' }}>Integre sua conta bancária e receba pagamentos dos seus clientes via PIX ou Cartão.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '30px' }}>
            <button onClick={() => setShowInvoiceModal(true)} style={{ ...btnPrimary, background: '#18181b', border: '1px solid #FC5F16', color: '#FC5F16', boxShadow: 'none' }}>
              <Settings size={18} /> Configurações da fatura
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {/* Card Mercado Pago Simplificado (Estilo Print) */}
            <div style={{ 
              background: '#18181b', 
              border: mpStatus === 'active' ? '1px solid #009ee3' : '1px solid #27272a', 
              borderRadius: '16px', 
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>Gateway Oficial</h3>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mpStatus === 'active' && (
                    <div style={{ 
                      background: '#fff', 
                      color: '#009ee3', 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
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

              <div style={{ padding: '30px' }}>
                {/* Linha Principal: Access Token e Status */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Informe o Access Token de sua conta *</label>
                    <input 
                      type="text" 
                      value={mpAccessToken} 
                      onChange={e => setMpAccessToken(e.target.value)} 
                      placeholder="APP_USR-..." 
                      style={{ width: '100%', padding: '14px', background: 'transparent', border: mpStatus === 'active' ? '1px solid #009ee3' : '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Status *</label>
                    <select 
                      value={mpStatusActive}
                      onChange={e => setMpStatusActive(e.target.value)}
                      style={{ width: '100%', padding: '14px', background: 'transparent', border: mpStatus === 'active' ? '1px solid #009ee3' : '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="Ativar" style={{background: '#18181b'}}>Ativar</option>
                      <option value="Desativar" style={{background: '#18181b'}}>Desativar</option>
                    </select>
                  </div>
                </div>

                {/* Métodos de Recebimento */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', padding: '15px', background: '#09090b', borderRadius: '12px', border: mpStatus === 'active' ? '1px solid rgba(0,158,227,0.3)' : '1px solid #27272a' }}>
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
                      style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', outline: 'none' }} 
                    />
                  </details>
                </div>

                {/* Botões de Ação */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
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
                    style={{ flex: 1, height: '50px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Desconectar
                  </button>
                  <button 
                    onClick={() => validateMpToken(mpAccessToken)} 
                    disabled={mpStatus === 'validating' || !mpAccessToken} 
                    style={{ width: '100px', height: '50px', background: '#27272a', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '800', cursor: 'pointer' }}
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
              borderRadius: '16px', 
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>Pagamentos Globais</h3>
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

              <div style={{ padding: '30px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Client ID (Production) *</label>
                  <input 
                    type="text" 
                    value={paypalClientId} 
                    onChange={e => setPaypalClientId(e.target.value)} 
                    placeholder="Abc123xyz..." 
                    style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none' }} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Client Secret *</label>
                    <input 
                      type="password" 
                      value={paypalClientSecret} 
                      onChange={e => setPaypalClientSecret(e.target.value)} 
                      placeholder="••••••••••••" 
                      style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px', display: 'block' }}>Status *</label>
                    <select 
                      value={paypalStatusActive}
                      onChange={e => setPaypalStatusActive(e.target.value)}
                      style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="Ativar" style={{background: '#18181b'}}>Ativar</option>
                      <option value="Desativar" style={{background: '#18181b'}}>Desativar</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={handleSaveGateways} disabled={savingGateways} style={{ ...btnPrimary, flex: 1, height: '50px', justifyContent: 'center', background: 'transparent', border: '1px solid #003087', color: '#003087', boxShadow: 'none' }}>
                    {savingGateways ? '...' : 'Salvar'}
                  </button>
                  <button onClick={handleDisconnectPaypal} disabled={savingGateways || !paypalClientId} style={{ flex: 1, height: '50px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
                    Desconectar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'apps' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }}>
              <Smartphone size={28} color="#FC5F16" /> Catálogo de Aplicativos
            </h2>
            <button 
              onClick={() => {
                setAppFormData({ app_name: '', logo_url: '', monthly_price: '', yearly_price: '', description: '', is_active: true });
                setShowAppModal(true);
              }}
              style={{ background: '#FC5F16', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(252,95,22,0.3)' }}
            >
              <Plus size={20} /> Cadastrar Novo App
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
            {appPackages.map((app) => (
              <div key={app.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                   <div style={{ width: '70px', height: '70px', borderRadius: '18px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #3f3f46' }}>
                      {app.logo_url ? <img src={app.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Smartphone size={35} color="#3f3f46" />}
                   </div>
                   <div>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#fff' }}>{app.app_name}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#a1a1aa', fontWeight: '600' }}>Licença Vitalícia/MAC</p>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                   <div style={{ background: 'rgba(252,95,22,0.05)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(252,95,22,0.1)' }}>
                      <span style={{ fontSize: '11px', color: '#FC5F16', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mensal</span>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginTop: '4px' }}>{formatCurrency(app.monthly_price)}</div>
                   </div>
                   <div style={{ background: 'rgba(252,95,22,0.15)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(252,95,22,0.2)' }}>
                      <span style={{ fontSize: '11px', color: '#FC5F16', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Anual</span>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginTop: '4px' }}>{formatCurrency(app.yearly_price)}</div>
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                   <button onClick={() => handleDeleteApp(app.id)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer', fontWeight: '800', fontSize: '14px', transition: 'all 0.2s' }}>Excluir Plano</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL CONFIGURAÇÕES DE GATEWAY (Antigo bloco de gateways) */}
      {activeTab === 'gateways' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          {/* ... (O código anterior de gateways já está aqui, apenas confirmando a estrutura) */}
        </div>
      )}

      {/* MODAL CONFIGURAÇÕES DA FATURA */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#18181b', width: '90%', maxWidth: '700px', borderRadius: '24px', border: '1px solid #27272a', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: '900', color: '#fff' }}>Configurar Fatura e Checkout</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Nome do Negócio</label>
                <input 
                  type="text" value={invoiceName} onChange={e => setInvoiceName(e.target.value)}
                  style={{ width: '100%', padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Tema do Checkout</label>
                <div style={{ display: 'flex', gap: '15px' }}>
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
                <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '800', color: '#fff' }}>Dados pré-definidos (Opcional)</h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '20px' }}>Ative para preencher os dados fiscais automaticamente no checkout, evitando que o cliente final precise digitar CEP e CPF.</p>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Ativar dados padrão</label>
                  <select 
                    value={fiscalActive} onChange={e => setFiscalActive(e.target.value)}
                    style={{ width: '100%', padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff', outline: 'none' }}
                  >
                    <option value="no">Não</option>
                    <option value="yes">Sim</option>
                  </select>
                </div>

                {fiscalActive === 'yes' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input type="text" placeholder="Nome Completo Fictício" value={fiscalData.costumer_name} onChange={e => setFiscalData({...fiscalData, costumer_name: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }} />
                    <input type="text" placeholder="CPF Válido" value={fiscalData.document} onChange={e => setFiscalData({...fiscalData, document: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }} />
                    <input type="text" placeholder="CEP" value={fiscalData.zip_code} onChange={e => setFiscalData({...fiscalData, zip_code: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }} />
                    <input type="text" placeholder="Rua" value={fiscalData.street_name} onChange={e => setFiscalData({...fiscalData, street_name: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }} />
                    <input type="text" placeholder="Número" value={fiscalData.street_number} onChange={e => setFiscalData({...fiscalData, street_number: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }} />
                    <input type="text" placeholder="Bairro" value={fiscalData.neighborhood} onChange={e => setFiscalData({...fiscalData, neighborhood: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }} />
                    <input type="text" placeholder="Cidade" value={fiscalData.city} onChange={e => setFiscalData({...fiscalData, city: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }} />
                    <input type="text" placeholder="Estado (Ex: SP)" value={fiscalData.federal_unit} onChange={e => setFiscalData({...fiscalData, federal_unit: e.target.value})} style={{ padding: '14px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
              <button onClick={() => setShowInvoiceModal(false)} style={{ padding: '12px 24px', background: 'transparent', color: '#a1a1aa', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
           <div style={{ background: '#18181b', width: '90%', maxWidth: '500px', borderRadius: '32px', border: '1px solid #27272a', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', animation: 'zoomIn 0.3s' }}>
              <h2 style={{ margin: '0 0 30px', fontSize: '24px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(252,95,22,0.1)', borderRadius: '12px' }}>
                   <Smartphone size={24} color="#FC5F16" />
                </div>
                Configurar Aplicativo
              </h2>

              <form onSubmit={handleSaveApp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Nome do Aplicativo</label>
                    <input 
                      type="text" placeholder="Ex: MAXX PLAYER PRO" value={appFormData.app_name}
                      onChange={e => setAppFormData({...appFormData, app_name: e.target.value})}
                      style={{ width: '100%', padding: '16px', background: '#09090b', border: '1px solid #27272a', borderRadius: '16px', color: '#fff', outline: 'none', fontSize: '15px' }} 
                    />
                 </div>

                 <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>URL do Logo (Opcional)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <div style={{ width: '54px', height: '54px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {appFormData.logo_url ? <img src={appFormData.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Image size={20} color="#3f3f46" />}
                       </div>
                       <input 
                         type="text" placeholder="https://..." value={appFormData.logo_url}
                         onChange={e => setAppFormData({...appFormData, logo_url: e.target.value})}
                         style={{ flex: 1, padding: '16px', background: '#09090b', border: '1px solid #27272a', borderRadius: '16px', color: '#fff', outline: 'none', fontSize: '14px' }} 
                       />
                    </div>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                       <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Mensal (R$)</label>
                       <input 
                         type="number" step="0.01" placeholder="30.00" value={appFormData.monthly_price}
                         onChange={e => setAppFormData({...appFormData, monthly_price: e.target.value})}
                         style={{ width: '100%', padding: '16px', background: '#09090b', border: '1px solid #27272a', borderRadius: '16px', color: '#fff', outline: 'none', fontSize: '15px' }} 
                       />
                    </div>
                    <div>
                       <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Anual (R$)</label>
                       <input 
                         type="number" step="0.01" placeholder="150.00" value={appFormData.yearly_price}
                         onChange={e => setAppFormData({...appFormData, yearly_price: e.target.value})}
                         style={{ width: '100%', padding: '16px', background: '#09090b', border: '1px solid #27272a', borderRadius: '16px', color: '#fff', outline: 'none', fontSize: '15px' }} 
                       />
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setShowAppModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'transparent', border: '1px solid #27272a', color: '#a1a1aa', fontWeight: '800', cursor: 'pointer' }}>Cancelar</button>
                    <button type="submit" style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#FC5F16', border: 'none', color: '#fff', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(252,95,22,0.3)' }}>Salvar App</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default FinancePlans;
