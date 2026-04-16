import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWhatsApp } from '../context/WhatsAppContext'
import {
  MessageCircle, QrCode, CheckCircle, X, Loader2, Send,
  Users, RefreshCw, Bot, MessageSquare,
  Search, Tag, StickyNote, Power, Hash, CircleDot, UserCircle, ArrowLeft, Menu, CloudLightning,
  Smartphone, Clock, Inbox, Check
} from 'lucide-react'

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
        if (res.ok) { const d = await res.json(); if (isMounted && d.url) setPicUrl(d.url) }
      } catch (e) {}
    }
    fetchPic()
    return () => { isMounted = false }
  }, [jid])

  if (picUrl) return <img src={picUrl} alt={name || jid} className={`object-cover rounded-full ${className}`} />
  return (
    <div className={`rounded-full flex items-center justify-center font-black relative flex-shrink-0 ${
      isGroup ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
    } ${className}`}>
      {isGroup ? <Users className="h-[50%] w-[50%]" /> : (name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

export default function LiveChat() {
  const navigate = useNavigate()
  const { waStatus, waQrCode, loadStatus, connectWhatsApp } = useWhatsApp()

  // ── State ──
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeJid, setActiveJid] = useState(null)
  const [activeConv, setActiveConv] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [labels, setLabels] = useState([])
  const [quickReplies, setQuickReplies] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notesInput, setNotesInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [msgLoading, setMsgLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const notesTimerRef = useRef(null)

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // ─── API ──────────────────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (chatSearch) params.set('search', chatSearch)
      const res = await fetch(`/api/whatsapp/chat/conversations?${params}`, { headers: getAuthHeader() })
      if (res.ok) { const d = await res.json(); setConversations(d.conversations || []) }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [statusFilter, chatSearch])

  const loadMessages = useCallback(async (jid) => {
    setMsgLoading(true)
    setHasMore(true)
    try {
      const res = await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/messages`, { headers: getAuthHeader() })
      if (res.ok) {
        const d = await res.json()
        setMessages(d.messages || [])
        if ((d.messages || []).length < 50) setHasMore(false)
      }
    } catch (e) {}
    finally { setMsgLoading(false) }
  }, [])

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || messages.length === 0) return
    setLoadingMore(true)
    const oldestId = messages[0].id
    const scrollPos = messagesContainerRef.current?.scrollHeight
    try {
      const res = await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(activeJid)}/messages?before=${oldestId}`, { headers: getAuthHeader() })
      if (res.ok) {
        const d = await res.json()
        const newMsgs = d.messages || []
        if (newMsgs.length === 0) {
          setHasMore(false)
        } else {
          setMessages(prev => [...newMsgs, ...prev])
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - scrollPos
            }
          }, 0)
          if (newMsgs.length < 50) setHasMore(false)
        }
      }
    } catch (e) {}
    finally { setLoadingMore(false) }
  }

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore && !loadingMore) loadMoreMessages()
  }

  const loadLabels = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/chat/labels', { headers: getAuthHeader() })
      if (res.ok) { const d = await res.json(); setLabels(d.labels || []) }
    } catch (e) {}
  }, [])

  const loadQuickReplies = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/chat/quick-replies', { headers: getAuthHeader() })
      if (res.ok) { const d = await res.json(); setQuickReplies(d.quickReplies || []) }
    } catch (e) {}
  }, [])

  const selectConv = (conv) => {
    setActiveJid(conv.jid)
    setActiveConv(conv)
    setNotesInput(conv.notes || '')
    loadMessages(conv.jid)
  }

  const sendMessage = async () => {
    if (!chatInput.trim() || !activeJid || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/whatsapp/chat/send', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid: activeJid, message: chatInput.trim() })
      })
      if (res.ok) {
        setChatInput('')
        setMessages(prev => [...prev, {
          id: `opt_${Date.now()}`, from_me: true, sender_name: 'Atendente',
          content: chatInput.trim(), media_type: 'text', is_bot_reply: false,
          created_at: new Date().toISOString()
        }])
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (e) { showFeedback('Erro ao enviar.', 'error') }
    finally { setSending(false) }
  }

  const toggleBot = async (jid, currentState) => {
    try {
      await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/bot`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_active: !currentState })
      })
      setActiveConv(prev => prev ? { ...prev, bot_active: !currentState } : prev)
      showFeedback(!currentState ? 'Bot ativado!' : 'Bot desativado — Atendimento humano')
      loadConversations()
    } catch (e) {}
  }

  const updateLabel = async (jid, labelId) => {
    try {
      await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/label`, {
        method: 'PUT', headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ label_id: labelId })
      })
      loadConversations()
    } catch (e) {}
  }

  const updateStatus = async (jid, status) => {
    try {
      await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/status`, {
        method: 'PUT', headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      loadConversations()
      showFeedback(status === 'resolved' ? 'Conversa resolvida!' : 'Status atualizado')
    } catch (e) {}
  }

  const saveNotes = (jid, text) => {
    setNotesInput(text)
    clearTimeout(notesTimerRef.current)
    notesTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/whatsapp/chat/conversations/${encodeURIComponent(jid)}/notes`, {
          method: 'PUT', headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: text })
        })
      } catch (e) {}
    }, 1500)
  }

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const filteredQR = chatInput.startsWith('/')
    ? quickReplies.filter(qr => qr.shortcut.toLowerCase().includes(chatInput.toLowerCase()))
    : []

  const totalUnread = conversations.reduce((a, c) => a + (c.unread_count || 0), 0)

  // ── Effects ──
  useEffect(() => {
    loadConversations()
    loadLabels()
    loadQuickReplies()
  }, [loadConversations, loadLabels, loadQuickReplies])

  useEffect(() => {
    const interval = setInterval(loadConversations, 8000)
    return () => clearInterval(interval)
  }, [loadConversations])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let socket
    try {
      const io = require('socket.io-client')
      socket = io(window.location.origin)
      if (activeJid) socket.emit('join_chat', activeJid)
      socket.on('new_message', (msg) => {
        if (msg.jid === activeJid) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
        loadConversations()
      })
      socket.on('conversation_updated', () => loadConversations())
    } catch (e) { /* sem socket.io-client */ }
    return () => { if (socket) socket.disconnect() }
  }, [activeJid])

  // ─── WhatsApp Desconectado — tela de aviso ─────────────────────────────────
  if (waStatus !== 'connected') {
    return (
      <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6 animate-fadeIn">
        <div className="max-w-md w-full text-center">
          <div className="h-24 w-24 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-2xl shadow-green-500/5">
            <MessageSquare className="h-12 w-12 text-green-500/60" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">MaxxChat — Chat ao Vivo</h1>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
            Para usar o atendimento ao vivo, você precisa conectar o WhatsApp primeiro.
          </p>

          {waStatus === 'disconnected' && !waQrCode && (
            <button
              onClick={() => connectWhatsApp()}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-600/20 text-sm tracking-widest uppercase active:scale-95"
            >
              <QrCode className="h-5 w-5" /> Gerar QR Code
            </button>
          )}

          {waStatus === 'disconnected' && waQrCode && (
            <div className="animate-fadeIn bg-dark-800 border border-dark-700 rounded-3xl p-6">
              <p className="text-green-400 text-[11px] font-black tracking-widest uppercase mb-4 animate-pulse">Escaneie com seu WhatsApp</p>
              <div className="bg-white p-3 rounded-2xl inline-block mb-4 shadow-2xl">
                <img src={`data:image/png;base64,${waQrCode}`} alt="QR Code" className="w-44 h-44" />
              </div>
              <p className="text-zinc-600 text-xs">Atualizando automaticamente...</p>
            </div>
          )}

          {waStatus === 'loading' && (
            <div className="flex items-center justify-center gap-3 text-yellow-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-bold text-sm">Conectando...</span>
            </div>
          )}

          <button
            onClick={() => navigate('/whatsapp-auto')}
            className="mt-6 text-zinc-500 hover:text-white text-sm transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Ir para Automação WhatsApp
          </button>
        </div>
      </div>
    )
  }

  // ─── INTERFACE PRINCIPAL ───────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col animate-fadeIn">

      {/* ── Feedback ── */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-[10000] p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-lg border animate-fadeIn min-w-[280px] ${
          feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
          feedback.type === 'error'   ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                        'bg-dark-800 text-yellow-400 border-yellow-500/30'
        }`}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)}><X className="h-4 w-4 ml-3" /></button>
        </div>
      )}

      {/* ── HEADER GLOBAL ── */}
      <div className={`h-[70px] bg-[#0a0a0a] border-b border-dark-700/80 items-center justify-between px-3 md:px-6 shrink-0 relative z-20 shadow-md ${activeJid ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => navigate('/dashboard')}
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
              <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mt-0.5 opacity-80">
                Chat ao Vivo
                {totalUnread > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{totalUnread}</span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status WhatsApp */}
          <div className="hidden md:flex items-center gap-2 bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-xl text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 font-black uppercase tracking-widest">Online</span>
          </div>
          <button
            onClick={loadConversations}
            className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl text-xs font-bold text-zinc-300 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-green-400' : ''}`} />
            <span className="hidden md:block">Atualizar</span>
          </button>
        </div>
      </div>

      {/* ── CORPO PRINCIPAL ── */}
      <div className="flex-1 w-full relative flex overflow-hidden">

        {/* ─── PAINEL 1: LISTA DE CONVERSAS ─── */}
        <div className={`w-full lg:w-[340px] flex-shrink-0 border-r border-dark-700/80 flex flex-col bg-dark-800/30 ${activeJid ? 'hidden lg:flex' : 'flex'}`}>

          {/* Busca + Filtros */}
          <div className="p-4 border-b border-dark-700/50 bg-[#0a0a0a]/50 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                value={chatSearch}
                onChange={e => setChatSearch(e.target.value)}
                placeholder="Buscar contato..."
                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-green-500/50 placeholder-zinc-600 transition-all shadow-inner"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {[
                { v: 'all', l: 'Todos', c: 'zinc' },
                { v: 'open', l: 'Abertos', c: 'green' },
                { v: 'pending', l: 'Pendente', c: 'yellow' },
                { v: 'resolved', l: 'Resolvidos', c: 'blue' }
              ].map(f => (
                <button
                  key={f.v}
                  onClick={() => setStatusFilter(f.v)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                    statusFilter === f.v
                      ? `bg-${f.c}-500/10 text-${f.c}-400 border-${f.c}-500/30`
                      : 'bg-dark-900 text-zinc-500 border-dark-700 hover:text-zinc-300'
                  }`}
                >{f.l}</button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && conversations.length === 0 ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-600" /></div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="h-16 w-16 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-700">
                  <MessageCircle className="h-6 w-6 text-zinc-600" />
                </div>
                <p className="text-white font-bold text-sm">Nenhuma conversa</p>
                <p className="text-zinc-600 text-[10px] mt-1 uppercase tracking-widest">Aguardando mensagens...</p>
              </div>
            ) : conversations.map(conv => (
              <div
                key={conv.jid}
                onClick={() => selectConv(conv)}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-dark-700/30 hover:bg-dark-700/50 ${
                  activeJid === conv.jid ? 'bg-dark-800/80 border-l-4 border-l-green-500' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="relative h-11 w-11 flex-shrink-0">
                  <ContactAvatar jid={conv.jid} name={conv.name || conv.phone} isGroup={conv.is_group} className="h-11 w-11 text-sm border-2 border-dark-600/50" />
                  {conv.unread_count > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-[#050505] z-10" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs truncate max-w-[150px] ${conv.unread_count > 0 ? 'text-white font-black' : 'text-zinc-200 font-bold'}`}>
                      {conv.name || conv.phone || conv.jid}
                    </span>
                    <span className={`text-[9px] font-bold flex-shrink-0 ${conv.unread_count > 0 ? 'text-green-400' : 'text-zinc-600'}`}>
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[11px] truncate flex-1 ${conv.unread_count > 0 ? 'text-zinc-300 font-bold' : 'text-zinc-500'}`}>
                      {conv.last_message || 'Sem histórico'}
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

        {/* ─── PAINEL 2: ÁREA DO CHAT ─── */}
        <div className={`flex-1 flex flex-col min-w-0 bg-[#050505] relative ${!activeJid ? 'hidden lg:flex' : 'flex'}`}>
          {!activeJid ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(ellipse_at_center,_#111111_0%,_#050505_80%)]">
              <div className="h-28 w-28 bg-dark-900/50 rounded-full flex items-center justify-center mb-6 border border-dark-700/50 shadow-2xl">
                <MessageSquare className="h-10 w-10 text-zinc-700" />
              </div>
              <h3 className="text-white font-black text-xl mb-2">Central de Atendimento</h3>
              <p className="text-zinc-500 text-sm max-w-sm">Selecione uma conversa à esquerda para começar.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-[72px] px-4 md:px-6 border-b border-dark-700/80 bg-[#0a0a0a]/80 flex items-center justify-between shrink-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3 md:gap-4">
                  <button onClick={() => setActiveJid(null)} className="lg:hidden flex items-center p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-dark-700/50 transition-all">
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  <ContactAvatar jid={activeConv?.jid} name={activeConv?.name || activeConv?.phone} isGroup={activeConv?.is_group} className="h-11 w-11 text-sm border-2 border-dark-600" />
                  <div>
                    <h3 className="text-white font-black text-sm md:text-base leading-tight">{activeConv?.name || activeConv?.phone || activeJid}</h3>
                    <p className="text-zinc-500 text-[10px] flex items-center gap-2 mt-0.5">
                      {activeConv?.phone && <span className="font-mono">{activeConv.phone}</span>}
                      {activeConv?.bot_active
                        ? <span className="text-brand-400 flex items-center gap-1 font-bold uppercase tracking-widest"><Bot className="h-3 w-3" /> Bot Ativo</span>
                        : <span className="text-green-400 flex items-center gap-1 font-bold uppercase tracking-widest"><UserCircle className="h-3 w-3" /> Humano</span>
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <button
                    onClick={() => updateStatus(activeJid, 'resolved')}
                    className="px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hidden sm:flex items-center gap-2"
                  ><Check className="h-3.5 w-3.5" /> Resolver</button>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${sidebarOpen ? 'bg-brand-500/10 text-brand-400 border-brand-500/30' : 'bg-dark-800 text-zinc-400 border-dark-700 hover:text-white'}`}
                  ><Menu className="h-5 w-5" /></button>
                </div>
              </div>

              {/* Mensagens */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4 bg-[#0a0a0a]"
                style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '20px 20px' }}
              >
                {loadingMore && (
                  <div className="flex items-center justify-center py-2">
                    <div className="bg-dark-800/80 px-4 py-1.5 rounded-full border border-dark-700/50 flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-maxx" />
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Carregando histórico...</span>
                    </div>
                  </div>
                )}

                {msgLoading ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-zinc-600" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-xs">
                    <div className="bg-dark-800/80 px-4 py-2 rounded-lg border border-dark-700/50">Histórico criptografado. Novas mensagens aparecerão abaixo.</div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const showDate = i === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[i - 1]?.created_at).toDateString()
                      return (
                        <div key={msg.id || i}>
                          {showDate && (
                            <div className="flex items-center justify-center my-6">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-dark-800 px-4 py-1.5 rounded-full border border-dark-700 shadow-sm">
                                {new Date(msg.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${msg.from_me ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-md relative group ${
                              msg.from_me
                                ? msg.is_bot_reply
                                  ? 'bg-dark-800 border border-brand-500/30 text-zinc-200 rounded-tr-sm'
                                  : 'bg-green-700 text-white rounded-tr-sm'
                                : 'bg-dark-800 border border-dark-700 text-zinc-200 rounded-tl-sm'
                            }`}>
                              {msg.is_bot_reply && (
                                <span className="text-[9px] text-brand-400 font-black uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                                  <Bot className="h-3 w-3" /> ATENDIMENTO BOT
                                </span>
                              )}
                              {!msg.from_me && msg.sender_name && (
                                <span className="text-[11px] text-green-400 font-black block mb-1">{msg.sender_name}</span>
                              )}
                              {msg.content?.startsWith('/media/') ? (
                                msg.content.endsWith('.mp4')
                                  ? <video src={msg.content} controls className="max-w-full rounded-xl mb-2" style={{ maxHeight: '250px' }} />
                                  : <img src={msg.content} alt="Media" className="max-w-full rounded-xl mb-2" style={{ maxHeight: '250px', objectFit: 'cover' }} />
                              ) : msg.content === '[IMAGE]' || msg.content === '[VIDEO]' ? (
                                <div className="flex items-center gap-2 text-zinc-500 bg-dark-900/50 px-3 py-2 rounded-lg text-[10px] font-bold border border-dark-700 mb-1">
                                  📸 Mídia criptografada (Histórico antigo).
                                </div>
                              ) : (
                                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              )}
                              <div className="flex items-center justify-end gap-1 mt-1.5">
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

              {/* Quick Replies */}
              {filteredQR.length > 0 && (
                <div className="absolute bottom-[80px] left-4 right-4 border border-dark-600 bg-dark-800/95 backdrop-blur-xl max-h-[220px] overflow-y-auto rounded-2xl shadow-2xl z-50 p-2">
                  <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest px-3 py-2 border-b border-dark-700">Respostas Rápidas</p>
                  {filteredQR.map(qr => (
                    <button
                      key={qr.id}
                      onClick={() => { setChatInput(qr.content) }}
                      className="w-full text-left px-3 py-2.5 hover:bg-dark-700/50 rounded-xl transition-colors flex items-center gap-3 mt-1"
                    >
                      <span className="text-zinc-900 bg-brand-400 px-2 py-0.5 rounded text-[10px] font-black uppercase">{qr.shortcut}</span>
                      <span className="text-zinc-300 text-[13px] truncate flex-1">{qr.content}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Compose */}
              <div className="p-3 md:p-4 border-t border-dark-700/80 bg-[#0a0a0a]/90 backdrop-blur-lg shrink-0 z-20">
                <div className="flex items-end gap-2 md:gap-3 max-w-5xl mx-auto">
                  <div className="flex-1 relative bg-dark-900 border border-dark-700 rounded-2xl flex items-center shadow-inner overflow-hidden transition-all focus-within:border-green-500/50">
                    <textarea
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Digite uma mensagem... ( / respostas rápidas)"
                      rows={1}
                      className="w-full bg-transparent px-5 py-4 text-[14px] text-white outline-none placeholder-zinc-600 resize-none"
                      style={{ minHeight: '56px', maxHeight: '160px' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim() || sending}
                    className="h-[56px] w-[56px] flex items-center justify-center bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl shadow-lg shadow-green-600/20 active:scale-95 transition-all flex-shrink-0"
                  >
                    {sending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── PAINEL 3: SIDEBAR DETALHES ─── */}
        {sidebarOpen && activeConv && (
          <div className={`absolute inset-0 z-[100] lg:static lg:z-auto w-full lg:w-[300px] flex-shrink-0 border-l border-dark-700/80 bg-[#0a0a0a] overflow-y-auto custom-scrollbar flex flex-col ${activeJid ? 'flex' : 'hidden lg:flex'}`}>
            {/* Mobile close */}
            <div className="lg:hidden absolute top-4 right-4 z-[110]">
              <button onClick={() => setSidebarOpen(false)} className="h-10 w-10 bg-dark-800 rounded-full flex items-center justify-center text-white"><X className="h-5 w-5" /></button>
            </div>

            {/* Contact Info */}
            <div className="p-6 border-b border-dark-700/50 text-center bg-dark-900/20">
              <div className={`h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-xl ${
                activeConv.is_group ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}>
                {activeConv.is_group ? <Users className="h-10 w-10" /> : (activeConv.name || '?').charAt(0).toUpperCase()}
              </div>
              <h3 className="text-white font-black text-lg mb-1 leading-tight">{activeConv.name || 'Contato Sem Nome'}</h3>
              {activeConv.phone && (
                <p className="text-zinc-500 text-xs flex items-center justify-center gap-1.5 font-mono">
                  <Smartphone className="h-3.5 w-3.5" /> +{activeConv.phone}
                </p>
              )}
            </div>

            {/* Bot Toggle */}
            <div className="p-5 border-b border-dark-700/50">
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-white flex items-center gap-2">
                    <div className="bg-brand-500/20 p-1.5 rounded-lg"><Bot className="h-4 w-4 text-brand-400" /></div> Chatbot Auto
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={activeConv.bot_active} onChange={() => toggleBot(activeJid, activeConv.bot_active)} />
                    <div className="w-11 h-6 bg-dark-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500 shadow-inner" />
                  </label>
                </div>
                <p className="text-[10px] text-zinc-500">
                  {activeConv.bot_active ? 'O bot está respondendo automaticamente.' : 'Bot desligado. Respostas manuais apenas.'}
                </p>
              </div>
            </div>

            {/* Labels */}
            <div className="p-5 border-b border-dark-700/50">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Tag className="h-3 w-3" /> Etiquetas
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateLabel(activeJid, null)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${!activeConv.label_id ? 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30' : 'bg-dark-900 text-zinc-500 border-dark-700 hover:text-white'}`}
                >Limpar</button>
                {labels.map(label => (
                  <button
                    key={label.id}
                    onClick={() => updateLabel(activeJid, label.id)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95"
                    style={{
                      backgroundColor: activeConv.label_id === label.id ? `${label.color}20` : 'transparent',
                      color: activeConv.label_id === label.id ? label.color : '#a1a1aa',
                      borderColor: activeConv.label_id === label.id ? `${label.color}50` : '#27272a'
                    }}
                  >{label.name}</button>
                ))}
              </div>
            </div>

            {/* Status */}
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
                  const Icon = s.icon
                  return (
                    <button
                      key={s.v}
                      onClick={() => updateStatus(activeJid, s.v)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                        activeConv.status === s.v
                          ? `bg-${s.color}-500/10 text-${s.color}-400 border-${s.color}-500/30`
                          : 'bg-dark-900 text-zinc-400 border-dark-700 hover:bg-dark-800 hover:text-white'
                      }`}
                    ><Icon className="h-4 w-4" /> {s.l}</button>
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="p-5 flex-1 flex flex-col min-h-[200px]">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <StickyNote className="h-3 w-3" /> Bloco de Notas
              </span>
              <textarea
                value={notesInput}
                onChange={e => saveNotes(activeJid, e.target.value)}
                placeholder="Observações privadas sobre este cliente..."
                className="flex-1 w-full bg-dark-900 border border-dark-700 rounded-2xl p-4 text-[13px] text-zinc-300 outline-none focus:border-brand-500/50 placeholder-zinc-700 resize-none transition-all shadow-inner"
              />
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2 flex items-center justify-end gap-1">
                <CloudLightning className="h-3 w-3" /> Salvo automaticamente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
