import axios from 'axios'

// Configuração da API - usa URL relativa em produção
const BACKEND_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://maxxcontrol-x-sistema.onrender.com' 
    : 'http://localhost:3001')

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos - tolerante ao cold start do Render
})

// Interceptor para adicionar token em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api
