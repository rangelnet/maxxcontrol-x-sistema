import { useState } from 'react'
import { Server, FileText } from 'lucide-react'
import Devices from './Devices'
import Logs from './Logs'

// Componente que integra Dispositivos e Logs em abas
const DevicesWithLogs = () => {
  const [activeTab, setActiveTab] = useState('devices')

  return (
    <div>
      {/* Título Principal */}
      <h1 className="text-3xl font-bold mb-6">Dispositivos & Logs</h1>
      
      {/* Abas Principais */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'devices'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Server size={20} />
            Dispositivos
          </div>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'logs'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={20} />
            Logs & Bugs
          </div>
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'devices' && <Devices />}
      {activeTab === 'logs' && <Logs />}
    </div>
  )
}

export default DevicesWithLogs
