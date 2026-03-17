import axios from 'axios'

// Configuração da API - usa URL relativa em produção
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001'),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000 // 8 segundos - evita travar infinitamente
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
