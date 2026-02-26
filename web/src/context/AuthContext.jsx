import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      validateToken()
    }
  }, [token])

  const validateToken = async () => {
    try {
      await api.get('/api/auth/validate-token')
    } catch (error) {
      logout()
    }
  }

  const login = async (email, senha) => {
    const response = await api.post('/api/auth/login', { email, senha })
    const { token: newToken, user: userData } = response.data
    
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
