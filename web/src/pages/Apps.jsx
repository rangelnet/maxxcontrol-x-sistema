import { useState, useEffect } from 'react'
import api from '../services/api'
import { Trash2, Download, RefreshCw, Package, AlertCircle } from 'lucide-react'

const Apps = () => {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [newAppUrl, setNewAppUrl] = useState('')
  const [newAppName, setNewAppName] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const response = await api.get('/api/device/list-all')
      setDevices(response.data.devices)
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
    }
  }

  const loadApps = async (deviceId) => {
    setLoading(true)
    try {
      const response = await api.get(`/api/apps/device/${deviceId}`)
      setApps(response.data.apps)
    } catch (error) {
      console.error('Erro ao carregar apps:', error)
      setApps([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDevice = (device) => {
    setSelectedDevice(device)
    loadApps(device.id)
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

    setSending(true)
    try {
      await api.post('/api/apps/send-apk', {
        device_id: selectedDevice.id,
        app_name: newAppName,
        app_url: newAppUrl
      })
      alert('Comando de instalação enviado!')
      setShowSendModal(false)
      setNewAppUrl('')
      setNewAppName('')
    } catch (error) {
      console.error('Erro ao enviar APK:', error)
      alert('Erro ao enviar APK')
    } finally {
      setSending(false)
    }
  }

  const systemApps = apps.filter(app => app.is_system)
  const userApps = apps.filter(app => !app.is_system)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Apps</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Seletor de Dispositivo */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Dispositivos</h2>
            <div className="space-y-2">
              {devices.map(device => (
                <button
                  key={device.id}
                  onClick={() => handleSelectDevice(device)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedDevice?.id === device.id
                      ? 'bg-primary text-white'
                      : 'bg-dark hover:bg-gray-800'
                  }`}
                >
                  <div className="font-mono text-sm">{device.mac_address}</div>
                  <div className="text-xs text-gray-400">{device.modelo}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Apps */}
        <div className="lg:col-span-3">
          {selectedDevice ? (
            <div className="space-y-6">
              {/* Botões de Ação */}
              <div className="flex gap-2">
                <button
                  onClick={() => loadApps(selectedDevice.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
                >
                  <RefreshCw size={18} />
                  Atualizar
                </button>
                <button
                  onClick={() => setShowSendModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download size={18} />
                  Enviar APK
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">Carregando apps...</div>
              ) : apps.length === 0 ? (
                <div className="card text-center py-8 text-gray-400">
                  Nenhum app encontrado
                </div>
              ) : (
                <>
                  {/* Apps do Usuário */}
                  {userApps.length > 0 && (
                    <div className="card">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                              <div className="font-semibold">{app.app_name}</div>
                              <div className="text-xs text-gray-400 font-mono">
                                {app.package_name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                v{app.version_name} (código: {app.version_code})
                              </div>
                            </div>
                            <button
                              onClick={() => uninstallApp(app.package_name)}
                              className="ml-4 p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Desinstalar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apps do Sistema */}
                  {systemApps.length > 0 && (
                    <div className="card">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                              <div className="font-semibold">{app.app_name}</div>
                              <div className="text-xs text-gray-400 font-mono">
                                {app.package_name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                v{app.version_name} (código: {app.version_code})
                              </div>
                            </div>
                            <div className="ml-4 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded">
                              Sistema
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        Apps do sistema não podem ser desinstalados
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-400">
              Selecione um dispositivo para ver os apps instalados
            </div>
          )}
        </div>
      </div>

      {/* Modal Enviar APK */}
      {showSendModal && (
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
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={() => setShowSendModal(false)}
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

export default Apps
