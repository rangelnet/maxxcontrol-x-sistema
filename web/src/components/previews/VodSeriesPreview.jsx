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

export default function VodSeriesPreview({ type = 'vod', featuredCategories = [] }) {
  return (
    <AndroidTvLayout>
      {({ branding }) => (
        <div style={{ position: 'relative', height: '100%', width: '100%', backgroundColor: branding.background_color }}>
          
          <div className="maxx-section-header" style={{ position: 'absolute', top: '45px', left: '15px' }}>
            <div className="maxx-section-bar" style={{ backgroundColor: branding.primary_color }} />
            <span className="maxx-section-title" style={{ fontSize: '18px', color: branding.text_color }}>
              Lançamentos {type === 'vod' ? 'Filmes' : 'Séries'}
            </span>
          </div>

          <div style={{ position: 'absolute', top: '80px', left: '15px', right: '15px', bottom: '15px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="maxx-poster-container" style={{ width: '80px' }}>
                  <div className="maxx-poster" style={{ height: '120px' }}>
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
