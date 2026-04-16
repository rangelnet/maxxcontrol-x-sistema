import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const WhatsAppContext = createContext()

export const useWhatsApp = () => useContext(WhatsAppContext)

export const WhatsAppProvider = ({ children }) => {
  const [waStatus, setWaStatus] = useState('disconnected') // 'disconnected' | 'loading' | 'connected'
  const [waLoading, setWaLoading] = useState(false)
  const [waGroups, setWaGroups] = useState([])
  const [waGroupsLoading, setWaGroupsLoading] = useState(false)

  const [waQrCode, setWaQrCode] = useState('')

  const loadStatus = useCallback(async () => {
    try {
      const res = await api.get('/api/whatsapp/status')
      const data = res.data
      setWaStatus(data.status)
      if (data.qr_code) setWaQrCode(data.qr_code)
      if (data.status === 'connected' && waGroups.length === 0) {
        loadGroups()
      }
    } catch (error) {
      setWaStatus('disconnected')
    }
  }, [waGroups.length])

  const connectWhatsApp = async () => {
    setWaLoading(true)
    setWaStatus('loading')
    setWaQrCode('')
    try {
      await api.post('/api/whatsapp/connect')
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error)
      setWaStatus('disconnected')
    } finally {
      setWaLoading(false)
    }
  }

  const disconnect = async () => {
    setWaLoading(true)
    try {
      await api.post('/api/whatsapp/disconnect')
      setWaStatus('disconnected')
      setWaQrCode('')
      setWaGroups([])
    } catch (error) {
       console.error('Erro ao desconectar WhatsApp:', error)
    } finally {
      setWaLoading(false)
    }
  }

  const loadGroups = useCallback(async () => {
    setWaGroupsLoading(true)
    try {
      const res = await api.get('/api/whatsapp/groups')
      setWaGroups(res.data.groups || [])
    } catch (error) {
      console.error('Erro ao carregar grupos do WhatsApp:', error)
    } finally {
      setWaGroupsLoading(false)
    }
  }, [])

  // Polling de status (mais frequente quando está 'loading' ou ao iniciar)
  useEffect(() => {
    loadStatus()
    const interval = setInterval(() => {
      loadStatus()
    }, (waStatus === 'loading' || (waStatus === 'disconnected' && waQrCode)) ? 3000 : 30000) 

    return () => clearInterval(interval)
  }, [loadStatus, waStatus, waQrCode])

  return (
    <WhatsAppContext.Provider value={{ 
      waStatus, setWaStatus,
      waLoading, setWaLoading,
      waQrCode,
      waGroups, waGroupsLoading,
      loadStatus, loadGroups,
      connectWhatsApp, disconnect
    }}>
      {children}
    </WhatsAppContext.Provider>
  )
}
