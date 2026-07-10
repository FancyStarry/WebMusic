<template>
  <div class="artist-detail" v-if="artist">
    <div class="artist-header">
      <div class="artist-avatar">
        <span>{{ artist.name[0] }}</span>
      </div>
      <div class="artist-info">
        <span class="label">歌手</span>
        <h1 class="artist-name">{{ artist.name }}</h1>
        <div class="artist-meta">
          <span>{{ artist.song_count }} 首歌曲</span>
          <span class="dot">·</span>
          <span>{{ artist.album_count }} 张专辑</span>
        </div>
        <button class="btn-play" @click="playAll">播放全部</button>
      </div>
    </div>

    <div class="section" v-if="albums.length">
      <h2 class="section-title">专辑</h2>
      <div class="album-grid">
        <AlbumCard v-for="al in albums" :key="al.title" :album="al" />
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">热门歌曲</h2>
      <MusicTable :songs="songs" />
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AlbumCard from '../components/AlbumCard.vue'
import MusicTable from '../components/MusicTable.vue'
import { useLibraryStore } from '../stores/library'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
const library = useLibraryStore()
const player = usePlayerStore()

const artist = ref(null)
const albums = ref([])
const songs = ref([])

onMounted(async () => {
  try {
    const data = await library.fetchArtist(route.params.id)
    artist.value = data.artist
    albums.value = data.albums
    songs.value = data.songs
  } catch (e) {
    console.error('加载歌手失败:', e)
  }
})

function playAll() {
  if (songs.value.length) {
    player.playList(songs.value, 0)
  }
}
</script>

<style scoped>
.artist-detail {
  max-width: 1000px;
}

.artist-header {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
  align-items: flex-end;
}

.artist-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.artist-info {
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

.artist-name {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--md-on-surface);
}

.artist-meta {
  font-size: 14px;
  color: var(--md-on-surface-variant);
  margin-bottom: 16px;
}

.dot {
  margin: 0 6px;
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
  width: fit-content;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--md-on-surface);
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.loading {
  text-align: center;
  padding: 80px;
  color: var(--md-on-surface-variant);
}

@media (max-width: 768px) {
  .artist-detail {
    max-width: 100%;
  }

  .artist-header {
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }

  .artist-avatar {
    width: 140px;
    height: 140px;
    font-size: 48px;
  }

  .artist-info {
    align-items: center;
  }

  .artist-name {
    font-size: 24px;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .section-title {
    font-size: 17px;
  }

  .loading {
    padding: 60px 20px;
  }
}
</style>
