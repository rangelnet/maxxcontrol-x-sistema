import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { useWhatsApp } from '../context/WhatsAppContext'
import {
  MessageCircle, QrCode, CheckCircle, X, Loader2, Send,
  Users, Clock, Edit3, Trash2, Plus, Play, Pause,
  RefreshCw, Zap, ChevronDown, ChevronUp, AlertTriangle,
  Copy, Check, Smartphone, Link, MousePointerClick, Eye,
  Phone, Globe, ShoppingCart, Star, Network, Bot, Settings2,
  MessageSquare, PenTool, Layers, ArrowRight,
  Search, Tag, StickyNote, Power, Inbox, Hash, CircleDot, UserCircle, ArrowLeft, Menu, CloudLightning
} from 'lucide-react'

// ─── CONFIGURAÇÕES DE BOTÃO PADRÃO ───────────────────────────────────────────
const BUTTON_PRESETS = [
  { label: '📲 Falar com Revendedor', type: 'whatsapp', value: '' },
  { label: '🛒 Ver Planos / Loja',    type: 'url',      value: '' },
  { label: '✅ Quero Assinar Agora',  type: 'whatsapp', value: '' },
  { label: '📺 Baixar App',           type: 'url',      value: '' },
  { label: '⭐ Seja um Revendedor',   type: 'whatsapp', value: '' },
]

// ─── TEMPLATES PADRÃO (DISPARO EM MASSA) ──────────────────────────────────────
const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: '🎬 Lançamento de Filme/Série',
    category: 'banner',
    icon: '🎬',
    message: `🎬 *{nome_loja}* INFORMA:\n\n📽️ Lançamento: *{titulo}*\n⭐ Nota: {nota} | 🕒 {duracao}\n\n📺 Assista agora no seu app favorito!`,
    buttons: [
      { id: 1, label: '📲 Falar com Revendedor', type: 'whatsapp', value: '' },
      { id: 2, label: '🛒 Ver Planos',            type: 'url',      value: '' },
    ],
    active: true, schedule: null
  },
  {
    id: 2,
    name: '👋 Saudação Diária',
    category: 'diario',
    icon: '👋',
    message: `👋 Olá pessoal! Passando para desejar um ótimo dia de muita diversão com a nossa grade completa!\n\n🚀 Estabilidade total e o melhor conteúdo na palma da sua mão.`,
    buttons: [
      { id: 3, label: '✅ Quero Assinar', type: 'whatsapp', value: '' },
    ],
    active: true, schedule: '09:00'
  },
  {
    id: 3,
    name: '⚠️ Aviso de Vencimento',
    category: 'renovacao',
    icon: '⚠️',
    message: `⚠️ *AVISO DE VENCIMENTO*\n\nOlá! Notamos que sua assinatura vence em *3 dias*.\n\nEvite ficar sem sinal e renove agora mesmo via PIX com desconto!`,
    buttons: [
      { id: 4, label: '💳 Renovar via PIX', type: 'whatsapp', value: '' },
    ],
    active: true, schedule: null
  },
  {
    id: 4,
    name: '⚽ Transmissão de Esportes',
    category: 'esportes',
    icon: '⚽',
    message: `⚽ *HOJE TEM JOGÃO!*\n\nNão perca nenhum lance da rodada de hoje. Transmissão em FULL HD 60fps sem travamentos.\n\n🏁 Acesse a categoria ESPORTES no seu app!`,
    buttons: [
      { id: 5, label: '📺 Ver Grade de Jogos', type: 'url', value: '' },
    ],
    active: true, schedule: '19:00'
  },
  {
    id: 5,
    name: '⚡ Promoção Relâmpago',
    category: 'promo',
    icon: '⚡',
    message: `⚡ *OFERTA EXCLUSIVA DO DIA*\n\nAssine o plano quadrimestral e leve +1 MÊS GRÁTIS!\n\n🏃 Válido apenas para as primeiras 10 renovações de hoje.`,
    buttons: [
      { id: 6, label: '🔥 Aproveitar Agora', type: 'whatsapp', value: '' },
    ],
    active: true, schedule: null
  },
  {
    id: 6,
    name: '🔐 Envio de Login e Senha',
    category: 'credenciais',
    icon: '🔐',
    message: `🔐 *SEU ACESSO FOI LIBERADO!*\n\nSeja muito bem-vindo!\n\n👤 *Usuário:* {usuario}\n🔑 *Senha:* {senha}\n\nLembre-se: não compartilhe seus dados. Caso precise de ajuda, chame nosso suporte. 🚀`,
    buttons: [
      { id: 7, label: '🛠️ Suporte Técnico', type: 'whatsapp', value: '' },
    ],
    active: true, schedule: null
  },
  {
    id: 7,
    name: '💰 Indicação & Ganhe',
    category: 'promo',
    icon: '💰',
    message: `💰 *INDIQUE E GANHE!*\n\nSabia que a cada amigo indicado que assinar, você ganha *1 MÊS GRÁTIS* na sua assinatura?\n\nChame seus amigos e mande o contato deles pra gente! 🎉`,
    buttons: [
      { id: 8, label: '🎁 Indicar um Amigo', type: 'whatsapp', value: '' },
    ],
    active: true, schedule: null
  },
  {
    id: 8,
    name: '🧾 Envio de Recibo / Pagamento',
    category: 'financeiro',
    icon: '🧾',
    message: `🧾 *PAGAMENTO CONFIRMADO!*\n\nRecebemos o seu pagamento referente à assinatura do plano.\n\nMuito obrigado pela confiança! Seu comprovante de renovação já está registrado no sistema. ✅`,
    buttons: [
      { id: 9, label: '🛒 Ver Opções Premium', type: 'url', value: '' },
    ],
    active: true, schedule: null
  },
  {
    id: 9,
    name: '🎂 Feliz Aniversário',
    category: 'relacionamento',
    icon: '🎂',
    message: `🎂 *FELIZ ANIVERSÁRIO!* 🎈\n\nHoje é o seu dia! Desejamos muitas alegrias, saúde e paz.\n\nComo presente, liberamos +7 DIAS GRÁTIS na sua conta para você curtir nossos lançamentos! 🥳`,
    buttons: [
      { id: 10, label: '🎁 Resgatar Presente', type: 'whatsapp', value: '' },
    ],
    active: true, schedule: null
  },
  {
    id: 10,
    name: '🚨 Assinatura Expirada / Cancelamento',
    category: 'renovacao',
    icon: '🚨',
    message: `🚨 *ASSINATURA EXPIRADA*\n\nSua assinatura venceu e o sinal foi pausado momentaneamente.\n\nSentimos sua falta! Renove agora com nosso plano especial e volte a assistir imediatamente. 🍿`,
    buttons: [
      { id: 11, label: '💳 Renovar Imediatamente', type: 'whatsapp', value: '' },
    ],
    active: true, schedule: null
  },
  {
    id: 11,
    name: '📥 Instruções de Downloader',
    category: 'suporte',
    icon: '📥',
    message: `📥 *COMO INSTALAR O APP NA SUA TV*\n\n1️⃣ Na sua TV, abra o App "Downloader"\n2️⃣ No campo de busca Digite o código: *00000*\n3️⃣ Clique em "GO" e a instalação inicia automaticamente.\n\nQualquer dúvida, é só nos chamar!`,
    buttons: [
      { id: 12, label: '🛠️ Falar com Suporte', type: 'whatsapp', value: '' },
    ],
    active: true, schedule: null
  }
]

const CATEGORY_COLORS = {
  banner:   'text-purple-400 bg-purple-500/10 border-purple-500/20',
  diario:   'text-blue-400   bg-blue-500/10   border-blue-500/20',
  renovacao:'text-red-400    bg-red-500/10    border-red-500/20',
  esportes: 'text-green-400  bg-green-500/10  border-green-500/20',
  promo:    'text-orange-400 bg-orange-500/10 border-orange-500/20',
  credenciais:'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  financeiro:'text-teal-400 bg-teal-500/10 border-teal-500/20',
  relacionamento:'text-pink-400 bg-pink-500/10 border-pink-500/20',
  suporte: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
}
const CATEGORY_LABELS = {
  banner:'Banner', diario:'Diário', renovacao:'Renovação / Aviso', esportes:'Esportes', promo:'Promoção',
  credenciais:'Credenciais', financeiro:'Financeiro', relacionamento:'Relacionamento', suporte:'Suporte Técnico'
}

// ─── HELPER: Monta texto final com botões ────────────────────────────────────
function buildFinalMessage(message, buttons) {
  const activeButtons = (buttons || []).filter(b => b.label && b.value)
  if (activeButtons.length === 0) return message
  const btnLines = activeButtons.map(b => {
    const url = b.type === 'whatsapp'
      ? `https://wa.me/${b.value.replace(/\D/g, '')}`
      : b.value
    return `${b.label}\n${url}`
  })
  return `${message}\n\n${btnLines.join('\n\n')}`
}

