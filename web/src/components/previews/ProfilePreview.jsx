import AndroidTvLayout from './AndroidTvLayout';

export default function ProfilePreview() {
  return (
    <AndroidTvLayout hideTopNav={true}>
      {({ branding }) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', backgroundColor: branding.background_color }}>
          
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: branding.text_color, marginBottom: '20px' }}>
            Quem está assistindo?
          </h2>

          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Perfil 1 (Focado) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="maxx-premium-avatar" style={{ 
                width: '60px', height: '60px', 
                border: `2px solid ${branding.white || '#fff'}`, 
                boxShadow: `0 0 20px ${branding.primary_color}, inset 0 0 0 2px #fff`,
                transform: 'scale(1.1)'
              }}>
                <img src="https://ui-avatars.com/api/?name=Maxx&background=FC5F16&color=fff" alt="" />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: branding.text_color }}>Papai</span>
            </div>

            {/* Perfil 2 (Desfocado) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="maxx-premium-avatar" style={{ 
                width: '60px', height: '60px', 
                border: `2px solid ${branding.primary_color}`, 
                opacity: 0.7 
              }}>
                <img src="https://ui-avatars.com/api/?name=Kids&background=0385E2&color=fff" alt="" />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>Kids</span>
            </div>

            {/* Adicionar Perfil */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0.7 
              }}>
                <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.5)' }}>+</span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>Adicionar</span>
            </div>
          </div>

        </div>
      )}
    </AndroidTvLayout>
  );
}
