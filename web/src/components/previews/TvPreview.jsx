import AndroidTvLayout from './AndroidTvLayout';

const TV_LOGOS = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Rede_Globo_logo.svg/1200px-Rede_Globo_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/SBT_logo_2015.svg/1200px-SBT_logo_2015.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/RecordTV_logo.svg/1200px-RecordTV_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Band_logo_2018.svg/1200px-Band_logo_2018.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/RedeTV%21_logo.png/1200px-RedeTV%21_logo.png"
];

const TV_NAMES = ["Globo HD", "SBT", "RecordTV", "Band", "RedeTV!"];

export default function TvPreview({ liveCategories = [] }) {
  return (
    <AndroidTvLayout>
      {({ branding }) => (
        <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: branding.background_color }}>
          
          {/* Coluna Esquerda - Lista de Canais (36%) */}
          <div style={{ width: '36%', height: '100%', borderRight: `1px solid ${branding.primary_color}30`, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '15px', borderBottom: `1px solid ${branding.primary_color}30`, marginTop: '40px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: branding.text_color }}>Lista de Canais</span>
            </div>
            <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'hidden' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', 
                  backgroundColor: i === 0 ? branding.primary_color : 'rgba(255,255,255,0.05)', 
                  borderRadius: '6px' 
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: i === 0 ? branding.background_color : branding.text_color }}>
                    00{i+1}
                  </span>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={TV_LOGOS[i]} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: i === 0 ? branding.background_color : branding.text_color }}>
                      {TV_NAMES[i]}
                    </span>
                    <span style={{ fontSize: '8px', color: i === 0 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)' }}>
                      Programação Normal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna Direita - Player Transparente (64%) */}
          <div style={{ width: '64%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* Usando um backdrop generico para simular o player rodando um filme na TV */}
            <img src="https://image.tmdb.org/t/p/w780/tE18oZ2kSss3Q4T3rX32Eam5P2F.jpg" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} alt="" />
            
            {/* Speed Indicator */}
            <div style={{ position: 'absolute', top: '55px', right: '15px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px' }}>
              <span style={{ fontSize: '9px', color: branding.text_color, fontWeight: 'bold' }}>☁ 148 KB/s</span>
            </div>

            {/* OSD Inferior */}
            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '15px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: branding.text_color, textShadow: '1px 1px 2px #000' }}>
                Globo HD
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                <span style={{ fontSize: '10px', color: branding.primary_color, fontWeight: 'bold' }}>LIVE</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>Novela das 9</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </AndroidTvLayout>
  );
}
