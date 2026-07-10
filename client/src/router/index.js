import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/library' },
  { path: '/library', name: 'library', component: () => import('../pages/Library.vue') },
  { path: '/album/:id', name: 'album', component: () => import('../pages/AlbumDetail.vue') },
  { path: '/artist/:id', name: 'artist', component: () => import('../pages/ArtistDetail.vue') },
  { path: '/playlists', name: 'playlists', component: () => import('../pages/Playlists.vue') },
  { path: '/playlist/:id', name: 'playlist', component: () => import('../pages/PlaylistDetail.vue') },
  { path: '/settings', name: 'settings', component: () => import('../pages/Settings.vue') },
  { path: '/login', name: 'login', component: () => import('../pages/Login.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (to.path === '/login') return

  if (to.path === '/settings') {
    const auth = useAuthStore()
    if (!auth.initialized) await auth.checkStatus()
    if (!auth.loggedIn) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
})

export default router
