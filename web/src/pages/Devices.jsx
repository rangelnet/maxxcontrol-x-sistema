import { useState, useEffect } from 'react'
import api from '../services/api'
import { Ban, CheckCircle, Server, X, Save, Trash2, Download, RefreshCw, Package, AlertCircle } from 'lucide-react'

const Devices = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showIptvModal, setShowIptvModal] = useState(false)
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

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const response = await api.get('/api/device/list-all')
      setDevices(response.data.devices)
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
      setDevices([])
    } finally {
      setLoading(false)
    }
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

  const systemApps = apps.filter(app => app.is_system)
  const userApps = apps.filter(app => !app.is_system)

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dispositivos</h1>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4">MAC Address</th>
                <th className="text-left py-3 px-4">Modelo</th>
                <th className="text-left py-3 px-4">Android</th>
                <th className="text-left py-3 px-4">App</th>
                <th className="text-left py-3 px-4">IP</th>
                <th className="text-left py-3 px-4">Último Acesso</th>
                <th className="text-left py-3 px-4">Conexão</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id} className="border-b border-gray-800 hover:bg-gray-900">
                  <td className="py-3 px-4 font-mono text-sm">{device.mac_address}</td>
                  <td className="py-3 px-4">{device.modelo}</td>
                  <td className="py-3 px-4">{device.android_version}</td>
                  <td className="py-3 px-4">{device.app_version}</td>
                  <td className="py-3 px-4">{device.ip}</td>
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
                      {device.status === 'ativo' && (
                        <button
                          onClick={() => blockDevice(device.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Bloquear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {devices.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhum dispositivo encontrado
            </div>
          )}
        </div>
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
    </div>
  )
}

export default Devices
