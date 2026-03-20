import { useState, useEffect } from 'react'
import api from '../services/api'
import { Ban, CheckCircle, Server, X, Save, Trash2, Download, RefreshCw, Package, AlertCircle, Unlock, TestTube, Search, Eye, EyeOff, Copy } from 'lucide-react'
import TestApiModal from '../components/TestApiModal'

// Versão 1.1 - Botões de bloquear/desbloquear e excluir dispositivos
const Devices = () => {
  const [devices, setDevices] = useState([])
  const [filteredDevices, setFilteredDevices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showIptvModal, setShowIptvModal] = useState(false)
  const [showTestApiModal, setShowTestApiModal] = useState(false)
  const [showAppsModal, setShowAppsModal] = useState(false)
  const [showSendApkModal, setShowSendApkModal] = useState(false)
  const [iptvConfig, setIptvConfig] = useState({
    xtream_url: '',
    xtream_username: '',
    xtream_password: ''
  })
  const [apps, setApps] = useState([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [newAppUrl, setNewAppUrl] = useState('')
  const [newAppName, setNewAppName] = useState('')
  const [saving, setSaving] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)
  const [visiblePasswords, setVisiblePasswords] = useState({})

  useEffect(() => {
    loadDevices()
    
    // Atualizar dispositivos a cada 2 segundos (tempo real)
    const interval = setInterval(() => {
      loadDevices()
    }, 2000)

    // WebSocket para atualizações em tempo real
    const wsHost = import.meta.env.MODE === 'production'
      ? 'wss://maxxcontrol-x-sistema.onrender.com'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    const ws = new WebSocket(wsHost)

    ws.onopen = () => {
      console.log('🔌 WebSocket conectado')
      // Autenticar WebSocket
      const token = localStorage.getItem('token')
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }))
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Atualizar quando test_api_url for modificado
        if (data.type === 'device:test-api-updated') {
          console.log('📡 Test API atualizado:', data.data)
          setDevices(prevDevices => 
            prevDevices.map(device => 
              device.id === data.data.device_id
                ? { ...device, test_api_url: data.data.test_api_url }
                : device
            )
          )
        }
        
        // Atualizar quando IPTV for modificado
        if (data.type === 'device:iptv-updated') {
          console.log('📡 IPTV atualizado:', data.data)
          setDevices(prevDevices => 
            prevDevices.map(device => 
              device.id === data.data.device_id
                ? { 
                    ...device, 
                    current_iptv_server_url: data.data.xtream_url,
                    current_iptv_username: data.data.xtream_username
                  }
                : device
            )
          )
        }
        
        // Atualizar quando credenciais de teste forem geradas
        if (data.type === 'device:test-credentials-updated') {
          console.log('📡 Credenciais de teste atualizadas:', data.data)
          setDevices(prevDevices => 
            prevDevices.map(device => 
              device.id === data.data.device_id
                ? { 
                    ...device, 
                    server: data.data.server,
                    username: data.data.username,
                    ping: data.data.ping,
                    quality: data.data.quality
                  }
                : device
            )
          )
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('❌ Erro no WebSocket:', error)
    }

    ws.onclose = () => {
      console.log('🔌 WebSocket desconectado')
    }

    return () => {
      clearInterval(interval)
      ws.close()
    }
  }, [])

  // Filtrar dispositivos quando searchTerm ou devices mudar
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDevices(devices)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = devices.filter(device => 
        device.mac_address?.toLowerCase().includes(term) ||
        device.modelo?.toLowerCase().includes(term) ||
        device.ip?.toLowerCase().includes(term) ||
        device.current_iptv_server_url?.toLowerCase().includes(term) ||
        device.current_iptv_username?.toLowerCase().includes(term)
      )
      setFilteredDevices(filtered)
    }
  }, [searchTerm, devices])

  const loadDevices = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true)
    }
    
    try {
      const response = await api.get('/api/device/list-all')
      setDevices(response.data.devices)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
      setDevices([])
    } finally {
      setLoading(false)
      if (showRefreshIndicator) {
        setTimeout(() => setRefreshing(false), 500)
      }
    }
  }

  const handleManualRefresh = () => {
    loadDevices(true)
  }

  const formatLastUpdate = () => {
    if (!lastUpdate) return ''
    const now = new Date()
    const diff = Math.floor((now - lastUpdate) / 1000)
    
    if (diff < 10) return 'agora mesmo'
    if (diff < 60) return `há ${diff}s`
    if (diff < 3600) return `há ${Math.floor(diff / 60)}min`
    return lastUpdate.toLocaleTimeString('pt-BR')
  }

  const blockDevice = async (deviceId) => {
    if (!confirm('Deseja bloquear este dispositivo?')) return

    try {
      await api.post('/api/device/block', { device_id: deviceId })
      loadDevices()
    } catch (error) {
      console.error('Erro ao bloquear dispositivo:', error)
    }
  }

  const unblockDevice = async (deviceId) => {
    if (!confirm('Deseja desbloquear este dispositivo?')) return

    try {
      await api.post('/api/device/unblock', { device_id: deviceId })
      loadDevices()
    } catch (error) {
      console.error('Erro ao desbloquear dispositivo:', error)
    }
  }

  const deleteDevice = async (deviceId, macAddress) => {
    if (!confirm(`Deseja excluir o dispositivo ${macAddress}?\n\nEsta ação não pode ser desfeita e removerá:\n- Configurações IPTV\n- Apps instalados\n- Comandos pendentes\n- Todos os dados do dispositivo`)) return

    try {
      console.log('🗑️ Iniciando exclusão do dispositivo...')
      console.log('   Device ID:', deviceId)
      console.log('   MAC Address:', macAddress)
      console.log('   URL da requisição:', `/api/device/delete/${deviceId}`)
      
      const response = await api.delete(`/api/device/delete/${deviceId}`)
      
      console.log('✅ Dispositivo excluído com sucesso!')
      console.log('   Resposta do servidor:', response.data)
      
      alert('Dispositivo excluído com sucesso!')
      loadDevices()
    } catch (error) {
      console.error('❌ ERRO ao excluir dispositivo')
      console.error('   Erro completo:', error)
      console.error('   Status HTTP:', error.response?.status)
      console.error('   Dados da resposta:', error.response?.data)
      console.error('   Headers:', error.response?.headers)
      console.error('   Config da requisição:', error.config)
      
      const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido'
      alert(`Erro ao excluir dispositivo:\n\n${errorMessage}\n\nVerifique o console do navegador para mais detalhes.`)
    }
  }

  const openIptvModal = async (device) => {
    setSelectedDevice(device)
    setShowIptvModal(true)
    
    try {
      const response = await api.get(`/api/iptv-server/device/${device.id}`)
      if (response.data.xtream_url) {
        setIptvConfig(response.data)
      } else {
        setIptvConfig({ xtream_url: '', xtream_username: '', xtream_password: '' })
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    }
  }

  const openTestApiModal = (device) => {
    setSelectedDevice(device)
    setShowTestApiModal(true)
  }

  const saveIptvConfig = async () => {
    setSaving(true)
    try {
      await api.post(`/api/iptv-server/device/${selectedDevice.id}`, iptvConfig)
      alert('Configuração salva com sucesso!')
      setShowIptvModal(false)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const deleteIptvConfig = async () => {
    if (!confirm('Remover configuração específica? O dispositivo usará a configuração global.')) return
    
    try {
      await api.delete(`/api/iptv-server/device/${selectedDevice.id}`)
      alert('Configuração removida. Dispositivo usará configuração global.')
      setShowIptvModal(false)
    } catch (error) {
      console.error('Erro ao remover:', error)
      alert('Erro ao remover configuração')
    }
  }

  const openAppsModal = async (device) => {
    setSelectedDevice(device)
    setShowAppsModal(true)
    loadApps(device.id)
  }

  const loadApps = async (deviceId) => {
    setAppsLoading(true)
    try {
      const response = await api.get(`/api/apps/device/${deviceId}`)
      setApps(response.data.apps)
    } catch (error) {
      console.error('Erro ao carregar apps:', error)
      setApps([])
    } finally {
      setAppsLoading(false)
    }
  }

  const uninstallApp = async (packageName) => {
    if (!confirm(`Desinstalar este app?`)) return

    try {
      await api.post('/api/apps/uninstall', {
        device_id: selectedDevice.id,
        package_name: packageName
      })
      alert('Comando de desinstalação enviado!')
      loadApps(selectedDevice.id)
    } catch (error) {
      console.error('Erro ao desinstalar:', error)
      alert('Erro ao desinstalar app')
    }
  }

  const sendApk = async () => {
    if (!newAppUrl.trim() || !newAppName.trim()) {
      alert('Preencha URL e nome do app')
      return
    }

    setSaving(true)
    try {
      await api.post('/api/apps/send-apk', {
        device_id: selectedDevice.id,
        app_name: newAppName,
        app_url: newAppUrl
      })
      alert('Comando de instalação enviado!')
      setShowSendApkModal(false)
      setNewAppUrl('')
      setNewAppName('')
    } catch (error) {
      console.error('Erro ao enviar APK:', error)
      alert('Erro ao enviar APK')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  const truncateUrl = (url, maxLength = 40) => {
    if (!url) return 'Não Configurado'
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
  }

  const getServerName = (url) => {
    if (!url) return 'Não Configurado'
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch (error) {
      // Se não for uma URL válida, retornar a string original truncada
      return url.length > 30 ? url.substring(0, 30) + '...' : url
    }
  }

  const formatPing = (ping) => {
    if (!ping) return { text: 'N/A', color: 'text-gray-500' }
    
    const pingValue = parseInt(ping)
    if (pingValue < 100) {
      return { text: `${pingValue}ms`, color: 'text-green-500' }
    } else if (pingValue < 300) {
      return { text: `${pingValue}ms`, color: 'text-yellow-500' }
    } else {
      return { text: `${pingValue}ms`, color: 'text-red-500' }
    }
  }

  const formatQuality = (quality) => {
    if (!quality) return { stars: 0, text: 'N/A', color: 'text-gray-500' }
    
    const qualityMap = {
      'excelente': { stars: 4, text: 'Excelente', color: 'text-green-500' },
      'boa': { stars: 3, text: 'Boa', color: 'text-blue-500' },
      'regular': { stars: 2, text: 'Regular', color: 'text-yellow-500' },
      'ruim': { stars: 1, text: 'Ruim', color: 'text-red-500' }
    }
    
    return qualityMap[quality] || { stars: 0, text: 'N/A', color: 'text-gray-500' }
  }

  // Paginação
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDevices = filteredDevices.slice(startIndex, endIndex)

  // Reset para página 1 quando filtro mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const systemApps = apps.filter(app => app.is_system)
  const userApps = apps.filter(app => !app.is_system)

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dispositivos</h1>
          {lastUpdate && (
            <p className="text-sm text-gray-400 mt-1">
              Última atualização: {formatLastUpdate()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por MAC, modelo, IP ou servidor..."
              className="w-80 px-4 py-2 pl-10 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            title="Atualizar lista de dispositivos em tempo real"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      <div className="card">
        {searchTerm && (
          <div className="px-4 py-3 border-b border-gray-800 bg-dark/50">
            <p className="text-sm text-gray-400">
              Mostrando {filteredDevices.length} de {devices.length} dispositivos
            </p>
          </div>
        )}
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-3 py-1 bg-dark border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-primary"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <span className="text-sm text-gray-400">dispositivos por página</span>
          </div>
          <div className="text-sm text-gray-400">
            Página {currentPage} de {totalPages} ({filteredDevices.length} total)
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4">MAC Address</th>
                <th className="text-left py-3 px-4">Modelo</th>
                <th className="text-left py-3 px-4">Android</th>
                <th className="text-left py-3 px-4">App</th>
                <th className="text-left py-3 px-4">IP</th>
                <th className="text-left py-3 px-4">Servidor</th>
                <th className="text-left py-3 px-4">Usuário</th>
                <th className="text-left py-3 px-4">Senha</th>
                <th className="text-left py-3 px-4">Ping</th>
                <th className="text-left py-3 px-4">Qualidade</th>
                <th className="text-left py-3 px-4">Último Acesso</th>
                <th className="text-left py-3 px-4">Conexão</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDevices.map((device) => {
                const pingInfo = formatPing(device.ping)
                const qualityInfo = formatQuality(device.quality)
                
                return (
                <tr key={device.id} className="border-b border-gray-800 hover:bg-gray-900">
                  <td className="py-3 px-4 font-mono text-sm">{device.mac_address}</td>
                  <td className="py-3 px-4">{device.modelo}</td>
                  <td className="py-3 px-4">{device.android_version}</td>
                  <td className="py-3 px-4">{device.app_version}</td>
                  <td className="py-3 px-4">{device.ip}</td>
                  <td className="py-3 px-4">
                    <span className={device.server ? 'text-white font-medium' : 'text-gray-500'}>
                      {device.server || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={device.username ? 'text-white font-mono text-sm' : 'text-gray-500'}>
                      {device.username || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {device.current_iptv_password ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-white">
                          {visiblePasswords[device.id] ? device.current_iptv_password : '••••••••'}
                        </span>
                        <button
                          onClick={() => setVisiblePasswords(prev => ({ ...prev, [device.id]: !prev[device.id] }))}
                          className="text-gray-400 hover:text-white p-1"
                          title={visiblePasswords[device.id] ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {visiblePasswords[device.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(device.current_iptv_password)
                          }}
                          className="text-gray-400 hover:text-white p-1"
                          title="Copiar senha"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${pingInfo.color}`}>
                      {pingInfo.text}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {qualityInfo.stars > 0 ? (
                        <>
                          {[...Array(qualityInfo.stars)].map((_, i) => (
                            <span key={i} className={qualityInfo.color}>⭐</span>
                          ))}
                          <span className={`ml-1 text-xs ${qualityInfo.color}`}>
                            {qualityInfo.text}
                          </span>
                        </>
                      ) : (
                        <span className={qualityInfo.color}>{qualityInfo.text}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">{formatDate(device.ultimo_acesso)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                      device.connection_status === 'online' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        device.connection_status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                      }`}></span>
                      {device.connection_status === 'online' ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      device.status === 'ativo' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {device.status === 'ativo' ? <CheckCircle size={14} /> : <Ban size={14} />}
                      {device.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openTestApiModal(device)}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        title="Configurar API de Teste"
                      >
                        <TestTube size={16} />
                      </button>
                      <button
                        onClick={() => openIptvModal(device)}
                        className="text-primary hover:text-primary/80 flex items-center gap-1"
                        title="Configurar Servidor IPTV"
                      >
                        <Server size={16} />
                      </button>
                      <button
                        onClick={() => openAppsModal(device)}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        title="Gerenciar Apps"
                      >
                        <Package size={16} />
                      </button>
                      {device.status === 'ativo' ? (
                        <button
                          onClick={() => blockDevice(device.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                          title="Bloquear dispositivo"
                        >
                          <Ban size={14} />
                          Bloquear
                        </button>
                      ) : (
                        <button
                          onClick={() => unblockDevice(device.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-colors"
                          title="Desbloquear dispositivo"
                        >
                          <Unlock size={14} />
                          Desbloquear
                        </button>
                      )}
                      <button
                        onClick={() => deleteDevice(device.id, device.mac_address)}
                        className="text-red-500 hover:text-red-400 flex items-center gap-1 p-2 hover:bg-red-500/10 rounded transition-colors"
                        title="Excluir dispositivo permanentemente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}

            </tbody>
          </table>

          {filteredDevices.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm 
                ? `Nenhum dispositivo encontrado para "${searchTerm}"`
                : 'Nenhum dispositivo encontrado'
              }
            </div>
          )}
        </div>

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-dark border border-gray-700 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Anterior
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                // Mostrar apenas páginas próximas à atual
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'bg-dark border border-gray-700 text-gray-400 hover:bg-gray-800'
                      } transition-colors`}
                    >
                      {page}
                    </button>
                  )
                } else if (
                  page === currentPage - 3 ||
                  page === currentPage + 3
                ) {
                  return <span key={page} className="text-gray-500">...</span>
                }
                return null
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-dark border border-gray-700 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Modal de Configuração IPTV */}
      {showIptvModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="text-primary" size={24} />
                Servidor IPTV
              </h2>
              <button onClick={() => setShowIptvModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-dark rounded border border-gray-800">
              <p className="text-sm text-gray-400">Dispositivo:</p>
              <p className="text-white font-mono">{selectedDevice?.mac_address}</p>
              <p className="text-sm text-gray-400 mt-1">{selectedDevice?.modelo}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL do Servidor
                </label>
                <input
                  type="text"
                  value={iptvConfig.xtream_url}
                  onChange={(e) => setIptvConfig({ ...iptvConfig, xtream_url: e.target.value })}
                  placeholder="http://exemplo.com:8080"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usuário
                </label>
                <input
                  type="text"
                  value={iptvConfig.xtream_username}
                  onChange={(e) => setIptvConfig({ ...iptvConfig, xtream_username: e.target.value })}
                  placeholder="usuario"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={iptvConfig.xtream_password}
                  onChange={(e) => setIptvConfig({ ...iptvConfig, xtream_password: e.target.value })}
                  placeholder="senha"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={saveIptvConfig}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                
                {iptvConfig.xtream_url && (
                  <button
                    onClick={deleteIptvConfig}
                    className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Usar configuração global"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                Se não configurar, o dispositivo usará o servidor global
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciar Apps */}
      {showAppsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-800 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="text-primary" size={24} />
                Gerenciar Apps
              </h2>
              <button onClick={() => setShowAppsModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-dark rounded border border-gray-800">
              <p className="text-sm text-gray-400">Dispositivo:</p>
              <p className="text-white font-mono">{selectedDevice?.mac_address}</p>
              <p className="text-sm text-gray-400 mt-1">{selectedDevice?.modelo}</p>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => loadApps(selectedDevice.id)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
              >
                <RefreshCw size={18} />
                Atualizar
              </button>
              <button
                onClick={() => setShowSendApkModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={18} />
                Enviar APK
              </button>
            </div>

            {appsLoading ? (
              <div className="text-center py-8">Carregando apps...</div>
            ) : apps.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nenhum app encontrado
              </div>
            ) : (
              <>
                {userApps.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <Package size={20} className="text-primary" />
                      Apps Instalados ({userApps.length})
                    </h3>
                    <div className="space-y-2">
                      {userApps.map(app => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-3 bg-dark rounded-lg hover:bg-gray-800"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{app.app_name}</div>
                            <div className="text-xs text-gray-400 font-mono">
                              {app.package_name}
                            </div>
                          </div>
                          <button
                            onClick={() => uninstallApp(app.package_name)}
                            className="ml-4 p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Desinstalar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {systemApps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <AlertCircle size={20} className="text-yellow-500" />
                      Apps do Sistema ({systemApps.length})
                    </h3>
                    <div className="space-y-2">
                      {systemApps.map(app => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-3 bg-dark rounded-lg opacity-75"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{app.app_name}</div>
                            <div className="text-xs text-gray-400 font-mono">
                              {app.package_name}
                            </div>
                          </div>
                          <div className="ml-4 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded">
                            Sistema
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Enviar APK */}
      {showSendApkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Enviar APK</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do App
                </label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="Ex: YouTube"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL do APK
                </label>
                <input
                  type="text"
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  placeholder="https://exemplo.com/app.apk"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={sendApk}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={() => setShowSendApkModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração Test API */}
      {showTestApiModal && (
        <TestApiModal
          device={selectedDevice}
          onClose={() => setShowTestApiModal(false)}
          onSave={() => loadDevices(true)}
        />
      )}
    </div>
  )
}

export default Devices
