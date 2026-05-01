import { useState } from 'react';
import { Server, Tv, Play, Globe, Zap, BarChart3 } from 'lucide-react';
import ServersManagement from './ServersManagement';
import IptvTreeViewer from './IptvTreeViewer';
import PlaylistManager from './PlaylistManager';
import IptvServer from './IptvServer';

// ─── Estilos base ───────────────────────────────────────────
const tabBtn = (active) => ({
  display:'flex', alignItems:'center', gap:8, padding:'11px 24px',
  borderRadius:12, border:'none', cursor:'pointer', fontSize:13,
  fontWeight:700, transition:'all .25s',
  background: active ? 'rgba(255,165,0,0.15)' : 'transparent',
  color: active ? '#FFA500' : '#71717a',
  boxShadow: active ? '0 2px 12px rgba(255,165,0,0.15)' : 'none',
});

const tabs = [
  { key:'servers',  label:'Servidores',       Icon: Server },
  { key:'tree',     label:'Curadoria IPTV',   Icon: Tv },
  { key:'playlist', label:'Playlist 4-em-1',  Icon: Play },
  { key:'global',   label:'Config Global',    Icon: Globe },
];

const IptvServersManager = () => {
  const [activeTab, setActiveTab] = useState('servers');

  return (
    <div>
      {/* ══════ HEADER ══════ */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#FFA500,#FF6B00)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(255,165,0,0.35)' }}>
            <Zap size={22} color='#000'/>
          </div>
          Plugin IPTV <span style={{ color:'#FFA500' }}>Unificado</span>
        </h1>
        <p style={{ fontSize:12, color:'#52525b', marginLeft:56 }}>
          Hub central de gerenciamento IPTV — Servidores, Curadoria, Playlists e Configuração Global
        </p>
      </div>

      {/* ══════ STATS MINI ══════ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
        {[
          { label:'Módulos Ativos', value:'4', color:'#FFA500', icon: BarChart3 },
          { label:'Servidores',     value:'—', color:'#3b82f6', icon: Server },
          { label:'Curadoria',     value:'—', color:'#a855f7', icon: Tv },
          { label:'Playlists',     value:'—', color:'#22c55e', icon: Play },
        ].map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}18`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <s.icon size={16} color={s.color}/>
            </div>
            <div>
              <p style={{ fontSize:18, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</p>
              <p style={{ fontSize:10, color:'#52525b', marginTop:2, fontWeight:600 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══════ TABS ══════ */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'rgba(17,17,17,0.6)', padding:5, borderRadius:16, width:'fit-content', border:'1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={tabBtn(activeTab === t.key)}>
            <t.Icon size={15}/> {t.label}
          </button>
        ))}
      </div>

      {/* ══════ CONTEÚDO DAS ABAS ══════ */}
      <div style={{ animation:'fadeIn .3s ease-out' }}>
        {activeTab === 'servers'  && <ServersManagement />}
        {activeTab === 'tree'     && <IptvTreeViewer />}
        {activeTab === 'playlist' && <PlaylistManager />}
        {activeTab === 'global'   && <IptvServer />}
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

export default IptvServersManager;
