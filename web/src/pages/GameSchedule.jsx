import { useState, useEffect, useMemo } from 'react'
import { Clock, Calendar, Copy, CheckCircle, Search, Loader2, Trophy, Tv2, RefreshCcw, Swords, Dribbble as Basketball } from 'lucide-react'
import axios from 'axios'

const FILTROS_DATA = ['Hoje', 'Amanhã', 'Semana']
const ESPORTES = [
  { id: 'soccer', label: 'Futebol', icon: Trophy },
  { id: 'mma', label: 'MMA (UFC)', icon: Swords },
  { id: 'basketball', label: 'Basquete', icon: Basketball }
]

export default function GameSchedule() {
  const [esporte, setEsporte] = useState('soccer')
  const [filtroData, setFiltroData] = useState('Hoje')
  const [termoBusca, setTermoBusca] = useState('')
  const [loading, setLoading] = useState(false)
  const [gradeCompleta, setGradeCompleta] = useState([])
  const [copiado, setCopiado] = useState(false)
  const [ultimoRefresh, setUltimoRefresh] = useState(new Date())

  useEffect(() => {
    carregarGrade()
    
    // Auto-refresh a cada 60 segundos
    const interval = setInterval(() => {
      carregarGrade(true)
    }, 60000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esporte, filtroData])

  async function carregarGrade(isSilent = false) {
    if (!isSilent) setLoading(true)
    
    try {
      // Ajustar data conforme filtro
      let dateParam = new Date().toISOString().split('T')[0]
      if (filtroData === 'Amanhã') {
        const amanha = new Date()
        amanha.setDate(amanha.getDate() + 1)
        dateParam = amanha.toISOString().split('T')[0]
      }

      const response = await axios.get('/api/sports/matches', {
        params: { 
          type: esporte,
          date: dateParam
        }
      })

      if (response.data.success) {
        setGradeCompleta(response.data.data)
        setUltimoRefresh(new Date())
      }
    } catch (error) {
      console.error('Erro ao carregar grade:', error)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  const gradeFiltrada = useMemo(() => {
    if (!gradeCompleta) return []
    if (!termoBusca.trim()) return gradeCompleta
    
    const termo = termoBusca.toLowerCase()
    return gradeCompleta
      .map(camp => ({
        ...camp,
        jogos: camp.jogos.filter(j =>
          j.time_casa.toLowerCase().includes(termo) ||
          j.time_fora.toLowerCase().includes(termo) ||
          camp.campeonato.toLowerCase().includes(termo)
        )
      }))
      .filter(camp => camp.jogos.length > 0)
  }, [gradeCompleta, termoBusca])

  function copiarGrade() {
    const hoje = new Date()
    const dataFmt = hoje.toLocaleDateString('pt-BR')
    const titulo = filtroData === 'Amanhã' ? 'JOGOS DE AMANHÃ' : filtroData === 'Semana' ? 'JOGOS DA SEMANA' : 'JOGOS DE HOJE'
    let texto = `📆 | *${titulo} - ${dataFmt}*\n━━━━━━━━━━━━━━━━━━\n`
    let count = 0

    gradeFiltrada.forEach(camp => {
      const validos = camp.jogos || []
      if (validos.length > 0) {
        texto += `\n🏆 *${camp.campeonato.toUpperCase()}*\n`
        validos.forEach(j => {
          texto += `⚽ *${j.time_casa}* x *${j.time_fora}*\n⏰ ${j.horario}  ${j.status === 'FINAL' ? '(Encerrado)' : ''}\n━━━━━━━━━━━━━━━━━━\n`
          count++
        })
      }
    })

    if (count === 0) { alert('⚠️ Nenhum jogo encontrado para copiar.'); return }
    texto += `\nAqui você assiste todos os jogos sem travamentos! ⚽🔥`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        setCopiado(true)
        setTimeout(() => setCopiado(false), 3000)
      })
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center border border-brand/20">
              <Trophy className="h-5 w-5 text-brand" />
            </div>
            Placares em Tempo Real
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Dados atualizados automaticamente via SportsData.io</p>
        </div>
        
        <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono bg-dark-900/50 px-3 py-1.5 rounded-lg border border-white/5">
          <RefreshCcw className="h-3 w-3 animate-spin-slow" />
          ÚLTIMA ATUALIZAÇÃO: {ultimoRefresh.toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* Seletor de Esporte */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {ESPORTES.map(item => (
          <button
            key={item.id}
            onClick={() => setEsporte(item.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border ${
              esporte === item.id
                ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20 scale-105'
                : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Barra de Filtros */}
      <div className="glass-effect rounded-2xl p-4 border border-white/5">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Filtro de Data */}
            <div className="flex bg-dark-900/80 p-1 rounded-xl border border-white/10">
              {FILTROS_DATA.map(f => (
                <button
                  key={f}
                  onClick={() => setFiltroData(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filtroData === f
                      ? 'bg-brand text-white'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={termoBusca}
                onChange={e => setTermoBusca(e.target.value)}
                placeholder="Buscar time ou liga..."
                className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-zinc-200 text-sm focus:border-brand/40 outline-none transition"
              />
            </div>

            <button
              onClick={copiarGrade}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition transform active:scale-95 ${
                copiado ? 'bg-green-600 text-white' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
              }`}
            >
              {copiado ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiado ? 'Copiado!' : 'Copiar Grade'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Jogos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
          <Loader2 className="h-10 w-10 animate-spin text-brand mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Sincronizando placares ao vivo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {gradeFiltrada.length === 0 ? (
            <div className="glass-effect rounded-3xl border border-dashed border-white/10 py-24 text-center">
              <Trophy className="h-12 w-12 mx-auto text-zinc-700 mb-4 opacity-50" />
              <p className="text-zinc-500 font-medium">Nenhum evento ao vivo ou programado para este filtro.</p>
            </div>
          ) : (
            gradeFiltrada.map((camp, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-8 w-1 bg-brand rounded-full shadow-glow"></div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{camp.campeonato}</h3>
                  <span className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 px-2 py-0.5 rounded uppercase font-mono">
                    {camp.jogos.length} PARTIDAS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {camp.jogos.map((jogo, i) => (
                    <div key={i} className="group glass-effect rounded-2xl border border-white/5 hover:border-brand/30 transition-all duration-300 overflow-hidden relative">
                      {/* Status Flutuante */}
                      {jogo.status === 'INPROGRESS' && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-[9px] font-black text-red-500 uppercase italic">AO VIVO</span>
                        </div>
                      )}

                      <div className="p-5">
                        {/* Horário */}
                        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
                          <span className="text-[11px] font-bold text-brand flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> {jogo.horario}
                          </span>
                          <span className="text-[11px] font-medium text-zinc-500">
                             {jogo.data_fmt}
                          </span>
                        </div>

                        {/* Placar Principal */}
                        <div className="flex items-center justify-between gap-4 py-2">
                          {/* Time Casa */}
                          <div className="flex flex-col items-center flex-1 text-center group-hover:scale-105 transition-transform">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/5 flex items-center justify-center mb-3 shadow-xl">
                              <span className="text-2xl">⚽</span>
                            </div>
                            <span className="text-sm font-bold text-zinc-200 line-clamp-2 min-h-[40px] leading-snug">{jogo.time_casa}</span>
                          </div>

                          {/* Versvs + Placar */}
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                              <span className={`text-2xl font-black ${jogo.status === 'INPROGRESS' ? 'text-white' : 'text-zinc-600'}`}>{jogo.placar_casa}</span>
                              <span className="text-zinc-700 font-bold text-sm">X</span>
                              <span className={`text-2xl font-black ${jogo.status === 'INPROGRESS' ? 'text-white' : 'text-zinc-600'}`}>{jogo.placar_fora}</span>
                            </div>
                            {jogo.status === 'INPROGRESS' && (
                              <span className="text-[10px] font-mono text-green-500 font-bold">{jogo.clock}' {jogo.periodo}</span>
                            )}
                            {jogo.status === 'FINAL' && (
                              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">FINALIZADO</span>
                            )}
                          </div>

                          {/* Time Fora */}
                          <div className="flex flex-col items-center flex-1 text-center group-hover:scale-105 transition-transform">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/5 flex items-center justify-center mb-3 shadow-xl">
                              <span className="text-2xl">⚽</span>
                            </div>
                            <span className="text-sm font-bold text-zinc-200 line-clamp-2 min-h-[40px] leading-snug">{jogo.time_fora}</span>
                          </div>
                        </div>

                        {/* Canal / Link */}
                        <div className="mt-5 flex gap-2">
                           <button className="flex-1 bg-brand/5 hover:bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                             <Tv2 className="h-3 w-3" /> Transmitir Agora
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Footer info */}
      {!loading && gradeFiltrada.length > 0 && (
        <div className="text-center text-zinc-600 text-xs py-2">
          {gradeFiltrada.reduce((acc, c) => acc + c.jogos.length, 0)} jogos encontrados • Dados atualizados automaticamente
        </div>
      )}
    </div>
  )
}