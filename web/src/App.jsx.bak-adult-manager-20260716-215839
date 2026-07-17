import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { WhatsAppProvider } from './context/WhatsAppContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import APIPanel from './pages/APIPanel'
import BrandingBanners from './pages/BrandingBanners'
import BannerGallery from './pages/BannerGallery'
import GameSchedule from './pages/GameSchedule'
import WhiteLabel from './pages/WhiteLabel'
import VersionsWithLogs from './pages/VersionsWithLogs'
import IptvPanel from './pages/IptvPanel'
import IptvTreeViewer from './pages/IptvTreeViewer'
import IptvServer from './pages/IptvServer'
import IptvServersManager from './pages/IptvServersManager'
import Resale from './pages/Resale'
import Settings from './pages/Settings'
import BannerGenerator from './pages/BannerGenerator'
import Landing from './pages/Landing'
import UploadPlaylist from './pages/UploadPlaylist'
import Tickets from './pages/Tickets'
import Store from './pages/Store'
import WhatsAppAuto from './pages/WhatsAppAuto'
import Finance from './pages/Finance'
import FinancePlans from './pages/FinancePlans'
import SubscribePlans from './pages/SubscribePlans'
import Wallet from './pages/Wallet'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import NexusAgent from './pages/NexusAgent'
import AnimeManager from './pages/AnimeManager'
import Active from './pages/Active'
import LegalDocs from './pages/LegalDocs'
import LegalDisclaimerModal from './components/LegalDisclaimerModal'

function App() {
  return (
    <AuthProvider>
      <WhatsAppProvider>
      <BrowserRouter>
        <LegalDisclaimerModal />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />
          <Route path="/upload-playlist" element={<UploadPlaylist />} />
          <Route path="/active" element={<Active />} />
          <Route path="/terms" element={<LegalDocs />} />
          <Route path="/termos-de-uso" element={<LegalDocs />} />
          <Route path="/privacy" element={<LegalDocs />} />
          <Route path="/politica-de-privacidade" element={<LegalDocs />} />
          <Route path="/cookies" element={<LegalDocs />} />
          <Route path="/loja/:slug" element={<Store />} />
          <Route path="/subscribe-plans" element={<SubscribePlans />} />
          <Route element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="devices" element={<Devices />} />
            <Route path="api-monitor" element={<Navigate to="/api-config" replace />} />
            <Route path="api-config" element={<APIPanel />} />
            <Route path="branding-banners" element={<BrandingBanners />} />
            <Route path="logs" element={<Navigate to="/versions" replace />} />
            <Route path="bugs" element={<Navigate to="/versions" replace />} />
            <Route path="versions" element={<VersionsWithLogs />} />
            <Route path="iptv-server" element={<IptvServer />} />
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
            <Route path="whatsapp-auto" element={<WhatsAppAuto />} />
            <Route path="finance" element={<Finance />} />
            <Route path="finance-plans" element={<FinancePlans />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="agents" element={<NexusAgent />} />
            <Route path="anime-manager" element={<AnimeManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </WhatsAppProvider>
    </AuthProvider>
  )
}

export default App
