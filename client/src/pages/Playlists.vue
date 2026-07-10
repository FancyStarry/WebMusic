<template>
  <div class="playlists-page">
    <h1 class="page-title">我的歌单</h1>
    <div v-for="pl in library.playlists" :key="pl.id"
      class="pl-card" @click="$router.push(`/playlist/${pl.id}`)">
      <div class="pl-cover" :style="pl.cover_song_id ? { backgroundImage: `url(/api/music/${pl.cover_song_id}/cover)` } : {}">
        <span v-if="!pl.cover_song_id" class="material-symbols-rounded">playlist_play</span>
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
</template>

<script setup>
import { onMounted } from 'vue'
import { useLibraryStore } from '../stores/library'

const library = useLibraryStore()

onMounted(() => {
  library.fetchPlaylists()
})
</script>

<style scoped>
.playlists-page {
  max-width: 720px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--md-on-surface);
}

.pl-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
}

.pl-card:active {
  background: var(--md-surface-variant);
}

.pl-cover {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--md-primary-container);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pl-cover .material-symbols-rounded {
  font-size: 24px;
  color: var(--md-primary);
}

.pl-info {
  flex: 1;
  min-width: 0;
}

.pl-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: var(--md-on-surface);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-count {
  font-size: 12px;
  color: var(--md-on-surface-variant);
  margin-top: 2px;
}

.pl-arrow {
  font-size: 20px;
  color: var(--md-on-surface-variant);
  flex-shrink: 0;
}

.pl-empty {
  text-align: center;
  padding: 60px 16px;
  color: var(--md-on-surface-variant);
}

.pl-empty .material-symbols-rounded {
  font-size: 48px;
  margin-bottom: 12px;
}

.pl-empty p {
  font-size: 15px;
  margin: 0;
}
</style>
