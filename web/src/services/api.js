import axios from 'axios'

// Configuração da API
// Em dev: usa proxy do Vite (localhost:3001) via VITE_API_URL ou string vazia
// Em produção: sempre aponta para o backend no Render
const isDev = import.meta.env.DEV
const BACKEND_URL = import.meta.env.VITE_API_URL || 
  (isDev ? 'http://localhost:3001' : '')

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 300000 // 5 minutos - suporta listas IPTV grandes (até 500.000 itens)
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
