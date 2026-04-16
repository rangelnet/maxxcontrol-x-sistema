import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Play, Crown, MonitorPlay, Zap, LayoutGrid, Globe, ShieldCheck, ChevronRight, X, User, Mail, Phone, Lock } from 'lucide-react'

export default function Landing() {
  const [showClientModal, setShowClientModal] = useState(false)
  const [clientData, setClientData] = useState({ nome: '', email: '', telefone: '', senha: '' })

  const handleClientSubmit = (e) => {
    e.preventDefault()
    // Número do WhatsApp oficial (Exemplo, o cliente editaria ou puxaria do back)
    const numeroWhats = '5511999999999' 
    const textoWhats = `*NOVO CADASTRO DE CLIENTE*\n\n*Nome:* ${clientData.nome}\n*E-mail:* ${clientData.email}\n*Telefone:* ${clientData.telefone}\n*Senha Solicitada:* ${clientData.senha}\n\nOlá, gostaria de finalizar meu cadastro e liberação de acesso.`
    
    window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(textoWhats)}`, '_blank')
    setShowClientModal(false)
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-brand-500 selection:text-white">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #111 0%, #000 100%)' }}></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/20 rounded-full filter blur-[150px] opacity-30 pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-black/90 backdrop-blur-xl border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <img src="/logo-maxx.svg" alt="Maxx Control" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,165,0,0.5)] transition-transform group-hover:scale-110" />
            <span className="text-xl font-black tracking-tight text-white group-hover:text-brand-500 transition">MAXX<span className="text-brand-500">Control</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
            <a href="#solucoes" className="hover:text-white transition">Soluções</a>
            <a href="#precos" className="hover:text-white transition">Preços</a>
            <a href="#apps" className="hover:text-white transition">Dispositivos</a>
          </div>
          <button onClick={() => setShowClientModal(true)} className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all shadow-[0_0_15px_rgba(255,165,0,0.4)] hover:scale-105">
            Área do Cliente
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-28">
        {/* HERO SECTION */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 pt-10 pb-20 relative">
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600/20 rounded-full blur-[80px] animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-brand-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-yellow-500 mb-8 backdrop-blur-md animate-fade-in">
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

            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                Transmita sem esforço com o MAXX Control. A combinação perfeita entre um servidor IPTV de altíssima performance estruturado em ARMv8 e o Gerador de Banners Inteligente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center relative z-20">
                <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-brand-600 to-orange-600 hover:from-brand-500 hover:to-orange-500 text-white rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(255,165,0,0.4)] transition transform hover:-translate-y-1 flex items-center justify-center gap-3 relative overflow-hidden group">
                    <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <Play size={20} className="fill-current text-yellow-300" /> ACESSAR SISTEMA
                </Link>
                <a href="#apps" className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-lg transition backdrop-blur-md flex items-center justify-center gap-2">
                    <MonitorPlay size={20} className="text-brand-400" /> Visualizar Apps
                </a>
            </div>

            {/* MOCKUP HERO */}
            <div className="mt-24 relative max-w-6xl mx-auto w-full group perspective-1000">
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

        {/* PROVA SOCIAL / STATS SECTION */}
        <section className="py-12 border-y border-white/5 bg-[#050505] relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-full bg-grid-pattern opacity-10 pointer-events-none"></div>
             <div className="container mx-auto px-4 max-w-6xl relative z-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                      <div>
                          <div className="text-4xl md:text-5xl font-black text-white mb-2">99<span className="text-brand-500">%</span></div>
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Uptime Garantido</div>
                      </div>
                      <div>
                          <div className="text-4xl md:text-5xl font-black text-white mb-2">+15<span className="text-orange-500">k</span></div>
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Banners Gerados/Mês</div>
                      </div>
                      <div>
                          <div className="text-4xl md:text-5xl font-black text-white mb-2">+2<span className="text-yellow-500">M</span></div>
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Conexões Ativas</div>
                      </div>
                      <div>
                          <div className="text-4xl md:text-5xl font-black text-white mb-2">24<span className="text-brand-400">/7</span></div>
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Suporte Técnico VIP</div>
                      </div>
                  </div>
             </div>
        </section>

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
                    <div className="bg-[#1a1a1a] border border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[240px] relative transform scale-105 shadow-[0_0_30px_rgba(255,165,0,0.15)] z-10">
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
                            <MonitorPlay className="text-yellow-500" size={28} />
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
                            
                            <div className="grid grid-cols-3 gap-4">
                                {/* CARD JOGADOR 1 */}
                                <div className="group relative aspect-[3/4] rounded-2xl border-2 border-brand-500 overflow-hidden bg-gradient-to-t from-dark-900 to-transparent cursor-pointer">
                                    <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay"></div>
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-3 flex flex-col items-center justify-end h-full z-10 transition-transform duration-300 group-hover:scale-110">
                                        <div className="w-12 h-12 bg-white/10 rounded-full border border-white/20 mb-2 flex items-center justify-center overflow-hidden">
                                            <span className="text-[10px] font-bold text-zinc-400">CR7</span>
                                        </div>
                                        <p className="text-xs font-black text-white drop-shadow-md text-center">Cristiano R.</p>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-brand-500 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md z-20">1</div>
                                </div>
                                {/* CARD JOGADOR 2 */}
                                <div className="group relative aspect-[3/4] rounded-2xl border border-white/10 hover:border-white/30 overflow-hidden bg-gradient-to-t from-dark-900 to-transparent cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-3 flex flex-col items-center justify-end h-full z-10 transition-transform duration-300 group-hover:scale-110 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100">
                                        <div className="w-12 h-12 bg-white/10 rounded-full border border-white/20 mb-2 flex items-center justify-center overflow-hidden">
                                            <span className="text-[10px] font-bold text-zinc-400">NEY</span>
                                        </div>
                                        <p className="text-xs font-black text-zinc-300 drop-shadow-md text-center">Neymar Jr.</p>
                                    </div>
                                </div>
                                {/* CARD JOGADOR 3 */}
                                <div className="group relative aspect-[3/4] rounded-2xl border border-white/10 hover:border-white/30 overflow-hidden bg-gradient-to-t from-dark-900 to-transparent cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-3 flex flex-col items-center justify-end h-full z-10 transition-transform duration-300 group-hover:scale-110 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100">
                                        <div className="w-12 h-12 bg-white/10 rounded-full border border-white/20 mb-2 flex items-center justify-center overflow-hidden">
                                            <span className="text-[10px] font-bold text-zinc-400">MES</span>
                                        </div>
                                        <p className="text-xs font-black text-zinc-300 drop-shadow-md text-center">Lionel M.</p>
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
                    <img src="/logo-maxx.svg" alt="Maxx Control" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,165,0,0.3)] transition-transform group-hover:scale-110" />
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

              <button type="submit" className="w-full bg-gradient-to-r from-brand-600 to-orange-500 text-white font-black py-4 rounded-xl mt-6 shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
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
