import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, MessageCircle, Star, Tv, ShieldCheck, Crown, Smartphone, MonitorPlay, Wifi, Zap, PlayCircle, HelpCircle, ChevronDown, Check } from 'lucide-react'

// Simulando dados vindo do backend com base no :slug
const MOCK_STORE_DATA = {
  nome: 'MAXX Premium',
  whatsapp: '5511999999999',
  logo: null, // Puxaria a logo se houvesse
  tema: {
    primary: '#FC5F16', // Laranja MAXX
    bg: '#050505',
    text: '#ffffff'
  },
  planos: [
    {
      id: 'mensal',
      nome: 'MENSAL',
      preco: 'R$ 35,00',
      descricao: 'Acesso completo por 30 dias',
      features: ['Qualidade SD/HD/4K', 'Interface Fluida', 'Suporte Especializado'],
      badge: '',
      cor: 'brand'
    },
    {
      id: 'trimestral',
      nome: 'TRIMESTRAL',
      preco: 'R$ 79,90',
      descricao: '(Apenas R$ 26,60 / mês)',
      features: ['90 Dias de Conexão', 'Biblioteca Completa', 'Servidor de Alta Estabilidade'],
      badge: 'MAIS VENDIDO',
      cor: 'brand'
    },
    {
      id: 'anual',
      nome: 'ANUAL',
      preco: 'R$ 199,90',
      descricao: '(Economia Real Garantida)',
      features: ['12 Meses de Acesso', 'Prioridade no Atendimento', 'Sem Mensalidades'],
      badge: 'MELHOR CUSTO',
      cor: 'purple'
    }
  ],
  reviews: [
    { nome: 'Ricardo S.', initial: 'R', text: 'Poder usar em duas telas ao mesmo tempo foi o que me fez assinar. Minha esposa assiste na sala e eu no quarto.', stars: 5 },
    { nome: 'Fernanda M.', initial: 'F', text: 'Instalação super rápida. O suporte me atendeu no domingo e resolveu minha configuração na TV Box.', stars: 5 },
    { nome: 'Jorge P.', initial: 'J', text: 'Uso no Firestick e a imagem 4K é real. Não fica carregando toda hora. Recomendo o plano anual.', stars: 4 }
  ]
}

