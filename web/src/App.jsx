import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DevicesWithLogs from './pages/DevicesWithLogs'
import APIPanel from './pages/APIPanel'
import BrandingBanners from './pages/BrandingBanners'
import Versions from './pages/Versions'
import IptvPanel from './pages/IptvPanel'
import IptvTreeViewer from './pages/IptvTreeViewer'
import IptvServersManager from './pages/IptvServersManager'
import Resale from './pages/Resale'
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
            <Route path="devices" element={<DevicesWithLogs />} />
            <Route path="api-monitor" element={<Navigate to="/api-config" replace />} />
            <Route path="api-config" element={<APIPanel />} />
            <Route path="branding-banners" element={<BrandingBanners />} />
            <Route path="logs" element={<Navigate to="/devices" replace />} />
            <Route path="bugs" element={<Navigate to="/devices" replace />} />
            <Route path="versions" element={<Versions />} />
            <Route path="iptv-server" element={<IptvPanel />} />
            <Route path="iptv-servers" element={<Navigate to="/iptv-server" replace />} />
            <Route path="iptv-plugin" element={<IptvServersManager />} />
            <Route path="iptv-tree" element={<IptvTreeViewer />} />
            <Route path="resale" element={<Resale />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
