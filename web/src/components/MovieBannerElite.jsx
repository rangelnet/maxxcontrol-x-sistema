import React from 'react';
import { Phone, Star, PlayCircle } from 'lucide-react';

const MovieBannerElite = ({ movie, contact, theme }) => {
  if (!movie) return null;

  const backdrop = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${movie.poster_path}`;
  
  const poster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const year = movie.release_date ? movie.release_date.split('-')[0] : '2024';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.5';

  return (
    <div 
      id="banner-capture"
      className="relative w-[1080px] h-[1920px] bg-black overflow-hidden font-['Inter',sans-serif] flex flex-col items-center"
    >
      {/* ── CAMADA 0: BACKDROP COM BLUR ─────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backdrop} 
          className="w-full h-full object-cover scale-110 blur-[30px] opacity-40" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      {/* ── CAMADA 1: HEADER & LOGO ───────────────────────────── */}
      <div className="relative z-10 w-full pt-20 px-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
           <div className="h-14 w-14 bg-brand-500 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-brand-500/20">
             X
           </div>
           <div className="flex flex-col">
             <span className="text-3xl font-black text-white tracking-widest uppercase">MaxxControl</span>
             <span className="text-brand-500 text-sm font-black tracking-[0.3em] uppercase">Gerador Premium</span>
           </div>
        </div>
        <div className="bg-red-600 text-white text-xl font-black px-8 py-2 rounded-full shadow-lg shadow-red-600/30 uppercase tracking-widest border-2 border-white/20">
           Disponível Agora
        </div>
      </div>

      {/* ── CAMADA 2: POSTER COM FRAME ─────────────────────────── */}
      <div className="relative z-10 mt-16 px-12 w-full flex justify-center">
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-brand-500/20 blur-3xl rounded-[3rem] opacity-50" />
          
          <div className="relative border-[12px] border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] w-[700px] aspect-[2/3]">
            <img 
              src={poster} 
              className="w-full h-full object-cover" 
              alt={movie.titulo} 
            />
          </div>
        </div>
      </div>

      {/* ── CAMADA 3: CONTEÚDO (TÍTULO E INFO) ─────────────────── */}
      <div className="relative z-10 flex-1 w-full px-16 pt-16 flex flex-col items-center text-center">
        <h1 className="text-7xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-2xl">
          {movie.titulo}
        </h1>

        {/* Metadata Pills */}
        <div className="flex items-center gap-4 mt-8">
          <div className="px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-zinc-300 text-xl font-bold">
            {year}
          </div>
          <div className="px-6 py-2 bg-brand-500/20 backdrop-blur-xl border border-brand-500/30 rounded-full text-brand-400 text-xl font-black flex items-center gap-2">
            <Star className="w-6 h-6 fill-brand-500" />
            {rating}
          </div>
          <div className="px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-zinc-300 text-xl font-bold uppercase tracking-widest">
            UHD 4K
          </div>
        </div>

        {/* Synopsis */}
        <p className="mt-10 text-2xl text-zinc-400 leading-relaxed font-medium line-clamp-3">
          {movie.overview || 'Sinopse não disponível para este título.'}
        </p>
      </div>

      {/* ── CAMADA 4: RODAPÉ CTA ───────────────────────────────── */}
      <div className="relative z-10 w-full px-12 pb-24">
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-12 rounded-[3.5rem] shadow-3xl flex flex-col items-center gap-8 border-t-2 border-white/20">
          <div className="flex items-center gap-4 text-white">
            <PlayCircle className="w-12 h-12" />
            <span className="text-4xl font-black uppercase tracking-widest">Solicite seu Teste agora</span>
          </div>
          
          <div className="flex items-center gap-6 bg-black/30 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10">
            <Phone className="w-10 h-10 text-white fill-white" />
            <span className="text-5xl font-black text-white tracking-tight">
              {contact || '(00) 00000-0000'}
            </span>
          </div>
        </div>
      </div>

      {/* Style Overrides para Fontes e Customizações */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        .text-brand-500 { color: #FFA500; }
        .bg-brand-500 { background-color: #FFA500; }
        .border-brand-500 { border-color: #FFA500; }
      `}} />
    </div>
  );
};

export default MovieBannerElite;
