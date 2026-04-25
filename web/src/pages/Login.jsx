import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Mail, Lock, ArrowRight, Loader2, AlertTriangle, Zap } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [show2FA, setShow2FA] = useState(false) // Novo: Controle do 2FA
  const [tfaCode, setTfaCode] = useState('')    // Novo: Código digitado
  const [tfaPayload, setTfaPayload] = useState(null) // Novo: Dados para verificação
  const { login, complete2FALogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await login(email, senha)
      
      // Se exigir 2FA, troca a tela
      if (res?.require2FA) {
        setShow2FA(true)
        setTfaPayload(res)
        setSuccess(res.message)
        return
      }

      setSuccess('Acesso Liberado! Redirecionando...')
      setTimeout(() => navigate('/dashboard'), 800)
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

        // Login realizado com sucesso após 2FA - Sincroniza estado global
        complete2FALogin(data.token, data.user)
        
        setSuccess('Dispositivo Verificado! Bem-vindo.')
        setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
        setError(err.response?.data?.error || 'Código inválido')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center relative overflow-hidden">

      {/* ══════ BLOBS ANIMADOS DE FUNDO ══════ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Padrão de pontos */}
        <div 
          className="absolute inset-0 w-full h-full opacity-30"
          style={{
            backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        {/* Blob laranja */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-pulse" 
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
        <div className="glass-effect rounded-2xl p-8 md:p-10 relative overflow-hidden" 
          style={{
            background: 'rgba(24, 24, 27, 0.6)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >

          {/* ══════ CABEÇALHO ══════ */}
          <div className="text-center mb-8">
            {/* Logo Maxx Control */}
            <div className="inline-flex items-center justify-center mb-4 transition hover:scale-105 duration-300">
              <img src="/logo-maxx.svg" alt="Maxx Control" className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(255,165,0,0.6)] animate-pulse" style={{ animationDuration: '3s' }} />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white mb-1">
              Maxx<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400">Control</span>
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              Entre para acessar o sistema
            </p>
          </div>

          {/* ══════ FORMULÁRIO ══════ */}
          {!show2FA ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Email */}
              <div className="space-y-1 group">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider transition-colors group-focus-within:text-brand-500">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={16} className="text-zinc-600 transition-colors group-focus-within:text-brand-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#111111]/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] outline-none transition-all shadow-[0_0_15px_rgba(255,165,0,0.1)]"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-1 group">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider transition-colors group-focus-within:text-brand-500">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={16} className="text-zinc-600 transition-colors group-focus-within:text-brand-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-dark-900/50 border border-dark-600 rounded-xl text-white placeholder-zinc-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
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
                className="w-full group relative flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-brand-500 to-orange-600 hover:from-brand-600 hover:to-orange-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg mt-2 active:scale-95 transform"
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
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
                  <Zap size={24} className="animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Segurança Máxima</h2>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Enviamos um código de acesso para o <br />
                  <span className="text-brand-400 font-bold">seu Bot no Telegram.</span>
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={6}
                  value={tfaCode}
                  onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl tracking-[0.6em] font-mono py-4 bg-dark-900/50 border-2 border-brand-500/30 rounded-2xl text-white focus:border-brand-500 focus:ring-0 outline-none transition-all shadow-2xl shadow-brand-500/10 placeholder:text-zinc-800 placeholder:tracking-normal"
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
                className="w-full group py-4 px-4 font-black rounded-2xl text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:grayscale transition-all shadow-lg active:scale-95"
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

      {/* ══════ CSS PARA BLOB ANIMATION ══════ */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  )
}

export default Login
