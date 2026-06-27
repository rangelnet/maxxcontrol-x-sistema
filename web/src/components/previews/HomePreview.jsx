import AndroidTvLayout from './AndroidTvLayout';

const MOVIE_POSTERS = [
  "https://image.tmdb.org/t/p/w300/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
  "https://image.tmdb.org/t/p/w300/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  "https://image.tmdb.org/t/p/w300/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg",
  "https://image.tmdb.org/t/p/w300/ui4DrH1cKk2vkHshcUcGt2lKxCm.jpg",
  "https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "https://image.tmdb.org/t/p/w300/fiVW06jE7z9YnO4trhaMEdclRVc.jpg",
  "https://image.tmdb.org/t/p/w300/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
  "https://image.tmdb.org/t/p/w300/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg"
];

const PLATFORM_LOGOS = [
  "https://image.tmdb.org/t/p/w300/wwemzKWzjKYJFfCeiB57q3r4Bcm.png",
  "https://image.tmdb.org/t/p/w300/1X7PASWe14Z9Y2iKusR2hSjA89R.png",
  "https://image.tmdb.org/t/p/w300/sVBEF7q7LqjHAWSnKwDbzvw2KEq.png",
  "https://image.tmdb.org/t/p/w300/gjDqwJbGkC1K73n75B9Hknt2vE8.png"
];

export default function HomePreview({ heroBanner, rows = [] }) {
  const defaultBg = 'https://image.tmdb.org/t/p/original/tE18oZ2kSss3Q4T3rX32Eam5P2F.jpg';
  const logoDummy = 'https://image.tmdb.org/t/p/w500/shqWehP25P6Yg3S7bOam0J3K07G.png';
  
  const bgImg = heroBanner?.imageUrl || defaultBg;

  const activeRows = rows.filter(r => r.active);

  return (
    <AndroidTvLayout>
      {({ branding }) => (
        <>
          {/* Cinema Background Effect */}
          <div className="maxx-bg-manager">
            <img src={bgImg} className="maxx-backdrop-blur" alt="" />
            <img src={bgImg} className="maxx-backdrop" alt="" />
            <div className="maxx-backdrop-overlay" />
          </div>

          {/* Hero Section */}
          <div className="maxx-hero-section">
            <img src={logoDummy} alt="Logo" style={{ maxHeight: '40px', maxWidth: '60%', objectFit: 'contain', objectPosition: 'left bottom', marginBottom: '8px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '9px', fontWeight: 'bold' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: 'var(--maxx-orange)' }}>
                <span style={{ textShadow: '0 0 5px var(--maxx-orange)' }}>★</span> 9.5
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>2024</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}>4K UHD</span>
            </div>
            <p className="maxx-hero-overview">
              {heroBanner?.title || 'Assista agora no MAXX PLAYERS com a melhor qualidade. O melhor do entretenimento está aqui.'}
            </p>
          </div>

          {/* Rows Container */}
          <div className="maxx-rows-container">
            {activeRows.map((row, idx) => {
              
              if (row.type === 'platforms_entry') {
                return (
                  <div key={idx}>
                    <div className="maxx-section-header">
                      <div className="maxx-section-bar" />
                      <span className="maxx-section-title">{row.name}</span>
                    </div>
                    <div className="maxx-lazy-row">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="maxx-platform-icon">
                          <img src={PLATFORM_LOGOS[i-1]} alt="" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (row.type.startsWith('top_10')) {
                return (
                  <div key={idx}>
                    <div className="maxx-section-header">
                      <div className="maxx-section-bar" />
                      <span className="maxx-section-title">{row.name}</span>
                    </div>
                    <div className="maxx-lazy-row">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="maxx-ranked-container">
                          <div className="maxx-ranked-poster">
                            <img src={MOVIE_POSTERS[i-1]} alt="" />
                            <span className="maxx-rank-number">{i}</span>
                          </div>
                          <span className="maxx-ranked-title">Conteúdo Top {i}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx}>
                  <div className="maxx-section-header">
                    <div className="maxx-section-bar" />
                    <span className="maxx-section-title">{row.name}</span>
                  </div>
                  <div className="maxx-lazy-row">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="maxx-poster-container">
                        <div className="maxx-poster">
                          <img src={MOVIE_POSTERS[i+3]} alt="" />
                        </div>
                        <span className="maxx-poster-title">Conteúdo {i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AndroidTvLayout>
  );
}
