import React from 'react';
import { Phone, Star, PlayCircle } from 'lucide-react';

/**
 * MovieBannerElite - Motor de Renderização Master
 * Suporta configurações dinâmicas vindas da Fábrica de Temas.
 * Versão Fire Master Adaptável.
 */
const MovieBannerElite = ({ movie, contact, theme, config = {} }) => {
  if (!movie) return null;

  // Parâmetros dinâmicos com fallback para o design padrão Elite
  const {
    poster_x = 50, 
    poster_y = 50, 
    poster_scale = 1,
    text_color = '#FFA500',
    font_family = 'Inter',
    show_synopsis = true,
    custom_bg = null,
    custom_overlay = null,
    brand_name = 'TV MAXX',
    brand_logo_url = null
  } = config;

  const isFireSeries = theme === 'fire-series';

  const backdrop = custom_bg || (movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${movie.poster_path}`);
  
  const poster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const year = movie.release_date ? movie.release_date.split('-')[0] : '2024';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.5';

  return (
    <div 
      id="banner-capture"
      className="relative w-[1080px] h-[1920px] bg-black overflow-hidden flex flex-col items-center"
      style={{ fontFamily: font_family + ', sans-serif' }}
    >
      {/* ── CAMADA 0: BACKDROP MASTER (FULL SCREEN) ─────────────────── */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backdrop} 
          className={`w-full h-full object-cover ${isFireSeries ? 'blur-none saturate-[1.2]' : 'blur-[30px] opacity-40'} transition-all duration-700`} 
          alt="" 
        />
        {/* Overlay de Gradiente para Legibilidade (Apenas para Full Screen) */}
        {isFireSeries && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        )}
        <div className={`absolute inset-0 ${isFireSeries ? 'bg-gradient-to-t from-black via-transparent to-black/20' : 'bg-gradient-to-t from-black via-black/80 to-black/40'}`} />
        <div className={`absolute inset-0 ${isFireSeries ? 'bg-gradient-radial from-red-900/40 via-transparent to-black/80 opacity-60' : ''}`} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

       {/* ── CAMADA 1: HEADER & LOGO DINÂMICO ───────────────────────────── */}
       {!isFireSeries ? (
         <div className="relative z-10 w-full pt-20 px-12 flex flex-col items-center gap-6">
           <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
             <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-brand-500/20" style={{ backgroundColor: text_color }}>
               X
             </div>
             <div className="flex flex-col">
               <span className="text-3xl font-black text-white tracking-widest uppercase">{brand_name}</span>
               <span className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: text_color }}>Gerador Premium</span>
             </div>
           </div>
           <div className="bg-red-600 text-white text-xl font-black px-8 py-2 rounded-full shadow-lg shadow-red-600/30 uppercase tracking-widest border-2 border-white/20">
             Disponível Agora
           </div>
         </div>
       ) : (
         /* BRANDING DINÂMICO DO USUÁRIO (STRANGER STYLE) */
         <div className="absolute top-16 right-16 z-30 flex items-center gap-4 p-4">
            {brand_logo_url ? (
               <img src={brand_logo_url} className="h-24 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" alt="Logo" />
            ) : (
               <div className="flex flex-col items-end">
                  <span className="text-6xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-[0_0_30px_rgba(225,29,72,0.6)]">{brand_name}</span>
                  <span className="text-xs font-bold text-white/40 tracking-[0.5em] uppercase mt-1">Premium Streaming</span>
               </div>
            )}
         </div>
       )}

       {/* ── CAMADA 2: POSTER MASTER / TEXT OVERLAY ─────────────────────── */}
       {isFireSeries ? (
         /* LAYOUT STRANGER GLOOM: ATMOSFERA E NUMERAL GIGANTE */
         <div className="absolute bottom-[32%] left-1/2 -translate-x-1/2 w-full flex flex-col items-center z-40 pointer-events-none">
            {/* GHOST NUMBER (NUMERAL GIGANTE NO FUNDO) */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 z-0 opacity-20 transform scale-[3]">
               <span className="text-[500px] font-black text-red-900 tracking-tighter leading-none" 
                     style={{ fontFamily: "'Bebas Neue', sans-serif", WebkitTextStroke: '10px #450a0a' }}>
                  {movie.season_number || '5'}
               </span>
            </div>

            {/* Linha Superior: TEMPORADA */}
            <div className="relative z-10">
               <span className="text-[140px] font-serif font-bold text-[#E11D48] uppercase italic leading-none tracking-[-0.05em] drop-shadow-[0_0_40px_rgba(225,29,72,0.9)]" style={{ fontFamily: "'Cinzel', serif" }}>
                 Temporada
               </span>
            </div>
            
            {/* Linha Inferior: FINAL + ADICIONADA */}
            <div className="relative z-10 flex items-end gap-6 -mt-14">
               <span className="text-[180px] font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-2xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                 Final
               </span>
               <div className="bg-red-700 px-12 py-5 rounded-md flex items-center justify-center transform skew-x-[-12deg] mb-6 border-2 border-white/20 shadow-[0_0_50px_rgba(225,29,72,0.6)]">
                  <span className="text-6xl font-black text-white uppercase italic tracking-widest transform skew-x-[12deg]">Adicionada</span>
               </div>
            </div>

            {/* Título da Obra (Master Stroke Style - Com Z-index acima do Numeral) */}
            <div className="mt-6 relative z-20">
               <h1 className="text-[140px] font-serif font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#E11D48] to-[#881337] tracking-tighter italic text-center px-10" 
                   style={{ 
                     fontFamily: "'Cinzel', serif",
                     WebkitTextStroke: '5px #E11D48',
                     filter: 'drop-shadow(0 0 80px rgba(225,29,72,1))'
                   }}>
                 {movie.titulo}
               </h1>
            </div>
         </div>
       ) : (
         /* LAYOUT PADRÃO: POSTER COM MOLDURA CENTRALIZADO */
         <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center" 
              style={{ 
                transform: `translate(${(poster_x - 50) * 10}px, ${(poster_y - 50) * 10}px) scale(${poster_scale})`
              }}>
           <div className="relative border-[12px] border-white/5 rounded-[3rem] overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.9)] w-[750px] aspect-[2/3] pointer-events-auto">
             <img 
               src={poster} 
               className="w-full h-full object-cover" 
               alt={movie.titulo} 
             />
           </div>
         </div>
       )}

       {/* ── CAMADA 3: CONTEÚDO (PADRÃO NÃO-FIRE) ─────────────────── */}
       {!isFireSeries && (
         <div className="relative z-20 mt-auto w-full px-16 pb-16 flex flex-col items-center text-center bg-gradient-to-t from-black via-black/90 to-transparent pt-40">
           <h1 className="text-7xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-2xl font-['Outfit']">
             {movie.titulo}
           </h1>

           <div className="flex items-center gap-4 mt-8">
             <div className="px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-zinc-300 text-xl font-bold">{year}</div>
             <div className="px-6 py-2 backdrop-blur-xl border rounded-full text-xl font-black flex items-center gap-2" style={{ borderColor: `${text_color}4d`, backgroundColor: `${text_color}33` }}>
               <Star className="w-6 h-6" style={{ color: text_color, fill: text_color }} />
               <span style={{ color: text_color }}>{rating}</span>
             </div>
             <div className="px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-zinc-300 text-xl font-bold uppercase tracking-widest">UHD 4K</div>
           </div>

           {show_synopsis && (
             <p className="mt-10 text-2xl text-zinc-400 leading-relaxed font-medium line-clamp-3 max-w-[850px]">
               {movie.overview || 'Sinopse não disponível para este título.'}
             </p>
           )}
         </div>
       )}

       {/* ── CAMADA 4: RODAPÉ ────────────────────────── */}
       <div className="relative z-20 w-full px-12 pb-24 mt-auto">
         {!isFireSeries ? (
           <div className="p-12 rounded-[3.5rem] shadow-3xl flex flex-col items-center gap-8 border-t-2 border-white/20" style={{ background: `linear-gradient(to right, ${text_color}, #000000)` }}>
             <div className="flex items-center gap-4 text-white">
               <PlayCircle className="w-12 h-12" />
               <span className="text-4xl font-black uppercase tracking-widest">Solicite seu Teste agora</span>
             </div>
             <div className="flex items-center gap-6 bg-black/30 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10">
               <Phone className="w-10 h-10 text-white fill-white" />
               <span className="text-5xl font-black text-white tracking-tight">{contact || '(00) 00000-0000'}</span>
             </div>
           </div>
         ) : (
           /* RODAPÉ MASTER (ATMOSFERA SEM FOGO) */
           <div className="relative w-full flex flex-col items-center gap-12">
              {/* SELO DE SATISFAÇÃO MASTER CLEAN (TUCKED IN CORNER) */}
              <div className="absolute -left-12 -bottom-2 w-44 h-44 z-50 transform -rotate-6">
                 <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-black rounded-full border-[5px] border-[#FFC107] shadow-[0_0_40px_rgba(255,193,7,0.4)]" />
                    <div className="absolute inset-1 bg-gradient-to-b from-[#FFC107] to-[#FFA000] rounded-full border-[2px] border-black" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center px-2">
                       <div className="mb-0.5 text-black">
                         <Star className="w-4 h-4 fill-black" />
                       </div>
                       <span className="text-black font-black text-[11px] leading-[0.9] uppercase tracking-tighter text-center">Satisfação<br/>Garantida</span>
                    </div>
                 </div>
              </div>

              {/* NÉVOA VERMELHA ATMOSFÉRICA (SUBSTITUINDO O FOGO) */}
              <div className="absolute -left-40 -bottom-20 w-[800px] h-[600px] bg-gradient-radial from-red-600/20 via-transparent to-transparent blur-[120px] pointer-events-none z-30" />
              <div className="absolute -right-40 -bottom-20 w-[800px] h-[600px] bg-gradient-radial from-red-900/40 via-transparent to-transparent blur-[120px] pointer-events-none z-30 opacity-60" />
              
              {/* BARRA DE DISPOSITIVOS PREMIUM (FRAMEADO) */}
              <div className="w-[90%] bg-zinc-950/95 backdrop-blur-3xl border-2 border-white/10 rounded-[2.5rem] p-8 px-16 flex flex-col items-center gap-6 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden z-40">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-orange-600/5" />
                
                <span className="relative z-10 text-zinc-500 font-extrabold text-sm uppercase tracking-[0.6em]">Assista em qualquer dispositivo agora</span>
                
                <div className="relative z-10 flex items-center justify-between w-full opacity-80 mix-blend-screen px-4">
                   <span className="text-white text-3xl font-black italic tracking-tighter">SAMSUNG</span>
                   <span className="text-white text-4xl font-black tracking-[-0.05em]">LG</span>
                   <span className="text-white text-3xl font-black flex items-center gap-3"><div className="w-5 h-5 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]" /> androidtv</span>
                   <span className="text-[#662D91] text-3xl font-black">ROKU</span>
                   <span className="text-white text-3xl font-black">TCL</span>
                   <span className="text-[#FF8C00] text-3xl font-black flex items-center gap-2">firetv</span>
                </div>

                {/* Whatsapp Contato Flutuante (Se existir) */}
                {contact && (
                  <div className="absolute right-8 -top-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-2xl font-black text-4xl shadow-[0_20px_40px_rgba(34,197,94,0.3)] border-2 border-white/20 transform hover:scale-105 transition-transform">
                    {contact}
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Estilos Dinâmicos e Fontes Mestre */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@900&family=EB+Garamond:ital,wght@1,800&family=Bebas+Neue&family=Outfit:wght@400;700;900&display=swap');
        
        @keyframes glowPulse {
          0% { filter: drop-shadow(0 0 20px rgba(225,29,72,0.6)); }
          50% { filter: drop-shadow(0 0 40px rgba(225,29,72,0.9)); }
          100% { filter: drop-shadow(0 0 20px rgba(225,29,72,0.6)); }
        }
        
        .fire-glow-text {
          animation: glowPulse 2s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};

export default MovieBannerElite;
