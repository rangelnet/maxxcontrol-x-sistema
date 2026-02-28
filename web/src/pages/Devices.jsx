import { useState, useEffect } from 'react'
import api from '../services/api'
import { Smartphone, Ban, CheckCircle, Server, X, Save, Trash2 } from 'lucide-react'

const Devices = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [iptvConfig, setIptvConfig] = useState({
    xtream_url: '',
    xtream_username: '',
    xtream_password: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const response = await api.get('/api/device/list')
      setDevices(response.data.devices)
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
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
    setShowModal(true)
    
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
      setShowModal(false)
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
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao remover:', error)
      alert('Erro ao remover configuração')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR')
  }

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
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      device.status === 'ativo' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
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
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="text-primary" size={24} />
                Servidor IPTV
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
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
    </div>
  )
}

export default Devices
