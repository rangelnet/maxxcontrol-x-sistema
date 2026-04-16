import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, Edit2, Trash2, Power, PowerOff, Shield, Link2, KeyRound, ShoppingCart, History, QrCode, X, CheckCircle, MessageCircle, Zap, Loader2 } from 'lucide-react';

const Resale = () => {
  const [activeTab, setActiveTab] = useState('resellers'); // 'resellers' | 'shop'
  
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

  const [editandoRevendedor, setEditandoRevendedor] = useState(null);
  const [formData, setFormData] = useState({ 
    nome: '', email: '', telefone: '', empresa: '', 
    limite_dispositivos: 10, creditos: 0, ativo: true,
    provider_code: '', dns_url: '',
    perm_dashboard: true, perm_dispositivos: true, perm_revenda: false, perm_jogos: false, perm_banners: false,
    perm_iptv: true, perm_plugin: true, perm_arvore: false, 
    perm_api: false, perm_branding: false, perm_galeria: false, perm_whitelabel: false, perm_versoes: false, perm_config: false, perm_tickets: true
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

  const creditPackages = [
      { id: 1, credits: 10, price: 100, unitPrice: 10.00 },
      { id: 2, credits: 30, price: 240, unitPrice: 8.00 },
      { id: 3, credits: 50, price: 350, unitPrice: 7.00 },
      { id: 4, credits: 100, price: 650, unitPrice: 6.50 },
      { id: 5, credits: 500, price: 3000, unitPrice: 6.00 },
      { id: 6, credits: 1000, price: 5000, unitPrice: 5.00 },
  ];

  useEffect(() => { 
    carregarRevendedores(); 
    carregarHistorico();
  }, []);

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
      if (revendedores.length === 0) {
          setRevendedores([{
              id: 1, nome: "João Silva", empresa: "TV MAXX João", email: "joao@iptv.com", 
              dispositivos_ativos: 4, limite_dispositivos: 100, creditos: 50, ativo: true, 
              provider_code: "885522", dns_url: "http://paineldojoao:8080"
          }]);
      }
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
       alert('Integrado: Crie o endpoint no Backend para salvar.');
       setShowModal(false); resetForm();
    }
  };

  const handleEdit = (revendedor) => {
    setEditandoRevendedor(revendedor);
    setFormData({ 
      nome: revendedor.nome, email: revendedor.email, telefone: revendedor.telefone || '', 
      empresa: revendedor.empresa || '', limite_dispositivos: revendedor.limite_dispositivos,
      creditos: revendedor.creditos || 0, ativo: revendedor.ativo,
      provider_code: revendedor.provider_code || generateProviderCode(), dns_url: revendedor.dns_url || '',
      perm_dashboard: revendedor.perm_dashboard ?? true, perm_dispositivos: revendedor.perm_dispositivos ?? true, 
      perm_revenda: revendedor.perm_revenda ?? false, perm_jogos: revendedor.perm_jogos ?? false, perm_banners: revendedor.perm_banners ?? false,
      perm_iptv: revendedor.perm_iptv ?? true, perm_plugin: revendedor.perm_plugin ?? true, perm_arvore: revendedor.perm_arvore ?? false,
      perm_api: revendedor.perm_api ?? false, perm_branding: revendedor.perm_branding ?? false, perm_galeria: revendedor.perm_galeria ?? false,
      perm_whitelabel: revendedor.perm_whitelabel ?? false, perm_versoes: revendedor.perm_versoes ?? false, perm_config: revendedor.perm_config ?? false, perm_tickets: revendedor.perm_tickets ?? true
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
    setFormData({ 
       nome: '', email: '', telefone: '', empresa: '', limite_dispositivos: 10, creditos: 0, ativo: true, provider_code: '', dns_url: '',
       perm_dashboard: true, perm_dispositivos: true, perm_revenda: false, perm_jogos: false, perm_banners: false,
       perm_iptv: true, perm_plugin: true, perm_arvore: false, 
       perm_api: false, perm_branding: false, perm_galeria: false, perm_whitelabel: false, perm_versoes: false, perm_config: false, perm_tickets: true
    }); 
    setEditandoRevendedor(null); 
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
  const handleCheckout = async (pkg) => {
      setSelectedPackage(pkg);
      setShowPixModal(true);
      setPaymentLoading(true);
      setPaymentError('');
      setPaymentData(null);

      try {
        const response = await api.get(`/api/payments/pix?package_id=${pkg.id}&credits=${pkg.credits}&amount=${pkg.price}`);
        // Nota: O controller usa req.body, vou ajustar para POST real conforme o controller
        const postResponse = await api.post('/api/payments/pix', {
           package_id: pkg.id,
           credits: pkg.credits,
           amount: pkg.price
        });
        setPaymentData(postResponse.data);
      } catch(err) {
        setPaymentError(err.response?.data?.error || 'Erro ao gerar PIX. Verifique suas configurações Mercado Pago.');
      } finally {
        setPaymentLoading(false);
      }
  }

  // Polling de pagamento (a cada 5 seg)
  useEffect(() => {
    let intervalId;
    if (showPixModal && paymentData && paymentData.payment_id) {
       intervalId = setInterval(async () => {
          try {
             const res = await api.get(`/api/payments/status/${paymentData.payment_id}`);
             if (res.data.status === 'approved') {
                 setPaymentData(prev => ({...prev, status: 'approved'}));
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
        <div className="flex bg-dark-900 border border-dark-700 rounded-lg p-1">
            <button onClick={() => setActiveTab('resellers')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-md transition-all ${activeTab === 'resellers' ? 'bg-dark-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Users className="w-4 h-4" /> Revendedores
            </button>
            <button onClick={() => setActiveTab('shop')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-md transition-all ${activeTab === 'shop' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'text-zinc-500 hover:text-yellow-500/50'}`}>
                <ShoppingCart className="w-4 h-4" /> Loja de Créditos
            </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA: REVENDEDORES E DNS */}
      {/* ========================================================================= */}
      {activeTab === 'resellers' && (
      <div>
        <div className="flex justify-end mb-4">
            <button onClick={handleOpenNew} className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 border border-orange-500/50">
            <Plus className="w-5 h-5 flex-shrink-0" /> Criar Revendedor
            </button>
        </div>
        <div className="glass-effect rounded-2xl overflow-hidden border border-dark-700 shadow-xl bg-dark-800/60">
            <div className="overflow-x-auto">
                {/* ... (Resto da Tabela de Revendedores mantida intacta) ... */}
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
                                    {revendedor.nome.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{revendedor.nome}</div>
                                    <div className="text-xs text-zinc-500">{revendedor.email}</div>
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
                        <button onClick={() => handleToggleStatus(revendedor.id, revendedor.ativo)} className={`px-3 py-1 inline-flex text-xs font-bold rounded-full transition-all border ${revendedor.ativo ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                            {revendedor.ativo ? 'ATIVO' : 'BLOQUEADO'}
                        </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setTransferData({revendedor_id: revendedor.id, nome: revendedor.nome, quantidade: 5}); setShowTransferModal(true); }}
                                    className="h-8 px-3 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-dark-900 border border-yellow-500/20 flex items-center gap-1.5 transition-all text-[10px] font-black uppercase">
                                    <Plus className="w-3.5 h-3.5" /> Adicionar Créditos
                                </button>
                                <button onClick={() => handleEdit(revendedor)} className="h-8 w-8 rounded-lg bg-dark-700 text-zinc-300 hover:text-white hover:bg-orange-500/80 border border-dark-600 flex items-center justify-center transition-all"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(revendedor.id)} className="h-8 w-8 rounded-lg bg-dark-700 text-zinc-300 hover:text-white hover:bg-red-600/80 border border-dark-600 flex items-center justify-center transition-all"><Trash2 className="w-4 h-4" /></button>
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
                        {pkg.credits >= 100 && (
                            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow shadow-red-600/30 uppercase">
                                Promocional
                            </span>
                        )}

                        <h3 className="text-4xl font-black text-white mt-2 group-hover:scale-110 transition-transform origin-bottom">{pkg.credits}</h3>
                        <p className="text-xs font-bold tracking-widest text-zinc-500 mt-1 uppercase">Créditos</p>
                        
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent my-4"></div>

                        <div className="text-2xl font-bold text-white">R$ {pkg.price.toFixed(2).replace('.',',')}</div>
                        <p className="text-[10px] text-yellow-500 mt-1 mb-5">R$ {pkg.unitPrice.toFixed(2).replace('.',',')} / unidade</p>

                        <button onClick={() => handleCheckout(pkg)} className="w-full py-2.5 rounded-lg bg-dark-700 text-zinc-300 font-bold border border-dark-600 group-hover:bg-yellow-500 group-hover:text-dark-900 group-hover:border-yellow-500 transition-all shadow-lg flex items-center justify-center gap-2">
                           <ShoppingCart className="w-4 h-4" /> Comprar Agora
                        </button>
                    </div>
                ))}
            </div>
            <p className="text-xs text-zinc-500 text-center mt-6">Compras confirmadas caem no seu saldo automaticamente em até 5 segundos via PIX.</p>
        </div>

        {/* PARTE 2: HISTÓRICO DE COMPRAS (Lado Direito/Ocupa 1/3) */}
        <div className="lg:col-span-1">
            <div className="glass-effect rounded-2xl border border-dark-700 bg-dark-800/80 p-5 sticky top-24">
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-dark-700 pb-3 mb-4">
                    <History className="text-orange-500 w-5 h-5"/> Extrato de Créditos
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
      {/* MODAL 1: CRIAR/EDITAR REVENDEDOR (MANTIDA) */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-effect relative w-full max-w-2xl shadow-2xl rounded-2xl border border-dark-700 bg-dark-900/90 p-1 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-5 py-3 border-b border-dark-700 bg-dark-800/50 flex justify-between items-center rounded-t-2xl shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Shield className="w-5 h-5 text-orange-500" /> {editandoRevendedor ? 'Atualizar Revendedor & DNS' : 'Nova Franquia de Revenda'}
              </h3>
              <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="text-zinc-500 hover:text-white"><i className="fas fa-times"></i></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Nome Completo *</label><input type="text" required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" /></div>
                <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Nome da Empresa</label><input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" /></div>
                <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Email (Painel Web) *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" /></div>
                <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Telefone/WhatsApp</label><input type="text" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" /></div>
              </div>

              <div className="bg-dark-800/80 rounded-xl p-5 border border-brand-500/30 mb-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                  <h4 className="text-sm font-bold text-brand-400 mb-4 flex items-center gap-2"><Link2 className="w-4 h-4" /> Integração DNS Local</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Provider Code</label><div className="relative"><input type="text" maxLength={8} required value={formData.provider_code} onChange={(e) => setFormData({ ...formData, provider_code: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-brand-400 font-mono font-bold text-lg rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand-500" /><KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" /></div></div>
                      <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">URL DNS do Revendedor</label><input type="url" value={formData.dns_url} onChange={(e) => setFormData({ ...formData, dns_url: e.target.value })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500" /></div>
                  </div>
              </div>

              {/* MÓDULOS DE ACESSO (PERMISSÕES) - ALL ITEMS */}
              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-600 mb-5 max-h-[180px] overflow-y-auto custom-scrollbar">
                  <h4 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2 sticky top-0 bg-dark-800/90 py-1 backdrop-blur-sm z-10"><Shield className="w-4 h-4 text-zinc-400" /> Permissões de Acesso Ao Menu</h4>
                  
                  <div className="space-y-4">
                      {/* Grupo 1: Principal */}
                      <div>
                          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-dark-700 pb-1">Principal</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                             {[
                                { label: 'Dashboard', field: 'perm_dashboard', color: 'bg-orange-500' },
                                { label: 'Dispositivos', field: 'perm_dispositivos', color: 'bg-orange-500' },
                                { label: 'Revenda', field: 'perm_revenda', color: 'bg-orange-500' },
                                { label: 'Grade de Jogos', field: 'perm_jogos', color: 'bg-brand-500' },
                                { label: 'Gerador Banners', field: 'perm_banners', color: 'bg-orange-500' }
                             ].map(item => (
                                <label key={item.field} className="flex items-center justify-between bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-lg cursor-pointer hover:border-brand-500/50 transition">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate mr-2" title={item.label}>{item.label}</span>
                                    <div className="relative flex-shrink-0">
                                        <input type="checkbox" className="sr-only" checked={formData[item.field]} onChange={(e) => setFormData({...formData, [item.field]: e.target.checked})} />
                                        <div className={`block w-6 h-3.5 rounded-full transition-colors ${formData[item.field] ? item.color : 'bg-dark-600'}`}></div>
                                        <div className={`dot absolute left-0.5 top-0.5 bg-white w-2.5 h-2.5 rounded-full transition-transform ${formData[item.field] ? 'transform translate-x-2.5' : ''}`}></div>
                                    </div>
                                </label>
                             ))}
                          </div>
                      </div>

                      {/* Grupo 2: IPTV & Servidores */}
                      <div>
                          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-dark-700 pb-1">IPTV & Servidores</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                             {[
                                { label: 'Servidor IPTV', field: 'perm_iptv', color: 'bg-green-500' },
                                { label: 'Plugin Unificado', field: 'perm_plugin', color: 'bg-green-500' },
                                { label: 'Árvore IPTV', field: 'perm_arvore', color: 'bg-green-500' }
                             ].map(item => (
                                <label key={item.field} className="flex items-center justify-between bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-lg cursor-pointer hover:border-brand-500/50 transition">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate mr-2" title={item.label}>{item.label}</span>
                                    <div className="relative flex-shrink-0">
                                        <input type="checkbox" className="sr-only" checked={formData[item.field]} onChange={(e) => setFormData({...formData, [item.field]: e.target.checked})} />
                                        <div className={`block w-6 h-3.5 rounded-full transition-colors ${formData[item.field] ? item.color : 'bg-dark-600'}`}></div>
                                        <div className={`dot absolute left-0.5 top-0.5 bg-white w-2.5 h-2.5 rounded-full transition-transform ${formData[item.field] ? 'transform translate-x-2.5' : ''}`}></div>
                                    </div>
                                </label>
                             ))}
                          </div>
                      </div>

                      {/* Grupo 3: Ferramentas */}
                      <div>
                          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-dark-700 pb-1">Ferramentas & Extras</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                             {[
                                { label: 'APIs', field: 'perm_api', color: 'bg-purple-500' },
                                { label: 'Branding & Banners', field: 'perm_branding', color: 'bg-purple-500' },
                                { label: 'Minha Galeria', field: 'perm_galeria', color: 'bg-blue-500' },
                                { label: 'White Label', field: 'perm_whitelabel', color: 'bg-yellow-500' },
                                { label: 'Versões', field: 'perm_versoes', color: 'bg-zinc-500' },
                                { label: 'Configurações', field: 'perm_config', color: 'bg-red-500' },
                                { label: 'Tickets de Suporte', field: 'perm_tickets', color: 'bg-cyan-500' }
                             ].map(item => (
                                <label key={item.field} className="flex items-center justify-between bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-lg cursor-pointer hover:border-brand-500/50 transition">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate mr-2" title={item.label}>{item.label}</span>
                                    <div className="relative flex-shrink-0">
                                        <input type="checkbox" className="sr-only" checked={formData[item.field]} onChange={(e) => setFormData({...formData, [item.field]: e.target.checked})} />
                                        <div className={`block w-6 h-3.5 rounded-full transition-colors ${formData[item.field] ? item.color : 'bg-dark-600'}`}></div>
                                        <div className={`dot absolute left-0.5 top-0.5 bg-white w-2.5 h-2.5 rounded-full transition-transform ${formData[item.field] ? 'transform translate-x-2.5' : ''}`}></div>
                                    </div>
                                </label>
                             ))}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 border-t border-dark-700 pt-5">
                <div><label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Limite de Acessos *</label><input type="number" required min="1" value={formData.limite_dispositivos} onChange={(e) => setFormData({ ...formData, limite_dispositivos: parseInt(e.target.value) })} className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500" /></div>
                <div><label className="block text-xs font-bold w-full text-yellow-500 mb-1.5 uppercase"><i className="fas fa-coins"></i> Créditos Para Ativação *</label><input type="number" required min="0" value={formData.creditos} onChange={(e) => setFormData({ ...formData, creditos: parseInt(e.target.value) || 0 })} className="w-full bg-dark-900 border border-yellow-500/30 text-yellow-500 font-bold rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-500" /></div>
                <div className="flex items-center justify-end">
                  <label className="flex items-center cursor-pointer mt-5">
                    <span className="mr-3 text-sm font-bold text-white">Revendedor Ativo</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} />
                      <div className={`block w-12 h-6 rounded-full transition-colors ${formData.ativo ? 'bg-green-500' : 'bg-dark-600'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.ativo ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-dark-700 sticky bottom-0 bg-dark-900/95 py-2 backdrop-blur-sm z-10">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-5 py-2.5 bg-dark-700 text-zinc-300 font-bold rounded-lg border border-dark-600">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-orange-600 text-white font-bold rounded-lg shadow border border-orange-500/50 flex flex-center gap-2"><Shield className="w-4 h-4" /> Salvar Configurações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CHECKOUT PIX (NOVA) */}
      {/* ========================================================================= */}
      {showPixModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-effect relative w-full max-w-sm shadow-2xl rounded-2xl border border-dark-700 bg-dark-900 p-1">
            
            {/* BOTÃO FECHAR X DA MODAL */}
            <button onClick={() => { setShowPixModal(false); setPaymentData(null); }} className="absolute z-10 top-3 right-3 w-8 h-8 flex items-center justify-center bg-dark-800 text-zinc-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 rounded-full transition-all border border-dark-600">
                <X className="w-4 h-4" />
            </button>

            <div className="p-6 pb-2 text-center text-white mt-2">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Pague R$ {selectedPackage.price.toFixed(2).replace('.',',')}</h3>
                <p className="text-sm text-zinc-400 mt-1">E receba <strong className="text-yellow-500">{selectedPackage.credits} Créditos</strong> na hora!</p>
            </div>
            
            <div className="p-6 pt-4 text-center">
                
                {paymentLoading && (
                   <div className="py-10 text-zinc-500 flex flex-col items-center">
                      <i className="fas fa-circle-notch fa-spin text-3xl mb-3 text-orange-500"></i>
                      <p className="text-sm">Gerando PIX Inteligente...</p>
                   </div>
                )}

                {paymentError && (
                   <div className="py-5 px-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mb-4 text-sm font-bold">
                       {paymentError}
                   </div>
                )}

                {paymentData && paymentData.status !== 'approved' && !paymentError && !paymentLoading && (
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
      {/* MODAL 3: RECIBO PREMIUM (NOVA) */}
      {/* ========================================================================= */}
      {showReceiptModal && selectedTrx && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in zoom-in duration-200">
              <div className="w-full max-w-[320px] bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-5">
                  {/* Cabeçalho do Recibo */}
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

                  {/* Corpo do Recibo */}
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

      {/* ========================================================================= */}
      {/* MODAL 4: TRANSFERÊNCIA SEGURA (2FA) */}
      {/* ========================================================================= */}
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

      {/* FOOTER MOBILE */}
      <div className="h-16 md:h-0"></div>
    </div>
  );
};

export default Resale;
