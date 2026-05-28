import { useState, useEffect } from 'react'
import { Tv2, FileText } from 'lucide-react'
import Devices from './Devices'
import Logs from './Logs'
import { useAuth } from '../context/AuthContext'

const DevicesWithLogs = () => {
  const { user } = useAuth()
  
  const allTabs = [
    { key:'devices', label:'Dispositivos', Icon:Tv2, perm: 'perm_dispositivos_lista' },
    { key:'logs',    label:'Logs & Bugs',  Icon:FileText, perm: 'perm_dispositivos_logs' },
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
          <Tv2 size={26} color='#FC5F16'/> Dispositivos & Logs
        </h1>
        <p style={{ fontSize:12, color:'#52525b' }}>Monitore dispositivos, bugs e eventos do sistema em tempo real</p>
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
        {activeTab==='devices' && <Devices/>}
        {activeTab==='logs'    && <Logs/>}
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

export default DevicesWithLogs
