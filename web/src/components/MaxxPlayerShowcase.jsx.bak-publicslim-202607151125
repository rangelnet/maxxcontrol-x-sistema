import React, { useState, useEffect } from 'react';
import { ArrowDown, Tv, Zap, MonitorPlay, Smartphone, Key, Globe, Radio } from 'lucide-react';
import MaxxPlayerPricing from './MaxxPlayerPricing';
import api from '../services/api';

export default function MaxxPlayerShowcase() {
  const [trendingPosters, setTrendingPosters] = useState([]);

  useEffect(() => {
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
          if (validUrls.length >= 10) setTrendingPosters(validUrls.slice(0, 20));
        }
      } catch (err) {
        console.error('Erro ao carregar TMDB:', err);
      }
    };
    carregarPostersTMDB();
  }, []);

  const defaultPosters = [
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
  
  const postersList = trendingPosters.length >= 10 ? trendingPosters : defaultPosters;
  const col1 = postersList.slice(0, Math.floor(postersList.length / 2));
  const col2 = postersList.slice(Math.floor(postersList.length / 2));
  const col3 = [...col1].reverse();
  const col4 = [...col2].reverse();
  const col5 = [...col1].sort(() => Math.random() - 0.5);
  const col6 = [...col2].sort(() => Math.random() - 0.5);
  const col7 = [...col3].sort(() => Math.random() - 0.5);
  const col8 = [...col4].sort(() => Math.random() - 0.5);
  const scrollDown = () => {
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#030303] text-white flex flex-col font-sans overflow-hidden relative">
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
          .animate-marquee-y { animation: marquee-y 40s linear infinite; }
          .animate-marquee-y-reverse { animation: marquee-y-reverse 40s linear infinite; }
        `}
      </style>
      
      {/* 1. HERO SECTION */}
      <div className="relative w-full min-h-[60vh] md:min-h-[80vh] flex flex-col items-center justify-center pt-24 pb-16 px-4">
        {/* Background Animated Posters */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-10">
           <div className="flex w-full h-full justify-center gap-2 rotate-12 scale-[2.0] transform-gpu">
              
              <div className="flex flex-col gap-2 animate-marquee-y w-24 md:w-40">
                 {[...col1, ...col1, ...col1].map((url, i) => ( <img key={`c1-${i}`} src={url} alt="Poster" className="w-full h-auto rounded-lg shadow-lg" /> ))}
              </div>
              <div className="flex flex-col gap-2 animate-marquee-y-reverse w-24 md:w-40">
                 {[...col2, ...col2, ...col2].map((url, i) => ( <img key={`c2-${i}`} src={url} alt="Poster" className="w-full h-auto rounded-lg shadow-lg" /> ))}
              </div>
              <div className="flex flex-col gap-2 animate-marquee-y w-24 md:w-40 hidden sm:flex">
                 {[...col3, ...col3, ...col3].map((url, i) => ( <img key={`c3-${i}`} src={url} alt="Poster" className="w-full h-auto rounded-lg shadow-lg" /> ))}
              </div>
              <div className="flex flex-col gap-2 animate-marquee-y-reverse w-24 md:w-40 hidden md:flex">
                 {[...col4, ...col4, ...col4].map((url, i) => ( <img key={`c4-${i}`} src={url} alt="Poster" className="w-full h-auto rounded-lg shadow-lg" /> ))}
              </div>
              <div className="flex flex-col gap-2 animate-marquee-y w-24 md:w-40 hidden lg:flex">
                 {[...col5, ...col5, ...col5].map((url, i) => ( <img key={`c5-${i}`} src={url} alt="Poster" className="w-full h-auto rounded-lg shadow-lg" /> ))}
              </div>
              <div className="flex flex-col gap-2 animate-marquee-y-reverse w-24 md:w-40 hidden lg:flex">
                 {[...col6, ...col6, ...col6].map((url, i) => ( <img key={`c6-${i}`} src={url} alt="Poster" className="w-full h-auto rounded-lg shadow-lg" /> ))}
              </div>
              <div className="flex flex-col gap-2 animate-marquee-y w-24 md:w-40 hidden xl:flex">
                 {[...col7, ...col7, ...col7].map((url, i) => ( <img key={`c7-${i}`} src={url} alt="Poster" className="w-full h-auto rounded-lg shadow-lg" /> ))}
              </div>
              <div className="flex flex-col gap-2 animate-marquee-y-reverse w-24 md:w-40 hidden xl:flex">
                 {[...col8, ...col8, ...col8].map((url, i) => ( <img key={`c8-${i}`} src={url} alt="Poster" className="w-full h-auto rounded-lg shadow-lg" /> ))}
              </div>
           </div>

          <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/40 via-[#030303]/80 to-[#030303]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-[#030303]"></div>
          {/* Brand Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-600/30 rounded-full blur-[150px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 mt-8">
          
          {/* LEFT COLUMN: Text and Brands */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-500 font-bold tracking-widest text-xs uppercase mb-2 animate-fade-in-up animation-delay-100">
              <Zap size={16} className="fill-current" /> A Revolução do Entretenimento
            </div>
            
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-none animate-fade-in-up animation-delay-200">
              A SUA TV <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-600">NUNCA MAIS SERÁ A MESMA</span>
            </h1>
            
            <p className="text-sm md:text-base text-zinc-400 font-light max-w-xl mt-6 animate-fade-in-up animation-delay-300">
              O aplicativo definitivo para assistir Filmes, Séries e TV Ao Vivo. Leve, sem travamentos e com a organização que você sempre sonhou.
            </p>
            
            {/* TV Brands / Devices */}
            <div className="pt-6 animate-fade-in-up animation-delay-400 w-full">
              <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mb-4 text-center lg:text-left">Compatível com os melhores dispositivos</p>
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 opacity-60">
                <div className="flex items-center gap-2 font-bold text-lg"><MonitorPlay size={20}/> Samsung</div>
                <div className="flex items-center gap-2 font-bold text-lg"><Tv size={20}/> LG Smart</div>
                <div className="flex items-center gap-2 font-bold text-lg"><Radio size={20}/> Android TV</div>
                <div className="flex items-center gap-2 font-bold text-lg"><MonitorPlay size={20}/> Roku TV</div>
                <div className="flex items-center gap-2 font-bold text-lg"><Tv size={20}/> Fire TV</div>
              </div>
            </div>

            <button onClick={scrollDown} className="mt-8 bg-white text-black hover:bg-brand-500 hover:text-white px-8 py-4 rounded-full font-black tracking-widest text-sm uppercase transition-all flex items-center gap-2 animate-fade-in-up animation-delay-500 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(252,95,22,0.6)]">
              Ver Planos <ArrowDown size={18} />
            </button>
          </div>

          {/* RIGHT COLUMN: App Mockup */}
          <div className="flex-1 w-full max-w-2xl animate-fade-in-up animation-delay-300 relative group perspective-1000">
             {/* Glow Behind Mockup */}
             <div className="absolute inset-0 bg-brand-500/20 rounded-[40px] blur-[60px] group-hover:bg-brand-500/30 transition-all duration-700 pointer-events-none"></div>
             
             {/* Mockup Container (User Screenshot) */}
             <div className="relative transform transition-transform duration-700 hover:scale-[1.02] hover:-rotate-1">
                <img src="/assets/app_login_mockup.png" alt="Maxx Player Tela de Login" className="w-full h-auto rounded-3xl shadow-[0_0_50px_rgba(252,95,22,0.15)] border border-white/10" />
             </div>
          </div>
        </div>
      </div>

      {/* 2. RECURSOS PREMIUM (GRID) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">TUDO QUE VOCÊ <span className="text-brand-500">SEMPRE QUIS</span></h2>
          <p className="text-zinc-500">Desenvolvido com tecnologia de ponta para entregar a melhor experiência.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: 4K */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-brand-500/30 transition-all hover:-translate-y-2 group">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
              <img src="/assets/ic_uhd.webp" alt="4K UHD" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-3">Qualidade 4K Ultra HD</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Assista seus conteúdos favoritos com a máxima qualidade de imagem disponível, sem perdas e sem travamentos.</p>
          </div>

          {/* Feature 2: VOD */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-brand-500/30 transition-all hover:-translate-y-2 group">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
              <img src="/assets/ic_movies.webp" alt="Filmes e Séries" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-3">Organização Inteligente</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Layout estilo Netflix. Capas, sinopses, trailers e categorias separadas de forma perfeita para você encontrar o que quer.</p>
          </div>

          {/* Feature 3: TV Ao Vivo */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-brand-500/30 transition-all hover:-translate-y-2 group">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
              <img src="/assets/ic_globo.webp" alt="TV Ao Vivo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-3">Guia de Programação (EPG)</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Saiba exatamente o que está passando em cada canal com o nosso guia de programação em tempo real.</p>
          </div>

          {/* Feature 4: Kids */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-brand-500/30 transition-all hover:-translate-y-2 group">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
              <img src="/assets/ic_kids.webp" alt="Kids Mode" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-3">Espaço Kids</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Deixe seus filhos navegarem com segurança em uma área totalmente dedicada e filtrada para crianças.</p>
          </div>

          {/* Feature 5: Sports */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-brand-500/30 transition-all hover:-translate-y-2 group">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
              <img src="/assets/ic_sports.webp" alt="Esportes" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-3">O Mundo dos Esportes</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Categorias exclusivas para todos os esportes e eventos ao vivo para você não perder nenhum lance.</p>
          </div>

          {/* Feature 6: Multi-plataforma */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-brand-500/30 transition-all hover:-translate-y-2 group">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 text-brand-500">
               <Tv size={32} />
               <Smartphone size={24} className="ml-1 -mb-4 opacity-70" />
            </div>
            <h3 className="text-xl font-bold mb-3">Multi-Dispositivos</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Disponível para as principais Smart TVs, TV Box, Fire Stick, Celulares e Computadores.</p>
          </div>
        </div>
      </div>

      {/* 3. INTEGRAÇÕES / STREAMING BANNER */}
      <div className="w-full bg-[#050505] py-20 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-full bg-brand-600/5 blur-[100px] pointer-events-none -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h3 className="text-xl md:text-2xl font-light text-zinc-400 mb-10">Todo o seu conteúdo favorito centralizado em um só lugar</h3>
          
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             <img src="/assets/netflix.png" alt="Netflix" className="h-10 md:h-14 object-contain hover:opacity-100 hover:scale-110 transition-transform" />
             <img src="/assets/hbomax.png" alt="HBO Max" className="h-8 md:h-10 object-contain hover:opacity-100 hover:scale-110 transition-transform" />
             <img src="/assets/prime.png" alt="Prime Video" className="h-10 md:h-14 object-contain hover:opacity-100 hover:scale-110 transition-transform" />
             <img src="/assets/disney.png" alt="Disney Plus" className="h-12 md:h-16 object-contain hover:opacity-100 hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4. PREÇOS (O Componente que já criamos) */}
      <div id="pricing-section">
         <MaxxPlayerPricing />
      </div>

    </div>
  );
}
