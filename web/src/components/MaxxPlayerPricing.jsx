import React from 'react';
import { Check, ShieldCheck, Zap, Headphones, RotateCcw, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MaxxPlayerPricing() {
  const navigate = useNavigate();

  const handleActivate = () => {
    navigate('/active');
  };

  return (
    <div className="bg-[#050505] min-h-screen py-8 px-4 font-sans text-white relative overflow-hidden flex flex-col items-center">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="text-center mb-6 relative z-10">
        <h4 className="text-brand-500 font-bold tracking-[0.2em] uppercase text-sm mb-3">PLANOS</h4>
        <h2 className="text-2xl md:text-2xl font-black mb-3">
          ESCOLHA O <span className="text-brand-500">PLANO IDEAL</span> PARA VOCÊ!
        </h2>
        <p className="text-zinc-400 text-lg">
          Todos os planos incluem acesso completo a todos os conteúdos do MAXX PLAYERS.
        </p>
      </div>

      {/* Pricing Cards Container (Snap Scroll for Mobile) */}
      <div className="w-full max-w-4xl mx-auto flex overflow-x-auto snap-x snap-mandatory gap-3 pb-6 md:justify-center scrollbar-none relative z-10 px-4 md:px-0">
        
        {/* CARD 1: Anual */}
        <div className="snap-center shrink-0 w-[300px] md:w-[340px] bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-3 flex flex-col relative transition-all duration-500 hover:border-brand-500/50 hover:shadow-[0_0_30px_rgba(252,95,22,0.1)] group">
          <div className="flex flex-col items-center border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center gap-2 text-zinc-400 font-black tracking-widest text-sm mb-6">
              <RotateCcw size={18} /> 365 DIAS
            </div>
            <div className="flex items-start text-brand-500 font-black leading-none group-hover:scale-105 transition-transform">
              <span className="text-2xl mt-2 mr-1">R$</span>
              <span className="text-2xl">49</span>
              <span className="text-2xl mt-2">,90</span>
            </div>
            <p className="text-zinc-500 text-sm mt-4 font-medium uppercase tracking-wider">por ano</p>
          </div>

          <div className="flex-1 space-y-4 mb-6">
            <div className="flex items-center gap-3 text-zinc-300 text-sm"><Check size={18} className="text-brand-500 shrink-0" /> Pacote de ativação por 1 ano</div>
            <div className="flex items-center gap-3 text-zinc-300 text-sm"><Check size={18} className="text-brand-500 shrink-0" /> Todos os recursos liberados</div>
            <div className="flex items-center gap-3 text-zinc-300 text-sm"><Check size={18} className="text-brand-500 shrink-0" /> Qualidade Full HD e 4K</div>
            <div className="flex items-center gap-3 text-zinc-300 text-sm"><Check size={18} className="text-brand-500 shrink-0" /> Suporte VIP</div>
          </div>

          <button onClick={handleActivate} className="w-full py-2.5 rounded-lg border border-brand-500 text-brand-500 font-bold hover:bg-brand-500 hover:text-white transition-all flex justify-center items-center gap-2 mt-auto active:scale-95">
            ASSINAR AGORA &rarr;
          </button>
        </div>

        {/* CARD 2: Vitalício (Destacado) */}
        <div className="snap-center shrink-0 w-[300px] md:w-[340px] bg-gradient-to-b from-[#150500] to-[#0a0a0a] border-2 border-brand-500 rounded-[2rem] p-3 flex flex-col relative transition-all duration-500 shadow-[0_0_40px_rgba(252,95,22,0.15)] group transform md:-translate-y-4">
          
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white font-black text-[10px] px-6 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(252,95,22,0.5)] whitespace-nowrap">
            MAIS ESCOLHIDO
          </div>

          <div className="flex flex-col items-center border-b border-brand-500/20 pb-6 mb-6 mt-2">
            <div className="flex items-center gap-2 text-white font-black tracking-widest text-sm mb-6">
              <Zap size={18} className="text-yellow-500 fill-current" /> VIDA TODA
            </div>
            <div className="flex items-start text-brand-500 font-black leading-none group-hover:scale-105 transition-transform">
              <span className="text-2xl mt-2 mr-1">R$</span>
              <span className="text-2xl">199</span>
              <span className="text-2xl mt-2">,00</span>
            </div>
            <p className="text-brand-500/70 text-sm mt-4 font-medium uppercase tracking-wider">pagamento único</p>
          </div>

          <div className="flex-1 space-y-4 mb-6">
            <div className="flex items-center gap-3 text-white text-sm font-medium"><Check size={18} className="text-brand-500 shrink-0" /> Pacote de ativação vitalício (99999 dias)</div>
            <div className="flex items-center gap-3 text-white text-sm font-medium"><Check size={18} className="text-brand-500 shrink-0" /> Todos os recursos liberados</div>
            <div className="flex items-center gap-3 text-white text-sm font-medium"><Check size={18} className="text-brand-500 shrink-0" /> Qualidade Full HD e 4K</div>
            <div className="flex items-center gap-3 text-white text-sm font-medium"><Check size={18} className="text-brand-500 shrink-0" /> Suporte Premium Prioritário</div>
            <div className="flex items-center gap-3 text-brand-400 font-bold text-sm bg-brand-500/10 px-3 py-1.5 rounded-lg w-max mt-2"><Check size={16} className="text-brand-500 shrink-0" /> Maior Economia</div>
          </div>

          <button onClick={handleActivate} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-orange-500 text-white font-black hover:from-brand-500 hover:to-orange-400 shadow-[0_0_20px_rgba(252,95,22,0.4)] transition-all flex justify-center items-center gap-2 mt-auto active:scale-95">
            ASSINAR AGORA &rarr;
          </button>
        </div>

      </div>

      {/* Trust Badges */}
      <div className="w-full max-w-4xl mx-auto mt-6 border border-white/5 bg-white/[0.02] rounded-xl p-3 md:p-3 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3">
          <ShieldCheck size={28} className="text-brand-500" />
          <div>
            <h5 className="font-bold text-white text-xs tracking-wider uppercase mb-1">Compra Segura</h5>
            <p className="text-[10px] text-zinc-500">Seus dados protegidos</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3">
          <Zap size={28} className="text-brand-500" />
          <div>
            <h5 className="font-bold text-white text-xs tracking-wider uppercase mb-1">Ativação Imediata</h5>
            <p className="text-[10px] text-zinc-500">Após a confirmação</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3">
          <Headphones size={28} className="text-brand-500" />
          <div>
            <h5 className="font-bold text-white text-xs tracking-wider uppercase mb-1">Suporte VIP</h5>
            <p className="text-[10px] text-zinc-500">Atendimento rápido</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3">
          <Lock size={28} className="text-brand-500" />
          <div>
            <h5 className="font-bold text-white text-xs tracking-wider uppercase mb-1">Privacidade Total</h5>
            <p className="text-[10px] text-zinc-500">100% seguro</p>
          </div>
        </div>
      </div>

      {/* CTA Footer with Mascot */}
      <div className="w-full max-w-4xl mx-auto mt-4 bg-gradient-to-r from-brand-900/30 to-black border border-brand-500/20 rounded-2xl p-3 relative flex flex-col md:flex-row items-center justify-between gap-3 z-10 overflow-visible">
        
        {/* Mascot Image (overflowing out) */}
        <div className="w-48 md:w-64 -ml-4 md:-ml-12 md:absolute md:-bottom-8 md:-left-16 flex-shrink-0 z-20 hover:scale-105 transition-transform duration-500">
           <img src="/robo-maxx.png" alt="Mascote Maxx" className="w-full h-auto drop-shadow-[0_10px_20px_rgba(252,95,22,0.3)] filter brightness-110" />
        </div>

        <div className="md:ml-56 flex flex-col md:flex-row items-center justify-between w-full gap-3">
           <div className="text-center md:text-left">
             <h4 className="text-white font-bold text-lg md:text-xl">AINDA COM DÚVIDAS?</h4>
             <h3 className="text-brand-500 font-black text-2xl md:text-2xl">TESTE GRÁTIS POR 24 HORAS!</h3>
           </div>
           
           <div className="hidden md:flex flex-col gap-2">
             <div className="flex items-center gap-2 text-zinc-300 text-sm"><Check size={16} className="text-brand-500" /> Acesso completo</div>
             <div className="flex items-center gap-2 text-zinc-300 text-sm"><Check size={16} className="text-brand-500" /> Sem compromisso</div>
           </div>

           <button onClick={() => window.open('https://wa.me/5511999999999', '_blank')} className="bg-gradient-to-b from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 active:scale-95 transition-all px-6 py-2.5 rounded-lg text-white font-black shadow-[0_0_20px_rgba(252,95,22,0.5)] flex items-center gap-3">
             <Zap size={20} className="fill-current text-white" />
             <div className="flex flex-col text-left">
               <span>TESTAR GRÁTIS AGORA</span>
               <span className="text-[9px] font-medium text-white/70 uppercase">SEM CARTÃO DE CRÉDITO</span>
             </div>
           </button>
        </div>
      </div>

    </div>
  );
}
