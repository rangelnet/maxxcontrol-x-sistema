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
      } catch (err) { }

      if (opt.whatsapp) { setWhatsapp(opt.whatsapp); setWhatsappInput(opt.whatsapp); }
      // ... (resto dos campos)
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
    // FIXME: Módulo logo exige base64 ou upload. Fica como mockup.
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
              if (gRes.data.last_sync) setGoogleLastSync(gRes.data.last_sync)
              clearInterval(interval)
              showFeedback('Google Conectado com sucesso!', 'success')
            }
          } catch (e) { }
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
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-lg border animate-fadeIn ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
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



    {/* NOVO: BLOCO 5: Trial e Boas-vindas (MOVIDO PARA O TOPO) */ }
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

    {/* Grid 2x2 */ }
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* BLOCO 1: WhatsApp do Banner */ }
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

    {/* BLOCO 2: Logo */ }
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

    {/* BLOCO 3: WhatsApp de Suporte */ }
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

        </div>

    {/* BLOCO 4: Telegram */ }
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


    {/* ========================================== */ }
  {/* GATEWAY DE PAGAMENTO: MERCADO PAGO         */ }
  {/* ========================================== */ }
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
        Conecte suas credenciais do MercadoPago para processar Pix e Cartão na sua <strong>Loja de Créditos</strong> aos revendedores.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start relative z-10">

      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Access Token (Produção)</label>
        <div className="relative">
          <Key className="absolute left-3 top-3.5 h-4 w-4 text-[#009EE3]" />
          <input
            type={showMpToken ? 'text' : 'password'}
            value={mpAccessToken}
            onChange={e => setMpAccessToken(e.target.value)}
            placeholder="APP_USR-123456789..."
            className="w-full p-3 pl-10 pr-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-[#009EE3] outline-none transition text-white text-sm font-mono"
          />
          <button onClick={() => setShowMpToken(!showMpToken)} className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition">
            {showMpToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row items-end">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Public Key (Produção)</label>
          <div className="relative">
            <Shield className="absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
            <input
              type="text"
              value={mpPublicKey}
              onChange={e => setMpPublicKey(e.target.value)}
              placeholder="APP_USR-..."
              className="w-full p-3 pl-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-zinc-400 outline-none transition text-white text-sm font-mono"
            />
          </div>
        </div>

        <button
          onClick={() => handleSave('mp')}
          disabled={saving.mp || (!mpAccessToken && !mpPublicKey)}
          className="w-full md:w-auto bg-[#009EE3] hover:bg-[#009EE3]/80 text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-50 shadow-lg shadow-[#009EE3]/20 flex items-center justify-center gap-2 h-12"
        >
          {saving.mp ? <span className="animate-spin">⏳</span> : 'Salvar API'}
        </button>
      </div>

    </div>
  </div>

  {/* Alterar Senha */ }
  <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-maxx/30 transition duration-300">
    <div className="mb-6 border-b border-dark-700 pb-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Lock className="h-5 w-5 text-maxx" /> Alterar Senha
      </h2>
      <p className="text-sm text-zinc-400">Mantenha sua conta segura atualizando sua senha periodicamente.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Senha Atual</label>
        <div className="relative">
          <Key className="absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
          <input
            type={showPwd ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
            placeholder="••••••"
            className="w-full p-3 pl-10 pr-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none transition text-white text-sm"
          />
          <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition">
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Nova Senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
          <input
            type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full p-3 pl-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none transition text-white text-sm"
          />
        </div>
      </div>
      <button
        onClick={() => handleSave('pwd')}
        disabled={saving.pwd || !currentPwd || !newPwd}
        className="w-full bg-maxx hover:bg-maxx/90 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
      >
        {saving.pwd ? <span className="animate-spin">⏳</span> : 'Atualizar Senha'}
      </button>
    </div>
  </div>

  {/* Automação WhatsApp */ }
  <div className="glass-effect rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group hover:border-green-500/20 transition duration-300">
    <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
      <MessageCircle className="h-28 w-28" />
    </div>

    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-white/5 flex-wrap gap-2 relative z-10">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-500" /> Automação WhatsApp
          <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-black uppercase">NOVO</span>
        </h2>
        <p className="text-sm text-zinc-400 mt-0.5">Conecte seu celular para postar artes automaticamente nos seus grupos.</p>
      </div>
      {waStatus === 'connected' && (
        <button
          onClick={() => loadWaGroups()}
          disabled={waGroupsLoading}
          className="flex items-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg border border-white/10 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${waGroupsLoading ? 'animate-spin' : ''}`} />
          Atualizar Grupos
        </button>
      )}
    </div>

    <div className="p-6 relative z-10 flex flex-col md:flex-row gap-8">

      {/* === COL ESQUERDA: QR Code / Status === */}
      <div className="flex-1">
        {/* Loading */}
        {waStatus === 'loading' && (
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-3" />
            <p className="text-sm text-zinc-400">Verificando conexão...</p>
          </div>
        )}

        {/* Desconectado com QR Code visible */}
        {waStatus === 'disconnected' && waQrCode && (
          <div className="bg-zinc-900 border border-yellow-500/30 rounded-xl p-6 text-center flex flex-col items-center h-full">
            <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5" /> Escaneie com o WhatsApp
            </p>
            <div className="bg-white p-3 rounded-xl inline-block mb-3 shadow-lg">
              <img src={`data:image/png;base64,${waQrCode}`} alt="QR Code WhatsApp" className="w-44 h-44 object-contain" />
            </div>
            <p className="text-[10px] text-zinc-500">Atualizando automaticamente a cada 5s...</p>
          </div>
        )}

        {/* Desconectado — botão conectar */}
        {waStatus === 'disconnected' && !waQrCode && (
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full">
            <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500 border border-white/5">
              <QrCode className="h-7 w-7" />
            </div>
            <h3 className="text-white font-bold mb-2">Aparelho Desconectado</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs mx-auto leading-relaxed">
              Clique abaixo para gerar o QR Code e conectar o WhatsApp do seu negócio.
            </p>
            <button
              onClick={() => loadWaStatus(true)}
              disabled={waLoadingAction}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-green-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {waLoadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              Conectar Aparelho (QR Code)
            </button>
          </div>
        )}

        {/* Conectado */}
        {waStatus === 'connected' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full shadow-inner">
            <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.25)]">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-green-400 font-bold mb-1 text-lg">Aparelho Conectado</h3>
            <p className="text-xs text-zinc-300 mb-6">Sua sessão está ativa e pronta para enviar.</p>
            <button
              onClick={disconnectWa}
              disabled={waLoadingAction}
              className="bg-zinc-900 border border-red-500/40 hover:bg-red-500/10 text-red-400 font-bold py-2.5 px-6 rounded-xl transition text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {waLoadingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              Desconectar Celular
            </button>
          </div>
        )}
      </div>

      {/* === COL DIREITA: Configurações (só ativa se connected) === */}
      <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${waStatus !== 'connected' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>

        {/* 1. Selecionar Grupo */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-white/10">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">
            1. Selecione o Grupo Destino
          </label>
          <p className="text-[11px] text-zinc-500 mb-3">O robô postará as artes geradas neste grupo.</p>

          {/* Aviso admin */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-3 flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-200 leading-snug">
              O robô só posta em grupos onde o número conectado seja <strong>Administrador</strong> ou <strong>Criador</strong>.
            </p>
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <select
              value={waSelectedGroup}
              onChange={e => setWaSelectedGroup(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg py-3 pl-9 pr-4 text-white text-sm focus:border-green-500 outline-none appearance-none cursor-pointer"
            >
              <option value="">-- Selecione um Grupo --</option>
              {waGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {waGroupsLoading && (
            <div className="mt-2 text-xs text-yellow-500 flex items-center gap-2 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
              <Loader2 className="h-3 w-3 animate-spin" /> Buscando grupos...
            </div>
          )}
          {!waGroupsLoading && waGroups.length === 0 && waStatus === 'connected' && (
            <div className="mt-2 text-xs text-zinc-500 flex items-center gap-2 bg-zinc-800 p-2 rounded border border-white/10">
              <AlertTriangle className="h-3 w-3" /> Nenhum grupo encontrado.
            </div>
          )}
        </div>

        {/* 2. Canal WhatsApp (Newsletter) */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-white/10">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">
            2. Canal WhatsApp (Opcional)
          </label>
          <p className="text-[11px] text-zinc-500 mb-3">
            Cole o link de convite do seu canal para enviar artes lá também.
          </p>

          {waChannelName ? (
            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-green-500" />
                <span className="text-sm text-green-400 font-bold">{waChannelName}</span>
              </div>
              <button onClick={removeChannel} className="text-red-400 hover:text-red-300 text-xs bg-red-500/10 hover:bg-red-500/20 p-1.5 rounded transition">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={waChannelLink}
                  onChange={e => setWaChannelLink(e.target.value)}
                  placeholder="https://whatsapp.com/channel/..."
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg py-3 pl-9 pr-3 text-white text-sm focus:border-green-500 outline-none"
                />
              </div>
              <button
                onClick={resolveChannel}
                disabled={!waChannelLink || waResolvingChannel}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
              >
                {waResolvingChannel ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* 3. Toggles de Automação */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-white/10">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 block">3. Postagem Automática</label>

          {/* Switch GRUPO */}
          <div
            onClick={toggleWaAutoPost}
            className="flex items-center justify-between cursor-pointer group p-3 rounded-lg bg-zinc-800 border border-white/10 hover:border-green-500/40 transition"
          >
            <div>
              <span className="text-sm font-bold text-white block group-hover:text-green-400 transition">
                {waAutoPost ? 'Grupo: Robô Ligado' : 'Grupo: Robô Desligado'}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Posta no grupo assim que a arte for gerada.</span>
            </div>
            <div className="relative">
              <div className={`w-14 h-7 rounded-full transition shadow-inner ${waAutoPost ? 'bg-green-500' : 'bg-zinc-700'}`} />
              <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow transition-transform ${waAutoPost ? 'translate-x-7' : ''}`} />
            </div>
          </div>

          {/* Switch CANAL (só mostra se tiver canal vinculado) */}
          {waChannelId && (
            <div
              onClick={toggleWaChannelAutoPost}
              className="flex items-center justify-between cursor-pointer group p-3 rounded-lg bg-zinc-800 border border-white/10 hover:border-green-500/40 transition mt-3"
            >
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-green-400 transition">
                  {waChannelAutoPost ? 'Canal: Robô Ligado' : 'Canal: Robô Desligado'}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Posta no canal assim que a arte for gerada.</span>
              </div>
              <div className="relative">
                <div className={`w-14 h-7 rounded-full transition shadow-inner ${waChannelAutoPost ? 'bg-green-500' : 'bg-zinc-700'}`} />
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow transition-transform ${waChannelAutoPost ? 'translate-x-7' : ''}`} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* ======================== MODAL BOAS PRÁTICAS ======================== */ }
  {
    waTermsModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8 relative overflow-hidden">
          {/* Faixa verde topo */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500" />

          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shrink-0">
              <Bot className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Boas Práticas de Automação</h3>
              <p className="text-xs text-zinc-400">Instruções para o uso do robô no seu WhatsApp.</p>
            </div>
          </div>

          <div className="bg-zinc-800 border border-white/10 p-5 rounded-xl text-sm text-zinc-300 space-y-4 mb-6 max-h-[40vh] overflow-y-auto">
            <p>Nossa ferramenta foi desenvolvida com tecnologia avançada para otimizar as postagens e aumentar a segurança.</p>
            <p>O WhatsApp possui políticas de uso rigorosas e sistemas automáticos de detecção. Recomendamos cautela, pois o uso inadequado pode resultar em bloqueio ou restrição temporária.</p>

            <h4 className="font-bold text-white mt-4 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand" /> Recomendações:
            </h4>

            <div className="space-y-3">
              {[
                { icon: '📱', text: <><strong>Não utilize seu número pessoal principal.</strong> O ideal é ter um número secundário focado apenas nas postagens.</> },
                { icon: '💳', text: <><strong>Evite usar números novos (recém-comprados).</strong> Utilize um chip com histórico mínimo de conversas e aquecimento.</> },
                { icon: '🛡️', text: <><strong>Coloque esse número secundário como Administrador do seu Grupo Oficial</strong> para que ele possa realizar postagens naturalmente.</> },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start bg-zinc-900 p-3 rounded-lg border border-white/5">
                  <span className="text-base">{item.icon}</span>
                  <p className="text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-zinc-500 border-t border-white/10 pt-4 leading-relaxed">
              Como qualquer automação externa, o WhatsApp dita as regras da plataforma. Ao prosseguir, você confirma que leu as boas práticas e utilizará com responsabilidade.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setWaTermsModalOpen(false)}
              className="w-full sm:w-1/3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition border border-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={acceptWaTerms}
              className="w-full sm:w-2/3 bg-green-600 hover:bg-green-500 text-white font-black py-3.5 rounded-xl transition shadow-lg shadow-green-600/20 active:scale-95 flex items-center justify-center gap-2 border border-green-500/30"
            >
              <CheckCircle className="h-4 w-4" /> Li e Entendi
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* ================================================ */ }
  {/* PERFIL DO USUÁRIO                               */ }
  {/* ================================================ */ }
  <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-maxx/30 transition duration-300">
    <div className="mb-6 border-b border-dark-700 pb-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <User className="h-5 w-5 text-maxx" /> Perfil do Usuário
      </h2>
      <p className="text-sm text-zinc-400 mt-1">Suas informações pessoais exibidas no painel.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Nome */}
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Nome Completo</label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
          <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
            placeholder="Seu nome" className="w-full p-3 pl-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none transition text-white text-sm" />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">E-mail</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
          <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)}
            placeholder="seu@email.com" className="w-full p-3 pl-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none transition text-white text-sm" />
        </div>
      </div>

      {/* WhatsApp pessoal */}
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">WhatsApp Pessoal</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
          <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
            placeholder="(11) 99999-9999" className="w-full p-3 pl-10 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none transition text-white text-sm" />
        </div>
      </div>

      {/* Telegram pessoal */}
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Telegram (Username)</label>
        <div className="relative">
          <span className="absolute left-3 top-3.5 text-zinc-600 text-sm font-bold">@</span>
          <input type="text" value={profileTg} onChange={e => setProfileTg(e.target.value)}
            placeholder="seususername" className="w-full p-3 pl-9 rounded-lg bg-dark-900 border border-dark-600 focus:border-maxx outline-none transition text-white text-sm" />
        </div>
      </div>
    </div>

    <div className="mt-5 flex justify-end">
      <button onClick={() => handleSave('profile')}
        disabled={saving.profile}
        className="bg-maxx hover:bg-maxx/90 text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-50 shadow-lg shadow-maxx/20 flex items-center gap-2">
        {saving.profile ? <span className="animate-spin">⏳</span> : <><CheckCircle className="h-4 w-4" /> Salvar Perfil</>}
      </button>
    </div>
  </div>

  {/* ================================================ */ }
  {/* PREFERÊNCIAS DO PAINEL                          */ }
  {/* ================================================ */ }
  <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-maxx/30 transition duration-300">
    <div className="mb-6 border-b border-dark-700 pb-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-maxx" /> Preferências do Painel
      </h2>
      <p className="text-sm text-zinc-400 mt-1">Personalize como o painel exibe as informações para você.</p>
    </div>

    <div className="space-y-3">
      {/* Toggle: Mostrar Ganhos */}
      {[{
        key: 'earnings', label: 'Mostrar Ganhos na Dashboard', desc: 'Exibe ou oculta os valores de lucro e receita na página inicial.',
        icon: <BarChart2 className="h-4 w-4 text-yellow-400" />, value: showEarnings, set: setShowEarnings, color: 'yellow'
      }, {
        key: 'filters', label: 'Filtros Persistentes', desc: 'Lembra o estado dos filtros ao navegar entre páginas.',
        icon: <SlidersHorizontal className="h-4 w-4 text-blue-400" />, value: persistFilters, set: setPersistFilters, color: 'blue'
      }, {
        key: 'master', label: 'Permissão Master (LGPD)', desc: 'Permite que o Master visualize dados e clientes desta conta.',
        icon: <UserCheck className="h-4 w-4 text-purple-400" />, value: masterPermission, set: setMasterPermission, color: 'purple'
      }].map(item => (
        <div key={item.key}
          onClick={() => { item.set(!item.value); handleSave(item.key) }}
          className="flex items-center justify-between cursor-pointer group p-4 rounded-xl bg-dark-900 border border-dark-700 hover:border-maxx/30 transition">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center`}>
              {item.icon}
            </div>
            <div>
              <span className="text-sm font-bold text-white block group-hover:text-maxx transition">{item.label}</span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">{item.desc}</span>
            </div>
          </div>
          <div className="relative shrink-0 ml-4">
            <div className={`w-12 h-6 rounded-full transition shadow-inner ${item.value ? 'bg-maxx' : 'bg-zinc-700'}`} />
            <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${item.value ? 'translate-x-6' : ''}`} />
          </div>
        </div>
      ))}

      {/* Idioma */}
      <div className="p-4 rounded-xl bg-dark-900 border border-dark-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Globe className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Idioma do Painel</span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">Selecione o idioma de exibição da interface.</span>
          </div>
        </div>
        <select value={panelLanguage} onChange={e => setPanelLanguage(e.target.value)}
          className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2.5 px-4 text-white text-sm focus:border-maxx outline-none appearance-none cursor-pointer">
          <option value="pt-BR">🇧🇷 Português (BR)</option>
          <option value="es">🇪🇸 Español</option>
          <option value="en">🇺🇸 English</option>
        </select>
      </div>
    </div>
  </div>

  {/* ================================================ */ }
  {/* AUTENTICAÇÃO DE DOIS FATORES (2FA)              */ }
  {/* ================================================ */ }
  <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-maxx/30 transition duration-300">
    <div className="mb-6 border-b border-dark-700 pb-4 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {twoFaEnabled ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldOff className="h-5 w-5 text-zinc-500" />}
          Autenticação de 2 Fatores (2FA)
          {twoFaEnabled && (
            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-black uppercase">ATIVO</span>
          )}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">Adicione uma camada extra de segurança usando o Google Authenticator ou Authy.</p>
      </div>
    </div>

    {!twoFaEnabled && twoFaStep === 'idle' && (
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-8 text-center flex flex-col items-center">
        <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500 border border-white/5">
          <Shield className="h-7 w-7" />
        </div>
        <h3 className="text-white font-bold mb-2">2FA Desativado</h3>
        <p className="text-xs text-zinc-400 mb-6 max-w-xs mx-auto leading-relaxed">
          Ative o 2FA para proteger sua conta contra acessos não autorizados mesmo que sua senha seja comprometida.
        </p>
        <button
          onClick={() => setTwoFaStep('type-select')}
          className="bg-maxx hover:bg-maxx/90 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-maxx/20 flex items-center gap-2">
          <Shield className="h-4 w-4" /> Ativar 2FA
        </button>
      </div>
    )}

    {twoFaStep === 'type-select' && (
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-8 text-center flex flex-col items-center">
        <h3 className="text-xl font-bold text-white mb-2">Escolha o Método de Autenticação</h3>
        <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
          Como você prefere receber seus códigos de verificação?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-6">
          <button
            onClick={() => {
              setTwoFaMethod('app')
              setTwoFaStep('setup')
              setTwoFaQr('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
              setTwoFaSecret('JBSWY3DPEHPK3PXP')
            }}
            className="bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-maxx/40 rounded-xl p-5 flex flex-col items-center transition group">
            <div className="h-12 w-12 bg-maxx/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Smartphone className="h-6 w-6 text-maxx" />
            </div>
            <h4 className="font-bold text-white mb-1">Aplicativo (Recomendado)</h4>
            <p className="text-xs text-zinc-500">Google Authenticator, Authy ou similar.</p>
          </button>

          <button
            onClick={() => {
              setTwoFaMethod('telegram')
              setTwoFaStep('setup')
            }}
            className="bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-blue-500/40 rounded-xl p-5 flex flex-col items-center transition group">
            <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Send className="h-6 w-6 text-blue-400" />
            </div>
            <h4 className="font-bold text-white mb-1">Telegram</h4>
            <p className="text-xs text-zinc-500">Receba o código por mensagem no bot do Telegram.</p>
          </button>
        </div>
        <button onClick={() => setTwoFaStep('idle')} className="text-sm text-zinc-500 hover:text-white transition">Cancelar</button>
      </div>
    )}

    {twoFaStep === 'setup' && twoFaMethod === 'app' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 text-center flex flex-col items-center relative">
          <button onClick={() => setTwoFaStep('type-select')} className="absolute left-4 top-4 text-zinc-500 hover:text-white transition"><X className="h-5 w-5" /></button>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-3 mt-2">1. Escaneie o QR Code</p>
          <div className="bg-white p-3 rounded-xl inline-block mb-3 shadow-lg">
            <img src={`data:image/png;base64,${twoFaQr}`} alt="2FA QR Code" className="w-40 h-40 object-contain" />
          </div>
          <p className="text-[11px] text-zinc-500 mb-3">Use Google Authenticator, Authy ou similar.</p>
          <div className="w-full bg-dark-800 border border-dark-600 rounded-lg p-3 flex items-center justify-between gap-2">
            <code className="text-xs text-maxx font-mono break-all flex-1">{twoFaSecret}</code>
            <button onClick={() => { navigator.clipboard.writeText(twoFaSecret); setCopiedSecret(true); setTimeout(() => setCopiedSecret(false), 1500) }}
              className="shrink-0 text-zinc-500 hover:text-maxx transition">
              {copiedSecret ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2">Ou insira a chave manualmente no app.</p>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 justify-center mb-3 text-maxx">
            <Smartphone className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-wider">2. Digite o Código do App</p>
          </div>
          <p className="text-[11px] text-zinc-500 mb-4 text-center leading-relaxed">Após escanear, insira o código de 6 dígitos gerado pelo aplicativo abaixo para confirmar a ativação.</p>
          <input type="text" maxLength={6} value={twoFaCode} onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000" className="w-full text-center text-3xl tracking-[0.5em] font-mono p-4 rounded-xl bg-dark-800 border border-dark-600 focus:border-maxx outline-none transition text-white mb-4" />
          <div className="flex gap-3">
            <button onClick={() => { setTwoFaStep('idle'); setTwoFaCode(''); }}
              className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-bold py-3 rounded-xl transition border border-dark-600">Cancelar</button>
            <button onClick={() => { if (twoFaCode.length === 6) { setTwoFaEnabled(true); setTwoFaStep('done'); showFeedback('2FA via App ativado!', 'success') } }}
              disabled={twoFaCode.length !== 6 || twoFaLoading}
              className="flex-1 bg-maxx hover:bg-maxx/90 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-maxx/20 flex items-center justify-center gap-2">
              {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="h-4 w-4" /> Confirmar</>}
            </button>
          </div>
        </div>
      </div>
    )}

    {twoFaStep === 'setup' && twoFaMethod === 'telegram' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 text-center flex flex-col items-center relative">
          <button onClick={() => setTwoFaStep('type-select')} className="absolute left-4 top-4 text-zinc-500 hover:text-white transition"><X className="h-5 w-5" /></button>
          <div className="h-14 w-14 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 mt-4 text-blue-400">
            <Send className="h-7 w-7" />
          </div>
          <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider mb-2">1. Envie uma mensagem para o Bot</p>
          <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
            Abra o Telegram, procure pelo nosso bot oficial <strong>@MxxcontrolBot</strong> e envie o comando:
          </p>
          <div className="w-full bg-dark-800 border border-dark-600 rounded-lg p-3 mb-4 flex items-center justify-between gap-2 overflow-hidden">
            <code className="text-xs text-blue-400 font-mono break-all flex-1 text-left">
              /2fa start {profileEmail}
            </code>
            <button onClick={() => { navigator.clipboard.writeText(`/2fa start ${profileEmail}`); showFeedback('Comando copiado!') }}
              className="shrink-0 text-zinc-500 hover:text-blue-400 transition">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <a
            href="https://t.me/MxxcontrolBot"
            target="_blank"
            rel="noreferrer"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mb-2">
            <Send className="h-4 w-4" /> Abrir Bot no Telegram
          </a>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 justify-center mb-3 text-blue-400">
            <MessageCircle className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-wider">2. Digite o Código do Telegram</p>
          </div>
          <p className="text-[11px] text-zinc-500 mb-4 text-center leading-relaxed">O bot enviará um código de 6 dígitos. Digite-o abaixo para confirmar a vinculação com seu Telegram.</p>
          <input type="text" maxLength={6} value={twoFaCode} onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000" className="w-full text-center text-3xl tracking-[0.5em] font-mono p-4 rounded-xl bg-dark-800 border border-dark-600 focus:border-blue-500 outline-none transition text-white mb-4" />
          <div className="flex gap-3">
            <button onClick={() => { setTwoFaStep('idle'); setTwoFaCode(''); }}
              className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-bold py-3 rounded-xl transition border border-dark-600">Cancelar</button>
            <button
              onClick={async () => {
                if (twoFaCode.length === 6) {
                  try {
                    setTwoFaLoading(true)
                    const bid = localStorage.getItem('browser_id')
                    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/verify-2fa`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: profileEmail,
                        code: twoFaCode,
                        device_id: bid,
                        modelo: 'Web Browser'
                      })
                    })

                    if (!res.ok) throw new Error('Código inválido')

                    // Ativar no banco de forma persistente
                    await api.put('/api/auth/toggle-tfa', { enabled: true })

                    setTwoFaEnabled(true);
                    setTwoFaStep('done');
                    showFeedback('2FA via Telegram ativado!', 'success')
                    loadDevices()
                  } catch (err) {
                    showFeedback(err.message, 'warning')
                  } finally {
                    setTwoFaLoading(false)
                  }
                }
              }}
              disabled={twoFaCode.length !== 6 || twoFaLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
              {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="h-4 w-4" /> Confirmar</>}
            </button>
          </div>
        </div>
      </div>
    )}

    {twoFaEnabled && twoFaStep !== 'setup' && twoFaStep !== 'type-select' && (
      <div className={`border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 ${twoFaMethod === 'app' ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
        <div className={`h-16 w-16 rounded-full flex items-center justify-center shrink-0 border shadow-[0_0_20px_rgba(34,197,94,0.25)] ${twoFaMethod === 'app' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20'}`}>
          {twoFaMethod === 'app' ? <Smartphone className="h-7 w-7" /> : <Send className="h-7 w-7 ml-1" />}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className={`font-bold text-lg mb-1 ${twoFaMethod === 'app' ? 'text-green-400' : 'text-blue-400'}`}>
            2FA Ativo via {twoFaMethod === 'telegram' ? 'Telegram' : 'Aplicativo'}
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">Sua conta está protegida. O código de 6 dígitos será solicitado a cada novo login.</p>
        </div>
        <button
          onClick={async () => {
            try {
              await api.put('/api/auth/toggle-tfa', { enabled: false })
              setTwoFaEnabled(false);
              setTwoFaStep('idle');
              setTwoFaCode('');
              setTwoFaQr('');
              setTwoFaSecret('');
              showFeedback('2FA desativado.', 'warning')
            } catch (err) {
              showFeedback('Erro ao desativar 2FA', 'warning')
            }
          }}
          className="shrink-0 bg-zinc-900 border border-red-500/40 hover:bg-red-500/10 text-red-400 font-bold py-2.5 px-6 rounded-xl transition text-sm flex items-center gap-2">
          <ShieldOff className="h-4 w-4" /> Desativar 2FA
        </button>
      </div>
    )}
  </div>



  {/* ================================================ */ }
  {/* SESSÕES ATIVAS                                   */ }
  {/* ================================================ */ }
  <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-maxx/30 transition duration-300">
    <div className="mb-6 border-b border-dark-700 pb-4 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Monitor className="h-5 w-5 text-maxx" /> Sessões Ativas
          <span className="ml-1 text-xs bg-maxx/20 text-maxx px-2 py-0.5 rounded-full border border-maxx/30 font-black">{sessions.length}</span>
        </h2>
        <p className="text-sm text-zinc-400 mt-1">Dispositivos conectados à sua conta. Encerre sessões suspeitas imediatamente.</p>
      </div>
      <button onClick={loadDevices}
        className="flex items-center gap-2 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg border border-white/10 transition">
        <RefreshCw className={`h-3.5 w-3.5 ${sessionsLoading ? 'animate-spin' : ''}`} /> Atualizar
      </button>
    </div>

    <div className="space-y-3">
      {sessions.map(session => {
        const DeviceIcon = session.icon === 'phone' ? Smartphone : session.icon === 'laptop' ? Laptop : Monitor
        return (
          <div key={session.id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition ${session.active
                ? 'bg-maxx/5 border-maxx/25'
                : 'bg-dark-900 border-dark-700 hover:border-dark-600'
              }`}>
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${session.active ? 'bg-maxx/15 border-maxx/30 text-maxx' : 'bg-zinc-800 border-white/10 text-zinc-500'
              }`}>
              <DeviceIcon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{session.device}</span>
                {session.active && (
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 font-black uppercase">Esta Sessão</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{session.location}
                </span>
                <span className="text-[11px] text-zinc-600 font-mono">{session.ip}</span>
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />{session.time}
                </span>
              </div>
            </div>

            {!session.active && (
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/api/auth/devices/${session.id}`)
                    loadDevices()
                    showFeedback(`Sessão "${session.device}" encerrada.`, 'warning')
                  } catch (err) {
                    showFeedback('Erro ao encerrar sessão', 'warning')
                  }
                }}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition"
                title="Encerrar sessão">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )
      })}

      {sessions.length > 1 && (
        <button
          onClick={() => { setSessions(prev => prev.filter(s => s.active)); showFeedback('Todas as outras sessões foram encerradas.', 'warning') }}
          className="w-full mt-2 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-bold transition flex items-center justify-center gap-2">
          <Trash2 className="h-4 w-4" /> Encerrar Todas as Outras Sessões
        </button>
      )}
    </div>
  </div>

  {/* ========================================== */ }
  {/* INTEGRAÇÃO GOOGLE                          */ }
  {/* ========================================== */ }
  <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg hover:border-blue-500/30 transition duration-300 overflow-hidden relative">
    {/* Decoração de fundo */}
    <div className="absolute right-0 top-0 p-6 opacity-5 pointer-events-none">
      <svg viewBox="0 0 24 24" className="h-36 w-36" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    </div>

    <div className="mb-6 border-b border-dark-700 pb-4 relative z-10">
      <h2 className="text-xl font-bold text-white flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>
        Integração Google
        <span className={`text-[10px] px-2 py-0.5 rounded border font-black uppercase ${googleConnected
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
          }`}>
          {googleConnected ? '● Ativo' : '○ Inativo'}
        </span>
      </h2>
      <p className="text-sm text-zinc-400 mt-2">
        Conecte sua conta Google para habilitar sincronização com <strong>Google Drive</strong> e <strong>Google Contacts</strong>.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

      {/* Card: Google Drive */}
      <div className={`rounded-xl border p-5 transition ${googleConnected
          ? 'bg-blue-500/5 border-blue-500/20'
          : 'bg-dark-900 border-dark-700 opacity-50'
        }`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <Globe className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Google Drive</p>
            <p className="text-[11px] text-zinc-500">Backup de templates</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Salva automaticamente seus banners e templates gerados no Google Drive.
        </p>
      </div>

      {/* Card: Google Contacts */}
      <div className={`rounded-xl border p-5 transition ${googleConnected
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-dark-900 border-dark-700 opacity-50'
        }`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Google Contacts</p>
            <p className="text-[11px] text-zinc-500">Sincronização de leads</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Sincroniza seus clientes e leads diretamente com sua agenda do Google.
        </p>
      </div>

      {/* Card: Status + Ação */}
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5 flex flex-col justify-between gap-4">
        {googleConnected ? (
          <>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-pulse"></div>
                <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Conta Conectada</p>
              </div>
              {googleLastSync && (
                <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3" />
                  Última sync: {new Date(googleLastSync).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
            <button
              onClick={handleGoogleDisconnect}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-bold transition disabled:opacity-50"
            >
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
              Desconectar Google
            </button>
          </>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-600"></div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Não Conectado</p>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Clique em conectar para autorizar o acesso. Uma janela do Google será aberta.
              </p>
            </div>
            <button
              onClick={handleGoogleConnect}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50 active:scale-95"
            >
              {googleLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ExternalLink className="h-4 w-4" />
              }
              {googleLoading ? 'Aguardando autorização...' : 'Conectar com Google'}
            </button>
          </>
        )}
      </div>

    </div>
  </div>

    </div>
  )
}
