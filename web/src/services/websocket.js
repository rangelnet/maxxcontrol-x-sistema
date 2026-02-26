class WebSocketService {
  constructor() {
    this.ws = null
    this.listeners = new Map()
  }

  connect(token) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('🔌 WebSocket conectado')
      this.send({ type: 'auth', token })
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.notifyListeners(data.type, data)
    }

    this.ws.onerror = (error) => {
      console.error('❌ Erro no WebSocket:', error)
    }

    this.ws.onclose = () => {
      console.log('🔌 WebSocket desconectado')
      setTimeout(() => this.connect(token), 5000)
    }
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event) || []
    callbacks.forEach(callback => callback(data))
  }

  disconnect() {
    this.ws?.close()
  }
}

export default new WebSocketService()