export default function Store() {
  const { slug } = useParams()
  const [store, setStore] = useState(null)
  const [openFaq, setOpenFaq] = useState(null) // Movido para cima do early return
  
  // Simula busca dos dados da loja baseada no Link (Slug)
  useEffect(() => {
    // Aqui usariamos um api.get(`/api/store/${slug}`)
    setStore(MOCK_STORE_DATA)
    document.title = `${MOCK_STORE_DATA.nome} - Assinatura Premium`
  }, [slug])

  if (!store) {
    return <div className="min-h-screen bg-[#050505] flex justify-center items-center text-white">Carregando loja...</div>
  }

  const handleWhatsappClick = (plano = null) => {
    let text = `Olá! Vim pelo Site e gostaria de saber mais informações.`
    if (plano) {
      text = `Olá, vim pelo seu site e tenho interesse em assinar o Plano *${plano.nome}* no valor de ${plano.preco}. Como procedemos?`
    }
    const url = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const faqData = [
    { q: 'Quanto tempo demora para liberar?', a: 'Sua liberação é imediata logo após a confirmação do pagamento! Você recebe usuário e senha no seu WhatsApp.' },
    { q: 'Funciona na minha Smart TV?', a: 'Sim! Funciona em Samsung, LG, TCL, Android TV, além de TV Box, Celulares, Computadores e Firestick.' },
    { q: 'Precisa de equipamento?', a: 'Não precisa de antenas ou aparelhos novos. Você só precisa de internet e um dispositivo compatível (TV ou Celular).' },
    { q: 'Tem fidelidade ou multa mecânica?', a: 'Nosso serviço é pré-pago, ou seja, sem fidelidade e sem boletos supresas. Cancela quando quiser.' }
  ]

  return (
    <div className="min-h-screen selection:bg-brand selection:text-white" style={{ backgroundColor: store.tema.bg, color: store.tema.text, fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <header className="w-full border-b border-white/5 py-5 flex justify-center items-center bg-[#000] sticky top-0 z-50">
        {store.logo ? (
          <img src={store.logo} alt={store.nome} className="h-12 object-contain" />
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl shadow-lg" style={{ backgroundColor: store.tema.primary, boxShadow: `0 0 15px ${store.tema.primary}60` }}>
              <Tv className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: store.tema.text }}>{store.nome}</h1>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 text-center">
        {/* Glow de fundo abstrato */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: store.tema.primary }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/80 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-300 mb-8 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-500" /> A melhor tecnologia Anti-Travamento
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter leading-[1.1]">
            O Futuro da Televisão chegou na <span style={{ color: store.tema.primary, textShadow: `0 0 30px ${store.tema.primary}60` }}>{store.nome}</span>
          </h2>
          
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Assista a canais ao vivo, filmes, séries e esportes em ultra definição 4K. Cancele as assinaturas caras e tenha tudo em um só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => window.scrollTo({top: document.getElementById('planos').offsetTop - 100, behavior: 'smooth'})} className="px-8 py-4 rounded-full font-black text-white uppercase tracking-widest transition-transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-xl w-full sm:w-auto" style={{ background: store.tema.primary }}>
              Ver Planos Disponíveis
            </button>
            <button onClick={() => handleWhatsappClick()} className="px-8 py-4 rounded-full font-bold text-zinc-300 bg-dark-800 border border-dark-600 hover:text-white hover:bg-dark-700 transition flex items-center justify-center gap-2 w-full sm:w-auto">
              <MessageCircle className="w-5 h-5 text-green-500" /> Tirar Dúvidas
            </button>
          </div>
        </div>
        
        {/* TV Mockup Abstrato Base */}
        <div className="max-w-4xl mx-auto mt-16 relative">
          <div className="aspect-[16/9] bg-dark-900 rounded-t-3xl border-t-8 border-l-8 border-r-8 border-dark-800 p-2 relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900 to-black opacity-80"></div>
             <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-white/20" />
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-dark-900 to-transparent"></div>
          </div>
          <div className="w-3/4 mx-auto h-4 bg-dark-700 rounded-b-xl"></div>
          <div className="w-[150px] mx-auto h-8 bg-dark-800 border-x-4 border-b-4 border-dark-900 clip-tv-stand flex items-center justify-center"><div className="w-2 h-2 rounded-full" style={{ background: store.tema.primary, boxShadow: `0 0 10px ${store.tema.primary}` }}></div></div>
        </div>
      </section>

      {/* DIFERENCIAIS SECTION */}
      <section className="bg-[#0a0a0a] py-20 px-4 border-t border-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-effect bg-[#111] border border-white/5 p-8 rounded-3xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${store.tema.primary}15` }}>
                <Tv className="w-7 h-7" style={{ color: store.tema.primary }} />
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-wide">Grade Completa</h3>
              <p className="text-zinc-500 font-medium">Cobertura de esportes ao vivo, canais abertos, fechados e um catálogo VOD gigante atualizado toda semana.</p>
            </div>
            
            <div className="glass-effect bg-[#111] border border-white/5 p-8 rounded-3xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${store.tema.primary}15` }}>
                <Wifi className="w-7 h-7" style={{ color: store.tema.primary }} />
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-wide">P2P Anti-Travas</h3>
              <p className="text-zinc-500 font-medium">Servidores robustos com tecnologia P2P que garante fluidez até em horários de pico e internet mais lenta.</p>
            </div>
            
            <div className="glass-effect bg-[#111] border border-white/5 p-8 rounded-3xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${store.tema.primary}15` }}>
                <Smartphone className="w-7 h-7" style={{ color: store.tema.primary }} />
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-wide">Assista Onde Quiser</h3>
              <p className="text-zinc-500 font-medium">Compatível com a sua Smart TV, TV Box, Computador ou Smartphone. O aplicativo perfeito para você.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="planos" className="max-w-6xl mx-auto px-4 py-24 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Escolha sua Assinatura</h2>
          <p className="text-zinc-400 mt-4">Sem taxas escondidas. Sem fidelidade.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {store.planos.map((plano, idx) => {
            const isDestaque = plano.cor === 'brand' && idx === 1 // Simula destaque no do meio
            return (
              <div 
                key={plano.id} 
                className={`relative rounded-3xl p-8 border bg-dark-900 flex flex-col transition-all duration-300 shadow-2xl hover:-translate-y-2
                  ${isDestaque ? 'border-2 scale-105 z-10' : 'border-zinc-800'}`}
                style={isDestaque ? { borderColor: store.tema.primary, boxShadow: `0 15px 40px -10px ${store.tema.primary}40` } : {}}
              >
                {/* Badge Destaque */}
                {plano.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-black text-white uppercase tracking-widest shadow-lg" style={{ backgroundColor: store.tema.primary }}>
                    {plano.badge}
                  </div>
                )}

                <h3 className="text-center text-xl font-bold text-zinc-300 tracking-widest">{plano.nome}</h3>
                
                <div className="text-center mt-4 mb-8">
                  <div className="text-5xl font-black text-white">{plano.preco}</div>
                  <div className="text-sm font-bold mt-3 px-3 py-1 bg-dark-800/80 rounded-lg inline-block" style={{ color: idx === 2 ? '#4cd137' : store.tema.primary }}>{plano.descricao || 'Ativação Imediata'}</div>
                </div>

                <ul className="flex-1 space-y-4 mb-8 bg-dark-800/20 p-6 rounded-2xl border border-white/5">
                  {plano.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-zinc-300 text-sm font-medium justify-start">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: store.tema.primary }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleWhatsappClick(plano)}
                  className="w-full py-4 rounded-full font-black text-white uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-xl"
                  style={isDestaque ? 
                    { background: `linear-gradient(90deg, ${store.tema.primary}, #cc4400)` } : 
                    { background: '#222', border: '1px solid #444', color: '#fff' }
                  }
                >
                  Ativar {plano.nome}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* FEEDBACK SECTION */}
      <section className="bg-dark-900 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">Feedback de Clientes</h2>
          <p className="text-zinc-500 mb-12 text-sm uppercase tracking-widest font-bold">Quem usa, assina embaixo</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {store.reviews.map((rev, i) => (
              <div key={i} className="bg-dark-800 p-8 rounded-3xl text-left border border-white/5 transition hover:-translate-y-2">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-4 h-4" fill={s < rev.stars ? store.tema.primary : 'transparent'} color={s < rev.stars ? store.tema.primary : '#333'} />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm mb-6 leading-relaxed flex-1">"{rev.text}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-dark-700">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white" style={{ background: store.tema.primary }}>
                    {rev.initial}
                  </div>
                  <span className="font-bold text-white tracking-wide">{rev.nome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-4 border-t border-white/5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ backgroundColor: store.tema.primary }}></div>
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4"><HelpCircle className="w-8 h-8 inline-block mr-2 -mt-2" style={{ color: store.tema.primary }} /> Perguntas Frequentes</h2>
            <p className="text-zinc-400">Tire suas dúvidas antes de assinar.</p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left px-6 py-5 font-bold text-white flex justify-between items-center hover:bg-dark-800 transition"
                >
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-white' : ''}`} />
                </button>
                <div className={`px-6 pb-5 text-zinc-400 text-sm leading-relaxed transition-all duration-300 ${openFaq === index ? 'block' : 'hidden'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOATING WHATSAPP BUTTON */}
      <button 
        onClick={() => handleWhatsappClick()}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#25d366] hover:bg-[#1ebd56] rounded-full flex items-center justify-center text-white shadow-[0_5px_20px_rgba(37,211,102,0.4)] transition-transform hover:scale-110 z-50"
      >
        <MessageCircle className="w-8 h-8" fill="currentColor" />
      </button>

      {/* FOOTER */}
      <footer className="bg-[#000] py-12 px-6 border-t border-zinc-900 text-center">
        <div className="flex justify-center gap-6 text-sm text-zinc-500 mb-6 font-bold">
          <a href="#" className="hover:text-white transition">Políticas de Privacidade</a>
          <a href="#" className="hover:text-white transition">Termos de Uso</a>
          <a href="#" className="hover:text-white transition">Contato</a>
        </div>
        
        <div className="max-w-3xl mx-auto text-[11px] text-zinc-600 leading-relaxed mb-6">
          Aviso Legal: O {store.nome} é um provedor de tecnologia e interface de usuário. Não hospedamos, distribuímos ou vendemos conteúdo protegido por direitos autorais. O valor cobrado refere-se exclusivamente ao suporte técnico, manutenção do servidor e licença de uso do aplicativo.
        </div>

        <p className="text-zinc-600 text-xs font-bold">© 2026 {store.nome}. Todos os direitos reservados.</p>
        <div className="mt-4 flex justify-center items-center gap-2 opacity-30">
          <ShieldCheck className="w-4 h-4" /> <span className="text-[10px] tracking-widest font-black">POWERED BY MAXX CONTROL</span>
        </div>
      </footer>

    </div>
  )
}
