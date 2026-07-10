<template>
  <div class="album-detail" v-if="album">
    <div class="album-header">
      <div class="album-cover-large" :style="{ backgroundImage: coverUrl ? `url(${coverUrl})` : '' }">
        <div class="cover-placeholder" v-if="!coverUrl">♪</div>
      </div>
      <div class="album-info">
        <span class="label">专辑</span>
        <h1 class="album-title">{{ album.title }}</h1>
        <p class="album-artist">{{ album.artist }}</p>
        <div class="album-meta">
          <span>{{ album.year || '未知年份' }}</span>
          <span class="dot">·</span>
          <span>{{ songs.length }} 首歌曲</span>
        </div>
        <div class="album-actions">
          <button class="btn-play" @click="playAll">播放全部</button>
        </div>
      </div>
    </div>

    <MusicTable :songs="songs" />
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MusicTable from '../components/MusicTable.vue'
import { useLibraryStore } from '../stores/library'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
const library = useLibraryStore()
const player = usePlayerStore()

const album = ref(null)
const songs = ref([])

const coverUrl = computed(() => {
  return album.value?.has_cover ? `/api/albums/${route.params.id}/cover` : ''
})

onMounted(async () => {
  try {
    const data = await library.fetchAlbum(route.params.id)
    album.value = data.album
    songs.value = data.songs
  } catch (e) {
    console.error('加载专辑失败:', e)
  }
})

function playAll() {
  if (songs.value.length) {
    player.playList(songs.value, 0)
  }
}
</script>

<style scoped>
.album-detail {
  max-width: 1000px;
}

.album-header {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}

.album-cover-large {
  width: 220px;
  height: 220px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  background-color: var(--md-surface-variant);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.cover-placeholder {
  font-size: 48px;
  opacity: 0.3;
}

.album-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--md-primary);
  margin-bottom: 8px;
}

.album-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--md-on-surface);
}

.album-artist {
  font-size: 15px;
  color: var(--md-on-surface-variant);
  margin: 0 0 8px;
}

.album-meta {
  font-size: 13px;
  color: var(--md-on-surface-variant);
  margin-bottom: 16px;
}

.dot {
  margin: 0 6px;
}

.album-actions {
  display: flex;
  gap: 12px;
}

.btn-play {
  padding: 10px 28px;
  border: none;
  border-radius: 24px;
  background: var(--md-primary);
  color: var(--md-on-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-play:hover {
  opacity: 0.9;
}

.loading {
  text-align: center;
  padding: 80px;
  color: var(--md-on-surface-variant);
}

@media (max-width: 768px) {
  .album-detail {
    max-width: 100%;
  }

  .album-header {
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }

  .album-cover-large {
    width: 180px;
    height: 180px;
    border-radius: 16px;
  }

  .album-info {
    align-items: center;
  }

  .album-title {
    font-size: 22px;
  }

  .album-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .loading {
    padding: 60px 20px;
  }
}
</style>
