import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  const login = async (email, senha, deviceInfo = {}) => {
    const response = await api.post('/api/auth/login', { 
      email, 
      senha,
      device_id: deviceInfo.device_id,
      modelo: deviceInfo.modelo,
      android_version: deviceInfo.android_version,
      app_version: deviceInfo.app_version
    })
    const { token: newToken, user: userData, config } = response.data
    
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('config', JSON.stringify(config))
    
    return { user: userData, config }
  }

  const logout = async () => {
    try {
      if (token) {
        await api.delete('/api/auth/logout')
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('config')
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
