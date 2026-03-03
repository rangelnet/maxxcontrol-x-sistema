import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import APIMonitor from './pages/APIMonitor'
import APIConfig from './pages/APIConfig'
import Branding from './pages/Branding'
import Versions from './pages/Versions'
import Logs from './pages/Logs'
import IptvServer from './pages/IptvServer'
import BannerGenerator from './pages/BannerGenerator'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="devices" element={<Devices />} />
            <Route path="api-monitor" element={<APIMonitor />} />
            <Route path="api-config" element={<APIConfig />} />
            <Route path="branding" element={<Branding />} />
            <Route path="logs" element={<Logs />} />
            <Route path="bugs" element={<Navigate to="/logs" replace />} />
            <Route path="versions" element={<Versions />} />
            <Route path="iptv-server" element={<IptvServer />} />
            <Route path="banners" element={<BannerGenerator />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
