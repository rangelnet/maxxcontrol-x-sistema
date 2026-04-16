import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { WhatsAppProvider } from './context/WhatsAppContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DevicesWithLogs from './pages/DevicesWithLogs'
import APIPanel from './pages/APIPanel'
import BrandingBanners from './pages/BrandingBanners'
import BannerGallery from './pages/BannerGallery'
import GameSchedule from './pages/GameSchedule'
import WhiteLabel from './pages/WhiteLabel'
import Versions from './pages/Versions'
import IptvPanel from './pages/IptvPanel'
import IptvTreeViewer from './pages/IptvTreeViewer'
import IptvServersManager from './pages/IptvServersManager'
import Resale from './pages/Resale'
import Settings from './pages/Settings'
import BannerGenerator from './pages/BannerGenerator'
import Landing from './pages/Landing'
import Tickets from './pages/Tickets'
import Store from './pages/Store'
import AdminTemplates from './pages/AdminTemplates'
import WhatsAppAuto from './pages/WhatsAppAuto'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <WhatsAppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />
          <Route path="/loja/:slug" element={<Store />} />
          <Route element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
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
            <Route path="gallery" element={<BannerGallery />} />
            <Route path="banner-gallery" element={<Navigate to="/gallery" replace />} />
            <Route path="game-schedule" element={<GameSchedule />} />
            <Route path="white-label" element={<WhiteLabel />} />
            <Route path="settings" element={<Settings />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="banner-generator" element={<BannerGenerator />} />
            <Route path="admin-templates" element={<AdminTemplates />} />
            <Route path="whatsapp-auto" element={<WhatsAppAuto />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </WhatsAppProvider>
    </AuthProvider>
  )
}

export default App
