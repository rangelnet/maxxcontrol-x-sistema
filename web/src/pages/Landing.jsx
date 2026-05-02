import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Play, Crown, Zap, LayoutGrid, Globe, ShieldCheck, ChevronRight, X, User, Mail, Phone, Lock, Layout, FileJson, Key, RefreshCw, Plus, Loader2, CreditCard, Smartphone } from 'lucide-react'
import api from '../services/api'

export default function Landing() {
  const [showClientModal, setShowClientModal] = useState(false)
  const [clientData, setClientData] = useState({ nome: '', email: '', telefone: '', senha: '' })

  // --- HUB DE SERVIÇOS STATES ---
  const [activeTab, setActiveTab] = useState('activation'); // 'activation' | 'playlists' | 'tools'
  const [deviceSession, setDeviceSession] = useState(null);
  const [deviceLoginMode, setDeviceLoginMode] = useState('mac');
  const [deviceCode, setDeviceCode] = useState('');
  const [deviceLoginForm, setDeviceLoginForm] = useState({ mac: '', key: '' });
  const [devicePlaylists, setDevicePlaylists] = useState([]);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [playlistForm, setPlaylistForm] = useState({ name: '', url: '', type: 'm3u', username: '', password: '' });
  const [dnsUrl, setDnsUrl] = useState('');
  const [migrationForm, setMigrationForm] = useState({ oldMac: '', oldKey: '', newMac: '' });
  
  const [activationForm, setActivationForm] = useState({ mac: '', appId: '', type: 'monthly' });
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [trendingPosters, setTrendingPosters] = useState([]); // TMDB Dinâmico em Tempo Real

  useEffect(() => {
    carregarApps();
    carregarPostersTMDB();
  }, []);

  const carregarPostersTMDB = async () => {
    try {
      const { data } = await api.get('/api/content/populares?tipo=movie');
      if (data && data.resultados) {
        const seen = new Set();
        const validUrls = [];
        
        for (const m of data.resultados) {
          if (m.poster_path && !seen.has(m.poster_path)) {
            seen.add(m.poster_path);
            validUrls.push(`https://image.tmdb.org/t/p/w500${m.poster_path}`);
          }
        }
        
        // Pega no máximo 20 posters válidos
        if (validUrls.length >= 10) {
          setTrendingPosters(validUrls.slice(0, 20));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar TMDB em tempo real:', err);
    }
  };

  const carregarApps = async () => {
    try {
      const response = await api.get('/api/finance/app-packages');
      setApps(response.data);
    } catch (err) {
      console.error('Erro ao carregar apps:', err);
    }
  };

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
    } catch (err) {
      alert(err.response?.data?.error || 'Acesso negado.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const carregarDevicePlaylists = async (mac) => {
    try {
      const response = await api.get(`/api/mac/playlists/${mac}`);
      setDevicePlaylists(response.data);
    } catch (err) {
      console.error('Erro ao carregar playlists:', err);
    }
  };

  const handleSavePlaylist = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/mac/playlists/save', {
        mac_address: deviceSession.mac_address,
        ...playlistForm
      });
      setShowPlaylistForm(false);
      setPlaylistForm({ name: '', url: '', type: 'm3u', username: '', password: '' });
      carregarDevicePlaylists(deviceSession.mac_address);
      alert('Playlist salva com sucesso!');
    } catch (err) {
      alert('Erro ao salvar playlist.');
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm('Excluir esta lista?')) return;
    try {
      await api.delete(`/api/mac/playlists/${id}`);
      carregarDevicePlaylists(deviceSession.mac_address);
    } catch (err) {
      alert('Erro ao excluir playlist.');
    }
  };

  const handleMigrate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/mac/migrate-license', {
        old_mac: migrationForm.oldMac,
        old_key: migrationForm.oldKey,
        new_mac: migrationForm.newMac
      });
      alert('Licença migrada com sucesso!');
      setMigrationForm({ oldMac: '', oldKey: '', newMac: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Erro na migração.');
    }
  };

  const handleUpdateDNS = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/mac/update-dns', {
        mac_address: deviceSession.mac_address,
        dns_url: dnsUrl
      });
      alert('DNS atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar DNS.');
    }
  };

  const handleActivation = async (e) => {
    if (e) e.preventDefault();
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const postResponse = await api.post('/api/payments/pix', {
         package_id: activationForm.appId,
         mac_address: activationForm.mac,
         type: activationForm.type
      });
      setQrCode(postResponse.data);
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
      setTimeout(() => clearInterval(checkStatus), 600000);
    } catch (err) {
      setPaymentError(err.response?.data?.error || 'Erro ao gerar pagamento');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleClientSubmit = (e) => {
    e.preventDefault()
    const numeroWhats = '5511999999999' 
    const textoWhats = `*NOVO CADASTRO DE CLIENTE*\n\n*Nome:* ${clientData.nome}\n*E-mail:* ${clientData.email}\n*Telefone:* ${clientData.telefone}\n*Senha Solicitada:* ${clientData.senha}\n\nOlá, gostaria de finalizar meu cadastro e liberação de acesso.`
    window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(textoWhats)}`, '_blank')
    setShowClientModal(false)
  }

  const defaultLeft = [
      "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1R80vEVYQHOhDs.jpg",
      "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
      "https://image.tmdb.org/t/p/w500/t6HIqrHeEEINfQ4PGBkK82w8D3s.jpg",
      "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkYSBghxZOSkH3YQ.jpg",
      "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
      "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2TDHwX7q7.jpg",
  ];
  const leftPosters = trendingPosters.length >= 10 ? trendingPosters.slice(0, Math.floor(trendingPosters.length / 2)) : defaultLeft;
  const rightPosters = trendingPosters.length >= 10 ? trendingPosters.slice(Math.floor(trendingPosters.length / 2)) : [...defaultLeft].reverse();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-brand-500/30">
      <style>
        {`
          @keyframes marquee-y {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes marquee-y-reverse {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
          }
          .animate-marquee-y {
            animation: marquee-y 40s linear infinite;
          }
          .animate-marquee-y-reverse {
            animation: marquee-y-reverse 40s linear infinite;
          }
        `}
      </style>
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #111 0%, #000 100%)' }}></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/20 rounded-full filter blur-[150px] opacity-30 pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-black/90 backdrop-blur-xl border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <img src="/logo-maxx.svg" alt="Maxx Control" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(252, 95, 22,0.5)] transition-transform group-hover:scale-110" />
            <span className="text-xl font-black tracking-tight text-white group-hover:text-brand-500 transition">MAXX<span className="text-brand-500">Control</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
            <a href="#solucoes" className="hover:text-white transition">Soluções</a>
            <a href="#precos" className="hover:text-white transition">Preços</a>
            <a href="#apps" className="hover:text-white transition">Dispositivos</a>
          </div>
          <button onClick={() => setShowClientModal(true)} className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all shadow-[0_0_15px_rgba(252, 95, 22,0.4)] hover:scale-105">
            Área do Cliente
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-28">
        {/* HERO SECTION */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 pt-10 pb-20 relative overflow-hidden">
            {/* BACKGROUND BLURS */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600/20 rounded-full blur-[80px] animate-pulse z-0"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-brand-600/20 rounded-full blur-[80px] animate-pulse z-0" style={{ animationDelay: '2s' }}></div>

            {/* BACKGROUND TMDB POSTERS - LADO ESQUERDO (MARQUEE) */}
            <div className="absolute left-0 lg:left-10 top-0 bottom-0 overflow-hidden hidden xl:flex flex-col z-0 pointer-events-none opacity-20 hover:opacity-80 blur-[2px] hover:blur-none transition-all duration-700 w-40 -rotate-6 scale-110">
                <div className="flex flex-col gap-6 w-full animate-marquee-y">
                    {[...leftPosters, ...leftPosters].map((url, i) => (
                        <div key={i} className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 aspect-[2/3] bg-black/50">
                            <img src={url} alt="TMDB" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* BACKGROUND TMDB POSTERS - LADO DIREITO (MARQUEE INVERSO) */}
            <div className="absolute right-0 lg:right-10 top-0 bottom-0 overflow-hidden hidden xl:flex flex-col z-0 pointer-events-none opacity-20 hover:opacity-80 blur-[2px] hover:blur-none transition-all duration-700 w-40 rotate-6 scale-110">
                <div className="flex flex-col gap-6 w-full animate-marquee-y-reverse">
                    {[...rightPosters, ...rightPosters].map((url, i) => (
                        <div key={i} className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 aspect-[2/3] bg-black/50">
                            <img src={url} alt="TMDB" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* CONTENT */}
            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-yellow-500 mb-8 backdrop-blur-md animate-fade-in shadow-xl">
                    <span className="relative flex h-3 w-3 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                    <Crown size={14} className="text-yellow-500" />
                    A Plataforma Secreta dos Maiores Provedores
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-tight max-w-5xl">
                    Controle Completo e Banners que <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-orange-400 to-yellow-500 text-glow">Vendem Sozinhos.</span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light backdrop-blur-sm bg-black/20 p-4 rounded-2xl">
                    Transmita sem esforço com o MAXX Control. A combinação perfeita entre um servidor IPTV de altíssima performance estruturado em ARMv8 e o Gerador de Banners Inteligente.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-brand-600 to-orange-600 hover:from-brand-500 hover:to-orange-500 text-white rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(252, 95, 22,0.4)] transition transform hover:-translate-y-1 flex items-center justify-center gap-3 relative overflow-hidden group">
                        <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Play size={20} className="fill-current text-yellow-300" /> ACESSAR SISTEMA
                    </Link>
                    <a href="#apps" className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-lg transition backdrop-blur-md flex items-center justify-center gap-2">
                        <Play size={20} className="text-brand-400" /> Visualizar Apps
                    </a>
                </div>
            </div>

            {/* MOCKUP HERO */}
            <div className="mt-24 relative max-w-6xl mx-auto w-full group perspective-1000 z-10">
                <div className="absolute -inset-1 bg-gradient-to-b from-brand-500 via-orange-500 to-transparent rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-[#050505] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] h-[300px] md:h-[600px] flex flex-col transform transition-transform duration-700 hover:rotate-x-1 hover:scale-[1.02]">
                     {/* Simulação de Browser Header */}
                     <div className="h-10 bg-[#0a0a0a] border-b border-white/5 flex items-center px-4 gap-2 w-full shrink-0">
                         <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                         <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                         <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                         <div className="mx-auto bg-white/5 px-20 py-1 rounded-full text-[10px] text-zinc-500 font-mono tracking-widest hidden md:block">https://maxxcontrol.pro</div>
                     </div>
                     <div className="flex-1 w-full bg-[url('https://geradorpremium.online/static/img/tema2apresentacao.jpg')] bg-cover bg-top opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center relative">
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                         <span className="text-white/50 font-black text-4xl md:text-6xl uppercase tracking-widest absolute mix-blend-overlay">MAXX CONTROL OS</span>
                     </div>
                </div>
            </div>
        </section>

        {/* HUB DE SERVIÇOS ESTRATÉGICOS (MIGRADO DO RESALE) */}
        <section id="hub-servicos" className="py-24 bg-black relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-500/5 blur-[150px] rounded-full pointer-events-none"></div>
             
             <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
                 <div className="text-center mb-16">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-black text-brand-500 mb-4 uppercase tracking-widest">
                        Hub de Autoatendimento
                     </div>
                     <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                        Gerencie seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-500">Dispositivo</span>
                     </h2>
                     <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        Ative seu app, gerencie suas playlists ou migre sua licença de forma autônoma e instantânea.
                     </p>
                 </div>

                 {/* TABS HUB */}
                 <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {[
                      { id: 'activation', label: 'Ativar App', icon: <Zap size={18} /> },
                      { id: 'playlists', label: 'HUB Playlists', icon: <Layout size={18} /> },
                      { id: 'tools', label: 'Ferramentas', icon: <RefreshCw size={18} /> }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 ${activeTab === tab.id ? 'bg-brand-500 border-brand-500 text-white shadow-[0_0_30px_rgba(252,95,22,0.4)] scale-105' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:text-white'}`}
                      >
                         {tab.icon} {tab.label}
                      </button>
                    ))}
                 </div>

                 <div className="bg-[#050505] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    {/* TAB: ACTIVATION */}
                    {activeTab === 'activation' && (
                       <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                          <div className="flex flex-col items-center lg:items-start lg:w-1/2 text-center lg:text-left">
                             <h1 className="text-4xl md:text-[44px] text-white font-medium tracking-tight mb-4 leading-tight">
                                Ative seu aplicativo MAXX Control já!
                             </h1>
                             <p className="text-zinc-300 max-w-md text-sm leading-relaxed mb-8">
                                Digite abaixo o número MAC do seu dispositivo. Você pode encontrar seu endereço MAC na página inicial do aplicativo MAXX Control no canto inferior direito da tela.
                             </p>

                             <form onSubmit={handleActivation} className="w-full max-w-md">
                                <div className="space-y-4 mb-6">
                                   <div className="relative">
                                      <select 
                                        value={activationForm.appId}
                                        onChange={e => setActivationForm({...activationForm, appId: e.target.value})}
                                        className="w-full px-4 rounded-xl text-white focus:outline-none h-[60px] bg-[#0D1D2D91] border border-brand-500/50 focus:border-brand-500 appearance-none font-medium"
                                      >
                                         <option value="" className="bg-black">Selecione o Aplicativo...</option>
                                         {apps.map(app => (
                                           <option key={app.id} value={app.id} className="bg-black">{app.app_name}</option>
                                         ))}
                                      </select>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                      <button 
                                        type="button"
                                        onClick={() => setActivationForm({...activationForm, type: 'monthly'})}
                                        className={`py-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${activationForm.type === 'monthly' ? 'border-brand-500 bg-brand-500/20' : 'border-white/10 hover:border-white/20 bg-[#0D1D2D91]'}`}
                                      >
                                         <span className="text-[10px] font-bold uppercase text-zinc-400">Plano Mensal</span>
                                         <span className="text-sm font-black text-white">R$ 14,90</span>
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => setActivationForm({...activationForm, type: 'yearly'})}
                                        className={`py-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${activationForm.type === 'yearly' ? 'border-brand-500 bg-brand-500/20' : 'border-white/10 hover:border-white/20 bg-[#0D1D2D91]'}`}
                                      >
                                         <span className="text-[10px] font-bold uppercase text-zinc-400">Plano Anual</span>
                                         <span className="text-sm font-black text-white">R$ 119,00</span>
                                      </button>
                                   </div>

                                   <div className="relative mt-6">
                                      <input 
                                        type="text" 
                                        required
                                        placeholder="Endereço MAC" 
                                        value={activationForm.mac}
                                        onChange={e => setActivationForm({...activationForm, mac: e.target.value.toUpperCase()})}
                                        className="w-full px-4 rounded-xl text-white placeholder-zinc-500 focus:outline-none pr-[140px] h-[60px] bg-[#0D1D2D91] border border-brand-500/50 focus:border-brand-500 font-mono text-lg"
                                        maxLength="17"
                                      />
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                          <button 
                                            type="submit"
                                            disabled={paymentLoading || !activationForm.mac || !activationForm.appId}
                                            className="bg-gradient-to-r from-orange-600 to-brand-500 hover:from-orange-500 hover:to-brand-400 text-white py-2.5 px-6 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(252,95,22,0.4)] flex items-center gap-2"
                                          >
                                            {paymentLoading ? <Loader2 className="animate-spin" size={20} /> : 'Ativar'}
                                          </button>
                                      </div>
                                   </div>
                                </div>
                                {paymentError && <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs font-bold text-center mt-2">{paymentError}</div>}
                             </form>
                          </div>

                          <div className="lg:w-1/2 flex justify-center w-full relative">
                             {qrCode ? (
                                <div className="bg-[#111] border border-brand-500/30 p-8 rounded-[2rem] flex flex-col items-center text-center animate-slide-up shadow-[0_0_50px_rgba(252,95,22,0.15)] w-full max-w-sm relative z-10">
                                   <h3 className="text-brand-500 font-black text-xl mb-2 uppercase tracking-wider">Escaneie o PIX</h3>
                                   <p className="text-zinc-400 text-xs mb-6 font-medium">A liberação da licença será automática.</p>
                                   
                                   <div className="p-4 bg-white rounded-2xl mb-6">
                                      <img src={`data:image/png;base64,${qrCode.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48" />
                                   </div>

                                   <div className="w-full space-y-3">
                                      <button 
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText(qrCode.qr_code)}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition"
                                      >
                                         Copiar Linha Digitável <CreditCard size={14} />
                                      </button>
                                      
                                      <div className="flex items-center justify-center gap-2 text-brand-500">
                                         <Loader2 className="animate-spin" size={14} />
                                         <span className="text-[10px] font-bold uppercase tracking-widest">Aguardando Pagamento...</span>
                                      </div>
                                   </div>
                                </div>
                             ) : (
                                <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
                                    <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                                    <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 rounded-full w-64 h-64 flex flex-col items-center justify-center p-8 relative z-10 shadow-2xl">
                                        <ShieldCheck size={56} className="text-brand-500 mb-4" />
                                        <h4 className="text-white font-bold text-base mb-2">100% Seguro</h4>
                                        <p className="text-zinc-500 text-[10px] text-center uppercase tracking-widest">Ativação Remota via PIX</p>
                                        <div className="flex gap-4 mt-6 opacity-30">
                                            <img src="/pix.png" alt="Pix" className="h-4 invert" />
                                        </div>
                                    </div>
                                </div>
                             )}
                          </div>
                       </div>
                    )}

                    {/* TAB: PLAYLISTS */}
                    {activeTab === 'playlists' && (
                       <div className="max-w-6xl mx-auto">
                          {!deviceSession ? (
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                   <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter leading-tight">
                                      Como deseja carregar <br /> sua <span className="text-brand-500">playlist?</span>
                                   </h3>
                                   <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                                      Acesse o HUB de gerenciamento para adicionar listas M3U ou Xtream diretamente no seu app.
                                   </p>
                                   
                                   <div className="space-y-4">
                                      <div 
                                        onClick={() => setDeviceLoginMode('mac')}
                                        className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${deviceLoginMode === 'mac' ? 'bg-brand-500/10 border-brand-500' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                      >
                                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${deviceLoginMode === 'mac' ? 'bg-brand-500 text-white' : 'bg-white/10 text-zinc-400'}`}>
                                            <Layout />
                                         </div>
                                         <div>
                                            <h4 className="font-bold text-white text-sm">Login com MAC e KEY</h4>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Acesse com os dados do dispositivo</p>
                                         </div>
                                      </div>

                                      <div 
                                        onClick={() => setDeviceLoginMode('code')}
                                        className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${deviceLoginMode === 'code' ? 'bg-brand-500/10 border-brand-500' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                      >
                                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${deviceLoginMode === 'code' ? 'bg-brand-500 text-white' : 'bg-white/10 text-zinc-400'}`}>
                                            <FileJson />
                                         </div>
                                         <div>
                                            <h4 className="font-bold text-white text-sm">Carregar com código</h4>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Use um PIN de 6 dígitos gerado na TV</p>
                                         </div>
                                      </div>
                                   </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[3rem] shadow-2xl backdrop-blur-xl">
                                   <h3 className="text-xl font-black text-white mb-8 text-center uppercase tracking-widest">
                                      {deviceLoginMode === 'mac' ? 'Acesso MAC/KEY' : 'Acesso via Código'}
                                   </h3>
                                   <form onSubmit={handleDeviceLogin} className="space-y-6">
                                      {deviceLoginMode === 'mac' ? (
                                         <>
                                            <div className="space-y-2">
                                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Endereço MAC</label>
                                               <input 
                                                 type="text" 
                                                 required
                                                 placeholder="00:11:22:AA:BB:CC"
                                                 value={deviceLoginForm.mac}
                                                 onChange={e => setDeviceLoginForm({...deviceLoginForm, mac: e.target.value.toUpperCase()})}
                                                 className="w-full bg-black border-2 border-white/10 rounded-2xl px-6 py-4 text-white focus:border-brand-500 transition-all outline-none font-mono text-xl"
                                               />
                                            </div>
                                            <div className="space-y-2">
                                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Device Key</label>
                                               <input 
                                                 type="password" 
                                                 required
                                                 placeholder="••••••••"
                                                 value={deviceLoginForm.key}
                                                 onChange={e => setDeviceLoginForm({...deviceLoginForm, key: e.target.value.toUpperCase()})}
                                                 className="w-full bg-black border-2 border-white/10 rounded-2xl px-6 py-4 text-white focus:border-brand-500 transition-all outline-none font-mono text-xl tracking-widest"
                                               />
                                            </div>
                                         </>
                                      ) : (
                                         <div className="space-y-4">
                                            <div className="space-y-2 text-center">
                                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Código PIN da TV</label>
                                               <input 
                                                 type="text" 
                                                 required
                                                 maxLength={6}
                                                 placeholder="123456"
                                                 value={deviceCode}
                                                 onChange={e => setDeviceCode(e.target.value)}
                                                 className="w-full bg-black border-2 border-white/10 rounded-3xl px-6 py-8 text-white focus:border-brand-500 transition-all outline-none font-black text-5xl text-center tracking-[1rem]"
                                               />
                                            </div>
                                            <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest font-medium">O código é gerado na tela inicial do app MAXX na TV.</p>
                                         </div>
                                      )}
                                      
                                      <button 
                                        type="submit"
                                        className="w-full py-5 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                      >
                                         {paymentLoading ? <Loader2 className="animate-spin" /> : <><Key size={18} /> Acessar HUB</>}
                                      </button>
                                   </form>
                                </div>
                             </div>
                          ) : (
                             <div className="space-y-8 animate-fade-in">
                                <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/10">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
                                         <Play />
                                      </div>
                                      <div>
                                         <h3 className="text-white font-black uppercase tracking-tighter">TV Conectada: {deviceSession.mac_address}</h3>
                                         <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Gerenciamento Remoto Ativo</p>
                                      </div>
                                   </div>
                                   <button 
                                     onClick={() => setDeviceSession(null)}
                                     className="px-6 py-2 bg-red-500/10 text-red-500 rounded-xl font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-all"
                                   >Sair</button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                   <div className="lg:col-span-2 space-y-6">
                                      <div className="flex items-center justify-between">
                                         <h3 className="text-xl font-black text-white uppercase tracking-tighter">Minhas Playlists</h3>
                                         <button 
                                           onClick={() => setShowPlaylistForm(true)}
                                           className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                                         >
                                            <Plus size={16} /> Nova Lista
                                         </button>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         {devicePlaylists.map(pl => (
                                            <div key={pl.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-brand-500/50 transition-all group">
                                               <div className="flex justify-between items-start mb-4">
                                                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${pl.type === 'm3u' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                     {pl.type}
                                                  </div>
                                                  <button onClick={() => handleDeletePlaylist(pl.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                                                     <X size={18} />
                                                  </button>
                                               </div>
                                               <h4 className="text-white font-bold mb-2">{pl.name}</h4>
                                               <p className="text-zinc-500 text-xs truncate mb-4">{pl.url || pl.username}</p>
                                               <div className="flex gap-2">
                                                  <button className="flex-1 py-2 bg-black rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all">Editar</button>
                                                  <button className="flex-1 py-2 bg-brand-500/10 rounded-xl text-[10px] font-black text-brand-500 uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all">Sincronizar</button>
                                               </div>
                                            </div>
                                         ))}
                                         {devicePlaylists.length === 0 && (
                                            <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                                               <FileJson className="mx-auto text-zinc-700 mb-4" size={48} />
                                               <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Nenhuma lista configurada.</p>
                                            </div>
                                         )}
                                      </div>
                                   </div>

                                   <div className="space-y-6">
                                      <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                                         <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-2">
                                            <Globe size={20} className="text-blue-500" /> DNS Remoto
                                         </h3>
                                         <form onSubmit={handleUpdateDNS} className="space-y-4">
                                            <div className="space-y-2">
                                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Portal DNS (URL)</label>
                                               <input 
                                                 type="text" 
                                                 placeholder="http://portal-iptv.com:80"
                                                 value={dnsUrl}
                                                 onChange={e => setDnsUrl(e.target.value)}
                                                 className="w-full bg-black border-2 border-white/5 rounded-2xl px-4 py-3 text-white text-sm focus:border-blue-500 transition-all outline-none"
                                               />
                                            </div>
                                            <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all">
                                               Atualizar DNS
                                            </button>
                                         </form>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          )}
                       </div>
                    )}

                    {/* TAB: TOOLS */}
                    {activeTab === 'tools' && (
                       <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-12 relative">
                             <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                                <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center text-brand-500 shrink-0">
                                   <RefreshCw size={40} />
                                </div>
                                <div className="text-center md:text-left">
                                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Migrar Licença MAC</h2>
                                   <p className="text-zinc-500 font-medium">Transfira sua ativação para uma TV nova de forma instantânea.</p>
                                </div>
                             </div>

                             <form onSubmit={handleMigrate} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                   <div className="p-6 bg-black rounded-3xl border border-white/5 space-y-4">
                                      <h4 className="text-zinc-500 font-black text-[10px] uppercase tracking-widest border-b border-white/5 pb-2">Origem (TV Antiga)</h4>
                                      <div className="space-y-2">
                                         <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">MAC Address Antigo</label>
                                         <input 
                                           type="text" 
                                           required
                                           placeholder="00:11:22:..."
                                           value={migrationForm.oldMac}
                                           onChange={e => setMigrationForm({...migrationForm, oldMac: e.target.value.toUpperCase()})}
                                           className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-all font-mono"
                                         />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Device Key Antiga</label>
                                         <input 
                                           type="password" 
                                           required
                                           placeholder="••••••••"
                                           value={migrationForm.oldKey}
                                           onChange={e => setMigrationForm({...migrationForm, oldKey: e.target.value.toUpperCase()})}
                                           className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-all"
                                         />
                                      </div>
                                   </div>
                                </div>

                                <div className="space-y-6">
                                   <div className="p-6 bg-brand-500/5 rounded-3xl border border-brand-500/20 space-y-4">
                                      <h4 className="text-brand-500 font-black text-[10px] uppercase tracking-widest border-b border-brand-500/10 pb-2">Destino (TV Nova)</h4>
                                      <div className="space-y-2">
                                         <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Novo MAC Address</label>
                                         <input 
                                           type="text" 
                                           required
                                           placeholder="AA:BB:CC:..."
                                           value={migrationForm.newMac}
                                           onChange={e => setMigrationForm({...migrationForm, newMac: e.target.value.toUpperCase()})}
                                           className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-all font-mono"
                                         />
                                      </div>
                                      <div className="pt-4">
                                         <button type="submit" className="w-full py-5 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-500/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                            Transferir Agora <ChevronRight size={18} />
                                         </button>
                                      </div>
                                   </div>
                                </div>
                             </form>

                             <div className="mt-12 p-6 bg-brand-500/10 border border-brand-500/20 rounded-[2rem] flex gap-4 items-center">
                                <Zap className="text-brand-500 shrink-0" size={24} />
                                <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-black tracking-wider">
                                   Atenção: A licença é removida da TV antiga no momento da migração. O novo MAC assume a ativação imediatamente.
                                </p>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
             </div>
        </section>

        {/* MODAL PLAYLIST (DENTRO DA LANDING) */}
        {showPlaylistForm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowPlaylistForm(false)}></div>
             <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-xl rounded-[3rem] p-10 md:p-12 animate-slide-up shadow-[0_0_100px_rgba(252,95,22,0.15)]">
                <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter">Configurar Playlist</h3>
                <form onSubmit={handleSavePlaylist} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome de Identificação</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Minha Lista VIP"
                        value={playlistForm.name}
                        onChange={e => setPlaylistForm({...playlistForm, name: e.target.value})}
                        className="w-full bg-black border-2 border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-500 transition-all font-bold"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button" 
                        onClick={() => setPlaylistForm({...playlistForm, type: 'm3u'})}
                        className={`py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${playlistForm.type === 'm3u' ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-white/5 text-zinc-500'}`}
                      >M3U URL</button>
                      <button 
                        type="button" 
                        onClick={() => setPlaylistForm({...playlistForm, type: 'xtream'})}
                        className={`py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${playlistForm.type === 'xtream' ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-white/5 text-zinc-500'}`}
                      >XTREAM API</button>
                   </div>

                   {playlistForm.type === 'm3u' ? (
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">URL da Lista (.m3u)</label>
                         <input 
                           type="text" 
                           required
                           placeholder="http://servidor.com:80/get.php?..."
                           value={playlistForm.url}
                           onChange={e => setPlaylistForm({...playlistForm, url: e.target.value})}
                           className="w-full bg-black border-2 border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-500 transition-all font-medium"
                         />
                      </div>
                   ) : (
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Servidor (Host:Porta)</label>
                            <input type="text" placeholder="http://host.com:80" className="w-full bg-black border-2 border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-500 transition-all font-medium" value={playlistForm.url} onChange={e => setPlaylistForm({...playlistForm, url: e.target.value})} />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Usuário</label>
                               <input type="text" placeholder="User" className="w-full bg-black border-2 border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-500 transition-all font-bold" value={playlistForm.username} onChange={e => setPlaylistForm({...playlistForm, username: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
                               <input type="password" placeholder="Pass" className="w-full bg-black border-2 border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-500 transition-all font-bold" value={playlistForm.password} onChange={e => setPlaylistForm({...playlistForm, password: e.target.value})} />
                            </div>
                         </div>
                      </div>
                   )}

                   <div className="pt-6 flex gap-4">
                      <button type="button" onClick={() => setShowPlaylistForm(false)} className="flex-1 py-5 bg-black text-zinc-500 font-black rounded-2xl uppercase tracking-widest text-xs border border-white/5 hover:border-white/10 transition-all">Cancelar</button>
                      <button type="submit" className="flex-1 py-5 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 transition-all">Salvar Playlist</button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {/* PREÇOS REVENDA - INSPIRED BY VIZZION PLAY */}
        <section id="precos" className="py-24 bg-[#0a0a0a] border-t border-white/5">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                        Pacotes para <span className="text-brand-500">Revendedor</span>
                    </h2>
                    <p className="text-zinc-500 text-lg">APLICATIVO MAIS LEVE / RÁPIDA REPRODUÇÃO DE CONTEÚDO</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Package 1 */}
                    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[220px] hover:-translate-y-2 transition-transform">
                        <span className="text-white font-bold text-xl">10 À 29</span>
                        <span className="text-brand-500 text-sm font-bold uppercase tracking-wider mb-2">Créditos</span>
                        <div className="my-4">
                            <span className="text-3xl font-black text-white">R$10.00</span>
                        </div>
                        <span className="uppercase text-zinc-500 text-xs font-bold">Cada</span>
                    </div>

                    {/* Package 2 (MAIS VENDIDO) */}
                    <div className="bg-[#1a1a1a] border border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[240px] relative transform scale-105 shadow-[0_0_30px_rgba(252, 95, 22,0.15)] z-10">
                        <div className="absolute top-0 left-0 right-0 bg-brand-500 rounded-t-xl text-white text-[10px] font-bold py-1 uppercase tracking-widest">
                            Mais Vendido
                        </div>
                        <span className="text-white font-bold text-2xl mt-4">30 À 49</span>
                        <span className="text-brand-500 text-sm font-bold uppercase tracking-wider mb-2">Créditos</span>
                        <div className="my-4">
                            <span className="text-4xl font-black text-white">R$8.00</span>
                        </div>
                        <span className="uppercase text-zinc-500 text-xs font-bold">Cada</span>
                    </div>

                    {/* Package 3 */}
                    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[220px] hover:-translate-y-2 transition-transform">
                        <span className="text-white font-bold text-xl">50 À 99</span>
                        <span className="text-brand-500 text-sm font-bold uppercase tracking-wider mb-2">Créditos</span>
                        <div className="my-4">
                            <span className="text-3xl font-black text-white">R$7.00</span>
                        </div>
                        <span className="uppercase text-zinc-500 text-xs font-bold">Cada</span>
                    </div>

                    {/* Package 4 */}
                    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[220px] hover:-translate-y-2 transition-transform">
                        <span className="text-white font-bold text-xl">100 À 499</span>
                        <span className="text-brand-500 text-sm font-bold uppercase tracking-wider mb-2">Créditos</span>
                        <div className="my-4">
                            <span className="text-3xl font-black text-white">R$6.50</span>
                        </div>
                        <span className="uppercase text-zinc-500 text-xs font-bold">Cada</span>
                    </div>

                    {/* Package 5 */}
                    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[220px] hover:-translate-y-2 transition-transform">
                        <span className="text-white font-bold text-xl">500 À 999</span>
                        <span className="text-brand-500 text-sm font-bold uppercase tracking-wider mb-2">Créditos</span>
                        <div className="my-4">
                            <span className="text-3xl font-black text-white">R$6.00</span>
                        </div>
                        <span className="uppercase text-zinc-500 text-xs font-bold">Cada</span>
                    </div>

                    {/* Package 6 */}
                    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[220px] hover:-translate-y-2 transition-transform">
                        <span className="text-white font-bold text-xl">+1.000</span>
                        <span className="text-brand-500 text-sm font-bold uppercase tracking-wider mb-2">Créditos</span>
                        <div className="my-4">
                            <span className="text-3xl font-black text-white">R$5.00</span>
                        </div>
                        <span className="uppercase text-zinc-500 text-xs font-bold">Cada</span>
                    </div>
                </div>

                <div className="flex justify-center mt-12">
                     <Link to="/login" className="bg-transparent border border-brand-500 hover:bg-brand-500/10 text-brand-400 font-bold px-8 py-3 rounded-xl transition">
                         Fazer Login e Comprar
                     </Link>
                </div>
            </div>
        </section>

        {/* TABELA PROVEDOR (MASTER) */}
        <section className="py-24 bg-black">
             <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
                <div className="flex flex-col text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-white">
                        Tabela de preços <span className="text-yellow-500">Provedor Master</span>
                    </h2>
                    <p className="mt-4 text-zinc-500 max-w-2xl mx-auto">Quanto mais vendas e conexões simultâneas ativas, mais barato e escalável fica seu negócio!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item Master */}
                    <div className="bg-[#111]/80 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase">ATÉ</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">350</span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Conexões Ativas</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="text-xs font-bold text-zinc-500 uppercase">POR</span>
                            <div className="flex items-baseline gap-2 justify-end">
                                <span className="text-3xl font-black text-white">R$1.00</span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">CADA</span>
                            </div>
                        </div>
                    </div>
                    {/* Item Master */}
                    <div className="bg-[#111]/80 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase">ATÉ</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">800</span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Conexões Ativas</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="text-xs font-bold text-zinc-500 uppercase">POR</span>
                            <div className="flex items-baseline gap-2 justify-end">
                                <span className="text-3xl font-black text-white">R$0.90</span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">CADA</span>
                            </div>
                        </div>
                    </div>
                     {/* Item Master */}
                     <div className="bg-[#111]/80 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase">ATÉ</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">1200</span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Conexões Ativas</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="text-xs font-bold text-zinc-500 uppercase">POR</span>
                            <div className="flex items-baseline gap-2 justify-end">
                                <span className="text-3xl font-black text-white">R$0.80</span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">CADA</span>
                            </div>
                        </div>
                    </div>
                     {/* Item Master */}
                     <div className="bg-[#111]/80 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase">ATÉ</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">5000</span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Conexões Ativas</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="text-xs font-bold text-zinc-500 uppercase">POR</span>
                            <div className="flex items-baseline gap-2 justify-end">
                                <span className="text-3xl font-black text-white">R$0.60</span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">CADA</span>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </section>

        {/* DIFFERENTIALS (MIXED GERADOR + VIZZION) */}
        <section id="solucoes" className="py-24 bg-[#0a0a0a] border-y border-white/5">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">A Diferença Está nos Detalhes</h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto">Streaming contínuo com desempenho incomparável em conjunto com as ferramentas de marketing e gerador de banners automatizados.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#111] p-8 rounded-3xl border border-white/5 hover:-translate-y-2 transition-transform">
                        <div className="h-14 w-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <Zap className="text-brand-500" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Transmissão Rápida Ultra HD</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Canais e filmes rodando em ARMv8 Nativo garantem a menor latência e ausência total de buffer, entregando UX de cinema.
                        </p>
                    </div>

                    <div className="bg-[#111] p-8 rounded-3xl border border-white/5 hover:-translate-y-2 transition-transform">
                        <div className="h-14 w-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <LayoutGrid className="text-purple-500" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Gerador de Banners Grátis</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Incluso em todos os painéis. Puxe a grade de jogos automaticamente e crie flyers de alta conversão para postar no WhatsApp.
                        </p>
                    </div>

                    <div className="bg-[#111] p-8 rounded-3xl border border-white/5 hover:-translate-y-2 transition-transform">
                        <div className="h-14 w-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <Play className="text-yellow-500" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Compatibilidade de Dispositivos</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Smartphones, Tablets, Android TV, Samsung e LG. Seus clientes logarão de forma transparente em qualquer sistema compatível com PWA.
                        </p>
                    </div>

                    <div className="bg-[#111] p-8 rounded-3xl border border-white/5 hover:-translate-y-2 transition-transform">
                        <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <Globe className="text-blue-500" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Multi-Idiomas & DNS Privado</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Bancos de IPs roteados e DNS Custom via backend Node.js, bloqueios das operadoras não vão incomodar o consumo final.
                        </p>
                    </div>

                    <div className="bg-[#111] p-8 rounded-3xl border border-white/5 hover:-translate-y-2 transition-transform">
                         <div className="h-14 w-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck className="text-green-500" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">2 Fatores de Segurança Integrado</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Seus tokens m3u8 ficam salvos a 7 chaves. Ativação via Google Authenticator ou via robô nativo do Telegram.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* PASSO A PASSO (VIZZION PLAY ADD) */}
        <section className="py-24 bg-black border-y border-white/5">
             <div className="container mx-auto px-4 max-w-6xl">
                 <div className="flex flex-col text-center mb-16">
                     <h2 className="text-3xl md:text-5xl font-black text-white">Como usar nosso <span className="text-brand-500">MAXX Control</span>?</h2>
                     <p className="mt-4 text-zinc-500 max-w-2xl mx-auto">Fluxo de trabalho rápido e intuitivo para ativar clientes em segundos, não em minutos.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div className="flex flex-col items-center text-center gap-4 border border-[#314969]/50 hover:border-brand-500/50 bg-[#0a0a0a] rounded-2xl p-8 transition-colors">
                         <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-500 font-black text-2xl">1</div>
                         <h3 className="text-lg font-bold text-white">Cadastre Seu Master</h3>
                         <p className="text-xs text-zinc-400">Entre na plataforma de faturamento automático e ative seus tokens com sigilo.</p>
                     </div>
                     <div className="flex flex-col items-center text-center gap-4 border border-[#314969]/50 hover:border-orange-500/50 bg-[#0a0a0a] rounded-2xl p-8 transition-colors">
                         <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500 font-black text-2xl">2</div>
                         <h3 className="text-lg font-bold text-white">Adicione DNS</h3>
                         <p className="text-xs text-zinc-400">Configure suas sub-revendas ou clientes diretos blindando suas IPs das operadoras.</p>
                     </div>
                     <div className="flex flex-col items-center text-center gap-4 border border-[#314969]/50 hover:border-yellow-500/50 bg-[#0a0a0a] rounded-2xl p-8 transition-colors">
                         <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500 font-black text-2xl">3</div>
                         <h3 className="text-lg font-bold text-white">Gere Banners</h3>
                         <p className="text-xs text-zinc-400">Use nosso gerador de PNGs automáticos para os jogos da rodada e dispare no WhatsApp.</p>
                     </div>
                     <div className="flex flex-col items-center text-center gap-4 border border-[#314969]/50 hover:border-green-500/50 bg-[#0a0a0a] rounded-2xl p-8 transition-colors">
                         <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500 font-black text-2xl">4</div>
                         <h3 className="text-lg font-bold text-white">Você Terminou!</h3>
                         <p className="text-xs text-zinc-400">Assista seus lucros escalarem enquanto as conexões assistem TV ao Vivo sem travamentos.</p>
                     </div>
                 </div>
             </div>
        </section>

        {/* ELENCO INTELIGENTE (GERADOR PREMIUM ADD) */}
        <section className="py-24 bg-[#050505] overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                    {/* Texto sobre Elenco */}
                    <div className="w-full lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-6">
                            ✨ Funcionalidade Exclusiva MAXX
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                            Elenco Inteligente: <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">O Fim das Fotos Genéricas</span>
                        </h2>
                        <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-xl">
                            Nosso robô lê o jogo IPTV que você selecionou e busca automaticamente os posters em alta definição (`.PNG` sem fundo) dos maiores craques daquela partida para compor a sua arte digital instantaneamente.
                        </p>
                        
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition hover:border-brand-500/30">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0"><CheckCircle size={18} /></div>
                                <div>
                                    <span className="text-zinc-200 font-bold block">Fotos com Fundo Transparente (HD)</span>
                                    <span className="text-xs text-zinc-500">Recortes perfeitos usando estúdio de IA Nativo.</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition hover:border-brand-500/30">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0"><CheckCircle size={18} /></div>
                                <div>
                                    <span className="text-zinc-200 font-bold block">Conexão direta com API TMDB / Soccer</span>
                                    <span className="text-xs text-zinc-500">Se é Flamengo x Palmeiras, traz Gabigol e Veiga.</span>
                                </div>
                            </li>
                        </ul>

                        <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-xl font-black hover:bg-zinc-200 transition shadow-lg gap-2">
                            ACESSAR PAINEL <ChevronRight size={18} />
                        </Link>
                    </div>

                    {/* Simulação Visual Elenco */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-600 rounded-full filter blur-[100px] opacity-20 pointer-events-none"></div>
                        <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <h4 className="font-bold text-white flex items-center gap-2">Selecione o Craque da Arte</h4>
                                <span className="text-[10px] bg-brand-500 text-white px-2 py-1 rounded font-bold uppercase tracking-wider animate-pulse">Ao Vivo</span>
                            </div>
                            
                            <div className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x hide-scrollbar scroll-smooth items-center">
                                {/* CARD JOGADOR 1 */}
                                <div className="group relative w-64 md:w-80 flex-shrink-0 aspect-[3/4] snap-center rounded-3xl border-2 border-brand-500 overflow-hidden bg-gradient-to-t from-dark-900 to-transparent cursor-pointer shadow-[0_0_30px_rgba(252,95,22,0.2)]">
                                    <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay"></div>
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-5 flex flex-col items-center justify-end h-full z-10 transition-transform duration-300 group-hover:scale-110">
                                        <div className="w-16 h-16 bg-white/10 rounded-full border border-white/20 mb-3 flex items-center justify-center overflow-hidden">
                                            <span className="text-xs font-bold text-zinc-400">CR7</span>
                                        </div>
                                        <p className="text-lg font-black text-white drop-shadow-md text-center">Cristiano R.</p>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-brand-500 text-white h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-20">1</div>
                                </div>
                                {/* CARD JOGADOR 2 */}
                                <div className="group relative w-64 md:w-80 flex-shrink-0 aspect-[3/4] snap-center rounded-3xl border border-white/10 hover:border-white/30 overflow-hidden bg-gradient-to-t from-dark-900 to-transparent cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-5 flex flex-col items-center justify-end h-full z-10 transition-transform duration-300 group-hover:scale-110 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100">
                                        <div className="w-16 h-16 bg-white/10 rounded-full border border-white/20 mb-3 flex items-center justify-center overflow-hidden">
                                            <span className="text-xs font-bold text-zinc-400">NEY</span>
                                        </div>
                                        <p className="text-lg font-black text-zinc-300 drop-shadow-md text-center">Neymar Jr.</p>
                                    </div>
                                </div>
                                {/* CARD JOGADOR 3 */}
                                <div className="group relative w-64 md:w-80 flex-shrink-0 aspect-[3/4] snap-center rounded-3xl border border-white/10 hover:border-white/30 overflow-hidden bg-gradient-to-t from-dark-900 to-transparent cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-5 flex flex-col items-center justify-end h-full z-10 transition-transform duration-300 group-hover:scale-110 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100">
                                        <div className="w-16 h-16 bg-white/10 rounded-full border border-white/20 mb-3 flex items-center justify-center overflow-hidden">
                                            <span className="text-xs font-bold text-zinc-400">MES</span>
                                        </div>
                                        <p className="text-lg font-black text-zinc-300 drop-shadow-md text-center">Lionel M.</p>
                                    </div>
                                </div>
                                {/* CARD JOGADOR 4 */}
                                <div className="group relative w-64 md:w-80 flex-shrink-0 aspect-[3/4] snap-center rounded-3xl border border-white/10 hover:border-white/30 overflow-hidden bg-gradient-to-t from-dark-900 to-transparent cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-5 flex flex-col items-center justify-end h-full z-10 transition-transform duration-300 group-hover:scale-110 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100">
                                        <div className="w-16 h-16 bg-white/10 rounded-full border border-white/20 mb-3 flex items-center justify-center overflow-hidden">
                                            <span className="text-xs font-bold text-zinc-400">VINI</span>
                                        </div>
                                        <p className="text-lg font-black text-zinc-300 drop-shadow-md text-center">Vini Jr.</p>
                                    </div>
                                </div>
                                {/* CARD JOGADOR 5 */}
                                <div className="group relative w-64 md:w-80 flex-shrink-0 aspect-[3/4] snap-center rounded-3xl border border-white/10 hover:border-white/30 overflow-hidden bg-gradient-to-t from-dark-900 to-transparent cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-5 flex flex-col items-center justify-end h-full z-10 transition-transform duration-300 group-hover:scale-110 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100">
                                        <div className="w-16 h-16 bg-white/10 rounded-full border border-white/20 mb-3 flex items-center justify-center overflow-hidden">
                                            <span className="text-xs font-bold text-zinc-400">MBA</span>
                                        </div>
                                        <p className="text-lg font-black text-zinc-300 drop-shadow-md text-center">K. Mbappe</p>
                                    </div>
                                </div>
                                {/* CARD JOGADOR 6 */}
                                <div className="group relative w-64 md:w-80 flex-shrink-0 aspect-[3/4] snap-center rounded-3xl border border-white/10 hover:border-white/30 overflow-hidden bg-gradient-to-t from-dark-900 to-transparent cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-5 flex flex-col items-center justify-end h-full z-10 transition-transform duration-300 group-hover:scale-110 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100">
                                        <div className="w-16 h-16 bg-white/10 rounded-full border border-white/20 mb-3 flex items-center justify-center overflow-hidden">
                                            <span className="text-xs font-bold text-zinc-400">HAA</span>
                                        </div>
                                        <p className="text-lg font-black text-zinc-300 drop-shadow-md text-center">E. Haaland</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* APPS DOWNLOADS */}
        <section id="apps" className="py-24 bg-black">
             <div className="container mx-auto px-4 text-center max-w-4xl">
                 <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Download MAXX Control Apps</h2>
                 <p className="text-zinc-500 mb-12">Nosso reprodutor premium unificado já está presente na loja de todos estes gigantes:</p>

                 <div className="flex flex-wrap justify-center gap-4">
                     <div className="w-32 h-14 md:w-40 md:h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-bold text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer">
                         LG Smart TV
                     </div>
                     <div className="w-32 h-14 md:w-40 md:h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-bold text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer">
                         Samsung Tizen
                     </div>
                     <div className="w-32 h-14 md:w-40 md:h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-bold text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer">
                         Android TV
                     </div>
                     <div className="w-32 h-14 md:w-40 md:h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-bold text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer">
                         ROKU TV
                     </div>
                 </div>

                 <div className="mt-16 bg-[#111] border border-brand-500/30 p-8 rounded-3xl max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between">
                     <span className="text-zinc-300 font-bold mb-4 md:mb-0">Código de Instalação Downloader (Android)</span>
                     <div className="flex gap-4 items-center">
                         <span className="text-3xl font-black text-brand-500 tracking-widest">533810</span>
                     </div>
                 </div>
             </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#050505] border-t border-white/5 py-12">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <img src="/logo-maxx.svg" alt="Maxx Control" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(252, 95, 22,0.3)] transition-transform group-hover:scale-110" />
                    <span className="font-black text-zinc-300 text-lg tracking-tighter">MAXX Control</span>
                </div>
                
                <div className="flex gap-6 text-sm text-zinc-500 font-medium">
                    <a href="#" className="hover:text-white transition">Política de Privacidade</a>
                    <a href="#" className="hover:text-white transition">Termos de Uso</a>
                </div>

                <div className="text-zinc-600 text-xs">
                    © 2026 MAXX Control Premium.
                </div>
            </div>
        </footer>

      {/* MODAL ÁREA DO CLIENTE / CADASTRO */}
      {showClientModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowClientModal(false)}></div>
          
          <div className="relative bg-[#111] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up">
            {/* Glow fundo modal */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand-500/20 rounded-full filter blur-[60px] pointer-events-none"></div>
            
            <button onClick={() => setShowClientModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">
              <X size={20} />
            </button>

            <div className="text-center mb-8 relative z-10">
              <h3 className="text-2xl font-black text-white mb-2">Novo <span className="text-brand-500">Cadastro</span></h3>
              <p className="text-zinc-400 text-sm">Preencha os dados abaixo para receber sua liberação de acesso imediato.</p>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-4 relative z-10">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User size={18} />
                </div>
                <input required type="text" placeholder="Seu Nome Completo" value={clientData.nome} onChange={(e) => setClientData({...clientData, nome: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition" />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail size={18} />
                </div>
                <input required type="email" placeholder="Seu melhor E-mail" value={clientData.email} onChange={(e) => setClientData({...clientData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition" />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Phone size={18} />
                </div>
                <input required type="text" placeholder="WhatsApp (DDD) 9.9999-9999" value={clientData.telefone} onChange={(e) => setClientData({...clientData, telefone: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition" />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={18} />
                </div>
                <input required type="text" placeholder="Crie uma Senha" value={clientData.senha} onChange={(e) => setClientData({...clientData, senha: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition" />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-brand-600 to-orange-500 text-white font-black py-4 rounded-xl mt-6 shadow-[0_0_20px_rgba(252, 95, 22,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                Concluir e Liberar Sistema <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      </main>
    </div>
  )
}
