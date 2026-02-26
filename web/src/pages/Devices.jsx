import { useState, useEffect } from 'react'
import api from '../services/api'
import { Smartphone, Ban, CheckCircle } from 'lucide-react'

const Devices = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

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
                    {device.status === 'ativo' && (
                      <button
                        onClick={() => blockDevice(device.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Bloquear
                      </button>
                    )}
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
    </div>
  )
}

export default Devices
