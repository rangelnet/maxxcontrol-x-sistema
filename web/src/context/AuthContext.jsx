import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

// ⚠️ CONTROLE DE AMBIENTE: Usado apenas para ambiente local.
// No servidor/nuvem sempre será bloqueado.
const isDevMode = import.meta.env.DEV;
const DEV_BYPASS_LOGIN = isDevMode && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    DEV_BYPASS_LOGIN ? 'dev-token' : localStorage.getItem('token')
  )
  const safeParseUser = () => {
    try {
      const item = localStorage.getItem('user');
      if (!item || item === 'undefined') return null;
      return JSON.parse(item);
    } catch (e) {
      localStorage.removeItem('user'); // Limpa o "lixo" do navegador
      return null;
    }
  };

  const [user, setUser] = useState(
    DEV_BYPASS_LOGIN ? { name: 'Admin Dev', email: 'admin@maxxcontrol.com', role: 'admin' } : safeParseUser()
  )
  const [loading, setLoading] = useState(DEV_BYPASS_LOGIN ? false : true)

  useEffect(() => {
    if (DEV_BYPASS_LOGIN) return // Pula validação em modo dev
    if (token) {
      validateToken()
    } else {
      setLoading(false)
    }
  }, [token])

  const validateToken = async () => {
    try {
      await api.get('/api/auth/validate-token')
      setLoading(false)
    } catch (error) {
      logout()
      setLoading(false)
    }
  }

  // Gerar ou recuperar ID único do navegador para 2FA inteligente
  const getBrowserId = () => {
    try {
      let bid = localStorage.getItem('browser_id')
      if (!bid) {
        // Fallback: Se crypto.randomUUID não estiver disponível (ex: navegadores antigos ou sem context seguro)
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          bid = crypto.randomUUID()
        } else {
          bid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        }
        localStorage.setItem('browser_id', bid)
      }
      return bid
    } catch (e) {
      console.error('Erro ao acessar localStorage', e)
      return 'anonymous-device'
    }
  }

  const login = async (email, senha, deviceInfo = {}) => {
    if (DEV_BYPASS_LOGIN) {
      const fakeToken = 'dev-bypass-token'
      const fakeUser = { name: 'Admin Dev', email, role: 'admin' }
      setToken(fakeToken)
      setUser(fakeUser)
      localStorage.setItem('token', fakeToken)
      return { user: fakeUser, config: {} }
    }

    const response = await api.post('/api/auth/login', { 
      email, 
      senha,
      device_id: deviceInfo.device_id || getBrowserId(),
      modelo: deviceInfo.modelo || 'Web Browser',
      android_version: deviceInfo.android_version || 'N/A',
      app_version: deviceInfo.app_version || '1.0.0'
    })

    // Se o backend pedir 2FA, retorna o payload na hora para a tela de Login interceptar
    if (response.data.require2FA) {
      return response.data;
    }

    const { token: newToken, user: userData, config } = response.data
    
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    if (config) localStorage.setItem('config', JSON.stringify(config))
    
    return response.data
  }

  const logout = async () => {
    try {
      if (token && !DEV_BYPASS_LOGIN) {
        await api.delete('/api/auth/logout')
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('config')
    }
  }

  const complete2FALogin = (token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, complete2FALogin }}>
      {children}
    </AuthContext.Provider>
  )
}
