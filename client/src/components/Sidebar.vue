<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="material-symbols-rounded logo-icon">music_note</span>
        <span class="logo-text">WebMusic</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/library" class="nav-item" :class="{ active: $route.path === '/library' }">
        <span class="material-symbols-rounded nav-icon">library_music</span>
        <span>音乐库</span>
      </router-link>
      <router-link to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
        <span class="material-symbols-rounded nav-icon">settings</span>
        <span>设置</span>
      </router-link>
    </nav>

    <div class="sidebar-section">
      <div class="section-title">
        <span>我的歌单</span>
        <button class="btn-add-playlist" @click.stop="showCreateDialog = true" title="新建歌单">
          <span class="material-symbols-rounded">add</span>
        </button>
      </div>
      <div class="playlist-list">
        <div v-for="pl in library.playlists" :key="pl.id"
          class="playlist-item"
          :class="{ active: $route.path === `/playlist/${pl.id}` }"
          @click="$router.push(`/playlist/${pl.id}`)">
          <span class="material-symbols-rounded playlist-icon">playlist_play</span>
          <span class="playlist-name">{{ pl.name }}</span>
          <span class="playlist-count">{{ pl.song_count }}</span>
        </div>
      </div>
    </div>

    <div v-if="auth.loggedIn" class="sidebar-user">
      <div class="user-info">
        <span class="material-symbols-rounded user-avatar">person</span>
        <span class="user-name">{{ auth.username }}</span>
      </div>
      <button class="logout-btn" @click="handleLogout" title="退出登录">
        <span class="material-symbols-rounded">logout</span>
      </button>
    </div>
  </aside>

  <Teleport to="body">
    <div class="modal-overlay" v-if="showCreateDialog" @click.self="showCreateDialog = false">
      <div class="modal-dialog">
        <h3 class="modal-title">新建歌单</h3>
        <input
          class="modal-input"
          v-model="newName"
          placeholder="歌单名称"
          ref="nameInput"
          @keydown.enter="createPlaylist" />
        <input
          class="modal-input"
          v-model="newDesc"
          placeholder="描述（可选）"
          @keydown.enter="createPlaylist" />
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showCreateDialog = false">取消</button>
          <button class="modal-btn confirm" @click="createPlaylist" :disabled="!newName.trim()">创建</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const library = useLibraryStore()
const auth = useAuthStore()

onMounted(() => {
  library.fetchPlaylists()
})

const showCreateDialog = ref(false)
const newName = ref('')
const newDesc = ref('')
const nameInput = ref(null)

watch(showCreateDialog, async (val) => {
  if (val) {
    newName.value = ''
    newDesc.value = ''
    await nextTick()
    nameInput.value?.focus()
  }
})

async function createPlaylist() {
  const name = newName.value.trim()
  if (!name) return
  await library.createPlaylist(name, newDesc.value.trim())
  showCreateDialog.value = false
}

async function handleLogout() {
  auth.logout()
  if (router.currentRoute.value.path === '/settings') {
    router.push('/login')
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: var(--md-surface-container);
  border-right: 1px solid var(--md-outline-variant);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  padding: 20px 20px 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
  color: var(--md-primary);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--md-on-surface);
}

.sidebar-nav {
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 12px;
  color: var(--md-on-surface-variant);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  border-radius: 0 3px 3px 0;
  background: var(--md-primary);
  transition: height 0.2s;
}

.nav-item.active::before {
  height: 20px;
}

.nav-item:hover {
  background: var(--md-surface-variant);
  color: var(--md-on-surface);
}

.nav-item.active {
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

.nav-icon {
  font-size: 20px;
}

.sidebar-section {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px 8px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--md-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 16px 8px;
}

.btn-add-playlist {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.btn-add-playlist:hover {
  background: var(--md-surface-variant);
  color: var(--md-on-surface);
}

.btn-add-playlist .material-symbols-rounded {
  font-size: 16px;
}

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 13px;
  color: var(--md-on-surface-variant);
}

.playlist-item:hover {
  background: var(--md-surface-variant);
  color: var(--md-on-surface);
}

.playlist-item.active {
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

.playlist-icon {
  font-size: 18px;
}

.playlist-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-count {
  font-size: 11px;
  opacity: 0.5;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-dialog {
  background: var(--md-surface-container-high);
  border-radius: 16px;
  padding: 24px;
  width: 360px;
  box-shadow: var(--md-elevation-3);
}

.modal-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--md-on-surface);
}

.modal-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--md-outline);
  border-radius: 8px;
  background: var(--md-surface);
  color: var(--md-on-surface);
  font-size: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}

.modal-input:focus {
  border-color: var(--md-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.modal-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.modal-btn.cancel {
  background: transparent;
  color: var(--md-on-surface-variant);
}

.modal-btn.cancel:hover {
  background: var(--md-surface-variant);
}

.modal-btn.confirm {
  background: var(--md-primary);
  color: var(--md-on-primary);
}

.modal-btn.confirm:disabled {
  opacity: 0.5;
  cursor: default;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--md-outline-variant);
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  font-size: 20px;
  color: var(--md-primary);
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--md-on-surface);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: var(--md-error-container);
  color: var(--md-error);
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}

</style>
