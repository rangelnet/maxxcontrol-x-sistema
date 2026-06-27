import { useActiveBranding } from './useActiveBranding';
import './previews.css';

export default function AndroidTvLayout({ children, hideTopNav = false }) {
  const { branding, loading } = useActiveBranding();

  if (loading) return <div className="animate-pulse bg-dark-800 rounded-xl w-full aspect-[16/9]" />;

  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const BACKEND_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
    return `${BACKEND_URL}${path}`;
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
      <div 
        className="maxx-preview-root"
        style={{ 
          '--maxx-bg': branding.background_color,
          '--maxx-orange': branding.primary_color,
          '--maxx-accent': branding.accent_color || branding.primary_color,
          '--maxx-white': branding.text_color,
        }}
      >
        {/* TopNav Mock (Idêntico ao TopNav.tsx do App) */}
        {!hideTopNav && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '40px',
            display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
          }}>
            {/* Logo */}
            <div style={{ flex: 1 }}>
              {branding.logo_url ? (
                <img src={getFullUrl(branding.logo_url)} alt="Logo" style={{ height: '20px', filter: 'drop-shadow(0 0 5px rgba(252,95,22,0.6))', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
              ) : (
                <span style={{ fontWeight: '900', color: branding.text_color, fontSize: '12px' }}>{branding.app_name?.slice(0, 8)}</span>
              )}
            </div>
            
            {/* Nav Items */}
            <div className="maxx-nav-pills" style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 15px', borderRadius: '30px', display: 'flex', gap: '10px' }}>
              <span className="maxx-nav-pill">Buscar</span>
              <span className="maxx-nav-pill">TV</span>
              <span className="maxx-nav-pill active">HOME</span>
              <span className="maxx-nav-pill">ESPORTES</span>
              <span className="maxx-nav-pill">DESTAQUES</span>
              <span className="maxx-nav-pill">ANIME</span>
              <span className="maxx-nav-pill">KIDS</span>
            </div>

            {/* Right Side */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.9)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 2v3M12 19v3M4.9 4.9L7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                28°C
              </span>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}>20:00</span>
              
              {/* Profile Avatar */}
              <div className="maxx-premium-avatar" style={{ width: '20px', height: '20px', borderWidth: '1px', padding: 0 }}>
                <img src="https://ui-avatars.com/api/?name=Maxx&background=FC5F16&color=fff" alt="Perfil" style={{ borderRadius: '50%' }} />
              </div>
              
              {/* Gear Icon */}
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 8.3a3.7 3.7 0 100 7.4 3.7 3.7 0 000-7.4z" fill="none" stroke="currentColor" strokeWidth="1.9" />
                  <path d="M19.1 13.4c.1-.5.1-.9.1-1.4s0-.9-.1-1.4l2-1.5-2-3.5-2.4 1a7.4 7.4 0 00-2.4-1.4L14 2.7h-4l-.4 2.5a7.4 7.4 0 00-2.4 1.4l-2.4-1-2 3.5 2 1.5c-.1.5-.1.9-.1 1.4s0 .9.1 1.4l-2 1.5 2 3.5 2.4-1a7.4 7.4 0 002.4 1.4l.4 2.5h4l.4-2.5a7.4 7.4 0 002.4-1.4l2.4 1 2-3.5-2.1-1.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {typeof children === 'function' ? children({ branding, getFullUrl }) : children}
      </div>
    </div>
  );
}
