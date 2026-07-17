import { useState, useEffect } from 'react'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Users, Search, Shield, X, Zap } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Wallet() {
  const { user } = useAuth()
  const isMasterOrUnlimited = user && (user.tipo === 'admin' || (user.plano && String(user.plano).toLowerCase().includes('ilimitado')))

  const [activeTab, setActiveTab] = useState('extrato') // 'extrato' | 'revendas'
  
  // Wallet State
  const [saldo, setSaldo] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Resellers CRM State
  const [resellers, setResellers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferData, setTransferData] = useState({ revendedor_id: '', nome: '', quantidade: 5 })
  const [tfaMode, setTfaMode] = useState(false)
  const [tfaCode, setTfaCode] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferSuccessMessage, setTransferSuccessMessage] = useState('')

  useEffect(() => {
    fetchExtract()
    if (isMasterOrUnlimited) {
      fetchResellers()
    }
  }, [isMasterOrUnlimited])

  const fetchExtract = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/finance/extract')
      setSaldo(res.data.saldo ?? 0)
      setTransactions(res.data.transactions || [])
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar o extrato da carteira.')
    } finally {
      setLoading(false)
    }
  }

  const fetchResellers = async () => {
    try {
      const res = await api.get('/api/resale/resellers')
      setResellers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendCredits = async (e) => {
    if (e) e.preventDefault()
    setTransferLoading(true)
    try {
      const response = await api.post('/api/resale/credits/send', {
        revendedor_id: transferData.revendedor_id,
        quantidade: transferData.quantidade,
        tfa_code: tfaCode
      })

      if (response.data.require2FA) {
        setTfaMode(true)
        return
      }

      setTransferSuccessMessage(response.data.message)
      setTfaMode(false)
      setTfaCode('')
      fetchResellers()
      fetchExtract()
    } catch (error) {
       alert(error.response?.data?.error || 'Erro ao enviar créditos')
    } finally {
       setTransferLoading(false)
    }
  }

  const getTypeInfo = (tx) => {
    if (isMasterOrUnlimited && tx.reseller_id !== user?.id && tx.reseller_name) {
       return {
         label: 'Envio',
         icon: ArrowDownRight,
         color: 'text-blue-500',
         bg: 'bg-blue-500/10'
       }
    }
    if (tx.credits < 0 || tx.type === 'credit_used' || tx.type === 'convert_trial') {
      return {
        label: 'Saída',
        icon: ArrowDownRight,
        color: 'text-red-500',
        bg: 'bg-red-500/10'
      }
    }
    return {
      label: 'Entrada',
      icon: ArrowUpRight,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="text-emerald-500" />
      case 'pending': return <Clock size={16} className="text-amber-500" />
      case 'rejected': return <XCircle size={16} className="text-red-500" />
      default: return null
    }
  }

  return (
    <div className="p-2 md:p-2 max-w-5xl mx-auto space-y-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <WalletIcon className="text-brand-500" /> Minha Carteira
          </h1>
          <p className="text-zinc-400 mt-1">Acompanhe seu saldo e histórico de transações de créditos.</p>
        </div>

        {isMasterOrUnlimited && (
          <div className="flex bg-dark-900 border border-dark-700 rounded-md p-1 overflow-x-auto">
            <button onClick={() => setActiveTab('extrato')} className={`flex items-center gap-2 px-4 py-1.5 font-bold text-sm rounded-md transition-all shrink-0 ${activeTab === 'extrato' ? 'bg-dark-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Clock className="w-4 h-4" /> Extrato
            </button>
            <button onClick={() => setActiveTab('revendas')} className={`flex items-center gap-2 px-4 py-1.5 font-bold text-sm rounded-md transition-all shrink-0 ${activeTab === 'revendas' ? 'bg-brand-500/20 text-brand-500 border border-brand-500/30' : 'text-zinc-500 hover:text-brand-500/50'}`}>
                <Users className="w-4 h-4" /> Minhas Revendas
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md text-red-500">
          {error}
        </div>
      )}

      {/* Cards de Resumo aparecem em qualquer aba */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Card Saldo Atual */}
        <div className="bg-dark-800 border border-dark-700 rounded-md p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="z-10">
            <p className="text-sm font-medium text-zinc-400 mb-1">Saldo Atual</p>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-white">
                {loading ? '...' : saldo}
              </span>
              <span className="text-brand-500 font-bold text-sm">créditos</span>
            </div>
          </div>
          <div className="mt-2 pt-4 border-t border-dark-700/50 z-10 flex items-center gap-2">
            <WalletIcon className="text-brand-500" size={16} />
            <span className="text-xs text-zinc-400">Gerencie seus créditos</span>
          </div>
        </div>

        {/* Card Total Entradas */}
        <div className="bg-dark-800 border border-dark-700 rounded-md p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="z-10">
            <p className="text-sm font-medium text-zinc-400 mb-1">Total Entradas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-white">
                {loading ? '...' : (transactions || []).reduce((acc, tx) => acc + (tx.credits > 0 ? Number(tx.credits) : 0), 0)}
              </span>
              <span className="text-emerald-500 font-bold text-sm">adquiridos</span>
            </div>
          </div>
          <div className="mt-2 pt-4 border-t border-dark-700/50 z-10 flex items-center gap-2">
            <ArrowUpRight className="text-emerald-500" size={16} />
            <span className="text-xs text-zinc-400">Créditos recebidos ou comprados</span>
          </div>
        </div>

        {/* Card Total Saídas */}
        <div className="bg-dark-800 border border-dark-700 rounded-md p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="z-10">
            <p className="text-sm font-medium text-zinc-400 mb-1">Total Saídas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-white">
                {loading ? '...' : (transactions || []).reduce((acc, tx) => acc + (tx.credits < 0 ? Math.abs(Number(tx.credits)) : 0), 0)}
              </span>
              <span className="text-red-500 font-bold text-sm">gastos</span>
            </div>
          </div>
          <div className="mt-2 pt-4 border-t border-dark-700/50 z-10 flex items-center gap-2">
            <ArrowDownRight className="text-red-500" size={16} />
            <span className="text-xs text-zinc-400">Ativações e transferências enviadas</span>
          </div>
        </div>
      </div>

      {activeTab === 'extrato' && (
        <div className="bg-dark-800 border border-dark-700 rounded-md overflow-hidden animate-in fade-in">
          <div className="p-2 border-b border-dark-700 bg-dark-900/50 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> Histórico de Transações
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-center text-zinc-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-2"></div>
              Carregando extrato...
            </div>
          ) : !(transactions && transactions.length > 0) ? (
            <div className="p-6 text-center text-zinc-500 flex flex-col items-center">
              <WalletIcon size={48} className="text-dark-600 mb-2" />
              <p className="font-medium text-zinc-400">Nenhuma transação encontrada</p>
              <p className="text-sm mt-1">Seu histórico de créditos aparecerá aqui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-900/30 text-zinc-400 text-xs uppercase tracking-wider">
                    <th className="p-2 font-medium">Data</th>
                    <th className="p-2 font-medium">Tipo</th>
                    <th className="p-2 font-medium">Descrição</th>
                    <th className="p-2 font-medium">Status</th>
                    <th className="p-2 font-medium text-right">Créditos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {(transactions || []).map((tx) => {
                    const info = getTypeInfo(tx)
                    const isSentToOther = isMasterOrUnlimited && tx.reseller_id !== user?.id && tx.reseller_name
                    const displayCredits = isSentToOther ? `-${tx.credits}` : (tx.credits < 0 ? tx.credits : `+${tx.credits}`)
                    const Icon = info.icon

                    return (
                      <tr key={tx.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="p-2 text-sm text-zinc-300">
                          {(() => {
                            const d = new Date(tx.created_at);
                            const day = String(d.getDate()).padStart(2, '0');
                            const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
                            const month = months[d.getMonth()];
                            const h = String(d.getHours()).padStart(2, '0');
                            const m = String(d.getMinutes()).padStart(2, '0');
                            return `${day} de ${month}, ${h}:${m}`;
                          })()}
                        </td>
                        <td className="p-2">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${info.bg} ${info.color}`}>
                            <Icon size={14} />
                            {info.label}
                          </div>
                        </td>
                        <td className="p-2 text-sm text-zinc-300 max-w-[200px] truncate">
                          {isSentToOther 
                            ? `Enviado para ${tx.reseller_name}` 
                            : (tx.description || (tx.type === 'convert_trial' ? 'Conversão de Teste p/ Assinante' : 'Movimentação de Créditos'))}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(tx.status)}
                            <span className="text-xs text-zinc-400 capitalize">{tx.status === 'approved' ? 'Aprovado' : tx.status}</span>
                          </div>
                        </td>
                        <td className={`p-2 text-right font-bold ${info.color}`}>
                          {displayCredits}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'revendas' && isMasterOrUnlimited && (
        <div className="bg-dark-800 border border-dark-700 rounded-md overflow-hidden animate-in fade-in">
          <div className="p-2 border-b border-dark-700 bg-dark-900/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Shield className="text-brand-500 w-5 h-5" /> CRM de Revendas
            </h3>
            <div className="relative">
              <Search size={16} className="text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Buscar revenda..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-dark-900 border border-dark-600 text-white text-sm rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-brand-500 w-full md:w-64" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-900/30 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="p-2 font-medium">Revendedor</th>
                  <th className="p-2 font-medium text-center">Saldo de Créditos</th>
                  <th className="p-2 font-medium text-center">Status</th>
                  <th className="p-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {resellers.filter(r => r.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || r.email?.toLowerCase().includes(searchTerm.toLowerCase())).map((rev) => (
                  <tr key={rev.id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="p-2">
                      <div className="font-bold text-white">{rev.nome || 'Sem Nome'}</div>
                      <div className="text-xs text-zinc-500">{rev.email}</div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold">
                        <i className="fas fa-coins text-[10px]"></i> {rev.creditos || 0}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${rev.status === 'ativo' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                        {rev.status === 'ativo' ? 'ATIVO' : 'BLOQUEADO'}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <button 
                        onClick={() => { setTransferData({revendedor_id: rev.id, nome: rev.nome, quantidade: 5}); setShowTransferModal(true); setTfaMode(false); setTfaCode(''); setTransferSuccessMessage(''); }}
                        disabled={rev.status !== 'ativo'}
                        className={`h-8 px-3 rounded-md text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ml-auto ${rev.status === 'ativo' ? 'bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white border border-brand-500/20 active:scale-95' : 'bg-dark-700 text-zinc-600 cursor-not-allowed border border-dark-600'}`}>
                        <Zap className="w-3.5 h-3.5" /> Enviar Créditos
                      </button>
                    </td>
                  </tr>
                ))}
                {resellers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-zinc-500">Nenhum revendedor encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 z-50 animate-in fade-in">
          <div className="bg-dark-900 border border-dark-700 rounded-md p-5 w-full max-w-sm relative overflow-hidden">
            {transferSuccessMessage ? (
              <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-sm font-black text-white mb-2">Sucesso!</h3>
                <p className="text-zinc-400 mb-2">{transferSuccessMessage}</p>
                <button 
                  onClick={() => { setShowTransferModal(false); setTransferSuccessMessage(''); }} 
                  className="w-full bg-dark-800 hover:bg-dark-700 active:scale-95 text-white font-bold py-1.5 rounded-md transition-all border border-dark-600">
                  Concluído
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2 border-b border-dark-700 pb-3">
                  <h3 className="font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-brand-500" /> Enviar Créditos</h3>
                  <button onClick={() => setShowTransferModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="mb-2">
                  <div className="text-xs text-zinc-400 mb-1">Revendedor Destino:</div>
                  <div className="font-bold text-white bg-dark-800 p-2 rounded-md border border-dark-700">{transferData.nome}</div>
                </div>

                {tfaMode ? (
                   <div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs p-2 rounded-md mb-2">
                         Um código de segurança foi enviado ao seu Telegram.
                      </div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Código 2FA</label>
                      <input type="text" value={tfaCode} onChange={e => setTfaCode(e.target.value)} className="w-full bg-dark-800 border border-dark-600 text-white rounded-md px-2 py-1 text-center tracking-widest font-mono text-base focus:outline-none focus:border-brand-500 mb-2" placeholder="000000" />
                   </div>
                ) : (
                   <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">Quantidade de Créditos</label>
                      <input type="number" min="1" value={transferData.quantidade} onChange={e => setTransferData({...transferData, quantidade: parseInt(e.target.value) || 0})} className="w-full bg-dark-800 border border-dark-600 text-white rounded-md px-2 py-1 focus:outline-none focus:border-brand-500 mb-2" />
                   </div>
                )}

                <button onClick={handleSendCredits} disabled={transferLoading} className="w-full bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold py-1.5 rounded-md transition-all flex justify-center items-center gap-2 shadow-lg shadow-brand-500/20">
                  {transferLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (tfaMode ? 'Confirmar 2FA' : 'Enviar Agora')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
