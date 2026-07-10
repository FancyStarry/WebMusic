<template>
  <div class="home">
    <div class="hero" v-if="recentAlbums.length">
      <div class="hero-glow" :style="{ background: heroGradient }"></div>
      <div class="hero-content">
        <h1 class="hero-title">欢迎回来</h1>
        <p class="hero-subtitle">{{ library.totalSongs }} 首歌曲 · {{ library.albums.length }} 张专辑</p>
      </div>
    </div>

    <div class="section" v-if="recentAlbums.length">
      <div class="section-header">
        <h2 class="section-title">最近添加</h2>
        <router-link to="/library" class="section-more">查看全部</router-link>
      </div>
      <div class="album-grid">
        <AlbumCard v-for="album in recentAlbums" :key="album.id" :album="album" />
      </div>
    </div>

    <div class="welcome" v-else>
      <div class="welcome-card">
        <div class="welcome-icon">
          <span class="material-symbols-rounded" style="font-size:64px">music_note</span>
        </div>
        <h2>开始使用 WebMusic</h2>
        <p>在左侧侧边栏点击「扫描本地音乐」，选择你的音乐文件夹</p>
        <p class="welcome-hint">支持 MP3、FLAC、WAV、OGG、M4A 等格式</p>
        <button class="scan-btn" @click="startScan" :disabled="library.scanStatus.scanning">
          {{ library.scanStatus.scanning ? '扫描中...' : '立即扫描' }}
        </button>
        <div class="scan-status" v-if="library.scanStatus.status === 'done'">
          扫描完成！找到 {{ library.totalSongs }} 首歌曲
        </div>
      </div>
    </div>

    <div class="mobile-playlists">
      <div class="section-header">
        <h2 class="section-title">我的歌单</h2>
        <button class="create-playlist-btn" @click="showCreate = true">
          <span class="material-symbols-rounded">add</span>
          新建
        </button>
      </div>

      <div v-for="pl in library.playlists" :key="pl.id" class="pl-card" @click="$router.push(`/playlist/${pl.id}`)">
        <div class="pl-cover">
          <span class="material-symbols-rounded">playlist_play</span>
        </div>
        <div class="pl-info">
          <span class="pl-name">{{ pl.name }}</span>
          <span class="pl-count">{{ pl.song_count }} 首</span>
        </div>
        <span class="material-symbols-rounded pl-arrow">chevron_right</span>
      </div>

      <div v-if="!library.playlists.length" class="pl-empty">
        <span class="material-symbols-rounded">queue_music</span>
        <p>暂无歌单</p>
      </div>
    </div>

    <Teleport to="body">
      <div class="modal-overlay" v-if="showCreate" @click.self="showCreate = false">
        <div class="modal-dialog">
          <h3 class="modal-title">新建歌单</h3>
          <input class="modal-input" v-model="newName" placeholder="歌单名称" ref="nameInput" @keydown.enter="handleCreate" />
          <input class="modal-input" v-model="newDesc" placeholder="描述（可选）" @keydown.enter="handleCreate" />
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showCreate = false">取消</button>
            <button class="modal-btn confirm" @click="handleCreate" :disabled="!newName.trim()">创建</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import AlbumCard from '../components/AlbumCard.vue'
import { useLibraryStore } from '../stores/library'

const library = useLibraryStore()
const recentAlbums = computed(() => library.albums.slice(0, 8))

const heroGradient = ref('linear-gradient(135deg, var(--md-primary), var(--md-tertiary))')
const showCreate = ref(false)
const newName = ref('')
const newDesc = ref('')
const nameInput = ref(null)

watch(showCreate, async (val) => {
  if (val) {
    newName.value = ''
    newDesc.value = ''
    await nextTick()
    nameInput.value?.focus()
  }
})

async function handleCreate() {
  const name = newName.value.trim()
  if (!name) return
  await library.createPlaylist(name, newDesc.value.trim())
  showCreate.value = false
}

onMounted(async () => {
  await library.fetchAlbums()
  await library.fetchSongs({ pageSize: 1 })
  library.fetchPlaylists()
})

async function startScan() {
  await library.triggerScan()
  await pollScanStatus()
  library.fetchAlbums()
  library.fetchSongs({ pageSize: 1 })
}

async function pollScanStatus() {
  for (let i = 0; i < 60; i++) {
    const status = await library.fetchScanStatus()
    if (!status.scanning) break
    await new Promise(r => setTimeout(r, 500))
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
}

.hero {
  position: relative;
  padding: 48px 32px;
  border-radius: 20px;
  margin-bottom: 32px;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  filter: blur(40px);
}

.hero-content {
  position: relative;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--md-on-surface);
}

.hero-subtitle {
  font-size: 14px;
  color: var(--md-on-surface-variant);
  margin: 0;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--md-on-surface);
}

.section-more {
  font-size: 13px;
  color: var(--md-primary);
  text-decoration: none;
  font-weight: 500;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.welcome-card {
  text-align: center;
  max-width: 400px;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.welcome-card h2 {
  font-size: 24px;
  margin: 0 0 8px;
  color: var(--md-on-surface);
}

.welcome-card p {
  font-size: 14px;
  color: var(--md-on-surface-variant);
  margin: 0 0 4px;
}

.welcome-hint {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 8px;
}

.scan-btn {
  margin-top: 24px;
  padding: 12px 32px;
  border: none;
  border-radius: 24px;
  background: var(--md-primary);
  color: var(--md-on-primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.scan-btn:disabled {
  opacity: 0.6;
}

.scan-status {
  margin-top: 16px;
  font-size: 13px;
  color: var(--md-primary);
}

.mobile-playlists {
  display: none;
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
  width: 320px;
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
}

.modal-btn.cancel {
  background: transparent;
  color: var(--md-on-surface-variant);
}

.modal-btn.confirm {
  background: var(--md-primary);
  color: var(--md-on-primary);
}

.modal-btn.confirm:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (max-width: 768px) {
  .mobile-playlists {
    display: block;
    margin-bottom: 16px;
  }

  .create-playlist-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border: none;
    border-radius: 20px;
    background: var(--md-primary-container);
    color: var(--md-on-primary-container);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .pl-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    background: var(--md-surface-container);
    margin-bottom: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .pl-card:active {
    background: var(--md-surface-variant);
  }

  .pl-cover {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: var(--md-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .pl-cover .material-symbols-rounded {
    font-size: 22px;
    color: var(--md-primary);
  }

  .pl-info {
    flex: 1;
    min-width: 0;
  }

  .pl-name {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--md-on-surface);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pl-count {
    font-size: 12px;
    color: var(--md-on-surface-variant);
  }

  .pl-arrow {
    font-size: 20px;
    color: var(--md-on-surface-variant);
    flex-shrink: 0;
  }

  .pl-empty {
    text-align: center;
    padding: 32px 16px;
    color: var(--md-on-surface-variant);
  }

  .pl-empty .material-symbols-rounded {
    font-size: 40px;
    margin-bottom: 8px;
  }

  .pl-empty p {
    font-size: 14px;
    margin: 0;
  }

  .home {
    max-width: 100%;
  }

  .hero {
    padding: 24px 16px;
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .hero-title {
    font-size: 22px;
  }

  .section-title {
    font-size: 17px;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .welcome-card h2 {
    font-size: 20px;
  }

  .hero, .section, .welcome {
    display: none;
  }
}
</style>
