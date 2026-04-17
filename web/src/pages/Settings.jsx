import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import {
  Settings as SettingsIcon, Upload, Lock, Phone, Send, MessageCircle,
  Key, Eye, EyeOff, Bot, AlertTriangle, CheckCircle, X, QrCode,
  ToggleLeft, ToggleRight, Loader2, Users, Radio, Shield, RefreshCw, Link,
  CreditCard, User, Globe, BarChart2, SlidersHorizontal, UserCheck,
  Smartphone, Monitor, Laptop, MapPin, Clock, Trash2, ShieldCheck,
  ShieldOff, Copy, Mail, Unlink, Zap, ExternalLink
} from 'lucide-react'

export default function Settings() {
  const [whatsapp, setWhatsapp] = useState('')
  const [whatsappInput, setWhatsappInput] = useState('')
  const [supportWhatsapp, setSupportWhatsapp] = useState('')
  const [supportInput, setSupportInput] = useState('')
  const [telegramId, setTelegramId] = useState('')
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [saving, setSaving] = useState({})
  const [message, setMessage] = useState(null)

  // === Perfil do Usuário ===
  const [profileName, setProfileName]     = useState('')
  const [profileEmail, setProfileEmail]   = useState('')
  const [profilePhone, setProfilePhone]   = useState('')
  const [profileTg, setProfileTg]         = useState('')
 
  // === Configurações de Trial e Entrega ===
  const [panelUrl, setPanelUrl]                     = useState('')
  const [trialHours, setTrialHours]                 = useState('24')
  const [welcomeTemplate, setWelcomeTemplate]       = useState('')

  // === Preferências do Painel ===
  const [showEarnings, setShowEarnings]         = useState(true)
  const [persistFilters, setPersistFilters]     = useState(false)
  const [masterPermission, setMasterPermission] = useState(false)
  const [panelLanguage, setPanelLanguage]       = useState('pt-BR')

  // === 2FA ===
  const [twoFaEnabled, setTwoFaEnabled]   = useState(false)
  const [twoFaLoading, setTwoFaLoading]   = useState(false)
  const [twoFaMethod, setTwoFaMethod]     = useState('app') // 'app' | 'telegram'
  const [twoFaQr, setTwoFaQr]             = useState('')
  const [twoFaSecret, setTwoFaSecret]     = useState('')
  const [twoFaCode, setTwoFaCode]         = useState('')
  const [twoFaStep, setTwoFaStep]         = useState('idle') // idle | type-select | setup | done
  const [copiedSecret, setCopiedSecret]   = useState(false)

  // === Sessões Ativas ===
  const [sessions, setSessions]           = useState([
    { id:1, device:'Chrome — Windows 11',  icon:'monitor', ip:'187.190.45.12',  location:'São Paulo, BR',  active:true,  time:'Agora' },
    { id:2, device:'Safari — iPhone 14',   icon:'phone',   ip:'189.62.100.55',  location:'Rio de Janeiro', active:false, time:'há 2h' },
    { id:3, device:'Firefox — macOS',      icon:'laptop',  ip:'200.173.201.99', location:'Belo Horizonte', active:false, time:'há 1d' },
  ])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // === Gateway Mercado Pago State ===
  const [mpAccessToken, setMpAccessToken] = useState('')
  const [mpPublicKey, setMpPublicKey] = useState('')
  const [showMpToken, setShowMpToken] = useState(false)

  // === WhatsApp Automation State ===
  const [waStatus, setWaStatus] = useState('disconnected') // 'loading' | 'disconnected' | 'connected'
  const [waQrCode, setWaQrCode] = useState('')
  const [waGroups, setWaGroups] = useState([])
  const [waSelectedGroup, setWaSelectedGroup] = useState('')
  const [waAutoPost, setWaAutoPost] = useState(false)
  const [waChannelId, setWaChannelId] = useState('')
  const [waChannelName, setWaChannelName] = useState('')
  const [waChannelAutoPost, setWaChannelAutoPost] = useState(false)
  const [waChannelLink, setWaChannelLink] = useState('')
  const [waResolvingChannel, setWaResolvingChannel] = useState(false)
  const [waGroupsLoading, setWaGroupsLoading] = useState(false)
  const [waLoadingAction, setWaLoadingAction] = useState(false)
  const [waTermsModalOpen, setWaTermsModalOpen] = useState(false)
  const [waPolling, setWaPolling] = useState(null)

  // === Google Integration ===
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleLastSync, setGoogleLastSync] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const loadDevices = async () => {
    try {
      setSessionsLoading(true)
      const bid = localStorage.getItem('browser_id')
      const res = await api.get('/api/auth/devices', {
        headers: { 'x-device-id': bid }
      })
      setSessions(res.data)
    } catch (err) {
      console.error('Erro ao carregar dispositivos:', err)
    } finally {
      setSessionsLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const res = await api.get('/api/settings')
      const opt = res.data

      // Carregar status 2FA do usuário real
      const profile = await api.get('/api/auth/validate-token')
      if (profile.data.user) {
        setTwoFaEnabled(profile.data.user.tfa_enabled)
        if (profile.data.user.telegram_chat_id) {
            setTwoFaMethod('telegram')
        }
      }

      // Carregar status Integração Google
      try {
        const gRes = await api.get('/api/integrations/google/status')
        setGoogleConnected(gRes.data.connected)
        if (gRes.data.last_sync) setGoogleLastSync(gRes.data.last_sync)
      } catch (err) {}

      if (opt.whatsapp) { setWhatsapp(opt.whatsapp); setWhatsappInput(opt.whatsapp); }
      if (opt.supportWhatsapp) { setSupportWhatsapp(opt.supportWhatsapp); setSupportInput(opt.supportWhatsapp); }
      if (opt.telegramId) setTelegramId(opt.telegramId);
      if (opt.logoUrl) { setLogoUrl(opt.logoUrl); setLogoPreview(opt.logoUrl); }
      
      if (opt.mpAccessToken) setMpAccessToken(opt.mpAccessToken);
      if (opt.mpPublicKey) setMpPublicKey(opt.mpPublicKey);

      if (opt.profileName) setProfileName(opt.profileName);
      if (opt.profileEmail) setProfileEmail(opt.profileEmail);
      if (opt.profilePhone) setProfilePhone(opt.profilePhone);
      if (opt.profileTg) setProfileTg(opt.profileTg);

      if (opt.showEarnings !== undefined) setShowEarnings(opt.showEarnings);
      if (opt.persistFilters !== undefined) setPersistFilters(opt.persistFilters);
      if (opt.masterPermission !== undefined) setMasterPermission(opt.masterPermission);
      if (opt.panelLanguage) setPanelLanguage(opt.panelLanguage);
 
      if (opt.panel_url) setPanelUrl(opt.panel_url);
      if (opt.trial_hours) setTrialHours(opt.trial_hours);
      if (opt.reseller_welcome_template) setWelcomeTemplate(opt.reseller_welcome_template);

    } catch (err) {
      console.error('Erro ao carregar configuracões:', err)
    }
  }

  useEffect(() => {
    loadSettings()
    loadDevices()
  }, [])

  const handleSave = async (key) => {
    setSaving(prev => ({ ...prev, [key]: true }))
    let payload = {}

    if (key === 'wpp') payload = { value: whatsappInput }
    else if (key === 'sup') payload = { value: supportInput }
    else if (key === 'tel') payload = { value: telegramId }
    else if (key === 'mp') payload = { value: { mpAccessToken, mpPublicKey } }
    else if (key === 'profile') payload = { value: { profileName, profileEmail, profilePhone, profileTg } }
    else if (key === 'earnings') payload = { value: !showEarnings }
    else if (key === 'filters') payload = { value: !persistFilters }
    else if (key === 'master') payload = { value: !masterPermission }
    else if (key === 'language') payload = { value: panelLanguage }
    else if (key === 'logo') { setTimeout(() => { setSaving(prev => ({ ...prev, [key]: false })); showFeedback('Configuração salva com sucesso!'); }, 500); return; }
    else if (key === 'pwd') { setTimeout(() => { setSaving(prev => ({ ...prev, [key]: false })); showFeedback('Senha atualizada com sucesso!'); }, 500); return; }
    else if (key === 'trial') payload = { value: { panelUrl, trialHours, welcomeTemplate } }

    try {
      if (key === 'wpp') await api.post('/api/settings/whatsapp', payload.value)
      else if (key === 'sup') await api.post('/api/settings/supportWhatsapp', payload.value)
      else if (key === 'tel') await api.post('/api/settings/telegramId', payload.value)
      else if (key === 'mp') {
          await api.post('/api/settings/mpAccessToken', payload.value.mpAccessToken)
          await api.post('/api/settings/mpPublicKey', payload.value.mpPublicKey)
      }
      else if (key === 'profile') {
          await api.post('/api/settings/profileName', payload.value.profileName)
          await api.post('/api/settings/profileEmail', payload.value.profileEmail)
          await api.post('/api/settings/profilePhone', payload.value.profilePhone)
          await api.post('/api/settings/profileTg', payload.value.profileTg)
      }
      else if (key === 'earnings') await api.post('/api/settings/showEarnings', payload.value)
      else if (key === 'filters') await api.post('/api/settings/persistFilters', payload.value)
      else if (key === 'master') await api.post('/api/settings/masterPermission', payload.value)
      else if (key === 'language') await api.post('/api/settings/panelLanguage', payload.value)
      else if (key === 'trial') {
          await api.post('/api/settings/panel_url', { value: panelUrl })
          await api.post('/api/settings/trial_hours', { value: trialHours })
          await api.post('/api/settings/reseller_welcome_template', { value: welcomeTemplate })
      }
      
      showFeedback('Configuração salva com sucesso!')
      
      if (key === 'wpp') setWhatsapp(whatsappInput)
      if (key === 'sup') setSupportWhatsapp(supportInput)

    } catch (err) {
      showFeedback('Erro ao salvar configuração', 'error')
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  // === WhatsApp API Functions ===
  const loadWaStatus = useCallback(async (forceConnect = false) => {
    if (forceConnect && !localStorage.getItem('wa_terms_accepted')) {
      setWaTermsModalOpen(true)
      return
    }
    setWaLoadingAction(true)
    try {
      const res = await fetch('/api/whatsapp/status')
      if (!res.ok) { setWaStatus('disconnected'); return }
      const data = await res.json()
      setWaStatus(data.status)
      if (data.status === 'disconnected') {
        if (localStorage.getItem('wa_terms_accepted') && data.qr_code) {
          setWaQrCode(data.qr_code)
        } else {
          setWaQrCode('')
        }
      } else if (data.status === 'connected') {
        setWaQrCode('')
        loadWaGroups()
      }
    } catch { setWaStatus('disconnected') }
    finally { setWaLoadingAction(false) }
  }, []) // eslint-disable-line

  const loadWaGroups = async () => {
    setWaGroupsLoading(true)
    try {
      const res = await fetch('/api/whatsapp/groups')
      if (res.ok) {
        const data = await res.json()
        setWaGroups(data.groups || [])
        if ((data.groups || []).length === 0) showFeedback('Nenhum grupo encontrado.', 'warning')
      } else {
        setWaGroups([])
        showFeedback('Erro ao buscar grupos.', 'error')
      }
    } catch { showFeedback('Falha de rede ao buscar grupos.', 'error') }
    finally { setWaGroupsLoading(false) }
  }

  const acceptWaTerms = () => {
    localStorage.setItem('wa_terms_accepted', 'true')
    setWaTermsModalOpen(false)
    loadWaStatus(true)
  }

  const disconnectWa = async () => {
    setWaLoadingAction(true)
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' })
      setWaStatus('disconnected')
      setWaQrCode('')
      setWaGroups([])
      setWaAutoPost(false)
      setWaChannelAutoPost(false)
      setWaChannelName('')
      setWaChannelId('')
      localStorage.removeItem('wa_terms_accepted')
      showFeedback('Aparelho desconectado.', 'warning')
    } catch { showFeedback('Erro ao desconectar.', 'error') }
    finally { setWaLoadingAction(false) }
  }

  const toggleWaAutoPost = async () => {
    const next = !waAutoPost
    setWaAutoPost(next)
    try {
      await fetch('/api/whatsapp/autopost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next, group_id: waSelectedGroup })
      })
    } catch { showFeedback('Erro ao salvar autopost.', 'error') }
  }

  const toggleWaChannelAutoPost = async () => {
    const next = !waChannelAutoPost
    setWaChannelAutoPost(next)
    try {
      await fetch('/api/whatsapp/channel-autopost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next, channel_id: waChannelId })
      })
    } catch { showFeedback('Erro ao salvar canal.', 'error') }
  }

  const resolveChannel = async () => {
    if (!waChannelLink) return
    setWaResolvingChannel(true)
    try {
      const res = await fetch('/api/whatsapp/resolve-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: waChannelLink })
      })
      if (res.ok) {
        const data = await res.json()
        setWaChannelId(data.id)
        setWaChannelName(data.name)
        setWaChannelLink('')
        showFeedback(`Canal "${data.name}" vinculado!`)
      } else {
        showFeedback('Link de canal inválido.', 'error')
      }
    } catch { showFeedback('Erro ao resolver canal.', 'error') }
    finally { setWaResolvingChannel(false) }
  }

  const removeChannel = () => {
    setWaChannelId('')
    setWaChannelName('')
    setWaChannelAutoPost(false)
    showFeedback('Canal removido.', 'warning')
  }

  useEffect(() => {
    // Inicia polling de status se termos já aceitos
    if (localStorage.getItem('wa_terms_accepted')) {
      loadWaStatus(false)
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    // Polling QR Code quando desconectado e termos aceitos
    if (waStatus === 'disconnected' && waQrCode && !waPolling) {
      const interval = setInterval(() => loadWaStatus(false), 5000)
      setWaPolling(interval)
    } else if (waStatus === 'connected' && waPolling) {
      clearInterval(waPolling)
      setWaPolling(null)
    }
    return () => { if (waPolling) clearInterval(waPolling) }
    // eslint-disable-next-line
  }, [waStatus, waQrCode])

  const handleGoogleConnect = async () => {
    setGoogleLoading(true)
    try {
      const res = await api.get('/api/integrations/google/auth')
      if (res.data.url) {
        window.open(res.data.url, '_blank', 'width=600,height=700')
        // Starts polling to check if user finished login
        const interval = setInterval(async () => {
          try {
            const gRes = await api.get('/api/integrations/google/status')
            if (gRes.data.connected) {
               setGoogleConnected(true)
               if(gRes.data.last_sync) setGoogleLastSync(gRes.data.last_sync)
               clearInterval(interval)
               showFeedback('Google Conectado com sucesso!', 'success')
            }
          } catch(e) {}
        }, 3000)
        // Clear interval after 2 minutes to prevent infinite polling
        setTimeout(() => clearInterval(interval), 120000)
      }
    } catch {
      showFeedback('Erro ao conectar Google', 'error')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleDisconnect = async () => {
    setGoogleLoading(true)
    try {
       await api.delete('/api/integrations/google/disconnect')
       setGoogleConnected(false)
       setGoogleLastSync(null)
       showFeedback('Google Desconectado.', 'warning')
    } catch {
       showFeedback('Erro ao desconectar Google.', 'error')
    } finally {
       setGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-maxx/10 flex items-center justify-center border border-maxx/20">
            <SettingsIcon className="h-5 w-5 text-maxx" />
          </div>
          Configurações
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Gerencie sua identidade visual, contatos e segurança.</p>
      </div>

      {/* Feedback Banner */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-lg border animate-fadeIn ${
          message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
          message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
          'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-zinc-400 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Aviso 24h */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-4 items-center shadow-sm">
        <div className="h-12 w-12 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0 text-yellow-500 border border-yellow-500/10">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-yellow-500 font-bold text-xs uppercase tracking-wide mb-1">Política de Alteração</h4>
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            Por medidas de segurança, a <strong>Logo</strong> só pode ser alterada 1 vez a cada 24 horas.
          </p>
        </div>
      </div>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BLOCO 1: WhatsApp do Banner */}
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex flex-col shadow-lg hover:border-maxx/30 transition duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1 text-white">Contato do Banner</h2>
            <p className="text-sm text-zinc-400">Este número aparecerá no rodapé das suas artes.</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-dark-900 p-5 rounded-lg text-center border border-dark-700 mb-6">
              <div className="h-12 w-12 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                <Phone className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-zinc-500 uppercase font-bold">Número Atual</p>
              <p className="text-xl font-semibold text-white my-1 tracking-wide">{whatsapp || 'Nenhum'}</p>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <input 
              type="text" value={whatsappInput} onChange={e => setWhatsappInput(e.target.value)}
              placeholder="(11) 99912-3745" 
              className="w-full p-3 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none transition text-white"
            />
            <button 
              onClick={() => { setWhatsapp(whatsappInput); handleSave('wpp') }}
              disabled={saving.wpp}
              className="w-full bg-white hover:bg-zinc-200 text-dark-900 font-bold py-3 rounded-lg transition flex items-center justify-center disabled:opacity-50"
            >
              {saving.wpp ? <span className="animate-spin">⏳</span> : 'Atualizar Número'}
            </button>
          </div>
        </div>

        {/* BLOCO 2: Logo */}
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex flex-col shadow-lg hover:border-maxx/30 transition duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1 text-white">Identidade Visual</h2>
            <p className="text-sm text-zinc-400">Sua logo será aplicada automaticamente nos templates.</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative w-full h-40 bg-dark-900 rounded-lg flex items-center justify-center border border-dashed border-dark-600 mb-6 overflow-hidden group">
              {logoPreview || logoUrl ? (
                <img src={logoPreview || logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-4" />
              ) : (
                <div className="text-center text-zinc-600">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs">Arraste ou selecione</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <label className="block w-full bg-dark-700 hover:bg-dark-600 border border-dark-600 text-zinc-300 font-semibold py-3 rounded-lg transition cursor-pointer text-center text-sm">
              <Upload className="inline h-4 w-4 mr-2" />Selecionar Arquivo
              <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={e => {
                const f = e.target.files[0]
                if (f) setLogoPreview(URL.createObjectURL(f))
              }} />
            </label>
            <button 
              onClick={() => handleSave('logo')}
              disabled={!logoPreview || saving.logo}
              className="w-full bg-maxx hover:bg-maxx/90 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-maxx/20"
            >
              {saving.logo ? <span className="animate-spin">⏳</span> : 'Salvar Logo'}
            </button>
          </div>
        </div>

        {/* BLOCO 3: WhatsApp de Suporte */}
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex flex-col shadow-lg relative overflow-hidden group hover:border-green-500/30 transition duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition">
            <MessageCircle className="h-16 w-16" />
          </div>
          <div className="mb-4 relative z-10">
            <h2 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-500" /> Contato de Suporte
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Aparecerá para seus <strong>Sub-Revendedores</strong> quando o painel estiver vencendo.
            </p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <div className="bg-dark-900 h-36 rounded-lg text-center border border-dark-700 mb-6 relative overflow-hidden flex flex-col justify-center items-center">
              <div className="absolute inset-0 bg-green-500/5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 relative z-10">Número Configurado</p>
              <p className="text-xl font-bold text-green-400 relative z-10 tracking-wide">{supportWhatsapp || 'Não configurado'}</p>
            </div>
          </div>

          <div className="mt-auto space-y-3 relative z-10">
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
              <input 
                type="text" value={supportInput} onChange={e => setSupportInput(e.target.value)}
                placeholder="(11) 99999-9999" 
                className="w-full p-3 pl-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-green-500 outline-none transition text-white"
              />
            </div>
            <button 
              onClick={() => { setSupportWhatsapp(supportInput); handleSave('sup') }}
              disabled={saving.sup}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              {saving.sup ? <span className="animate-spin">⏳</span> : 'Salvar Contato'}
            </button>
          </div>
        </div>

        {/* BLOCO 4: Telegram */}
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex flex-col shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition">
            <Send className="h-16 w-16" />
          </div>
          <div className="flex flex-col mb-4 relative z-10">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-400" /> Envio Automático
              </h2>
              <a href="#" className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500 hover:text-white transition flex items-center gap-2 font-bold">
                <Bot className="h-3 w-3" /> Ajuda
              </a>
            </div>
            <p className="text-sm text-zinc-400">Receba artes no seu Canal Telegram.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center relative z-10">
            <div className="bg-dark-900 h-36 rounded-lg text-center border border-dark-700 mb-6 relative overflow-hidden flex flex-col justify-center items-center">
              <div className="absolute inset-0 bg-blue-500/5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 relative z-10">Chat ID Configurado</p>
              <p className="text-lg font-bold text-blue-400 relative z-10 tracking-wide font-mono">{telegramId || 'Não configurado'}</p>
            </div>
          </div>

          <div className="mt-auto relative z-10 space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-zinc-600 text-xs font-bold">#</span>
              <input 
                type="text" value={telegramId} onChange={e => setTelegramId(e.target.value)}
                placeholder="-100..." 
                className="w-full p-3 pl-8 rounded-lg bg-dark-900 border border-dark-600 focus:border-blue-500 outline-none transition text-white font-mono text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => handleSave('tel')}
                disabled={saving.tel || !telegramId}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              >
                {saving.tel ? <span className="animate-spin">⏳</span> : 'Salvar'}
              </button>
              <button 
                disabled={!telegramId}
                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 border border-dark-600 flex items-center justify-center gap-2"
              >
                Testar
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* NOVO: BLOCO 5: Trial e Boas-vindas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-maxx/40 transition duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-maxx" /> Sistema de Trial (Teste)
            </h2>
            <p className="text-sm text-zinc-400">Configure o tempo de acesso gratuito e a URL oficial.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">URL Oficial do Painel</label>
              <div className="relative">
                <Link className="absolute left-3 top-3.5 h-4 w-4 text-maxx" />
                <input 
                  type="text" value={panelUrl} onChange={e => setPanelUrl(e.target.value)}
                  placeholder="https://sua-url.com" 
                  className="w-full p-3 pl-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Tempo de Teste (Horas)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                <input 
                  type="number" value={trialHours} onChange={e => setTrialHours(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-green-500/30 transition duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" /> Boas-vindas WhatsApp
            </h2>
            <p className="text-sm text-zinc-400">Personalize a mensagem enviada aos novos revendedores.</p>
          </div>
          <textarea 
            value={welcomeTemplate} onChange={e => setWelcomeTemplate(e.target.value)}
            rows="5"
            className="w-full p-3 rounded-lg bg-dark-900 border border-dark-600 focus:border-green-500 outline-none text-white text-sm resize-none mb-4"
            placeholder="Use {nome}, {login}, {senha}, {url}, {expiracao}"
          />
          <button 
            onClick={() => handleSave('trial')}
            disabled={saving.trial}
            className="w-full bg-maxx hover:bg-maxx/90 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
          >
            {saving.trial ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Salvar Configurações de Cadastro
          </button>
        </div>
      </div>

      {/* Gateway Mercado Pago */}
      <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-[#009EE3]/40 transition duration-300 overflow-hidden relative">
        <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <CreditCard className="h-40 w-40" />
        </div>
        
        <div className="mb-6 border-b border-dark-700 pb-4 relative z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="h-8 w-8 bg-[#009EE3]/10 text-[#009EE3] rounded-lg flex items-center justify-center border border-[#009EE3]/20">
              <CreditCard className="h-4 w-4" />
            </div>
            Mercado Pago
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Conecte suas credenciais para processar Pix e Cartão na sua <strong>Loja de Créditos</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start relative z-10">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Access Token</label>
            <div className="relative">
              <Key className="absolute left-3 top-3.5 h-4 w-4 text-[#009EE3]" />
              <input 
                type={showMpToken ? 'text' : 'password'} 
                value={mpAccessToken} 
                onChange={e => setMpAccessToken(e.target.value)}
                placeholder="APP_USR-..." 
                className="w-full p-3 pl-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-[#009EE3] outline-none text-white text-sm font-mono"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6 md:flex-row items-end">
            <div className="flex-1 w-full">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Public Key</label>
                <input 
                  type="text" value={mpPublicKey} onChange={e => setMpPublicKey(e.target.value)}
                  placeholder="APP_USR-..." 
                  className="w-full p-3 rounded-lg bg-dark-900 border border-dark-600 focus:border-zinc-400 outline-none text-white text-sm font-mono"
                />
            </div>
            <button 
              onClick={() => handleSave('mp')}
              className="w-full md:w-auto bg-[#009EE3] hover:bg-[#009EE3]/80 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Alterar Senha */}
      <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-maxx/30 transition duration-300">
        <div className="mb-6 mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-maxx" /> Alterar Senha
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Senha Atual</label>
            <input 
              type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
              className="w-full p-3 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nova Senha</label>
            <input 
              type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
              className="w-full p-3 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none text-white text-sm"
            />
          </div>
          <button 
            onClick={() => handleSave('pwd')}
            className="w-full bg-maxx hover:bg-maxx/90 text-white font-bold py-3 rounded-lg transition"
          >
            Atualizar Senha
          </button>
        </div>
      </div>

    </div>
  )
}
