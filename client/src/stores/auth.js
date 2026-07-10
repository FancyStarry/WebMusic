import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || '')
  const username = ref(localStorage.getItem('auth_username') || '')
  const setupRequired = ref(false)
  const initialized = ref(false)

  const loggedIn = computed(() => !!token.value && !!username.value)

  function getAuthHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  async function checkStatus() {
    try {
      const headers = getAuthHeaders()
      const res = await fetch('/api/auth/status', { headers })
      const data = await res.json()
      setupRequired.value = data.setupRequired
      if (data.loggedIn) {
        username.value = data.user.username
      } else if (localStorage.getItem('auth_token')) {
        token.value = ''
        username.value = ''
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_username')
      }
    } catch {
      setupRequired.value = false
    }
    initialized.value = true
  }

  async function login(loginUsername, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUsername, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    token.value = data.token
    username.value = data.user.username
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_username', data.user.username)
  }

  async function setup(setupUsername, password) {
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: setupUsername, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    token.value = data.token
    username.value = data.user.username
    setupRequired.value = false
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_username', data.user.username)
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_username')
  }

  return { token, username, loggedIn, setupRequired, initialized, getAuthHeaders, checkStatus, login, setup, logout }
})
