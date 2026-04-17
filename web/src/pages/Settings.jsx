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
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileTg, setProfileTg] = useState('')

  // === Configurações de Trial e Entrega ===
  const [panelUrl, setPanelUrl] = useState('')
  const [trialHours, setTrialHours] = useState('24')
  const [welcomeTemplate, setWelcomeTemplate] = useState('')

  // === Preferências do Painel ===
  const [showEarnings, setShowEarnings] = useState(true)
  const [persistFilters, setPersistFilters] = useState(false)
  const [masterPermission, setMasterPermission] = useState(false)
  const [panelLanguage, setPanelLanguage] = useState('pt-BR')

  // === 2FA ===
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [twoFaLoading, setTwoFaLoading] = useState(false)
  const [twoFaMethod, setTwoFaMethod] = useState('app') // 'app' | 'telegram'
  const [twoFaQr, setTwoFaQr] = useState('')
  const [twoFaSecret, setTwoFaSecret] = useState('')
  const [twoFaCode, setTwoFaCode] = useState('')
  const [twoFaStep, setTwoFaStep] = useState('idle') // idle | type-select | setup | done
  const [copiedSecret, setCopiedSecret] = useState(false)

  // === Sessões Ativas ===
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome — Windows 11', icon: 'monitor', ip: '187.190.45.12', location: 'São Paulo, BR', active: true, time: 'Agora' },
    { id: 2, device: 'Safari — iPhone 14', icon: 'phone', ip: '189.62.100.55', location: 'Rio de Janeiro', active: false, time: 'há 2h' },
    { id: 3, device: 'Firefox — macOS', icon: 'laptop', ip: '200.173.201.99', location: 'Belo Horizonte', active: false, time: 'há 1d' },
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

  // === Google Integration State ===
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  useEffect(() => {
    loadSettings()
    loadTwoFaStatus()
    loadWaStatus()
    loadGoogleStatus()
    loadDevices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDevices = async () => {
    try {
      setSessionsLoading(true)
      const bid = localStorage.getItem('browser_id')
      const res = await api.get('/auth/devices', {
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
      const response = await api.get('/settings')
      if (response.data) {
        setWhatsapp(response.data.whatsapp || '')
        setWhatsappInput(response.data.whatsapp || '')
        setSupportWhatsapp(response.data.support_whatsapp || '')
        setSupportInput(response.data.support_whatsapp || '')
        setTelegramId(response.data.telegram_id || '')
        setLogoUrl(response.data.logo_url || null)
        setProfileName(response.data.name || '')
        setProfileEmail(response.data.email || '')
        setPanelUrl(response.data.panel_url || '')
        setTrialHours(response.data.trial_hours || '24')
        setWelcomeTemplate(response.data.welcome_template || '')
        setMpAccessToken(response.data.mp_access_token || '')
        setMpPublicKey(response.data.mp_public_key || '')
        
        if (response.data.showEarnings !== undefined) setShowEarnings(response.data.showEarnings)
        if (response.data.persistFilters !== undefined) setPersistFilters(response.data.persistFilters)
        if (response.data.masterPermission !== undefined) setMasterPermission(response.data.masterPermission)
        if (response.data.panelLanguage) setPanelLanguage(response.data.panelLanguage)
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    }
  }

  const loadTwoFaStatus = async () => {
    try {
      const { data } = await api.get('/auth/2fa/status')
      setTwoFaEnabled(data.enabled)
    } catch (err) { console.error(err) }
  }

  const loadWaStatus = useCallback(async (forceConnect = false) => {
    if (forceConnect && !localStorage.getItem('wa_terms_accepted')) {
      setWaTermsModalOpen(true)
      return
    }
    setWaStatus('loading')
    try {
      const { data } = await api.get('/whatsapp/status')
      setWaStatus(data.status)
      if (data.status === 'connected') {
        loadWaGroups()
      } else if (data.status === 'disconnected' && data.qrcode) {
        setWaQrCode(data.qrcode)
      }
    } catch (err) {
      setWaStatus('disconnected')
    }
  }, [])

  const loadGoogleStatus = async () => {
    setGoogleLoading(true)
    try {
      const { data } = await api.get('/google/status')
      setGoogleConnected(data.connected)
      setGoogleEmail(data.email || '')
    } catch (err) {
      console.error(err)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSave = async (key) => {
    setSaving(prev => ({ ...prev, [key]: true }))
    try {
      let value = ''
      let payloadKey = key

      if (key === 'whatsapp' || key === 'wpp') { value = whatsappInput; payloadKey = 'whatsapp'; }
      if (key === 'support' || key === 'sup') {
        value = supportInput
        payloadKey = 'support_whatsapp'
      }
      if (key === 'telegram' || key === 'tel') {
        value = telegramId
        payloadKey = 'telegram_id'
      }
      if (key === 'mp' || key === 'mp_credentials') {
        await api.post('/settings', { mp_access_token: mpAccessToken, mp_public_key: mpPublicKey })
        showFeedback('Credenciais Mercado Pago salvas!')
        return
      }
      if (key === 'profile') {
        await api.post('/settings', { name: profileName, email: profileEmail, phone: profilePhone, telegram_username: profileTg })
        showFeedback('Perfil atualizado!')
        return
      }
      if (key === 'trial') {
        await api.post('/settings', { panel_url: panelUrl, trial_hours: trialHours, welcome_template: welcomeTemplate })
        showFeedback('Configurações de Trial salvas!')
        return
      }
      if (key === 'earnings' || key === 'filters' || key === 'master' || key === 'language') {
        const payload = {
          showEarnings: key === 'earnings' ? !showEarnings : showEarnings,
          persistFilters: key === 'filters' ? !persistFilters : persistFilters,
          masterPermission: key === 'master' ? !masterPermission : masterPermission,
          panelLanguage: key === 'language' ? value : panelLanguage
        }
        await api.post('/settings', payload)
        showFeedback('Preferencia salva!')
        return
      }

      await api.post('/settings', { [payloadKey]: value })
      if (key === 'whatsapp' || key === 'wpp') setWhatsapp(value)
      if (key === 'support' || key === 'sup') setSupportWhatsapp(value)
      
      showFeedback('Alteração salva com sucesso!')
    } catch (err) {
      showFeedback('Erro ao salvar alteração.', 'error')
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSaving(prev => ({ ...prev, logo: true }))
    const formData = new FormData()
    formData.append('logo', file)

    try {
      const { data } = await api.post('/settings/logo', formData)
      setLogoUrl(data.logo_url)
      setLogoPreview(null)
      showFeedback('Logo atualizada!')
    } catch (err) {
      showFeedback('Erro ao subir logo.', 'error')
    } finally {
      setSaving(prev => ({ ...prev, logo: false }))
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPwd) return
    setSaving(prev => ({ ...prev, password: true }))
    try {
      await api.post('/settings/password', { currentPassword: currentPwd, newPassword: newPwd })
      setCurrentPwd('')
      setNewPwd('')
      showFeedback('Senha alterada!')
    } catch (err) {
      showFeedback('Senha atual incorreta.', 'error')
    } finally {
      setSaving(prev => ({ ...prev, password: false }))
    }
  }

  const loadWaGroups = async () => {
    setWaGroupsLoading(true)
    try {
      const { data } = await api.get('/whatsapp/groups')
      setWaGroups(data.groups || [])
    } catch (err) {
      console.error(err)
    } finally {
      setWaGroupsLoading(false)
    }
  }

  const handleWaConnect = async () => {
    if (!localStorage.getItem('wa_terms_accepted')) {
      setWaTermsModalOpen(true)
      return
    }
    setWaLoadingAction(true)
    try {
      const { data } = await api.get('/whatsapp/connect')
      setWaQrCode(data.qrcode)
      // Iniciar polling
      const poll = setInterval(async () => {
        const { data: statusData } = await api.get('/whatsapp/status')
        if (statusData.status === 'connected') {
          setWaStatus('connected')
          setWaQrCode('')
          clearInterval(poll)
          loadWaGroups()
        }
      }, 3000)
      setWaPolling(poll)
    } catch (err) {
      showFeedback('Erro ao gerar QR Code', 'error')
    } finally {
      setWaLoadingAction(false)
    }
  }

  const handleWaDisconnect = async () => {
    if (!window.confirm('Deseja desconectar o WhatsApp?')) return
    setWaLoadingAction(true)
    try {
      await api.post('/whatsapp/disconnect')
      setWaStatus('disconnected')
      setWaQrCode('')
      setWaGroups([])
      showFeedback('WhatsApp desconectado.', 'warning')
    } catch (err) {
      showFeedback('Erro ao desconectar.', 'error')
    } finally {
      setWaLoadingAction(false)
    }
  }

  const handleToggleAutoPost = async () => {
    const next = !waAutoPost
    setWaAutoPost(next)
    try {
      await api.post('/whatsapp/autopost', { enabled: next, group_id: waSelectedGroup })
    } catch (err) {
      showFeedback('Erro ao salvar autopost.', 'error')
    }
  }

  const handleToggleChannelAutoPost = async () => {
    const next = !waChannelAutoPost
    setWaChannelAutoPost(next)
    try {
      await api.post('/whatsapp/channel-autopost', { enabled: next, channel_id: waChannelId })
    } catch (err) {
      showFeedback('Erro ao salvar canal post.', 'error')
    }
  }

  const handleResolveChannel = async () => {
    if (!waChannelLink) return
    setWaResolvingChannel(true)
    try {
      const { data } = await api.post('/whatsapp/resolve-channel', { link: waChannelLink })
      setWaChannelId(data.id)
      setWaChannelName(data.name)
      showFeedback(`Canal "${data.name}" vinculado!`)
    } catch (err) {
      showFeedback('Link de canal inválido.', 'error')
    } finally {
      setWaResolvingChannel(false)
    }
  }

  const handleGoogleConnect = async () => {
    setGoogleLoading(true)
    try {
      const { data } = await api.get('/google/auth-url')
      window.open(data.url, '_blank', 'width=600,height=700')
      // Poll por status
      const poll = setInterval(async () => {
        const { data: st } = await api.get('/google/status')
        if (st.connected) {
          setGoogleConnected(true)
          setGoogleEmail(st.email)
          clearInterval(poll)
          showFeedback('Google Conectado!')
        }
      }, 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleDisconnect = async () => {
    if (!window.confirm('Deseja desconectar sua conta Google?')) return
    setGoogleLoading(true)
    try {
      await api.post('/google/disconnect')
      setGoogleConnected(false)
      setGoogleEmail('')
      showFeedback('Google Desconectado.', 'warning')
    } catch (err) { console.error(err) }
    finally { setGoogleLoading(false) }
  }

  const acceptWaTerms = () => {
    localStorage.setItem('wa_terms_accepted', 'true')
    setWaTermsModalOpen(false)
    handleWaConnect()
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
          message.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
          'bg-red-500/10 border-red-500/20 text-red-400'
        } backdrop-blur-md animate-in slide-in-from-right-8`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <SettingsIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Configurações</h1>
            <p className="text-zinc-500 text-sm font-medium">Gerencie sua identidade visual, contatos e segurança.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Seção trial e entrega */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-white">Sistema de Trial (Teste)</h2>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">Configure o tempo de acesso gratuito e a URL oficial.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase ml-1 mb-2 block">Tempo de Teste (Horas)</label>
                  <select 
                    value={trialHours} 
                    onChange={e => setTrialHours(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/20 transition outline-none"
                  >
                    <option value="1">01 Hora</option Fundamentos</option>
                    <option value="1">01 Hora</option>
                    <option value="2">02 Horas</option>
                    <option value="6">06 Horas</option>
                    <option value="12">12 Horas</option>
                    <option value="24">24 Horas</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase ml-1 mb-2 block">Link do Painel</label>
                  <input 
                    type="text" 
                    value={panelUrl} 
                    onChange={e => setPanelUrl(e.target.value)}
                    placeholder="https://meu-painel.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/20 transition outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSave('trial')}
                disabled={saving.trial}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition shadow-lg shadow-orange-500/20"
              >
                {saving.trial ? 'Salvando...' : 'Salvar Configurações de Cadastro'}
              </button>
            </div>
          </div>

          {/* Boas vindas WhatsApp */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-white">Boas-vindas WhatsApp</h2>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">Personalize a mensagem enviada aos novos revendedores.</p>
              <textarea 
                value={welcomeTemplate}
                onChange={e => setWelcomeTemplate(e.target.value)}
                placeholder="Olá {nome}, seu acesso foi criado..."
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-orange-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Contato do Banner */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
             <div className="flex items-center gap-3 mb-4">
               <Phone className="h-5 w-5 text-orange-500" />
               <h3 className="font-bold text-white">Contato do Banner</h3>
             </div>
             <p className="text-[11px] text-zinc-500 mb-4">Este número aparecerá no rodapé das suas artes.</p>
             <div className="space-y-3">
               <input 
                 type="text"
                 value={whatsappInput}
                 onChange={e => setWhatsappInput(e.target.value)}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm"
                 placeholder="551199999999"
               />
               <button 
                 onClick={() => handleSave('wpp')}
                 disabled={saving.wpp}
                 className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
               >
                 {saving.wpp ? 'Salvando...' : 'Atualizar Número'}
               </button>
               {whatsapp && (
                 <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Número Atual: {whatsapp}</span>
                 </div>
               )}
             </div>
          </div>

          {/* Identidade Visual */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold text-white">Identidade Visual</h3>
            </div>
            <p className="text-[11px] text-zinc-500 mb-6">Sua logo será aplicada automaticamente nos templates.</p>
            
            <div className="flex flex-col items-center">
              <label 
                className="w-full aspect-square md:aspect-video rounded-2xl border-2 border-dashed border-zinc-800 hover:border-orange-500/50 hover:bg-orange-500/5 flex flex-col items-center justify-center gap-3 cursor-pointer transition relative overflow-hidden group mb-4"
              >
                {logoUrl || logoPreview ? (
                  <img src={logoPreview || logoUrl} alt="Logo" className="w-full h-full object-contain p-4 group-hover:opacity-30 transition" />
                ) : (
                  <Upload className="h-8 w-8 text-zinc-600 group-hover:text-orange-500 transition" />
                )}
                <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition">
                   <span className="text-[10px] font-black text-white uppercase bg-orange-500 px-3 py-1 rounded-full">Trocar Logo</span>
                </div>
                {!logoUrl && !logoPreview && <span className="text-[10px] font-bold text-zinc-600 uppercase">Arraste ou selecione</span>}
                <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
              </label>
              {saving.logo && <div className="flex items-center gap-2 text-[10px] text-orange-500 animate-pulse font-bold"><Loader2 className="h-3 w-3 animate-spin"/> ATUALIZANDO SERVIDOR...</div>}
            </div>
          </div>

          {/* Suporte */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-white">Contato de Suporte</h3>
            </div>
            <p className="text-[11px] text-zinc-500 mb-4">Aparecerá para seus Sub-Revendedores quando o painel estiver vencendo.</p>
            <input 
              type="text"
              value={supportInput}
              onChange={e => setSupportInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm mb-3"
              placeholder="Ex: 554799999999"
            />
            <button 
              onClick={() => handleSave('sup')}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition"
            >
              Salvar Contato
            </button>
            <div className="mt-3 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest block mb-1">Número Configurado</span>
              <span className="text-xs text-white font-medium">{supportWhatsapp || 'Não configurado'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Envio Automático Telegram */}
         <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-sky-400" />
                <h2 className="text-lg font-bold text-white">Envio Automático</h2>
              </div>
              <a href="#" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition"><ExternalLink className="h-4 w-4" /></a>
            </div>
            <p className="text-xs text-zinc-500 mb-6">Receba artes no seu Canal Telegram.</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 mb-2 block">Seu Telegram Chat ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={telegramId}
                    onChange={e => setTelegramId(e.target.value)}
                    placeholder="Ex: @meucanal ou -100XXXX"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button 
                    onClick={() => handleSave('tel')}
                    className="px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex items-center gap-3">
                 <Bot className="h-5 w-5 text-sky-400" />
                 <p className="text-[10px] font-medium text-sky-400 leading-tight">Certifique-se que o Bot @MaxxManagerBot é Administrador do seu canal.</p>
              </div>
            </div>
         </div>

         {/* Mercado Pago */}
         <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-5 w-5 text-sky-500" />
              <h2 className="text-lg font-bold text-white">Mercado Pago</h2>
            </div>
            <p className="text-xs text-zinc-500 mb-6">Conecte suas credenciais para processar Pix e Cartão na sua Loja de Créditos.</p>
            <div className="space-y-4">
              <input 
                type="password"
                value={mpAccessToken}
                onChange={e => setMpAccessToken(e.target.value)}
                placeholder="Access Token (APP_USR-...)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none shadow-inner"
              />
              <input 
                type="text"
                value={mpPublicKey}
                onChange={e => setMpPublicKey(e.target.value)}
                placeholder="Public Key (APP_USR-...)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none shadow-inner"
              />
              <button 
                onClick={() => handleSave('mp')}
                disabled={saving.mp}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black transition shadow-lg shadow-sky-500/20"
              >
                {saving.mp ? 'Conectando...' : 'Conectar Gateway'}
              </button>
            </div>
         </div>

         {/* Alterar Senha */}
         <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white">Alterar Senha</h2>
            </div>
            <div className="space-y-3">
               <input 
                 type="password" 
                 value={currentPwd}
                 onChange={e => setCurrentPwd(e.target.value)}
                 placeholder="Senha Atual" 
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" 
               />
               <input 
                 type="password" 
                 value={newPwd}
                 onChange={e => setNewPwd(e.target.value)}
                 placeholder="Nova Senha" 
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" 
               />
               <button 
                 onClick={handleUpdatePassword}
                 disabled={saving.password}
                 className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition"
               >
                 {saving.password ? 'Alterando...' : 'Confirmar Mudança'}
               </button>
            </div>
         </div>

         {/* Automação WhatsApp Status */}
         <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <Radio className="h-5 w-5 text-emerald-500" />
                 <h2 className="text-lg font-bold text-white">Automação WhatsApp</h2>
               </div>
               <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                 waStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
               }`}>
                 {waStatus === 'connected' ? 'Ativo' : 'Offline'}
               </div>
            </div>
            <p className="text-xs text-zinc-500 mb-6 font-medium leading-relaxed">Conecte seu celular para postar artes automaticamente nos seus grupos.</p>
            
            {waStatus === 'connected' ? (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-inner">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                         <Smartphone className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Dispositivo Pareado</p>
                        <p className="text-[10px] text-zinc-500 font-medium">Auto-postagem habilitada</p>
                      </div>
                   </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Grupo Destino</label>
                  <select 
                    value={waSelectedGroup} 
                    onChange={e => setWaSelectedGroup(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm"
                  >
                    <option value="">Selecione um grupo...</option>
                    {waGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <button 
                    onClick={handleToggleAutoPost}
                    className={`w-full py-3 rounded-xl text-xs font-black transition ${waAutoPost ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 text-white'}`}
                  >
                    {waAutoPost ? 'BOT ATIVO NO GRUPO' : 'ATIVAR BOT NO GRUPO'}
                  </button>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <button
                    onClick={handleWaDisconnect}
                    className="w-full py-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold rounded-xl transition"
                  >
                    Desconectar Celular
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex flex-col items-center">
                {waQrCode ? (
                  <div className="bg-white p-4 rounded-2xl shadow-2xl animate-in zoom-in-95">
                    <img src={`data:image/png;base64,${waQrCode}`} alt="QR Code WhatsApp" className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="h-48 w-48 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-800">
                    <QrCode className="h-12 w-12" />
                  </div>
                )}
                <button 
                  onClick={handleWaConnect}
                  disabled={waLoadingAction}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-sm rounded-2xl transition flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/20"
                >
                  {waLoadingAction ? <Loader2 className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5 group-hover:scale-110 transition" />}
                  {waQrCode ? 'REGERAR QR-CODE' : 'GERAR QR-CODE'}
                </button>
              </div>
            )}
         </div>
         
         {/* Google Integration */}
         <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-blue-500" />
                <div>
                  <h2 className="text-xl font-bold text-white">Google Integration</h2>
                  <p className="text-xs text-zinc-500 font-medium">Sincronize sua conta Google para serviços avançados.</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                googleConnected ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {googleConnected ? 'Conectado' : 'Indisponível'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-2xl border transition ${googleConnected ? 'bg-blue-500/5 border-blue-500/10' : 'bg-zinc-950/50 border-zinc-800 opacity-50'}`}>
                 <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
                    <Globe className="h-5 w-5 text-blue-400" />
                 </div>
                 <p className="text-xs font-bold text-white mb-1">Google Drive</p>
                 <p className="text-[10px] text-zinc-500">Backup automático de templates.</p>
              </div>

              <div className={`p-4 rounded-2xl border transition ${googleConnected ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-zinc-950/50 border-zinc-800 opacity-50'}`}>
                 <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-emerald-400" />
                 </div>
                 <p className="text-xs font-bold text-white mb-1">Google Contacts</p>
                 <p className="text-[10px] text-zinc-500">Sincronização de leads.</p>
              </div>

              <div className="flex flex-col justify-center">
                {googleConnected ? (
                  <div className="space-y-4">
                    <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                       <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">{googleEmail}</span>
                       <CheckCircle className="h-3 w-3 text-emerald-500" />
                    </div>
                    <button 
                      onClick={handleGoogleDisconnect}
                      disabled={googleLoading}
                      className="w-full py-3 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/5 transition"
                    >
                      {googleLoading ? 'DESCONECTANDO...' : 'DESCONECTAR GOOGLE'}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleGoogleConnect}
                    disabled={googleLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    CONECTAR COM GOOGLE
                  </button>
                )}
              </div>
            </div>
         </div>
      </div>

      {/* Perfil e Segurança Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Perfil */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
           <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-white">Perfil do Usuário</h2>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Nome" className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm" />
              <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} placeholder="Email" className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm opacity-50 cursor-not-allowed" disabled />
              <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="WhatsApp Pessoal" className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm" />
              <input type="text" value={profileTg} onChange={e => setProfileTg(e.target.value)} placeholder="Telegram Username" className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm" />
           </div>
           <button onClick={() => handleSave('profile')} className="w-full mt-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition">Salvar Perfil</button>
        </div>

        {/* Preferências */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
           <div className="flex items-center gap-3 mb-6">
              <SlidersHorizontal className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-white">Preferências</h2>
           </div>
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Mostrar Ganhos na Dashboard</span>
                <button onClick={() => handleSave('earnings')}>{showEarnings ? <ToggleRight className="h-8 w-8 text-orange-500" /> : <ToggleLeft className="h-8 w-8 text-zinc-700" />}</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Filtros Persistentes</span>
                <button onClick={() => handleSave('filters')}>{persistFilters ? <ToggleRight className="h-8 w-8 text-orange-500" /> : <ToggleLeft className="h-8 w-8 text-zinc-700" />}</button>
              </div>
           </div>
        </div>
      </div>

      {/* MODAL TERMOS WHATSAPP */}
      {waTermsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-orange-500/10 rounded-3xl flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4">Boas Práticas & Avisos</h2>
            <div className="space-y-4 mb-8">
              <p className="text-sm text-zinc-400 leading-relaxed">Para garantir a estabilidade da sua conta WhatsApp, siga estas recomendações:</p>
              <ul className="space-y-3">
                {['O uso de contas novas não é recomendado.', 'Evite disparos em massa para quem não tem seu contato salvo.', 'O sistema não se responsabiliza por banimentos.'].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-500">
                    <CheckCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={acceptWaTerms} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-zinc-950 font-black rounded-2xl transition active:scale-95">LI E CONCORDO COM OS TERMOS</button>
          </div>
        </div>
      )}
    </div>
  )
}
