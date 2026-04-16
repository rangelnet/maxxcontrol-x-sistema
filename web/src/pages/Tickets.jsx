import { useState } from 'react'
import {
  MessageSquare, Plus, Search, Filter, Clock, CheckCircle, 
  XCircle, AlertCircle, ChevronRight, Send, Paperclip
} from 'lucide-react'

export default function Tickets() {
  const [activeTab, setActiveTab] = useState('abertos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  
  // Dados falsos para demonstração
  const [tickets] = useState([
    {
      id: '#TCK-8812',
      title: 'Problema com API do Mercado Pago',
      department: 'Financeiro',
      status: 'aberto',
      priority: 'alta',
      date: 'Hoje, 14:30',
      lastUpdate: 'há 2 horas',
      messages: [
        { sender: 'user', time: '14:30', text: 'Minha integração com PIX parou de gerar QR Codes.' },
        { sender: 'support', time: '14:45', text: 'Olá! Estamos verificando o seu Access Token. Pode confirmar se gerou um novo recentemente?' }
      ]
    },
    {
      id: '#TCK-8755',
      title: 'Dúvida sobre limite de Revendedores',
      department: 'Comercial',
      status: 'respondido',
      priority: 'media',
      date: 'Ontem, 09:15',
      lastUpdate: 'Ontem, 11:20',
      messages: [
        { sender: 'user', time: '09:15', text: 'Gostaria de saber se o plano atual tem limite de criação de sub-revendas.' },
        { sender: 'support', time: '11:20', text: 'Seu plano é ILIMITADO, você pode criar quantos revendedores quiser!' }
      ]
    },
    {
      id: '#TCK-8120',
      title: 'APK personalizado não instala na TV Box',
      department: 'Suporte Técnico',
      status: 'fechado',
      priority: 'baixa',
      date: '10/04/2026',
      lastUpdate: '11/04/2026',
      messages: [
        { sender: 'user', time: '10/04 10:00', text: 'Minha TV Box Android 7 dá erro de sintaxe ao instalar.' },
        { sender: 'support', time: '11/04 15:00', text: 'Para TV Box antigas (Android 7), você precisa baixar a versão ARMv7 do APK disponível no seu painel.' }
      ]
    }
  ])

  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'abertos') return t.status === 'aberto' || t.status === 'respondido'
    if (activeTab === 'fechados') return t.status === 'fechado'
    return true
  })

  // Estilos de status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'aberto': return <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="h-3 w-3"/> Aguardando Suporte</span>
      case 'respondido': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Respondido</span>
      case 'fechado': return <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle className="h-3 w-3"/> Resolvido</span>
      default: return null
    }
  }

  const getPriorityColor = (priority) => {
    if(priority==='alta') return 'text-red-400 bg-red-400/10 border-red-400/20'
    if(priority==='media') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    return 'text-green-400 bg-green-400/10 border-green-400/20'
  }

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-maxx/10 flex items-center justify-center border border-maxx/20">
              <MessageSquare className="h-5 w-5 text-maxx" />
            </div>
            Tickets de Suporte
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Abra chamados para nossa equipe técnica ou comercial.</p>
        </div>
        {!selectedTicket && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-maxx hover:bg-maxx/90 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-lg shadow-maxx/20 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Novo Chamado
          </button>
        )}
      </div>

      {selectedTicket ? (
        // ==========================================
        // VIEW: TELA DE CHAT DO TICKET SELECIONADO
        // ==========================================
        <div className="flex-1 flex flex-col bg-dark-800 rounded-xl border border-dark-700 shadow-lg overflow-hidden relative">
          
          {/* Topo do Chat */}
          <div className="p-4 md:p-6 border-b border-dark-700 bg-dark-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4 items-start">
              <button onClick={() => setSelectedTicket(null)} className="h-10 w-10 shrink-0 bg-dark-800 hover:bg-dark-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition">
                <ChevronRight className="h-6 w-6 rotate-180" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-xl font-bold text-white">{selectedTicket.title}</h2>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className={`px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityColor(selectedTicket.priority)}`}>
                    Prioridade {selectedTicket.priority}
                  </span>
                  <span className="text-zinc-500">Departamento: <strong className="text-zinc-300">{selectedTicket.department}</strong></span>
                  <span className="text-zinc-500">Aberto em: <strong className="text-zinc-300">{selectedTicket.date}</strong></span>
                </div>
              </div>
            </div>
            {selectedTicket.status !== 'fechado' && (
              <button className="bg-dark-800 hover:bg-red-500/10 border border-dark-600 hover:border-red-500/20 text-zinc-400 hover:text-red-400 py-2 px-4 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2">
                <XCircle className="h-4 w-4" /> Marcar como Resolvido
              </button>
            )}
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 custom-scrollbar bg-dark-800/50">
            {selectedTicket.messages.map((msg, i) => (
              <div key={i} className={`flex max-w-[85%] md:max-w-3xl ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                {msg.sender === 'support' && (
                  <div className="h-8 w-8 rounded-full bg-maxx/20 flex items-center justify-center border border-maxx/30 shrink-0 mr-3 mt-1">
                    <span className="text-maxx font-bold text-xs uppercase">SUP</span>
                  </div>
                )}
                
                <div className={`p-4 rounded-2xl relative shadow-md ${
                  msg.sender === 'user' 
                  ? 'bg-brand-600 text-white rounded-tr-sm border border-brand-500/50' 
                  : 'bg-dark-900 border border-dark-700 text-zinc-200 rounded-tl-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[10px] block mt-2 font-medium text-right ${msg.sender==='user'?'text-brand-200':'text-zinc-500'}`}>
                    {msg.time}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-dark-700 flex items-center justify-center border border-dark-600 shrink-0 ml-3 mt-1">
                    <span className="text-white font-bold text-xs uppercase">EU</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input de Chat */}
          {selectedTicket.status !== 'fechado' ? (
            <div className="p-4 bg-dark-900 border-t border-dark-700">
              <div className="flex gap-3">
                <button className="h-12 w-12 shrink-0 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-600 flex items-center justify-center text-zinc-400 hover:text-white transition">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input type="text" placeholder="Escreva sua resposta..." 
                  className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-4 text-white text-sm focus:border-maxx outline-none transition"
                />
                <button className="h-12 px-6 shrink-0 bg-maxx hover:bg-maxx/90 rounded-xl text-white font-bold transition shadow-lg shadow-maxx/20 flex items-center gap-2">
                  <Send className="h-4 w-4" /> Enviar
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-dark-900 border-t border-dark-700 text-center text-sm font-medium text-zinc-500">
              🔒 Este ticket foi encerrado. Não é possível enviar novas mensagens.
            </div>
          )}

        </div>

      ) : (

        // ==========================================
        // VIEW: LISTA GERAL DE TICKETS
        // ==========================================
        <div className="flex-1 flex flex-col bg-dark-800 rounded-xl border border-dark-700 shadow-lg overflow-hidden">
          
          {/* Tabs & Filtros */}
          <div className="p-4 border-b border-dark-700 flex flex-col md:flex-row justify-between gap-4 bg-dark-900">
            <div className="flex bg-dark-800 p-1 rounded-lg border border-dark-700 shrink-0">
              <button onClick={() => setActiveTab('abertos')} 
                className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'abertos' ? 'bg-maxx text-white shadow' : 'text-zinc-500 hover:text-white'}`}>
                Em Andamento
              </button>
              <button onClick={() => setActiveTab('fechados')} 
                className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'fechados' ? 'bg-dark-700 text-white shadow' : 'text-zinc-500 hover:text-white'}`}>
                Fechados / Resolvidos
              </button>
            </div>
            
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input type="text" placeholder="Buscar ticket..." 
                className="w-full pl-9 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-white focus:border-maxx outline-none transition" />
            </div>
          </div>

          {/* Table / List */}
          <div className="flex-1 overflow-x-auto min-h-[300px]">
            {filteredTickets.length > 0 ? (
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-dark-900/50 text-xs uppercase text-zinc-500 font-bold border-b border-dark-700">
                  <tr>
                    <th className="px-6 py-4">Protocolo / Assunto</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 hidden md:table-cell">Departamento</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Última Att</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-dark-700/50 transition cursor-pointer group" onClick={() => setSelectedTicket(t)}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-maxx font-mono text-xs font-bold mb-1">{t.id}</span>
                          <span className="text-white font-bold group-hover:text-maxx transition line-clamp-1">{t.title}</span>
                          <span className="text-[10px] text-zinc-500 md:hidden mt-1">{t.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell font-medium">
                        {t.department}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap text-xs">
                        {t.lastUpdate}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs bg-dark-700 hover:bg-dark-600 text-white font-bold py-2 px-4 rounded-lg transition border border-dark-600 group-hover:border-maxx/50">
                          Abrir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="h-16 w-16 bg-dark-700 rounded-full flex items-center justify-center text-zinc-500 mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Nenhum Ticket Encontrado</h3>
                <p className="text-zinc-500 text-sm">Você não possui nenhum chamado {activeTab === 'abertos' ? 'em andamento' : 'fechado'}.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: NOVO TICKET                         */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-dark-800 w-full max-w-lg rounded-2xl border border-dark-700 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-dark-700 bg-dark-900 pb-5 shrink-0 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-maxx" /> Abrir Novo Chamado
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Nossa equipe retornará o contato o mais breve possível.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white p-1">
                <XCircle className="h-6 w-6"/>
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Departamento</label>
                <select className="w-full p-3 rounded-xl bg-dark-900 border border-dark-600 focus:border-maxx outline-none text-white text-sm">
                  <option>Suporte Técnico (Erros/Android/APKs)</option>
                  <option>Financeiro (Pagamentos/Créditos)</option>
                  <option>Comercial / Dúvidas Gerais</option>
                  <option>Relatar um Bug no Painel</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Nível de Urgência</label>
                <select className="w-full p-3 rounded-xl bg-dark-900 border border-dark-600 focus:border-maxx outline-none text-white text-sm">
                  <option value="baixa">Baixa (Problemas estéticos, dúvidas comuns)</option>
                  <option value="media">Média (Sistema instável, funções falhando parcialmente)</option>
                  <option value="alta">Alta (Painel fora do ar, clientes sem acesso)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Assunto / Título Resumido</label>
                <input type="text" placeholder="Ex: Erro ao adicionar créditos via PIX" 
                  className="w-full p-3 rounded-xl bg-dark-900 border border-dark-600 focus:border-maxx outline-none text-white text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Sua Mensagem Detalhada</label>
                <textarea rows="4" placeholder="Descreva o problema com o máximo de detalhes possível..." 
                  className="w-full p-3 rounded-xl bg-dark-900 border border-dark-600 focus:border-maxx outline-none text-white text-sm resize-none custom-scrollbar" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Anexar Print (Opcional)</label>
                <div className="w-full border-2 border-dashed border-dark-600 hover:border-maxx/50 rounded-xl p-4 text-center cursor-pointer transition bg-dark-900/50">
                  <Paperclip className="h-5 w-5 mx-auto text-zinc-500 mb-2" />
                  <p className="text-xs text-zinc-400">Clique para anexar arquivo ou imagem</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-dark-700 bg-dark-900 shrink-0 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} 
                className="w-1/3 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white font-bold py-3 rounded-xl transition">
                Cancelar
              </button>
              <button 
                onClick={() => { setIsModalOpen(false) }} 
                className="w-2/3 bg-maxx hover:bg-maxx/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-maxx/20 transition flex justify-center items-center gap-2">
                <Send className="h-4 w-4" /> Enviar Ticket
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
