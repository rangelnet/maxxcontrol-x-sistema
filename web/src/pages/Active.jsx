import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MonitorPlay, Users, HelpCircle, CheckCircle, Wallet, ShoppingCart, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Active() {
  const [macAddress, setMacAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Novos estados para a integração com finance-plans
  const [appPackages, setAppPackages] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Estados de Pagamento Pix (trazidos da antiga Landing)
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checkoutMethod, setCheckoutMethod] = useState('pix'); // 'pix' | 'card'
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    doc: ''
  });

  const navigate = useNavigate();

  // Buscar os planos ao carregar a página
  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/api/finance/app-packages');
        // Filtra apenas os planos ativos se houver a propriedade is_active
        const activePlans = (res.data || []).filter(p => p.is_active !== false);
        setAppPackages(activePlans);
        if (activePlans.length > 0) {
          setSelectedPlan(activePlans[0]); // Seleciona o primeiro por padrão
        }
      } catch (err) {
        console.error('Erro ao buscar planos de ativação:', err);
      }
    };
    fetchPlans();
  }, []);

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!macAddress || !selectedPlan) {
       setPaymentError('Por favor, informe o MAC e selecione um plano.');
       return;
    }
    
    setPaymentLoading(true);
    setPaymentError('');
    
    try {
      // Inicia a geração do PIX com o pacote dinâmico
      const postResponse = await api.post('/api/payments/pix', {
         package_id: selectedPlan.id,
         amount: selectedPlan.price,
         credits: 0,
         mac_address: macAddress
      });
      
      setQrCode(postResponse.data);
      setMessage('Plano selecionado com sucesso! Realize o pagamento para ativar.');

      // Inicia o polling de status
      const checkStatus = setInterval(async () => {
        try {
          const statusRes = await api.get(`/api/payments/status/${postResponse.data.id}`);
          if (statusRes.data.status === 'approved') {
            setPaymentStatus('approved');
            clearInterval(checkStatus);
          }
        } catch (err) {
          console.error('Erro ao checar status:', err);
        }
      }, 5000);

      // Limpa o polling após 10 minutos (tempo de expiração do Pix)
      setTimeout(() => clearInterval(checkStatus), 600000);
      
    } catch (err) {
      setPaymentError(err.response?.data?.error || 'Erro ao gerar pagamento PIX. Tente novamente.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCardCheckout = async (e) => {
    if (e) e.preventDefault();
    if (!macAddress || !selectedPlan) {
       setPaymentError('Por favor, informe o MAC e selecione um plano.');
       return;
    }

    setPaymentLoading(true);
    setPaymentError('');

    try {
      const response = await api.post('/api/payments/card', {
        ...cardForm,
        package_id: selectedPlan.id,
        credits: 0,
        amount: selectedPlan.price,
        mac_address: macAddress
      });

      if (response.data.status === 'approved') {
        setPaymentStatus('approved');
      } else {
        setPaymentError(`Pagamento ${response.data.status}: ${response.data.status_detail || 'Verifique os dados'}`);
      }
    } catch (err) {
      setPaymentError(err.response?.data?.error || 'Erro ao processar cartão.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const faqs = [
    {
      title: 'Quem somos?',
      icon: <Users size={32} className="text-white" />,
      text: 'Somos uma empresa especializada em oferecer uma solução perfeita experiência de streaming com nosso IPTV player, projetado para carregamento rápido e um desempenho sem erros. Nossa linda interface garante uma visualização agradável experiência e com multi-plataformas de suporte, você pode acessar seus canais favoritos em qualquer dispositivo.\n\nMas atenção: Nós fornecemos apenas o reprodutor IPTV e não o conteúdo. Aproveite! 🚀',
      expanded: true // As per Vizzion, the first one is sometimes expanded to show text
    },
    {
      title: 'Como Ativar?',
      icon: <HelpCircle size={32} className="text-white" />
    },
    {
      title: 'O que fazer depois\nde validar o DNS?',
      icon: <CheckCircle size={32} className="text-white" />
    },
    {
      title: 'Quanto custa?',
      icon: <Wallet size={32} className="text-white" />
    },
    {
      title: 'Vocês vendem o\ncontéudo do aplicativo?',
      icon: <ShoppingCart size={32} className="text-white" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Glows (MaxxControl Brand) */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(252, 95, 22, 0.15) 0%, #000 70%)' }}></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full filter blur-[150px] pointer-events-none -z-10"></div>

      {/* NAVBAR */}
      <nav className="relative z-10 w-full bg-black/30 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-[1500px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-maxx.svg" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(252,95,22,0.5)]" />
              <span className="text-xl font-black tracking-tight text-white hidden sm:block">
                MAXX<span className="text-brand-500">Control</span>
              </span>
            </Link>
            
            {/* Nav Menu */}
            <div className="hidden md:flex space-x-6 items-center">
              <Link to="/upload-playlist?tab=pricing" className="text-[14px] font-medium text-white hover:text-brand-500 transition-colors">Planos MAXX PLAYERS</Link>
              <Link to="/upload-playlist" className="text-[14px] font-medium text-white hover:text-brand-500 transition-colors">Carregar Playlist</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5">
              <ChevronLeft size={16} /> Voltar ao Site
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow w-full max-w-[1500px] mx-auto mt-4 md:mt-[20px] px-2 md:px-[40px] relative z-10">
        
        {/* Hero Section */}
        <section className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 px-4 py-8 lg:py-16">
          <div className="flex flex-col items-center md:items-start md:w-[55%] text-center md:text-left">
            <h1 className="text-white text-[32px] md:text-[44px] font-medium leading-[100%] tracking-[-1.6px] mb-8">
              Ative seu aplicativo<br className="hidden md:block"/> <span className="text-brand-500 font-black relative inline-block">MAXX PLAYERS</span> já!
            </h1>
            
            <p className="text-zinc-300 max-w-md text-[14px] leading-[24px] tracking-[0.15px] mb-8">
              Selecione o plano desejado e digite abaixo o número MAC do seu dispositivo. Você pode encontrar seu endereço MAC na página inicial do aplicativo MAXX PLAYERS no canto inferior direito da tela.
            </p>

            <form onSubmit={handleActivate} className="w-full">
              {/* Seleção Dinâmica de Planos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                 {appPackages.length > 0 ? (
                    appPackages.map(pkg => (
                      <button 
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPlan(pkg)}
                        className={`py-4 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-center gap-2 ${selectedPlan?.id === pkg.id ? 'border-brand-500 bg-brand-500/20 shadow-[0_0_20px_rgba(252,95,22,0.15)]' : 'border-white/10 hover:border-white/20 bg-[#111111]/80'}`}
                      >
                         <span className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">{pkg.name}</span>
                         <span className="text-xl font-black text-white">R$ {Number(pkg.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                         <span className="text-[10px] text-brand-500 font-bold bg-brand-500/10 px-3 py-1 rounded-full uppercase tracking-wider">{pkg.duration_days} DIAS</span>
                      </button>
                    ))
                 ) : (
                    <div className="col-span-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 text-sm flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> Carregando planos...
                    </div>
                 )}
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => { setCheckoutMethod('pix'); setPaymentError(''); }}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                    checkoutMethod === 'pix' 
                    ? 'bg-green-500/10 border-green-500/50 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                    : 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                    PIX
                </button>
                <button 
                  type="button"
                  onClick={() => { setCheckoutMethod('card'); setPaymentError(''); }}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                    checkoutMethod === 'card' 
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                    CARTÃO
                </button>
              </div>

              {checkoutMethod === 'pix' && (
                <div className="relative mt-6">
                  <input 
                    required
                    type="text" 
                    placeholder="Endereço MAC" 
                    maxLength="17" 
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value.toUpperCase())}
                    className="w-full px-5 border border-white/10 rounded-xl text-white placeholder-zinc-500 uppercase font-mono pr-[140px] focus:border-brand-500 outline-none transition-colors"
                    style={{ height: '60px', backgroundColor: 'rgba(20, 20, 20, 0.8)', lineHeight: '60px' }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <button 
                      type="submit" 
                      disabled={paymentLoading || !selectedPlan || !macAddress}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ fontSize: '17px', height: '44px' }}
                    >
                      {paymentLoading ? <Loader2 className="animate-spin" size={20} /> : 'Ativar'}
                    </button>
                  </div>
                </div>
              )}

              {paymentError && (
                 <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-bold text-sm text-center">
                    {paymentError}
                 </div>
              )}
            </form>

            {checkoutMethod === 'card' && (
              <form onSubmit={handleCardCheckout} className="w-full mt-6 space-y-4 text-left">
                 <input 
                   required
                   type="text" 
                   placeholder="Endereço MAC" 
                   maxLength="17" 
                   value={macAddress}
                   onChange={(e) => setMacAddress(e.target.value.toUpperCase())}
                   className="w-full px-5 border border-white/10 rounded-xl text-white placeholder-zinc-500 uppercase font-mono focus:border-brand-500 outline-none transition-colors"
                   style={{ height: '60px', backgroundColor: 'rgba(20, 20, 20, 0.8)', lineHeight: '60px' }}
                 />
                 <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Número do Cartão</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 transition-colors text-white"
                      value={cardForm.number}
                      onChange={e => setCardForm({...cardForm, number: e.target.value})}
                      required
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Validade</label>
                       <input 
                         type="text" 
                         placeholder="MM/AA"
                         className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 transition-colors text-white"
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
                         className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 transition-colors text-white"
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
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 transition-colors text-white uppercase"
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
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 transition-colors text-white"
                      value={cardForm.doc}
                      onChange={e => setCardForm({...cardForm, doc: e.target.value})}
                      required
                    />
                 </div>
                 
                 <button type="submit" disabled={paymentLoading || !selectedPlan || !macAddress} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 mt-4 flex items-center justify-center gap-2">
                    {paymentLoading ? <Loader2 className="animate-spin" size={20} /> : 'Finalizar Pagamento com Cartão'}
                 </button>
              </form>
            )}
          </div>

          <div className="md:w-[45%] flex justify-center w-full mt-12 md:mt-0 relative">
             {qrCode ? (
                <div className="bg-[#111] border border-brand-500/30 p-8 md:p-10 rounded-[3rem] flex flex-col items-center text-center animate-slide-up shadow-[0_0_50px_rgba(252,95,22,0.15)] w-full max-w-sm relative z-10">
                   <h3 className="text-brand-500 font-black text-xl mb-2 uppercase tracking-wider">
                      {paymentStatus === 'approved' ? 'Pagamento Aprovado!' : 'Escaneie o PIX'}
                   </h3>
                   
                   {paymentStatus === 'approved' ? (
                      <div className="py-8 flex flex-col items-center gap-4">
                         <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 animate-pulse">
                            <CheckCircle size={40} />
                         </div>
                         <p className="text-white font-bold text-lg mt-4">Seu aplicativo está ativado.</p>
                         <p className="text-zinc-500 text-sm">Reinicie o aplicativo na sua TV para validar a licença.</p>
                      </div>
                   ) : (
                      <>
                         <p className="text-zinc-400 text-xs mb-6 font-medium">A liberação da licença será automática.</p>
                         
                         <div className="p-4 bg-white rounded-2xl mb-6 shadow-xl">
                            <img src={`data:image/png;base64,${qrCode.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48 md:w-56 md:h-56" />
                         </div>

                         <div className="w-full space-y-3">
                            <button 
                              type="button"
                              onClick={() => navigator.clipboard.writeText(qrCode.qr_code)}
                              className="w-full py-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                            >
                               Copiar Código Copia e Cola
                            </button>
                            
                            <div className="flex items-center justify-center gap-2 text-brand-500 mt-4">
                               <Loader2 className="animate-spin" size={14} />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Aguardando Pagamento...</span>
                            </div>
                         </div>
                      </>
                   )}
                </div>
             ) : (
                <div className="relative w-[300px] md:w-[450px] aspect-video bg-black border-2 border-brand-500/20 rounded-2xl shadow-[0_0_50px_rgba(252,95,22,0.25)] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 group cursor-pointer hover:border-brand-500/50">
                   {/* Background Image of the actual APP */}
                   <img src="/app-login.png" alt="MAXX PLAYERS Login Screen" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                   
                   {/* Glow and Overlays */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity"></div>
                   <div className="absolute inset-0 bg-brand-500/10 mix-blend-overlay"></div>
                   
                   {/* Centered Logo */}
                   <img src="/logo-app.png" alt="MAXX PLAYERS Logo" className="relative z-10 w-24 md:w-32 drop-shadow-[0_0_25px_rgba(252,95,22,0.8)] transform group-hover:-translate-y-2 transition-transform duration-500" />
                   
                   {/* Status Indicator */}
                   <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 z-10">
                       <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(252,95,22,1)] animate-pulse"></div>
                       <span className="text-[9px] font-black text-white tracking-widest uppercase">Sistema Online</span>
                   </div>
                   
                   {/* Bottom Text */}
                   <span className="absolute bottom-4 text-white/50 font-bold tracking-widest z-10 text-xs md:text-sm uppercase group-hover:text-white transition-colors duration-500 drop-shadow-md">
                       O Melhor Reprodutor
                   </span>
                </div>
             )}
          </div>
        </section>

        {/* Banner Section */}
        <div className="relative mt-2 md:mt-8 mb-16">
          <div className="absolute inset-0 bg-[#0a0a0a]/80 border-y border-white/5" style={{ width: '100vw', left: '50%', transform: 'translateX(-50%)' }}></div>
          <div className="relative py-6 max-w-[980px] mx-auto px-4 text-center">
            <p className="text-xs md:text-sm max-w-[949px] mx-auto text-zinc-300 font-medium leading-relaxed tracking-wide">
              Não fornecemos nenhum conteúdo com este aplicativo e você deve ter uma lista de reprodução para<br className="hidden md:block"/> usá-lo. Certifique-se de ter uma lista de reprodução antes da compra
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="max-w-[980px] mx-auto px-4 pb-24">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-white">Perguntas Frequentes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-x-12">
             {faqs.map((faq, index) => (
                <div key={index} className="border border-white/10 rounded-2xl overflow-hidden cursor-pointer bg-[#141414]/50 hover:bg-[#141414] hover:border-brand-500/50 transition-all">
                  <div className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="w-[60px] md:w-[80px] h-[60px] md:h-[80px] flex items-center justify-center rounded-xl bg-white/5 flex-shrink-0">
                        {faq.icon}
                      </div>
                      <h3 className="text-white font-semibold text-lg whitespace-pre-line leading-tight">
                        {faq.title}
                      </h3>
                    </div>
                    {faq.text && faq.expanded && (
                       <div className="mt-6 text-zinc-400 text-sm leading-relaxed whitespace-pre-line border-t border-white/5 pt-4">
                          {faq.text}
                       </div>
                    )}
                  </div>
                </div>
             ))}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#050505] border-t border-white/5 py-12 relative z-10 mt-auto">
          <div className="max-w-[1500px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-6">
                 <div className="flex items-center gap-3 group cursor-pointer">
                     <img src="/logo-maxx.svg" alt="Maxx Control" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(252, 95, 22,0.3)] transition-transform group-hover:scale-110" />
                     <span className="font-black text-zinc-300 text-lg tracking-tighter">MAXX Control</span>
                 </div>
                 
                 <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-xs md:text-sm text-zinc-500 font-medium">
                     <Link to="/upload-playlist" className="hover:text-white transition">Carregar Playlist</Link>
                     <a href="#" className="hover:text-white transition">Política de Privacidade</a>
                     <a href="#" className="hover:text-white transition">Termos de Uso</a>
                     <a href="#" className="hover:text-white transition">Política de Cookies</a>
                 </div>
              </div>

              <div className="flex justify-center gap-4">
                 <img alt="Apple Pay" src="/applepay.png" className="h-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition" onError={(e) => e.target.style.display='none'} />
                 <img alt="Mastercard" src="/master.png" className="h-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition" onError={(e) => e.target.style.display='none'} />
                 <img alt="Pix" src="/pix.png" className="h-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition" onError={(e) => e.target.style.display='none'} />
              </div>

              <div className="text-zinc-600 text-xs">
                  © 2026 MAXX Control Premium. Todos os Direitos Reservados.
              </div>
          </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-110">
         <img alt="WhatsApp" className="w-7 h-7 filter brightness-0 invert" src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" />
      </a>
    </div>
  );
}
