import AndroidTvLayout from './AndroidTvLayout';

const PLATFORM_BACKGROUNDS = [
  "https://image.tmdb.org/t/p/w780/tE18oZ2kSss3Q4T3rX32Eam5P2F.jpg",
  "https://image.tmdb.org/t/p/w780/jZIYaISP3GBSrVOPfrp98AMa8Ng.jpg",
  "https://image.tmdb.org/t/p/w780/9n2tFcg9stZ6M1r2hL5Z0S5O7jI.jpg",
  "https://image.tmdb.org/t/p/w780/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg"
];

const MOVIE_POSTERS = [
  "https://image.tmdb.org/t/p/w300/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
  "https://image.tmdb.org/t/p/w300/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  "https://image.tmdb.org/t/p/w300/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg",
  "https://image.tmdb.org/t/p/w300/ui4DrH1cKk2vkHshcUcGt2lKxCm.jpg",
  "https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
];

export default function PlatformPreview({ platformConfig }) {
  const pName = platformConfig?.name || 'Plataforma';
  const pColor = platformConfig?.primaryColor || '#FC5F16';
  const pBg = platformConfig?.bgColor || '#050505';
  
  // Sorteia um background apenas para variar
  const randomBg = PLATFORM_BACKGROUNDS[Math.floor(Math.random() * PLATFORM_BACKGROUNDS.length)];

  return (
    <AndroidTvLayout hideTopNav={true}>
      {({ branding }) => (
        <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: pBg }}>
          
          {/* Header (Avatar | Nav | Logo) */}
          <header style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '10px 20px', zIndex: 100 
          }}>
            {/* Esquerda: Avatar Maxx Premium */}
            <div className="maxx-premium-avatar" style={{ width: '24px', height: '24px', borderColor: pColor, boxShadow: `0 0 6px ${pColor}` }}>
              <img src="https://ui-avatars.com/api/?name=Maxx&background=FC5F16&color=fff" alt="" />
            </div>

            {/* Centro: Nav Pills (Glassmorphism) */}
            <div className="maxx-nav-pills">
              <span className="maxx-nav-pill">🔍</span>
              <span className="maxx-nav-pill active">Início</span>
              <span className="maxx-nav-pill">Séries</span>
              <span className="maxx-nav-pill">Filmes</span>
              <span className="maxx-nav-pill">Minha MAXX</span>
            </div>

            {/* Direita: Logo */}
            <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
              {platformConfig?.logo ? (
                <img src={platformConfig.logo.startsWith('http') ? platformConfig.logo : `http://localhost:3001${platformConfig.logo}`} alt="Logo" style={{ maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: branding.text_color }}>{pName}</span>
              )}
            </div>
          </header>

          {/* Banner Hero */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', zIndex: 10 }}>
            <img src={randomBg} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} alt="" />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${pBg}, transparent)` }} />
            <div style={{ position: 'absolute', left: '20px', bottom: '15px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: branding.text_color, textShadow: '1px 1px 4px #000' }}>
                O MELHOR DE {pName.toUpperCase()}
              </h2>
            </div>
          </div>

          {/* Rows */}
          <div style={{ position: 'absolute', top: '55%', left: 0, right: 0, bottom: 0, zIndex: 20 }}>
            <div className="maxx-section-header" style={{ paddingLeft: '20px' }}>
              <div className="maxx-section-bar" style={{ backgroundColor: pColor }} />
              <span className="maxx-section-title">Destaques</span>
            </div>
            <div className="maxx-lazy-row" style={{ paddingLeft: '20px' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="maxx-poster-container" style={{ width: '80px' }}>
                  <div className="maxx-poster" style={{ height: '120px', border: `1px solid ${pColor}40` }}>
                    <img src={MOVIE_POSTERS[i-1]} alt="" />
                  </div>
                  <span className="maxx-poster-title">Conteúdo {i}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </AndroidTvLayout>
  );
}