// ─── COMPONENT: Contact Avatar ────────────────────────────────────────────────
function ContactAvatar({ jid, name, isGroup, className }) {
  const [picUrl, setPicUrl] = useState(null)
  
  useEffect(() => {
    let isMounted = true
    if (!jid) return
    const fetchPic = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/whatsapp/chat/profile-pic/${encodeURIComponent(jid)}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const d = await res.json()
          if (isMounted && d.url) setPicUrl(d.url)
        }
      } catch (e) {}
    }
    fetchPic()
    return () => { isMounted = false }
  }, [jid])

  if (picUrl) {
    return <img src={picUrl} alt={name || jid} className={`object-cover rounded-full ${className}`} />
  }

  return (
    <div className={`rounded-full flex items-center justify-center font-black relative flex-shrink-0 ${
      isGroup ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
    } ${className}`}>
      {isGroup ? <Users className="h-[50%] w-[50%]" /> : (name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

export default function WhatsAppAuto() {
  const { 
    waStatus, waLoading, setWaLoading, 
    waQrCode, waGroups, waGroupsLoading, loadGroups, loadStatus,
    connectWhatsApp, disconnect
  } = useWhatsApp()

  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'livechat' ? 'livechat' : 'bulk'
  const [activeTab, setActiveTab] = useState(initialTab) // 'bulk' | 'maxxflow' | 'livechat'
  const [waSelectedGroups, setWaSelectedGroups] = useState([])

  // ── MaxxChat Live Chat ──
  const [chatConversations, setChatConversations] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [chatActiveJid, setChatActiveJid] = useState(null)
  const [chatActiveConv, setChatActiveConv] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [chatStatusFilter, setChatStatusFilter] = useState('all')
  const [chatLabels, setChatLabels] = useState([])
  const [chatQuickReplies, setChatQuickReplies] = useState([])
  const [chatShowQR, setChatShowQR] = useState(false)
  const [chatSidebarOpen, setChatSidebarOpen] = useState(true)
  const [chatNotesInput, setChatNotesInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMsgLoading, setChatMsgLoading] = useState(false)
  const [chatHasMore, setChatHasMore] = useState(true)
  const [chatLoadingMore, setChatLoadingMore] = useState(false)
  const [chatSending, setChatSending] = useState(false)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const notesTimerRef = useRef(null)

  // ── Flows (MaxxFlow) ──
  const [flows, setFlows] = useState([])
  const [flowsLoading, setFlowsLoading] = useState(false)
  const [editingFlow, setEditingFlow] = useState(null)

  // ── Templates (Bulk) ──
  const [templates,  setTemplates]  = useState(DEFAULT_TEMPLATES)
  const [expandedId, setExpandedId] = useState(null)
  const [editingId,  setEditingId]  = useState(null)
  const [editText,   setEditText]   = useState('')
  const [editSchedule, setEditSchedule] = useState('')
  const [editButtons,  setEditButtons]  = useState([])

  // ── Preview & History ──
  const [previewId, setPreviewId] = useState(null)
  const [history, setHistory] = useState([])

  // ── Feedback ──
  const [feedback, setFeedback] = useState(null)
  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  const [copied, setCopied] = useState(null)
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // ── API Flows ──
  const loadFlows = useCallback(async () => {
    setFlowsLoading(true)
    try {
      const res = await fetch('/api/whatsapp/flows', { headers: getAuthHeader() })
      if (res.ok) { const d = await res.json(); setFlows(d.flows || []) }
    } catch (e) { console.error('Erro ao carregar fluxos:', e) }
    finally { setFlowsLoading(false) }
  }, [])

  const saveFlow = async (flowData) => {
    try {
      const res = await fetch('/api/whatsapp/flows', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(flowData)
      })
      if (res.ok) { showFeedback('Fluxo salvo com sucesso!'); loadFlows(); setEditingFlow(null) }
      else showFeedback('Erro ao salvar fluxo.', 'error')
    } catch (e) { showFeedback('Erro de conexão.', 'error') }
  }

  const deleteFlow = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este robô?')) return
    try {
      const res = await fetch(`/api/whatsapp/flows/${id}`, { method: 'DELETE', headers: getAuthHeader() })
      if (res.ok) { showFeedback('Fluxo excluído.', 'warning'); loadFlows() }
    } catch (e) { showFeedback('Erro ao excluir.', 'error') }
  }

  const activateFlow = async (id) => {
    try {
      const res = await fetch(`/api/whatsapp/flows/${id}/activate`, { method: 'POST', headers: getAuthHeader() })
      if (res.ok) { showFeedback('Robô ativado!'); loadFlows() }
    } catch (e) { showFeedback('Erro ao ativar.', 'error') }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAXXCHAT — LIVE CHAT API FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const loadConversations = useCallback(async () => {
    setChatLoading(true)
    try {
      const params = new URLSearchParams()
      if (chatStatusFilter !== 'all') params.set('status', chatStatusFilter)
      if (chatSearch) params.set('search', chatSearch)
      const res = await fetch(`/api/whatsapp/chat/conversations?${params}`, { headers: getAuthHeader() })
      if (res.ok) { const d = await res.json(); setChatConversations(d.conversations || []) }
    } catch (e) { console.error('Erro ao carregar conversas:', e) }
    finally { setChatLoading(false) }
  }, [chatStatusFilter, chatSearch])

  const loadMessages = useCallback(async (jid) => {
    setChatMsgLoading(true)
    setChatHasMore(true)
    try {
      const res = await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/messages`, { headers: getAuthHeader() })
      if (res.ok) { 
        const d = await res.json()
        setChatMessages(d.messages || []) 
        if ((d.messages || []).length < 50) setChatHasMore(false)
      }
    } catch (e) { console.error('Erro ao carregar mensagens:', e) }
    finally { setChatMsgLoading(false) }
  }, [])

  const loadMoreMessages = async () => {
    if (chatLoadingMore || !chatHasMore || chatMessages.length === 0) return
    
    setChatLoadingMore(true)
    const oldestId = chatMessages[0].id
    const scrollPos = messagesContainerRef.current.scrollHeight

    try {
      const res = await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(chatActiveJid)}/messages?before=${oldestId}`, { headers: getAuthHeader() })
      if (res.ok) {
        const d = await res.json()
        const newMsgs = d.messages || []
        
        if (newMsgs.length === 0) {
          setChatHasMore(false)
        } else {
          setChatMessages(prev => [...newMsgs, ...prev])
          
          // Manter o scroll na posição atual para não dar "pulo"
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - scrollPos
            }
          }, 0)
          
          if (newMsgs.length < 50) setChatHasMore(false)
        }
      }
    } catch (e) { console.error('Erro ao carregar mais mensagens:', e) }
    finally { setChatLoadingMore(false) }
  }

  const handleChatScroll = (e) => {
    if (e.target.scrollTop === 0 && chatHasMore && !chatLoadingMore) {
      loadMoreMessages()
    }
  }

  const loadChatLabels = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/chat/labels', { headers: getAuthHeader() })
      if (res.ok) { const d = await res.json(); setChatLabels(d.labels || []) }
    } catch (e) {}
  }, [])

  const loadQuickReplies = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/chat/quick-replies', { headers: getAuthHeader() })
      if (res.ok) { const d = await res.json(); setChatQuickReplies(d.quickReplies || []) }
    } catch (e) {}
  }, [])

  const selectConversation = (conv) => {
    setChatActiveJid(conv.jid)
    setChatActiveConv(conv)
    setChatNotesInput(conv.notes || '')
    loadMessages(conv.jid)
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !chatActiveJid || chatSending) return
    setChatSending(true)
    try {
      const res = await fetch('/api/whatsapp/chat/send', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid: chatActiveJid, message: chatInput.trim() })
      })
      if (res.ok) {
        setChatInput('')
        // Add optimistic message
        setChatMessages(prev => [...prev, {
          id: `opt_${Date.now()}`, from_me: true, sender_name: 'Atendente',
          content: chatInput.trim(), media_type: 'text', is_bot_reply: false,
          created_at: new Date().toISOString()
        }])
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (e) { showFeedback('Erro ao enviar.', 'error') }
    finally { setChatSending(false) }
  }

  const toggleBotForConv = async (jid, currentState) => {
    try {
      await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/bot`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_active: !currentState })
      })
      setChatActiveConv(prev => prev ? { ...prev, bot_active: !currentState } : prev)
      showFeedback(!currentState ? 'Bot ativado!' : 'Bot desativado — Atendimento humano')
      loadConversations()
    } catch (e) {}
  }

  const updateLabel = async (jid, labelId) => {
    try {
      await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/label`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ label_id: labelId })
      })
      loadConversations()
    } catch (e) {}
  }

  const updateConvStatus = async (jid, status) => {
    try {
      await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/status`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      loadConversations()
      showFeedback(status === 'resolved' ? 'Conversa resolvida!' : 'Status atualizado')
    } catch (e) {}
  }

  const saveNotes = (jid, text) => {
    setChatNotesInput(text)
    clearTimeout(notesTimerRef.current)
    notesTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/notes`, {
          method: 'PUT',
          headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: text })
        })
      } catch (e) {}
    }, 1500)
  }

  // Formatador de tempo relativo
  const timeAgo = (date) => {
    if (!date) return ''
    const now = new Date(), d = new Date(date)
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff / 60)}min`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  // Quick reply handler
  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage() }
  }

  const filteredQR = chatInput.startsWith('/') 
    ? chatQuickReplies.filter(qr => qr.shortcut.toLowerCase().includes(chatInput.toLowerCase()))
    : []

  // ── Effects ──
  useEffect(() => {
    if (activeTab === 'livechat') {
      loadConversations()
      loadChatLabels()
      loadQuickReplies()
    }
  }, [activeTab, loadConversations, loadChatLabels, loadQuickReplies])

  // Polling for new conversations every 8s when on livechat tab
  useEffect(() => {
    if (activeTab === 'livechat') {
      const interval = setInterval(loadConversations, 8000)
      return () => clearInterval(interval)
    }
  }, [activeTab, loadConversations])

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Socket.IO real-time (graceful — works without socket.io-client)
  useEffect(() => {
    let socket
    try {
      const io = require('socket.io-client')
      socket = io(window.location.origin)
      if (chatActiveJid) socket.emit('join_chat', chatActiveJid)
      socket.on('new_message', (msg) => {
        if (msg.jid === chatActiveJid) {
          setChatMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
        loadConversations()
      })
      socket.on('conversation_updated', () => loadConversations())
    } catch (e) { /* socket.io-client not installed, use polling */ }
    return () => { if (socket) socket.disconnect() }
  }, [chatActiveJid, activeTab])

  useEffect(() => {
    if (activeTab === 'maxxflow') loadFlows()
  }, [activeTab, loadFlows])

  // Polling específico para o QR Code (quando está carregando ou desconectado com QR)
  useEffect(() => {
    if (waStatus === 'loading' || (waStatus === 'disconnected' && waQrCode)) {
      const interval = setInterval(() => loadStatus(), 3000)
      return () => clearInterval(interval)
    }
  }, [waStatus, waQrCode, loadStatus])

  const toggleGroupSelection = (id) => {
    setWaSelectedGroups(prev => 
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    )
  }

  const selectAllGroups = () => {
    if (waSelectedGroups.length === waGroups.length) setWaSelectedGroups([])
    else setWaSelectedGroups(waGroups.map(g => g.id))
  }

  // ── Edição Bulk ──
  const startEdit = (tpl) => {
    setEditingId(tpl.id); setEditText(tpl.message)
    setEditSchedule(tpl.schedule || '')
    setEditButtons(tpl.buttons ? tpl.buttons.map(b => ({ ...b })) : [])
    setExpandedId(tpl.id); setPreviewId(null)
  }

  const saveEdit = (id) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, message: editText, schedule: editSchedule || null, buttons: editButtons } : t
    ))
    setEditingId(null); showFeedback('Template salvo!')
  }

  const addButton = () => {
    if (editButtons.length >= 3) { showFeedback('Máximo de 3 botões por mensagem!', 'error'); return }
    setEditButtons(prev => [...prev, { id: Date.now(), label: '📲 Novo Botão', type: 'whatsapp', value: '' }])
  }

  const updateButton = (idx, field, val) => {
    setEditButtons(prev => prev.map((b, i) => i === idx ? { ...b, [field]: val } : b))
  }

  const removeButton = (idx) => {
    setEditButtons(prev => prev.filter((_, i) => i !== idx))
  }

  const toggleActive = (id) =>
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t))

  const sendNow = async (tpl) => {
    if (waSelectedGroups.length === 0) { showFeedback('Selecione pelo menos um grupo!', 'error'); return }
    if (waStatus !== 'connected') { showFeedback('Conecte o WhatsApp primeiro!', 'error'); return }
    setWaLoading(true)
    const finalMsg = buildFinalMessage(tpl.message, tpl.buttons)
    let sentCount = 0
    for (const groupId of waSelectedGroups) {
      try {
        const res = await fetch('/api/whatsapp/send', { 
          method: 'POST', 
          headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ group_id: groupId, message: finalMsg }) 
        })
        if (res.ok) sentCount++
        await new Promise(r => setTimeout(r, 1500))
      } catch (e) { console.error('Erro no envio múltiplo:', e) }
    }
    setWaLoading(false)
    showFeedback(`✅ Enviado para ${sentCount} grupo(s)!`)
    setHistory(prev => [{ id: Date.now(), template: tpl.name, group: `${sentCount} grupo(s)`, time: new Date().toLocaleTimeString('pt-BR'), status: 'sent' }, ...prev.slice(0, 19)])
  }

  const activeCount = templates.filter(t => t.active && t.schedule).length

  return (
    <div className="space-y-6 animate-fadeIn pb-20">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <MessageCircle className="h-5 w-5 text-green-500" />
            </div>
            Automação WhatsApp
            <span className="text-[11px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 font-black tracking-widest">LOCAL</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Gerencie disparos em massa e fluxos de chatbot 100% offline.</p>
        </div>

        {/* ── TAB SWITCHER ── */}
        <div className="bg-dark-800 p-1 rounded-xl border border-dark-700 flex self-start md:self-auto">
          <button 
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'bulk' ? 'bg-maxx text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
            <Send className="h-3.5 w-3.5" /> Disparo em Massa
          </button>
          <button 
            onClick={() => setActiveTab('maxxflow')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'maxxflow' ? 'bg-maxx text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
            <Bot className="h-3.5 w-3.5" /> MaxxFlow (Chatbot)
          </button>
          <button 
            onClick={() => setActiveTab('livechat')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'livechat' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-zinc-500 hover:text-white'}`}>
            <MessageSquare className="h-3.5 w-3.5" /> Chat ao Vivo
            {chatConversations.reduce((a, c) => a + (c.unread_count || 0), 0) > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                {chatConversations.reduce((a, c) => a + (c.unread_count || 0), 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── FEEDBACK ── */}
      {feedback && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-lg border animate-fadeIn fixed top-4 right-4 z-50 min-w-[300px] ${
          feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
          feedback.type === 'error'   ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                        'bg-dark-800 text-yellow-400 border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-3"><CheckCircle className="h-4 w-4" /><span>{feedback.text}</span></div>
          <button onClick={() => setFeedback(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {activeTab !== 'livechat' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─ COL 1: CONEXÃO E GRUPOS ─ */}
        <div className="flex flex-col gap-4">

          {/* Painel Conexão */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-900/40">
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green-500" /> WhatsApp
              </h2>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${waStatus === 'connected' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${waStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                {waStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>

            <div className="p-5 text-center">
              {waStatus === 'disconnected' && !waQrCode && (
                <div className="py-2">
                  <div className="h-12 w-12 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-dark-700 shadow-inner">
                    <QrCode className="h-6 w-6 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 text-xs mb-5 px-4">Conecte o serviço para habilitar a IA e os disparos em massa.</p>
                  <button onClick={() => connectWhatsApp()} disabled={waLoading}
                    className="w-full bg-maxx hover:brightness-110 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-maxx/20 uppercase tracking-widest text-xs">
                    {waLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                    Gerar Novo QR Code
                  </button>
                </div>
              )}

              {waStatus === 'disconnected' && waQrCode && (
                <div className="animate-fadeIn">
                  <div className="bg-white p-3 rounded-2xl inline-block mb-4 border-8 border-dark-900 shadow-2xl">
                    <img src={`data:image/png;base64,${waQrCode}`} alt="QR" className="w-40 h-40" />
                  </div>
                  <p className="text-maxx text-[10px] font-black animate-pulse tracking-widest">ESCANEIE AGORA NO WHATSAPP</p>
                  <button onClick={() => connectWhatsApp()} className="mt-4 text-zinc-600 hover:text-white text-[10px] uppercase font-bold underline">Recarregar QR</button>
                </div>
              )}

              {waStatus === 'connected' && (
                <div className="animate-fadeIn">
                  <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-lg shadow-green-500/5 transition-transform hover:scale-105">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-white font-bold text-sm mb-1">Conexão Estabelecida</p>
                  <p className="text-zinc-500 text-[11px] mb-5">Sua sessão está ativa e protegida localmente.</p>
                  <button onClick={disconnect} disabled={waLoading}
                    className="w-full bg-dark-900 border border-red-500/30 text-red-400 py-2.5 rounded-xl text-[10px] font-black hover:bg-red-500/10 transition-colors uppercase tracking-widest">
                    Desvincular Aparelho
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grupos (Sempre Visíveis) */}
          <div className={`bg-dark-800 border border-dark-700 rounded-xl p-4 shadow-xl transition-opacity ${waStatus !== 'connected' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" /> Grupos Conectados
              </h2>
              <button onClick={loadGroups} disabled={waGroupsLoading} className="text-zinc-500 hover:text-white transition group">
                <RefreshCw className={`h-3.5 w-3.5 ${waGroupsLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              </button>
            </div>

            <div className="bg-dark-900/60 border border-dark-600 rounded-xl p-3">
               <div className="flex items-center justify-between mb-3 px-1">
                 <div className="flex flex-col">
                   <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Seleção</span>
                   <span className="text-xs text-brand-400 font-bold">{waSelectedGroups.length} selecionados</span>
                 </div>
                 <button onClick={selectAllGroups} className="text-[10px] bg-dark-800 hover:bg-dark-700 border border-dark-600 text-zinc-300 px-3 py-1.5 rounded-lg font-bold uppercase transition">
                    {waSelectedGroups.length === waGroups.length ? 'Limpar' : 'Todos'}
                 </button>
               </div>
               <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                 {waGroups.length === 0 && !waGroupsLoading && <div className="text-center py-8 opacity-30"><Users className="h-8 w-8 mx-auto mb-2" /><p className="text-[10px] uppercase font-bold">Nenhum grupo</p></div>}
                 {waGroups.map(g => (
                   <label key={g.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group/item ${waSelectedGroups.includes(g.id) ? 'bg-brand-500/10 border-brand-500/30' : 'bg-dark-800 border-dark-700 hover:border-dark-600'}`}>
                     <input type="checkbox" className="hidden" checked={waSelectedGroups.includes(g.id)} onChange={() => toggleGroupSelection(g.id)} />
                     <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${waSelectedGroups.includes(g.id) ? 'bg-brand-500 border-brand-500 shadow-[0_0_10px_rgba(255,165,0,0.3)]' : 'bg-dark-900 border-dark-600 group-hover/item:border-zinc-500'}`}>
                       {waSelectedGroups.includes(g.id) && <Check className="h-3 w-3 text-white stroke-[4px]" />}
                     </div>
                     <span className={`text-xs font-semibold truncate ${waSelectedGroups.includes(g.id) ? 'text-white' : 'text-zinc-400'}`}>{g.name}</span>
                   </label>
                 ))}
               </div>
            </div>
          </div>

          {/* Stats MaxxFlow (Se MaxxFlow) */}
          {activeTab === 'maxxflow' && (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 shadow-xl">
               <h2 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
                 <Settings2 className="h-4 w-4 text-brand-400" /> Configuração IA
               </h2>
               <div className="space-y-3">
                  <div className="bg-dark-900/60 p-3 rounded-xl border border-dark-700">
                    <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Status do Robô</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-xs text-white font-bold">Busca Fuzzy Ativa (Similaridade)</p>
                    </div>
                  </div>
                  <div className="bg-dark-900/60 p-3 rounded-xl border border-dark-700">
                    <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Confiança Mínima</p>
                    <div className="flex items-center justify-between">
                       <input type="range" min="0" max="100" defaultValue="60" className="flex-1 accent-maxx" />
                       <span className="text-xs text-brand-400 font-bold ml-3">60%</span>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* ─ COL 2+3: CONTEÚDO PRINCIPAL ─ */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          
          {/* ─────── ABA 1: DISPARO EM MASSA ─────── */}
          {activeTab === 'bulk' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-maxx" /> Campanhas e Modelos
                </h2>
                <button
                   onClick={() => {
                     const newId = Date.now()
                     setTemplates(prev => [...prev, { id: newId, name: '✏️ Nova Campanha', category: 'promo', icon: '✏️', message: 'Texto da campanha...', buttons: [], active: false, schedule: null }])
                     setExpandedId(newId); setEditingId(newId); setEditText('Texto da campanha...'); setEditSchedule(''); setEditButtons([])
                   }}
                   className="text-[10px] font-black bg-maxx/10 hover:bg-maxx/20 text-maxx border border-maxx/30 px-4 py-2 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                >
                   + NOVA CAMPANHA
                </button>
              </div>

              <div className="space-y-4">
                {templates.map(tpl => (
                  <div key={tpl.id} className={`bg-dark-800 border rounded-2xl transition-all shadow-lg overflow-hidden ${tpl.active ? 'border-brand-500/30 ring-1 ring-brand-500/10' : 'border-dark-700'}`}>
                    <div className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 bg-dark-900 rounded-xl flex items-center justify-center text-2xl border border-dark-700 shadow-inner">
                        {tpl.icon}
                      </div>
                      <div className="flex-1 truncate">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-black text-white truncate uppercase tracking-tight">{tpl.name}</p>
                          {tpl.active && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter ${CATEGORY_COLORS[tpl.category] || CATEGORY_COLORS.promo}`}>
                            {CATEGORY_LABELS[tpl.category] || tpl.category}
                          </span>
                          {tpl.buttons?.length > 0 && <span className="text-[9px] text-zinc-500 font-bold bg-dark-900 px-2 py-0.5 rounded-full border border-dark-700">⚡ {tpl.buttons.length} BOTÕES</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleActive(tpl.id)} className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${tpl.active ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-dark-900 text-zinc-600 border-dark-600 hover:border-zinc-500'}`}>
                          {tpl.active ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </button>
                        <button onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)} className="h-10 w-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors bg-dark-900 border border-dark-700 rounded-xl">
                          {expandedId === tpl.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {expandedId === tpl.id && (
                      <div className="px-5 pb-5 pt-2 border-t border-dark-700/50 bg-dark-900/20 animate-slideDown">
                        {editingId === tpl.id ? (
                          <div className="space-y-4 mt-4">
                            <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={5} className="w-full bg-dark-900 border border-dark-600 rounded-2xl p-4 text-white text-xs font-mono outline-none focus:border-brand-500 transition-all placeholder-zinc-700 shadow-inner" placeholder="Digite a mensagem da campanha..." />
                            
                            <div className="space-y-3">
                               <div className="flex items-center justify-between px-1">
                                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><MousePointerClick className="h-3 w-3" /> Botões Interativos</p>
                                 <button onClick={addButton} className="text-[10px] text-maxx hover:brightness-125 font-black uppercase tracking-widest">+ ADICIONAR LINK</button>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {editButtons.map((btn, idx) => (
                                   <div key={btn.id} className="bg-dark-900 border border-dark-600 rounded-2xl p-3 space-y-3 shadow-lg group/btn relative">
                                     <button onClick={() => removeButton(idx)} className="absolute top-2 right-2 text-zinc-700 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
                                     <input value={btn.label} onChange={e => updateButton(idx, 'label', e.target.value)} placeholder="Texto do botão" className="w-full bg-dark-800 border-none rounded-lg p-2 text-xs text-white font-bold" />
                                     <div className="flex gap-2">
                                        <select value={btn.type} onChange={e => updateButton(idx, 'type', e.target.value)} className="bg-dark-800 border-none rounded-lg px-2 py-2 text-[10px] text-zinc-400 font-bold outline-none">
                                           <option value="whatsapp">Zap</option>
                                           <option value="url">Link</option>
                                        </select>
                                        <input value={btn.value} onChange={e => updateButton(idx, 'value', e.target.value)} placeholder="Destino" className="flex-1 bg-dark-800 border-none rounded-lg p-2 text-[10px] text-zinc-500 font-mono" />
                                     </div>
                                   </div>
                                 ))}
                               </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button onClick={() => saveEdit(tpl.id)} className="flex-1 bg-maxx text-white font-black py-3 rounded-xl shadow-lg shadow-maxx/10 hover:brightness-110 active:scale-95 transition-all text-xs tracking-widest">SALVAR CAMPANHA</button>
                              <button onClick={() => setEditingId(null)} className="px-6 bg-dark-800 text-zinc-400 font-bold py-3 rounded-xl border border-dark-600 hover:text-white transition-all text-xs uppercase">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 mt-4">
                            <div className="bg-dark-900 border border-dark-700/50 rounded-2xl p-4 relative group shadow-inner">
                               <pre className="text-[13px] text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed line-clamp-6">{tpl.message}</pre>
                               <button onClick={() => handleCopy(tpl.id, buildFinalMessage(tpl.message, tpl.buttons))} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all text-zinc-600 hover:text-brand-500 p-2 bg-dark-800 rounded-lg border border-dark-600">
                                 {copied === tpl.id ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                               </button>
                               {tpl.buttons?.length > 0 && (
                                 <div className="mt-4 pt-4 border-t border-dark-700/30 flex flex-wrap gap-2">
                                   {tpl.buttons.map((b, i) => (
                                     <div key={i} className="px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-[10px] text-zinc-400 flex items-center gap-2">
                                       {b.type === 'whatsapp' ? <Phone className="h-3 w-3 text-green-500" /> : <Globe className="h-3 w-3 text-blue-500" />}
                                       <span className="font-bold">{b.label}</span>
                                     </div>
                                   ))}
                                 </div>
                               )}
                            </div>

                            <div className="flex gap-3">
                              <button 
                                onClick={() => sendNow(tpl)} 
                                disabled={waStatus !== 'connected' || waSelectedGroups.length === 0 || waLoading} 
                                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-20 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-600/10 active:scale-95 uppercase tracking-widest text-xs"
                              >
                                {waLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Disparar para {waSelectedGroups.length} Grupos
                              </button>
                              <button onClick={() => startEdit(tpl)} className="px-5 bg-dark-900 border border-dark-700 text-zinc-400 hover:text-brand-400 rounded-2xl transition-all active:scale-95 shadow-lg">
                                <Edit3 className="h-5 w-5" />
                              </button>
                               <button onClick={() => deleteFlow(tpl.id)} className="px-5 bg-dark-900 border border-dark-700 text-zinc-600 hover:text-red-500 rounded-2xl transition-all active:scale-95 shadow-lg">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─────── ABA 2: MAXXFLOW (CHATBOT) ─────── */}
          {activeTab === 'maxxflow' && (
             <div className="animate-fadeIn space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <Bot className="h-5 w-5 text-brand-400" /> Robôs Inteligentes (Fluxos)
                  </h2>
                  <button 
                    onClick={() => setEditingFlow({ 
                      id: null, 
                      name: 'Secretária Virtual Maxx', 
                      is_default: false,
                      content: { 
                        nodes: [
                          { id: 'start', type: 'message', content: 'Seja muito bem-vindo! Eu sou o assistente virtual *MAXX* 🤖 e vou adiantar seu atendimento.', options: [] },
                          { id: 'main_menu', type: 'choice', content: '🔰 *MENU PRINCIPAL* 🔰\nEscolha uma das opções abaixo para eu poder te ajudar rapidinho:\n\n1️⃣ ⏱️ *Teste Grátis* - Liberar 3 horas agora\n2️⃣ 🛒 *Planos e Preços* - Assinar Premium\n3️⃣ ♻️ *Renovação/PIX* - Pagar mensalidade\n4️⃣ 📥 *Instalação* - Como baixar na TV/Celular\n5️⃣ 🤝 *Indique e Ganhe* - Ganhe meses grátis\n6️⃣ 👨🏽‍💻 *Falar com Atendente* - Suporte Humano', 
                            options: [
                              { id: 'opt_1', text: 'Teste Grátis', next_node_id: 'flow_teste' },
                              { id: 'opt_2', text: 'Planos', next_node_id: 'flow_planos' },
                              { id: 'opt_3', text: 'Renovação', next_node_id: 'flow_pix' },
                              { id: 'opt_4', text: 'Instalação', next_node_id: 'flow_instalar' },
                              { id: 'opt_5', text: 'Indique e Ganhe', next_node_id: 'flow_indique' },
                              { id: 'opt_6', text: 'Suporte Humano', next_node_id: 'flow_humano' }
                            ] 
                          },
                          { id: 'flow_teste', type: 'input', content: 'Tudo bem! Para liberar seu teste de 3 horas 100% grátis, preciso do seu *NOME E SOBRENOME*. Escreva abaixo:', options: [] },
                          { id: 'flow_planos', type: 'message', content: 'Que maravilha! Nossos pacotes incluem Filmes, Séries, Novelas e Canais ao Vivo HD/4K.\n\n➔ *MENSAL*: R$ 35,00\n➔ *TRIMESTRAL*: R$ 90,00\n➔ *ANUAL*: R$ 250,00\n\nNossa chave PIX: 00.000.000/0001-00\nMe envie o comprovante para liberação!', options: [] },
                          { id: 'flow_pix', type: 'message', content: 'Para renovar sua assinatura sem que ela expire, nossa chave PIX é:\n\n🔑 *CNPJ*: 00.000.000/0001-00\n👤 Nome: Maxx Premium\n\nApós o pagamento, me envie o *COMPROVANTE* aqui mesmo.', options: [] },
                          { id: 'flow_instalar', type: 'message', content: 'Para instalar na TV Box ou Smart Android:\n\n1. Abra a loja de apps e baixe o botão Laranja *Downloader*\n2. No Downloader, digite o código: *654321*\n3. Aguarde o download do TV MAXX e clique em Instalar.\n\nFácil, né? Qualquer dúvida chame um atendente.', options: [] },
                          { id: 'flow_indique', type: 'message', content: 'A cada amigo que você indicar e fechar a assinatura, você ganha *1 MÊS GRÁTIS*! Pode mandar o contato deles pra mim ou pedir pra eles citarem o seu nome para resgatar. 🎁', options: [] },
                          { id: 'flow_humano', type: 'message', content: 'Aguarde um momentinho... ⏳\n\nEstou parando o atendimento automático e transferindo você para a nossa equipe. Em poucos minutos alguém vai te responder.', options: [] }
                        ] 
                      } 
                    })}
                    className="text-[10px] font-black bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 px-4 py-2 rounded-xl transition-all uppercase tracking-widest"
                  >
                    + CRIAR NOVO ROBÔ
                  </button>
                </div>

                {flowsLoading ? (
                  <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-maxx mx-auto opacity-20" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flows.length === 0 && <div className="col-span-2 py-20 bg-dark-800/50 border border-dashed border-dark-700 rounded-3xl text-center opacity-30 italic">Nenhum robô configurado ainda.</div>}
                    {flows.map(f => (
                      <div key={f.id} className={`bg-dark-800 border rounded-2xl p-5 transition-all shadow-xl hover:translate-y-[-2px] ${f.is_active ? 'border-brand-500/40 bg-brand-500/[0.02]' : 'border-dark-700'}`}>
                         <div className="flex items-start justify-between mb-4">
                           <div className="h-12 w-12 bg-dark-900 rounded-2xl flex items-center justify-center text-brand-400 border border-dark-700 shadow-inner">
                             <Bot className="h-6 w-6" />
                              <button onClick={() => activateFlow(f.id)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${f.is_active ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-dark-900 text-zinc-600 border-dark-700'}`}>
                                {f.is_active ? 'ATIVO' : 'ATIVAR'}
                              </button>
                           </div>
                         </div>
                         <h3 className="text-white font-black text-sm uppercase tracking-tight mb-1">{f.name}</h3>
                         <p className="text-zinc-500 text-[11px] mb-6 flex items-center gap-1.5"><Network className="h-3 w-3" /> {f.content.nodes.length} etapas no fluxo</p>
                         
                         <div className="flex gap-2">
                            <button onClick={() => setEditingFlow(f)} className="flex-1 bg-dark-900 border border-dark-600 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all">EDITAR FLUXO</button>
                            <button onClick={() => deleteFlow(f.id)} className="px-3 bg-dark-900 border border-red-500/20 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MAXXCHAT — LIVE CHAT ENTERPRISE (TELA CHEIA)                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'livechat' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col animate-fadeIn">
          
          {/* Header Global MaxxChat */}
          <div className={`h-[70px] bg-[#0a0a0a] border-b border-dark-700/80 items-center justify-between px-3 md:px-6 shrink-0 relative z-20 shadow-md ${chatActiveJid ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={() => setActiveTab('bulk')}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-dark-800 border border-dark-700 text-zinc-400 hover:text-white transition-all active:scale-95 shadow-inner"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/30">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h1 className="text-white font-black text-base md:text-lg tracking-tight leading-none">MaxxChat</h1>
                  <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mt-0.5 max-w-[120px] md:max-w-none truncate opacity-80">Local Enterprise</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadConversations} className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl text-xs font-bold text-zinc-300 transition-all">
                <RefreshCw className={`h-3.5 w-3.5 ${chatLoading ? 'animate-spin text-green-400' : ''}`} />
                <span className="hidden md:block">Atualizar</span>
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative flex overflow-hidden">
            
            {/* ─── PAINEL 1: LISTA DE CONVERSAS ─── */}
            <div className={`w-full lg:w-[350px] flex-shrink-0 border-r border-dark-700/80 flex flex-col bg-dark-800/30 ${chatActiveJid ? 'hidden lg:flex' : 'flex'}`}>
              
              {/* Box Header Search */}
              <div className="p-4 border-b border-dark-700/50 bg-[#0a0a0a]/50">
                <div className="relative mb-4">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input 
                    value={chatSearch}
                    onChange={e => setChatSearch(e.target.value)}
                    placeholder="Buscar contato ou número..."
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-green-500/50 placeholder-zinc-600 transition-all shadow-inner"
                  />
                </div>
                {/* Status filter chips scrollable on mobile */}
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                  {[
                    { v: 'all', l: 'Todos', c: 'zinc' },
                    { v: 'open', l: 'Abertos', c: 'green' },
                    { v: 'pending', l: 'Pendente', c: 'yellow' },
                    { v: 'resolved', l: 'Resolvidos', c: 'blue' }
                  ].map(f => (
                    <button 
                      key={f.v}
                      onClick={() => setChatStatusFilter(f.v)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                        chatStatusFilter === f.v 
                          ? `bg-${f.c}-500/10 text-${f.c}-400 border-${f.c}-500/30`
                          : 'bg-dark-900 text-zinc-500 border-dark-700 hover:text-zinc-300'
                      }`}
                    >{f.l}</button>
                  ))}
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {chatLoading && chatConversations.length === 0 ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-600" /></div>
                ) : chatConversations.length === 0 ? (
                  <div className="text-center py-20 px-6">
                     <div className="h-16 w-16 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-700">
                       <MessageCircle className="h-6 w-6 text-zinc-600" />
                     </div>
                     <p className="text-white font-bold text-sm">Nenhuma conversa encontrada</p>
                     <p className="text-zinc-600 text-[10px] mt-1 uppercase tracking-widest">Aguardando mensagens...</p>
                  </div>
                ) : chatConversations.map(conv => (
                  <div 
                    key={conv.jid}
                    onClick={() => selectConversation(conv)}
                    className={`flex items-center gap-3 lg:gap-4 px-4 py-3.5 cursor-pointer transition-all border-b border-dark-700/30 hover:bg-dark-700/50 ${
                      chatActiveJid === conv.jid ? 'bg-dark-800/80 border-l-4 border-l-green-500 border-b-dark-700/10' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative h-11 w-11 flex-shrink-0">
                      <ContactAvatar jid={conv.jid} name={conv.name || conv.phone} isGroup={conv.is_group} className="h-11 w-11 text-sm border-2 border-dark-600/50" />
                      {conv.unread_count > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-[#050505] z-10"></span>}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs truncate max-w-[150px] md:max-w-[160px] ${conv.unread_count > 0 ? 'text-white font-black' : 'text-zinc-200 font-bold'}`}>{conv.name || conv.phone || conv.jid}</span>
                        <span className={`text-[9px] font-bold flex-shrink-0 ${conv.unread_count > 0 ? 'text-green-400' : 'text-zinc-600'}`}>{timeAgo(conv.last_message_at)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[11px] truncate flex-1 ${conv.unread_count > 0 ? 'text-zinc-300 font-bold' : 'text-zinc-500'}`}>
                          {conv.last_message || 'Sem histórico de mensagens'}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {conv.bot_active && <Bot className="h-3 w-3 text-brand-400" />}
                          {conv.label_color && <div className="w-2.5 h-2.5 rounded-full ring-2 ring-[#050505]" style={{ backgroundColor: conv.label_color }} />}
                          {conv.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg">{conv.unread_count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── PAINEL 2: CHAT PRINCIPAL ─── */}
            <div className={`flex-1 flex flex-col min-w-0 bg-[#050505] relative ${!chatActiveJid ? 'hidden lg:flex' : 'flex'}`}>
              {!chatActiveJid ? (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dark-800/20 via-[#050505] to-[#050505]">
                  <div className="h-28 w-28 bg-dark-900/50 rounded-full flex items-center justify-center mb-6 border border-dark-700/50 shadow-2xl">
                    <MessageSquare className="h-10 w-10 text-zinc-700" />
                  </div>
                  <h3 className="text-white font-black text-xl mb-2">Central de Atendimento</h3>
                  <p className="text-zinc-500 text-sm max-w-sm">Selecione uma conversa ao lado para visualizar as mensagens e interagir com o cliente em tempo real.</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="h-[72px] px-4 md:px-6 border-b border-dark-700/80 bg-[#0a0a0a]/80 flex items-center justify-between shrink-0 relative z-10 backdrop-blur-md">
                    <div className="flex items-center gap-3 md:gap-4">
                      <button onClick={() => setChatActiveJid(null)} className="lg:hidden flex items-center -ml-2 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-dark-700/50 transition-all active:scale-95">
                        <ArrowLeft className="h-6 w-6" />
                      </button>
                      <ContactAvatar jid={chatActiveConv?.jid} name={chatActiveConv?.name || chatActiveConv?.phone} isGroup={chatActiveConv?.is_group} className="h-11 w-11 text-sm border-2 border-dark-600" />
                      <div className="flex flex-col justify-center">
                        <h3 className="text-white font-black text-sm md:text-base leading-tight">{chatActiveConv?.name || chatActiveConv?.phone || chatActiveJid}</h3>
                        <p className="text-zinc-500 text-[10px] md:text-xs flex items-center gap-2 mt-0.5">
                          {chatActiveConv?.phone && <span className="font-mono">{chatActiveConv.phone}</span>}
                          {chatActiveConv?.phone && <span className="h-1 w-1 bg-dark-600 rounded-full"></span>}
                          {chatActiveConv?.bot_active 
                            ? <span className="text-brand-400 flex items-center gap-1 font-bold uppercase tracking-widest"><Bot className="h-3 w-3" /> Bot Ativo</span>
                            : <span className="text-green-400 flex items-center gap-1 font-bold uppercase tracking-widest"><UserCircle className="h-3 w-3" /> Humano</span>
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <button 
                        onClick={() => updateConvStatus(chatActiveJid, 'resolved')}
                        className="px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hidden sm:flex items-center gap-2"
                      ><Check className="h-3.5 w-3.5" /> Resolver</button>
                      <button 
                        onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
                        className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${chatSidebarOpen ? 'bg-brand-500/10 text-brand-400 border-brand-500/30' : 'bg-dark-800 text-zinc-400 border-dark-700 hover:text-white'}`}
                      ><Menu className="h-5 w-5" /></button>
                    </div>
                  </div>

                  {/* Messages area (Wallpaper WhatsApp style) */}
                  <div 
                    ref={messagesContainerRef}
                    onScroll={handleChatScroll}
                    className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4 bg-[#0a0a0a] relative" 
                    style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                  >
                    {chatLoadingMore && (
                      <div className="flex items-center justify-center py-2 animate-fadeIn">
                        <div className="bg-dark-800/80 px-4 py-1.5 rounded-full border border-dark-700/50 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin text-maxx" />
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Carregando histórico...</span>
                        </div>
                      </div>
                    )}

                    {chatMsgLoading ? (
                      <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-zinc-600" /></div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-xs">
                         <div className="bg-dark-800/80 px-4 py-2 rounded-lg border border-dark-700/50">Histórico criptografado. Novas mensagens aparecerão abaixo.</div>
                      </div>
                    ) : (
                      <>
                        {chatMessages.map((msg, i) => {
                          // Date separator
                          const showDate = i === 0 || new Date(msg.created_at).toDateString() !== new Date(chatMessages[i - 1]?.created_at).toDateString()
                          return (
                            <div key={msg.id || i}>
                              {showDate && (
                                <div className="flex items-center justify-center my-6">
                                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-dark-800 px-4 py-1.5 rounded-full border border-dark-700 shadow-sm backdrop-blur-sm">
                                    {new Date(msg.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                  </span>
                                </div>
                              )}
                              <div className={`flex ${msg.from_me ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-md relative group ${
                                  msg.from_me 
                                    ? msg.is_bot_reply 
                                      ? 'bg-dark-800 border border-brand-500/30 text-zinc-200 shadow-brand-500/5 rounded-tr-sm' 
                                      : 'bg-green-700 text-white rounded-tr-sm'
                                    : 'bg-dark-800 border border-dark-700 text-zinc-200 rounded-tl-sm'
                                }`}>
                                  {msg.is_bot_reply && (
                                    <span className="text-[9px] text-brand-400 font-black uppercase tracking-widest flex items-center gap-1.5 mb-1.5 -ml-1">
                                      <Bot className="h-3 w-3" /> ATENDIMENTO BOT
                                    </span>
                                  )}
                                  {!msg.from_me && msg.sender_name && (
                                    <span className="text-[11px] text-green-400 font-black block mb-1">{msg.sender_name}</span>
                                  )}
                                  {msg.content?.startsWith('/media/') ? (
                                    msg.content.endsWith('.mp4') ? (
                                      <video src={msg.content} controls className="max-w-full rounded-xl mb-2 border border-black/20" style={{ maxHeight: '250px' }} />
                                    ) : (
                                      <img src={msg.content} alt="Media" className="max-w-full rounded-xl mb-2 border border-black/20" style={{ maxHeight: '250px', objectFit: 'cover' }} />
                                    )
                                  ) : msg.content === '[IMAGE]' || msg.content === '[VIDEO]' ? (
                                    <div className="flex items-center gap-2 text-zinc-500 bg-dark-900/50 px-3 py-2 rounded-lg text-[10px] font-bold border border-dark-700 mb-1 leading-tight">
                                      📸 Mídia criptografada (Histórico antigo não carrega de forma retroativa).
                                    </div>
                                  ) : (
                                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                  )}
                                  <div className="flex items-center justify-end gap-1 mt-1.5 -mr-1">
                                    <span className={`text-[10px] font-bold ${msg.from_me ? 'text-white/60' : 'text-zinc-500'}`}>
                                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {msg.from_me && <CheckCircle className={`h-3 w-3 ${msg.status === 'read' ? 'text-blue-400' : 'text-white/40'}`} />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={chatEndRef} />
                      </>
                    )}
                  </div>

                  {/* Quick replies dropdown */}
                  {filteredQR.length > 0 && (
                    <div className="absolute bottom-[80px] left-4 right-4 md:left-6 md:right-6 border border-dark-600 bg-dark-800/95 backdrop-blur-xl max-h-[220px] overflow-y-auto rounded-2xl shadow-2xl z-50 p-2">
                       <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest px-3 py-2 border-b border-dark-700">Respostas Rápidas Sugeridas</p>
                      {filteredQR.map(qr => (
                        <button 
                          key={qr.id}
                          onClick={() => { setChatInput(qr.content); setChatShowQR(false) }}
                          className="w-full text-left px-3 py-2.5 hover:bg-dark-700/50 rounded-xl transition-colors flex items-center gap-3 mt-1"
                        >
                          <span className="text-zinc-900 bg-brand-400 px-2 py-0.5 rounded text-[10px] font-black uppercase">{qr.shortcut}</span>
                          <span className="text-zinc-300 text-[13px] truncate flex-1">{qr.content}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Compose bar */}
                  <div className="p-3 md:p-4 border-t border-dark-700/80 bg-[#0a0a0a]/90 backdrop-blur-lg shrink-0 relative z-20">
                    <div className="flex items-end gap-2 md:gap-3 max-w-5xl mx-auto">
                      <div className="flex-1 relative bg-dark-900 border border-dark-700 rounded-2xl md:rounded-[24px] flex items-center shadow-inner overflow-hidden transition-all focus-within:border-green-500/50">
                        <textarea 
                          ref={chatInputRef}
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={handleChatKeyDown}
                          placeholder="Digite uma mensagem... ( / respostas rápidas)"
                          rows={1}
                          className="w-full bg-transparent px-5 py-4 text-[14px] text-white outline-none placeholder-zinc-600 resize-none"
                          style={{ minHeight: '56px', maxHeight: '160px' }}
                        />
                      </div>
                      <button 
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim() || chatSending}
                        className="h-[56px] w-[56px] flex items-center justify-center px-0 bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl shadow-lg shadow-green-600/20 active:scale-95 transition-all flex-shrink-0"
                      >
                        {chatSending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ─── PAINEL 3: SIDEBAR DE DETALHES ─── */}
            {chatSidebarOpen && chatActiveConv && (
              <div className={`absolute inset-0 z-[100] lg:static lg:z-auto w-full lg:w-[320px] flex-shrink-0 border-l border-dark-700/80 bg-[#0a0a0a] overflow-y-auto custom-scrollbar flex flex-col ${chatActiveJid ? 'flex' : 'hidden lg:flex'}`}>
                {/* Mobile close button for sidebar */}
                <div className="lg:hidden absolute top-4 right-4 z-[110]">
                   <button onClick={() => setChatSidebarOpen(false)} className="h-10 w-10 bg-dark-800 rounded-full flex items-center justify-center text-white"><X className="h-5 w-5"/></button>
                </div>
                
                {/* Contact info header */}
                <div className="p-6 lg:p-8 border-b border-dark-700/50 text-center bg-dark-900/20">
                  <div className={`h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-xl ${
                    chatActiveConv.is_group ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                    {chatActiveConv.is_group ? <Users className="h-10 w-10" /> : (chatActiveConv.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-white font-black text-lg mb-1 leading-tight">{chatActiveConv.name || 'Contato Sem Nome'}</h3>
                  {chatActiveConv.phone && (
                    <p className="text-zinc-500 text-xs flex items-center justify-center gap-1.5 font-mono">
                      <Smartphone className="h-3.5 w-3.5" /> +{chatActiveConv.phone}
                    </p>
                  )}
                </div>

                {/* Bot Toggle Card */}
                <div className="p-5 border-b border-dark-700/50">
                  <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-white flex items-center gap-2">
                        <div className="bg-brand-500/20 p-1.5 rounded-lg"><Bot className="h-4 w-4 text-brand-400" /></div> Chatbot Auto
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={chatActiveConv.bot_active} onChange={() => toggleBotForConv(chatActiveJid, chatActiveConv.bot_active)} />
                        <div className="w-11 h-6 bg-dark-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500 shadow-inner"></div>
                      </label>
                    </div>
                    <p className="text-[10px] text-zinc-500 pr-8">
                       {chatActiveConv.bot_active ? 'O bot está respondendo automaticamente baseado nos fluxos.' : 'Bot desligado. Apenas respostas manuais estão permitidas.'}
                    </p>
                  </div>
                </div>

                {/* Labels Card */}
                <div className="p-5 border-b border-dark-700/50">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Tag className="h-3 w-3" /> Etiquetas de Contato
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => updateLabel(chatActiveJid, null)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        !chatActiveConv.label_id ? 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30' : 'bg-dark-900 text-zinc-500 border-dark-700 hover:text-white hover:bg-dark-800'
                      }`}
                    >Limpar Etiquetas</button>
                    {chatLabels.map(label => (
                      <button 
                        key={label.id}
                        onClick={() => updateLabel(chatActiveJid, label.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 shadow-sm`}
                        style={{ 
                          backgroundColor: chatActiveConv.label_id === label.id ? `${label.color}20` : 'transparent',
                          color: chatActiveConv.label_id === label.id ? label.color : '#a1a1aa',
                          borderColor: chatActiveConv.label_id === label.id ? `${label.color}50` : '#27272a'
                        }}
                      >{label.name}</button>
                    ))}
                  </div>
                </div>

                {/* Status Options */}
                <div className="p-5 border-b border-dark-700/50">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <CircleDot className="h-3 w-3" /> Condição do Ticket
                  </span>
                  <div className="flex flex-col gap-2">
                    {[
                      { v: 'open', l: 'Atendimento Aberto', color: 'green', icon: Inbox },
                      { v: 'pending', l: 'Pendente / Aguardando', color: 'yellow', icon: Clock },
                      { v: 'resolved', l: 'Resolvido / Finalizado', color: 'blue', icon: CheckCircle }
                    ].map(s => {
                      const Icon = s.icon;
                      return (
                      <button 
                        key={s.v}
                        onClick={() => updateConvStatus(chatActiveJid, s.v)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                          chatActiveConv.status === s.v 
                            ? `bg-${s.color}-500/10 text-${s.color}-400 border-${s.color}-500/30`
                            : 'bg-dark-900 text-zinc-400 border-dark-700 hover:bg-dark-800 hover:text-white'
                        }`}
                      ><Icon className="h-4 w-4" /> {s.l}</button>
                    )})}
                  </div>
                </div>

                {/* Notes Block */}
                <div className="p-5 flex-1 flex flex-col min-h-[200px]">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <StickyNote className="h-3 w-3" /> Bloco de Notas Interno
                  </span>
                  <textarea 
                    value={chatNotesInput}
                    onChange={e => saveNotes(chatActiveJid, e.target.value)}
                    placeholder="Adicione observações particulares sobre este cliente. Ele não verá isso..."
                    className="flex-1 w-full bg-dark-900 border border-dark-700 rounded-2xl p-4 text-[13px] text-zinc-300 outline-none focus:border-brand-500/50 placeholder-zinc-700 resize-none transition-all shadow-inner"
                  />
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2 flex items-center justify-end gap-1"><CloudLightning className="h-3 w-3"/> Salvo automaticamente</p>
                </div>
              </div>
            )}
          </div>
        </div>
      , document.body)}

      {/* ── MODAL: EDITOR DE FLUXO (MAXXFLOW) ── */}
      {editingFlow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingFlow(null)} />
          <div className="relative bg-dark-800 border border-dark-700 w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-dark-700 flex items-center justify-between bg-dark-900/40">
               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20 text-brand-400">
                   <Network className="h-5 w-5" />
                 </div>
                 <div>
                    <input 
                      value={editingFlow.name} 
                      onChange={e => setEditingFlow({...editingFlow, name: e.target.value})}
                      className="bg-transparent border-none text-white font-black text-xl outline-none placeholder-zinc-700 p-0"
                      placeholder="Nome do Robô"
                    />
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-0.5">Editor de Fluxo Inteligente</p>
                 </div>
               </div>
               <button onClick={() => setEditingFlow(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-dark-900 border border-dark-700 text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-dark-900/40 backdrop-invert-[0.02]">
              <div className="max-w-xl mx-auto space-y-12 relative">
                {/* Linha conectora visual */}
                <div className="absolute left-[24px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-brand-500/50 via-brand-500/20 to-transparent z-0 shadow-[0_0_15px_rgba(255,165,0,0.1)]" />

                {editingFlow.content.nodes.map((node, idx) => (
                  <div key={idx} className="relative z-10 animate-slideUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="flex gap-6">
                      <div className="h-12 w-12 rounded-2xl bg-dark-800 border-2 border-brand-500/40 flex items-center justify-center text-brand-400 font-black text-sm shadow-[0_0_20px_rgba(255,165,0,0.1)] shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1 bg-dark-800 border-2 border-dark-700 rounded-3xl p-5 shadow-2xl relative group hover:border-brand-500/30 transition-all">
                        <div className="flex items-center justify-between mb-4 border-b border-dark-700/50 pb-4">
                           <div className="flex items-center gap-3">
                             {node.type === 'message' && <div className="bg-blue-500/10 text-blue-400 p-2 rounded-xl"><MessageSquare className="h-4 w-4" /></div>}
                             {node.type === 'input' && <div className="bg-orange-500/10 text-orange-400 p-2 rounded-xl"><PenTool className="h-4 w-4" /></div>}
                             {node.type === 'choice' && <div className="bg-purple-500/10 text-purple-400 p-2 rounded-xl"><Layers className="h-4 w-4" /></div>}
                             <select 
                                value={node.type} 
                                onChange={e => {
                                  const newNodes = [...editingFlow.content.nodes]
                                  newNodes[idx].type = e.target.value
                                  setEditingFlow({...editingFlow, content: { nodes: newNodes }})
                                }}
                                className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 text-xs font-black text-zinc-300 uppercase tracking-widest outline-none appearance-none cursor-pointer"
                             >
                               <option value="message">💬 MENSAGEM</option>
                               <option value="choice">🔘 MENU / CONDIÇÕES</option>
                               <option value="input">⌨️ ENTRADA DE DADOS</option>
                             </select>
                           </div>
                           <button onClick={() => {
                             const newNodes = editingFlow.content.nodes.filter((_, i) => i !== idx)
                             setEditingFlow({...editingFlow, content: { nodes: newNodes }})
                           }} className="text-zinc-600 hover:text-red-500 p-2 bg-dark-900 rounded-xl transition-all border border-dark-700"><Trash2 className="h-4 w-4" /></button>
                        </div>

                        {node.type === 'input' && (
                           <div className="mb-3 px-1 flex items-center gap-2">
                             <span className="text-[10px] text-zinc-500 font-bold uppercase">Definir variável:</span>
                             <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">{node.id === 'ask_name' ? 'Nome do Cliente' : 'Resposta do Usuário'}</span>
                           </div>
                        )}

                        <textarea 
                          value={node.content} 
                          onChange={e => {
                             const newNodes = [...editingFlow.content.nodes]
                             newNodes[idx].content = e.target.value
                             setEditingFlow({...editingFlow, content: { nodes: newNodes }})
                          }}
                          className={`${node.type === 'message' ? 'bg-dark-900 border border-dark-700 shadow-inner' : 'bg-transparent border-0 border-b border-dark-600 focus:border-brand-500 rounded-none'} w-full rounded-2xl p-4 text-zinc-300 text-sm outline-none transition-all font-sans leading-relaxed min-h-[80px] mb-2`} 
                          placeholder={node.type === 'input' ? 'Pergunta que o robô fará para capturar o dado...' : 'O que o robô deve dizer?'}
                        />

                        {node.type === 'choice' && (
                          <div className="mt-4 space-y-3 bg-dark-900/50 p-4 rounded-2xl border border-dark-700/50">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2"><Network className="h-3 w-3" /> Condições / Botões</p>
                              <button onClick={() => {
                                const newNodes = [...editingFlow.content.nodes]
                                newNodes[idx].options.push({ id: Date.now().toString(), text: 'Nova Opção', next_node_id: '' })
                                setEditingFlow({...editingFlow, content: { nodes: newNodes }})
                              }} className="text-[10px] bg-brand-500/10 text-brand-400 px-3 py-1 rounded-lg border border-brand-500/20 font-black hover:bg-brand-500/20 transition-all">+ ADICIONAR LIGAÇÃO</button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {node.options.map((opt, oIdx) => (
                                <div key={oIdx} className="bg-dark-800 border border-dark-600 rounded-xl p-3 flex flex-wrap lg:flex-nowrap items-center gap-3 shadow-lg">
                                  <div className="flex items-center gap-2 w-full lg:w-auto flex-1">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase">SE</span>
                                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">Mensagem</span>
                                    <span className="text-[10px] font-black text-zinc-600">=</span >
                                    <input 
                                      value={opt.text} 
                                      onChange={e => {
                                        const newNodes = [...editingFlow.content.nodes]
                                        newNodes[idx].options[oIdx].text = e.target.value
                                        setEditingFlow({...editingFlow, content: { nodes: newNodes }})
                                      }}
                                      className="flex-1 bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-lg text-white text-[11px] font-bold outline-none focus:border-brand-500/50 min-w-[120px]"
                                      placeholder="Ex: Teste Grátis"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap">VAI PARA</span>
                                     <select 
                                       value={opt.next_node_id} 
                                       onChange={e => {
                                         const newNodes = [...editingFlow.content.nodes]
                                         newNodes[idx].options[oIdx].next_node_id = e.target.value
                                         setEditingFlow({...editingFlow, content: { nodes: newNodes }})
                                       }}
                                       className="bg-brand-500/5 text-brand-400 text-[11px] font-black uppercase border border-brand-500/20 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                                     >
                                       <option value="">(ESCOLHA)</option>
                                       {editingFlow.content.nodes.map((n, ni) => <option key={ni} value={n.id}>ETAPA {ni+1}: {n.type === 'message' ? '💬' : n.type === 'input' ? '⌨️' : '🔘'}</option>)}
                                     </select>
                                     <button onClick={() => {
                                       const newNodes = [...editingFlow.content.nodes]
                                       newNodes[idx].options = newNodes[idx].options.filter((_, oi) => oi !== oIdx)
                                       setEditingFlow({...editingFlow, content: { nodes: newNodes }})
                                     }} className="text-zinc-600 hover:text-white bg-dark-900 border border-dark-700 p-1.5 rounded-lg transition-all"><X className="h-3 w-3" /></button>
                                  </div>
                                </div>
                              ))}
                              {node.options.length === 0 && (
                                <p className="text-[10px] text-zinc-600 text-center py-4 italic">Nenhuma opção configurada. O robô irá parar de responder após este bloco ou precisará usar a opção "Senão".</p>
                              )}
                              {/* Senão block */}
                              <div className="bg-dark-900/50 border border-dark-700/30 border-dashed rounded-xl p-3 flex items-center justify-between opacity-50 mt-1">
                                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Senão (Padrão)</span>
                                 <span className="text-[9px] text-zinc-600 border border-dark-700 px-2 py-1 rounded badge">Fim do Atendimento</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => {
                    const newId = `node_${Date.now()}`
                    setEditingFlow({...editingFlow, content: { nodes: [...editingFlow.content.nodes, { id: newId, type: 'message', content: 'Próxima mensagem...', options: [] }] }})
                  }}
                  className="w-full h-16 border-2 border-dashed border-dark-700 rounded-[24px] flex items-center justify-center gap-3 text-zinc-600 hover:text-brand-500 hover:border-brand-500/30 hover:bg-brand-500/[0.02] transition-all font-black text-xs uppercase tracking-[0.2em] relative z-10"
                >
                  <Plus className="h-4 w-4" /> Adicionar Nova Etapa
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-dark-700 bg-dark-900/60 flex items-center justify-between gap-4">
               <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest hidden md:flex">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_5px_rgba(255,165,0,0.5)]" /> Auto-Save Local Ativo</div>
               </div>
               <div className="flex flex-1 md:flex-none gap-3">
                 <button onClick={() => setEditingFlow(null)} className="flex-1 md:flex-none px-8 py-3 bg-dark-900 border border-dark-700 text-zinc-400 font-black rounded-2xl hover:text-white transition-all text-[10px] uppercase tracking-widest">Sair sem salvar</button>
                 <button onClick={() => saveFlow(editingFlow)} className="flex-1 md:flex-none px-12 py-3 bg-maxx text-white font-black rounded-2xl shadow-xl shadow-maxx/10 hover:brightness-110 active:scale-95 transition-all text-xs tracking-widest uppercase">GRAVAR ROBÔ</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
