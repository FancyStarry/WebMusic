import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import '@fontsource/noto-sans-sc/chinese-simplified-400.css'
import '@fontsource/noto-sans-sc/chinese-simplified-500.css'
import '@fontsource/noto-sans-sc/chinese-simplified-700.css'
import 'material-symbols/rounded.css'
import './styles/md3.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

const auth = useAuthStore()

const originalFetch = window.fetch
window.fetch = function(input, init = {}) {
  const url = typeof input === 'string' ? input : (input && input.url)
  if (typeof url === 'string' && url.startsWith('/api/') && !url.startsWith('/api/auth/')) {
    const store = useAuthStore()
    if (store.token) {
      init = { ...init }
      init.headers = { ...init.headers, Authorization: `Bearer ${store.token}` }
    }
  }
  return originalFetch.call(window, input, init)
}

auth.checkStatus()

app.mount('#app')
