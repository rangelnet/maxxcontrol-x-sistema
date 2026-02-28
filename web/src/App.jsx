import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import APIMonitor from './pages/APIMonitor'
import APIConfig from './pages/APIConfig'
import Branding from './pages/Branding'
import Bugs from './pages/Bugs'
import Versions from './pages/Versions'
import Logs from './pages/Logs'
import IptvServer from './pages/IptvServer'
import Layout from './components/Layout'

const PrivateRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

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
            <Route path="bugs" element={<Bugs />} />
            <Route path="versions" element={<Versions />} />
            <Route path="logs" element={<Logs />} />
            <Route path="iptv-server" element={<IptvServer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
