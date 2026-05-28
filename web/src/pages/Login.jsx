import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Mail, Lock, ArrowRight, Loader2, AlertTriangle, Zap, Smartphone, Palette, Tv, ShoppingBag, Shield } from 'lucide-react'

// Componente de Fundo Animado (Estilo Vizzion/Maxx Player)
const ScrollingPostersBackground = () => {
  const [posters, setPosters] = useState([])

  useEffect(() => {
    // Usando posters de alta qualidade como fallback, mas tenta usar a lista dinâmica
    const highQualityPosters = [
      'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLv1oYhiuK.jpg',
      'https://image.tmdb.org/t/p/w500/8S97hYpZJuS9axNkG6O6z5HveSR.jpg',
      'https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjCbG3fX.jpg',
      'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
      'https://image.tmdb.org/t/p/w500/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg',
      'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
      'https://image.tmdb.org/t/p/w500/xYduFGuch84r3DXBDeCBFaFmSbn.jpg',
      'https://image.tmdb.org/t/p/w500/feyiIOpR0GYkGmj6cxhzKbuBL5J.jpg',
      'https://image.tmdb.org/t/p/w500/i3omzdNEaBSGOJZnCZsDgwcZNmS.jpg',
      'https://image.tmdb.org/t/p/w500/9ghTSDRXDYZagU9hOf285EjOmgD.jpg',
      'https://image.tmdb.org/t/p/w500/5TENs623Fq7LiJ1hYcDTbuMljSS.jpg',
    ]

    api.get('/api/tmdb/trending')
      .then(res => {
        if (res.data?.posters && res.data.posters.length > 5) {
          setPosters(res.data.posters)
        } else {
          setPosters(highQualityPosters)
        }
      })
      .catch(() => {
        setPosters(highQualityPosters)
      })
  }, [])

  if (posters.length === 0) return <div className="absolute inset-0 bg-[#050505] z-0" />

  return (
    <div className="absolute inset-0 flex gap-3 opacity-30 overflow-hidden z-0">
      <style>{`
        @keyframes scrollUpLogin {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
      {[0, 1, 2, 3, 4].map(col => {
        const speed = 1 + col * 0.2
        const itemsPerCol = Math.max(1, Math.floor(posters.length / 5))
        const colPosters = posters.slice(col * itemsPerCol, (col + 1) * itemsPerCol)
        const finalColPosters = col === 4 ? posters.slice(col * itemsPerCol) : colPosters

        return (
          <div
            key={col}
            className="flex-1 flex flex-col gap-3"
            style={{ 
              animation: `scrollUpLogin ${60 / speed}s linear infinite`,
              animationDirection: col % 2 === 0 ? 'normal' : 'reverse'
            }}
          >
            {[...finalColPosters, ...finalColPosters, ...finalColPosters, ...finalColPosters].map((url, i) => (
              <div key={i} className="flex-shrink-0 h-[250px] rounded-xl overflow-hidden bg-[#0d0d0d] shadow-lg">
                <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [tfaCode, setTfaCode] = useState('')
  const [tfaPayload, setTfaPayload] = useState(null)
  const { login, complete2FALogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectPath = location.state?.from || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await login(email, senha)
      
      if (res?.require2FA) {
        setShow2FA(true)
        setTfaPayload(res)
        setSuccess(res.message)
        return
      }

      setSuccess('Acesso Liberado! Redirecionando...')
      setTimeout(() => navigate(redirectPath), 800)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
        const bid = localStorage.getItem('browser_id')
        const response = await api.post('/api/auth/verify-2fa', {
            email: tfaPayload.email, 
            code: tfaCode,
            device_id: bid,
            modelo: 'Web Browser'
        })
        const data = response.data;

        complete2FALogin(data.token, data.user)
        
        setSuccess('Dispositivo Verificado! Bem-vindo.')
        setTimeout(() => navigate(redirectPath), 1000)
    } catch (err) {
        setError(err.response?.data?.error || 'Código inválido')
    } finally {
        setLoading(false)
    }
  }

  const features = [
    { icon: Smartphone, label: 'Gestão de Dispositivos', desc: 'Controle total dos aparelhos' },
    { icon: Palette, label: 'Gerador de Banners', desc: 'Arte profissional em segundos' },
    { icon: Tv, label: 'Hub IPTV Unificado', desc: 'Servidores, EPG e VOD' },
    { icon: ShoppingBag, label: 'Loja White Label', desc: 'Venda com sua marca' },
  ]

  const stats = [
    { value: '24/7', label: 'Uptime' },
    { value: '100%', label: 'Cloud' },
    { value: '∞', label: 'Escala' },
    { value: 'Multi', label: 'Tenant' },
  ]

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col lg:flex-row relative overflow-hidden">

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PAINEL ESQUERDO — BRANDING / MARKETING (Oculto no Mobile)       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#050505] z-20">
        
        {/* Fundo com Posters SOMENTE na Esquerda */}
        <ScrollingPostersBackground />
        <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[2px]" />
        
        {/* Gradiente Overlay (Escurecendo a parte de baixo e direita para dar foco ao texto) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />

        {/* Glow laranja superior */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#FC5F16] rounded-full blur-[180px] opacity-15 z-10" />
        {/* Glow laranja inferior */}
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] bg-orange-600 rounded-full blur-[160px] opacity-10 z-10" />
        
        {/* Linha diagonal decorativa */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[#FC5F16]/20 to-transparent z-10" />

        {/* Conteúdo do painel esquerdo */}
        <div className="relative z-20 flex flex-col justify-between w-full p-10 xl:p-14">
          
          {/* TOPBAR — Logo + Versão */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FC5F16]/10 border border-[#FC5F16]/20 flex items-center justify-center">
                <img src="/logo-maxx.svg" alt="Maxx" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-white font-black text-lg tracking-tight">
                Maxx<span className="text-[#FC5F16]">Control</span>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#FC5F16]/10 border border-[#FC5F16]/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#FC5F16] animate-pulse" />
              <span className="text-[#FC5F16] text-xs font-bold">v2.0</span>
            </div>
          </div>

          {/* CORPO — Headline + Features + Stats */}
          <div className="flex-1 flex flex-col justify-center -mt-8">
            
            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Gerencie.<br />
              Escale.<br />
              <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#FC5F16] to-orange-400">
                Lucre mais.
              </em>
            </h1>

            <p className="text-zinc-400 text-sm xl:text-base leading-relaxed max-w-md mb-8">
              O painel de controle definitivo para gerenciar dispositivos, revendas, 
              servidores IPTV e automações — tudo em tempo real.
            </p>

            {/* Chips de Funcionalidades */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {features.map((feat, i) => (
                <div 
                  key={i}
                  className="group flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-[#FC5F16]/30 hover:bg-[#FC5F16]/[0.04] transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#FC5F16]/10 border border-[#FC5F16]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FC5F16]/20 transition-colors">
                    <feat.icon className="w-4 h-4 text-[#FC5F16]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{feat.label}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-0 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 max-w-md">
              {stats.map((stat, i) => (
                <div key={i} className="flex-1 flex flex-col items-center relative">
                  <span className="text-xl font-black text-white">{stat.value}</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{stat.label}</span>
                  {i < stats.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-white/[0.08]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER — Powered by */}
          <div className="flex items-center gap-2 text-zinc-600 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Powered by <span className="text-zinc-400 font-bold">MaxxControl X</span> • Hub IPTV Inteligente</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PAINEL DIREITO — FORMULÁRIO DE LOGIN                             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center relative min-h-screen lg:min-h-0">

        {/* ══════ BLOBS ANIMADOS DE FUNDO (mantidos no lado do form) ══════ */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Padrão de pontos */}
          <div 
            className="absolute inset-0 w-full h-full opacity-30"
            style={{
              backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          {/* Blob laranja */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-[#FC5F16] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-pulse" 
            style={{ animation: 'blob 7s infinite' }} 
          />
          {/* Blob laranja escuro */}
          <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-pulse" 
            style={{ animation: 'blob 7s infinite 2s' }} 
          />
          {/* Blob vermelho */}
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-15 animate-pulse" 
            style={{ animation: 'blob 7s infinite 4s' }} 
          />
        </div>

        {/* ══════ CARD PRINCIPAL (GLASSMORPHISM) ══════ */}
        <div className="w-full max-w-md p-4 z-10 animate-fade-in">

          {/* Logo mobile (apenas no mobile, no desktop aparece na esquerda) */}
          <div className="flex items-center justify-center gap-3 mb-6 lg:hidden">
            <img src="/logo-maxx.svg" alt="Maxx" className="w-10 h-10 object-contain" />
            <span className="text-white font-black text-xl tracking-tight">
              Maxx<span className="text-[#FC5F16]">Control</span>
            </span>
          </div>

          <div className="glass-effect rounded-2xl p-8 md:p-10 relative overflow-hidden" 
            style={{
              background: 'rgba(17, 17, 17, 0.6)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >

            {/* ══════ CABEÇALHO ══════ */}
            <div className="text-center mb-8">
              {/* Logo Maxx Control (Desktop — dentro do card) */}
              <div className="hidden lg:inline-flex items-center justify-center mb-4 transition hover:scale-105 duration-300">
                <img src="/logo-maxx.svg" alt="Maxx Control" className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(252,95,22,0.6)] animate-pulse" style={{ animationDuration: '3s' }} />
              </div>
              {/* Logo Maxx Control (Mobile — dentro do card) */}
              <div className="lg:hidden inline-flex items-center justify-center mb-4 transition hover:scale-105 duration-300">
                <img src="/logo-maxx.svg" alt="Maxx Control" className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(252,95,22,0.6)] animate-pulse" style={{ animationDuration: '3s' }} />
              </div>

              <h1 className="text-2xl lg:text-xl font-black tracking-tight text-white mb-1">
                {show2FA ? 'Verificação de Segurança' : (
                  <>Bem-vindo de volta<span className="text-[#FC5F16]">.</span></>
                )}
              </h1>
              <p className="text-zinc-400 text-sm font-medium">
                {show2FA ? 'Confirme seu acesso' : 'Entre para acessar o painel'}
              </p>

              {/* Divider decorativo centralizado */}
              <div className="flex items-center justify-center mt-6">
                <div className="w-8 h-8 rounded-full bg-[#FC5F16]/10 border border-[#FC5F16]/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#FC5F16]" />
                </div>
              </div>
            </div>

            {/* ══════ FORMULÁRIO ══════ */}
            {!show2FA ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo Email */}
                <div className="space-y-1 group">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider transition-colors group-focus-within:text-[#FC5F16]">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={16} className="text-zinc-500 transition-colors group-focus-within:text-[#FC5F16]" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#EEF2F6] border border-transparent rounded-xl text-[#111111] font-bold placeholder-zinc-500 focus:bg-white focus:border-[#FC5F16] focus:ring-1 focus:ring-[#FC5F16] outline-none transition-all shadow-inner"
                      placeholder="admin@maxxcontrol.com"
                      required
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-1 group">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider transition-colors group-focus-within:text-[#FC5F16]">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={16} className="text-zinc-500 transition-colors group-focus-within:text-[#FC5F16]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-[#EEF2F6] border border-transparent rounded-xl text-[#111111] font-bold tracking-widest placeholder-zinc-500 focus:bg-white focus:border-[#FC5F16] focus:ring-1 focus:ring-[#FC5F16] outline-none transition-all shadow-inner"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-800 transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Botão de Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#FC5F16] to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg mt-2 active:scale-95 transform"
                  style={{ boxShadow: '0 10px 15px -3px rgba(252, 95, 22, 0.2)' }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ENTRAR
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>
            ) : (
              /* ══════ FORMULÁRIO 2FA ══════ */
              <form onSubmit={handleVerify2FA} className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FC5F16]/10 text-[#FC5F16] border border-[#FC5F16]/20 mb-2">
                    <Zap size={24} className="animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Segurança Máxima</h2>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Enviamos um código de acesso para o <br />
                    <span className="text-[#FC5F16] font-bold">seu Bot no Telegram.</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={tfaCode}
                    onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl tracking-[0.6em] font-mono py-4 bg-[#111111]/50 border-2 border-[#FC5F16]/30 rounded-2xl text-white focus:border-[#FC5F16] focus:ring-0 outline-none transition-all shadow-2xl shadow-[#FC5F16]/10 placeholder:text-zinc-800 placeholder:tracking-normal"
                    placeholder="000000"
                    required
                    autoFocus
                  />
                  <button
                      type="button"
                      onClick={() => { setShow2FA(false); setError(''); setSuccess('') }}
                      className="text-[10px] text-zinc-500 hover:text-white transition w-full text-center"
                  >
                      Voltar para o Login
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || tfaCode.length !== 6}
                  className="w-full group py-4 px-4 font-black rounded-2xl text-white bg-[#FC5F16] hover:bg-orange-600 disabled:opacity-50 disabled:grayscale transition-all shadow-lg active:scale-95"
                >
                  {loading ? (
                      <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : (
                      'CONFIRMAR ACESSO'
                  )}
                </button>
              </form>
            )}

            {/* ══════ MENSAGENS DE FEEDBACK ══════ */}
            {error && (
              <div className="mt-4 text-center text-sm font-medium p-3 rounded-xl border flex items-center justify-center gap-2 text-red-400 bg-red-500/10 border-red-500/20 animate-fade-in">
                <AlertTriangle size={16} />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 text-center text-sm font-medium p-3 rounded-xl border flex items-center justify-center gap-2 text-green-400 bg-green-500/10 border-green-500/20 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p>{success}</p>
              </div>
            )}

            {/* ══════ RODAPÉ ══════ */}
            <div className="mt-8 text-center">
              <p className="text-[10px] text-zinc-600">
                © 2025 MaxxControl X. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ CSS PARA ANIMAÇÕES ══════ */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  )
}

export default Login
