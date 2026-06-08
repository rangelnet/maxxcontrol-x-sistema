import { useState, useEffect } from 'react'
import { Rocket, FileText } from 'lucide-react'
import Versions from './Versions'
import Logs from './Logs'
import { useAuth } from '../context/AuthContext'

const VersionsWithLogs = () => {
  const { user } = useAuth()
  
  const allTabs = [
    { key:'versions', label:'Versões do App', Icon:Rocket, perm: 'perm_versoes' },
    { key:'logs',     label:'Logs & Bugs',  Icon:FileText, perm: 'perm_dispositivos_logs' },
  ]
  
  const tabs = allTabs.filter(t => user?.tipo === 'admin' || user?.[t.perm] !== false)
  
  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].key : '')

  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.key === activeTab)) {
      setActiveTab(tabs[0].key)
    }
  }, [tabs, activeTab])

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <Rocket size={26} color='#FC5F16'/> Versões & Logs
        </h1>
        <p style={{ fontSize:12, color:'#52525b' }}>Gerencie as versões do aplicativo e monitore logs de sistema</p>
      </div>

      {/* Tabs premium */}
      <div style={{ display:'flex', gap:4, marginBottom:28, background:'rgba(17,17,17,0.6)', padding:5, borderRadius:14, width:'fit-content', border:'1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              display:'flex', alignItems:'center', gap:8, padding:'9px 22px',
              borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
              transition:'all .2s',
              background: activeTab===tab.key ? 'rgba(252, 95, 22,0.15)' : 'transparent',
              color: activeTab===tab.key ? '#FC5F16' : '#71717a',
              boxShadow: activeTab===tab.key ? '0 2px 10px rgba(252, 95, 22,0.15)' : 'none',
            }}>
            <tab.Icon size={15}/> {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo com fade */}
      <div key={activeTab} style={{ animation:'fadeIn .2s ease' }}>
        {activeTab==='versions' && <Versions/>}
        {activeTab==='logs'    && <Logs/>}
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

export default VersionsWithLogs
