import { useState, useEffect, useMemo } from 'react'
import { Clock, Calendar, Copy, CheckCircle, Search, Loader2, Trophy, Tv2 } from 'lucide-react'

const MOCK_GRADE = [
  {
    id: 1,
    emoji: '🇧🇷',
    campeonato: '🇧🇷 Brasileirão Série A',
    jogos: [
      { time_casa: 'Flamengo', time_fora: 'Palmeiras', horario: '16:00', data_fmt: '12/04', canal: 'Globo • SporTV', campeonato_extra: 'Brasileirão' },
      { time_casa: 'Corinthians', time_fora: 'São Paulo', horario: '18:30', data_fmt: '12/04', canal: 'TNT Sports', campeonato_extra: 'Brasileirão' },
      { time_casa: 'Botafogo', time_fora: 'Vasco', horario: '20:00', data_fmt: '12/04', canal: 'Premiere', campeonato_extra: 'Brasileirão' },
    ]
  },
  {
    id: 2,
    emoji: '🇪🇸',
    campeonato: '🇪🇸 LaLiga (Espanha)',
    jogos: [
      { time_casa: 'Real Madrid', time_fora: 'Barcelona', horario: '17:00', data_fmt: '12/04', canal: 'ESPN 2 • Disney+', campeonato_extra: 'LaLiga' },
      { time_casa: 'Atlético Madrid', time_fora: 'Sevilla', horario: '15:15', data_fmt: '12/04', canal: 'Disney+', campeonato_extra: 'LaLiga' },
    ]
  },
  {
    id: 3,
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    campeonato: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
    jogos: [
      { time_casa: 'Manchester City', time_fora: 'Arsenal', horario: '13:30', data_fmt: '12/04', canal: 'ESPN 4 • Star+', campeonato_extra: 'Premier League' },
      { time_casa: 'Liverpool', time_fora: 'Chelsea', horario: '16:00', data_fmt: '12/04', canal: 'ESPN • Star+', campeonato_extra: 'Premier League' },
      { time_casa: 'Tottenham', time_fora: 'Newcastle', horario: '11:00', data_fmt: '12/04', canal: 'Star+', campeonato_extra: 'Premier League' },
    ]
  },
  {
    id: 4,
    emoji: '🇮🇹',
    campeonato: '🇮🇹 Serie A (Itália)',
    jogos: [
      { time_casa: 'Inter de Milão', time_fora: 'Juventus', horario: '15:45', data_fmt: '12/04', canal: 'Disney+ • ESPN', campeonato_extra: 'Serie A' },
      { time_casa: 'AC Milan', time_fora: 'Napoli', horario: '12:30', data_fmt: '12/04', canal: 'Disney+', campeonato_extra: 'Serie A' },
    ]
  },
  {
    id: 5,
    emoji: '🇫🇷',
    campeonato: '🇫🇷 Ligue 1 (França)',
    jogos: [
      { time_casa: 'Paris Saint-Germain', time_fora: 'Olympique Marseille', horario: '16:45', data_fmt: '12/04', canal: 'CazéTV', campeonato_extra: 'Ligue 1' },
    ]
  },
  {
    id: 6,
    emoji: '🌍',
    campeonato: '🌍 Champions League',
    jogos: [
      { time_casa: 'Bayern München', time_fora: 'Real Madrid', horario: '16:00', data_fmt: '13/04', canal: 'Max • HBO', campeonato_extra: 'Champions' },
      { time_casa: 'Manchester City', time_fora: 'PSG', horario: '16:00', data_fmt: '13/04', canal: 'Max', campeonato_extra: 'Champions' },
    ]
  }
]

const FILTROS = ['Hoje', 'Amanhã', 'Semana']

