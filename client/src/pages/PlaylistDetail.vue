<template>
  <div class="playlist-detail" v-if="playlist">
    <div class="playlist-header">
      <div
        class="playlist-cover"
        :class="{ placeholder: !coverUrl }"
        :style="coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}">
        <span v-if="!coverUrl" class="material-symbols-rounded cover-icon">playlist_play</span>
      </div>
      <div class="playlist-info">
        <span class="label">歌单</span>
        <div class="name-row">
          <h1 class="playlist-name">{{ playlist.name }}</h1>
          <button class="btn-icon" @click="openEdit" title="编辑歌单">
            <span class="material-symbols-rounded">edit</span>
          </button>
        </div>
        <p class="playlist-desc" v-if="playlist.description">{{ playlist.description }}</p>
        <div class="playlist-meta">
          <span>{{ songs.length }} 首歌曲</span>
        </div>
        <div class="playlist-actions">
          <button class="btn-play" @click="playAll" :disabled="!songs.length">
            <span class="material-symbols-rounded">play_arrow</span>
            <span>播放全部</span>
          </button>
          <button class="btn-delete" @click="deletePlaylist">
            <span class="material-symbols-rounded">delete</span>
            <span>删除歌单</span>
          </button>
        </div>
      </div>
    </div>

    <div class="playlist-search" v-if="songs.length">
      <span class="material-symbols-rounded search-icon">search</span>
      <input v-model="searchQuery" type="text" class="search-input" placeholder="在歌单中搜索..." />
      <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>

    <div class="empty-state" v-if="!filteredSongs.length">
      <span class="material-symbols-rounded empty-icon">queue_music</span>
      <p v-if="!songs.length">歌单是空的</p>
      <p v-else>未找到匹配的歌曲</p>
      <span v-if="!songs.length" class="empty-hint">在歌曲上右键添加到歌单</span>
    </div>

    <MusicTable v-else :songs="filteredSongs" :playlist-id="Number(route.params.id)" @remove-song="onRemoveSong" />

    <Teleport to="body">
      <div class="modal-overlay" v-if="showEdit" @click.self="showEdit = false">
        <div class="modal-dialog">
          <h3 class="modal-title">编辑歌单</h3>
          <input class="modal-input" v-model="editName" placeholder="歌单名称" ref="editInput" />
          <input class="modal-input" v-model="editDesc" placeholder="描述（可选）" />
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showEdit = false">取消</button>
            <button class="modal-btn confirm" @click="saveEdit" :disabled="!editName.trim()">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MusicTable from '../components/MusicTable.vue'
import { useLibraryStore } from '../stores/library'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
const router = useRouter()
const library = useLibraryStore()
const player = usePlayerStore()

const playlist = ref(null)
const songs = ref([])
const coverSongId = ref(null)
const searchQuery = ref('')

const filteredSongs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return songs.value
  return songs.value.filter(s =>
    (s.title || '').toLowerCase().includes(q) ||
    (s.artist || '').toLowerCase().includes(q) ||
    (s.album || '').toLowerCase().includes(q)
  )
})

const coverUrl = computed(() => {
  return coverSongId.value ? `/api/music/${coverSongId.value}/cover` : ''
})

const showEdit = ref(false)
const editName = ref('')
const editDesc = ref('')
const editInput = ref(null)

onMounted(async () => {
  await loadPlaylist()
})

async function loadPlaylist() {
  try {
    const data = await library.fetchPlaylist(route.params.id)
    playlist.value = data.playlist
    songs.value = data.songs
    coverSongId.value = data.cover_song_id
  } catch (e) {
    console.error('加载歌单失败:', e)
  }
}

function playAll() {
  if (songs.value.length) {
    player.playList(songs.value, 0)
  }
}

async function deletePlaylist() {
  await library.deletePlaylist(route.params.id)
  router.push('/')
}

function openEdit() {
  editName.value = playlist.value.name
  editDesc.value = playlist.value.description || ''
  showEdit.value = true
  nextTick(() => editInput.value?.focus())
}

async function saveEdit() {
  const name = editName.value.trim()
  if (!name) return
  const data = await library.updatePlaylist(route.params.id, name, editDesc.value.trim())
  playlist.value = data.playlist
  showEdit.value = false
}

function onRemoveSong() {
  loadPlaylist()
}
</script>

<style scoped>
.playlist-detail {
  max-width: 1000px;
}

.playlist-header {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
  align-items: flex-end;
}

.playlist-cover {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.playlist-cover.placeholder {
  background: linear-gradient(135deg, var(--md-primary-container), var(--md-tertiary-container));
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-icon {
  font-size: 56px;
  color: var(--md-on-primary-container);
  opacity: 0.6;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
  min-width: 0;
}

.label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--md-primary);
  margin-bottom: 8px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.playlist-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--md-on-surface);
}

.btn-icon {
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

.btn-icon:hover {
  background: var(--md-surface-variant);
  color: var(--md-on-surface);
}

.btn-icon .material-symbols-rounded {
  font-size: 18px;
}

.playlist-desc {
  font-size: 14px;
  color: var(--md-on-surface-variant);
  margin: 0 0 8px;
}

.playlist-meta {
  font-size: 13px;
  color: var(--md-on-surface-variant);
  margin-bottom: 16px;
}

.playlist-actions {
  display: flex;
  gap: 12px;
}

.btn-play,
.btn-delete {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.btn-play {
  border: none;
  background: var(--md-primary);
  color: var(--md-on-primary);
}

.btn-play:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-delete {
  border: 1px solid var(--md-error);
  background: transparent;
  color: var(--md-error);
}

.btn-delete:hover {
  background: var(--md-error-container);
}

.playlist-search {
  position: relative;
  margin-bottom: 16px;
}

.playlist-search .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: var(--md-on-surface-variant);
  pointer-events: none;
}

.playlist-search .search-input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border: 1px solid var(--md-outline);
  border-radius: 10px;
  background: var(--md-surface);
  color: var(--md-on-surface);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.playlist-search .search-input:focus {
  border-color: var(--md-primary);
}

.search-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  background: var(--md-surface-variant);
}

.search-clear .material-symbols-rounded {
  font-size: 18px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  color: var(--md-on-surface-variant);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-state p {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px;
}

.empty-hint {
  font-size: 13px;
  opacity: 0.6;
}

.loading {
  text-align: center;
  padding: 80px;
  color: var(--md-on-surface-variant);
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

@media (max-width: 768px) {
  .playlist-detail {
    max-width: 100%;
  }

  .playlist-header {
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }

  .playlist-cover {
    width: 160px;
    height: 160px;
    border-radius: 16px;
  }

  .playlist-info {
    align-items: center;
  }

  .playlist-name {
    font-size: 22px;
  }

  .playlist-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .modal-dialog {
    width: calc(100vw - 32px);
    border-radius: 20px;
  }

  .loading {
    padding: 60px 20px;
  }
}
</style>
