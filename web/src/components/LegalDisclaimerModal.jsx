import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LegalDisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('maxx_consent');
    if (hasConsented !== 'true') {
      setIsOpen(true);
      // Previne rolagem do fundo
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('maxx_consent', 'true');
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleDisagree = () => {
    window.location.href = 'https://google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop blur (Impede clique fora) */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(252,95,22,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-600/20 to-transparent pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 p-5 md:p-10 overflow-y-auto custom-scrollbar">
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
              ATENÇÃO — O MAXX PLAYER <span className="text-red-500">NÃO VENDE NEM FORNECE</span> CONTEÚDO DE PLAYLIST!
            </h2>
          </div>

          <div className="space-y-4 text-sm md:text-base text-zinc-300 leading-relaxed">
            <p>
              O MAXX PLAYER é um aplicativo que oferece ativação/licenciamento de player disponível para diversas marcas e dispositivos, Smart TVs em geral.
            </p>
            <p>
              Ao instalar o aplicativo, você recebe 7 dias gratuitos para testar a plataforma.
            </p>
            <p className="font-bold text-white bg-white/5 p-4 rounded-lg border border-white/10">
              É importante reforçar que o funcionamento do aplicativo depende da playlists, linha ou servidor inserido pelo próprio usuário.
            </p>
            <div className="flex items-start gap-3 bg-brand-500/10 p-4 rounded-lg border border-brand-500/20">
              <span className="text-xl">📌</span>
              <p className="text-brand-50 font-medium">
                Nós não vendemos, não fornecemos e não indicamos conteúdo de playlist. Nosso serviço se limita exclusivamente à ativação do aplicativo (player).
              </p>
            </div>
            <p>
              O MAXX PLAYER repudia e não apoia qualquer tipo de violação de direitos autorais. O uso do aplicativo é de responsabilidade do usuário, que deve inserir apenas conteúdos adquiridos de forma legal.
            </p>
            
            <div className="pt-6 mt-6 border-t border-white/10">
              <p className="font-bold text-white mb-3">Ao continuar, você declara estar de acordo com:</p>
              <ul className="space-y-2 ml-2">
                <li>
                  <Link to="/terms" onClick={handleAgree} className="flex items-center gap-2 text-zinc-400 hover:text-brand-500 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" onClick={handleAgree} className="flex items-center gap-2 text-zinc-400 hover:text-brand-500 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" onClick={handleAgree} className="flex items-center gap-2 text-zinc-400 hover:text-brand-500 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 bg-[#050505] p-5 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4 justify-end">
          <button 
            onClick={handleDisagree}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-white/10 text-zinc-400 font-bold hover:bg-white/5 hover:text-white transition-colors"
          >
            Discordar
          </button>
          
          <button 
            onClick={handleAgree}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-brand-600 to-orange-500 text-white font-black hover:from-brand-500 hover:to-orange-400 shadow-[0_0_20px_rgba(252,95,22,0.4)] transition-all active:scale-95"
          >
            Concordar
          </button>
        </div>

      </div>
    </div>
  );
}