export default function GameSchedule() {
  const [filtroData, setFiltroData] = useState('Hoje')
  const [termoBusca, setTermoBusca] = useState('')
  const [loading, setLoading] = useState(false)
  const [gradeCompleta, setGradeCompleta] = useState([])
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    carregarGrade()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroData])

  async function carregarGrade() {
    setLoading(true)
    // Simula fetch da API
    await new Promise(r => setTimeout(r, 600))
    setGradeCompleta(MOCK_GRADE)
    setLoading(false)
  }

  const gradeFiltrada = useMemo(() => {
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
      const validos = camp.jogos.filter(j => {
        const canal = (j.canal || '').toUpperCase().trim()
        return canal && canal !== 'A DEFINIR' && canal !== 'SEM TRANSMISSÃO'
      })
      if (validos.length > 0) {
        texto += `\n🏆 *${camp.campeonato.toUpperCase()}*\n`
        validos.forEach(j => {
          texto += `⚽ *${j.time_casa}* x *${j.time_fora}*\n⏰ ${j.horario}  📺 ${j.canal}\n━━━━━━━━━━━━━━━━━━\n`
          count++
        })
      }
    })

    if (count === 0) { alert('⚠️ Nenhum jogo com transmissão confirmada.'); return }
    texto += `\nAqui você assiste todos os jogos sem travamentos! ⚽🔥`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        setCopiado(true)
        setTimeout(() => setCopiado(false), 3000)
      })
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center border border-brand/20">
            <Trophy className="h-5 w-5 text-brand" />
          </div>
          Grade Completa de Jogos
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Confira os jogos do dia com canais de transmissão.</p>
      </div>

      {/* Barra de Filtros */}
      <div className="glass-effect rounded-2xl p-4 border border-white/5">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Filtro de Data */}
          <div className="flex bg-dark-900/80 p-1 rounded-xl border border-white/10 w-full md:w-auto">
            {FILTROS.map(f => (
              <button
                key={f}
                onClick={() => setFiltroData(f)}
                className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  filtroData === f
                    ? 'bg-brand text-white shadow-md shadow-brand/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Busca */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={termoBusca}
                onChange={e => setTermoBusca(e.target.value)}
                placeholder="Buscar time ou campeonato..."
                className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-zinc-200 text-sm focus:border-brand/50 focus:outline-none transition"
              />
            </div>

            {/* Copiar Grade */}
            <button
              onClick={copiarGrade}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition transform active:scale-95 border ${
                copiado
                  ? 'bg-green-600 border-green-500/50 text-white'
                  : 'bg-green-600 hover:bg-green-500 border-green-500/50 text-white'
              }`}
            >
              {copiado ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiado ? 'Copiado!' : 'Copiar Grade'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin text-brand mb-3" />
          <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Sincronizando Grade...</p>
        </div>
      )}

      {/* Grade de Jogos */}
      {!loading && (
        <div className="space-y-6">
          {gradeFiltrada.length === 0 ? (
            <div className="glass-effect rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <Trophy className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-400">Nenhum jogo encontrado para este filtro.</p>
            </div>
          ) : (
            gradeFiltrada.map(camp => (
              <div key={camp.id} className="glass-effect rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                {/* Cabeçalho do Campeonato */}
                <div className="bg-gradient-to-r from-zinc-700/50 to-zinc-800/30 px-5 py-4 border-b border-white/5 flex items-center gap-3">
                  <span className="text-2xl">{camp.emoji}</span>
                  <h3 className="text-base font-bold text-white tracking-wide flex-1">{camp.campeonato}</h3>
                  <span className="bg-dark-900/60 text-zinc-400 text-[10px] px-2 py-1 rounded border border-white/10 font-mono">
                    {camp.jogos.length} JOGOS
                  </span>
                </div>

                {/* Grid de Jogos */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-white/5 p-px">
                  {camp.jogos.map((jogo, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900 hover:bg-zinc-800/80 transition-colors duration-200 p-4 flex flex-col gap-3"
                    >
                      {/* Horário e Data */}
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono border-b border-white/5 pb-2">
                        <span className="flex items-center gap-1 text-brand font-bold">
                          <Clock className="h-3 w-3" /> {jogo.horario}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {jogo.data_fmt}
                        </span>
                      </div>

                      {/* Badge do Campeonato */}
                      {jogo.campeonato_extra && (
                        <div className="flex justify-center">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20 truncate max-w-[90%]">
                            {jogo.campeonato_extra}
                          </span>
                        </div>
                      )}

                      {/* Times */}
                      <div className="flex items-center justify-between gap-2 py-2">
                        <div className="flex flex-col items-center w-5/12 text-center">
                          <div className="h-10 w-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mb-2 text-lg">
                            ⚽
                          </div>
                          <span className="text-xs font-bold text-zinc-200 leading-tight line-clamp-2">{jogo.time_casa}</span>
                        </div>
                        <div className="text-zinc-600 font-black text-[10px] italic">VS</div>
                        <div className="flex flex-col items-center w-5/12 text-center">
                          <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mb-2 text-lg">
                            ⚽
                          </div>
                          <span className="text-xs font-bold text-zinc-200 leading-tight line-clamp-2">{jogo.time_fora}</span>
                        </div>
                      </div>

                      {/* Canal */}
                      {jogo.canal && jogo.canal !== 'A DEFINIR' && (
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-brand/10 border border-brand/20 text-brand text-[10px] font-bold uppercase tracking-wide w-full text-center justify-center">
                          <Tv2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{jogo.canal}</span>
                        </div>
                      )}
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