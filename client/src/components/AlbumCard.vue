<template>
  <div class="album-card" @click="$router.push(`/album/${album.id}`)">
    <div class="album-cover" :style="{ backgroundImage: coverUrl ? `url(${coverUrl})` : '' }">
      <div class="cover-placeholder" v-if="!coverUrl">
        <span class="material-symbols-rounded">music_note</span>
      </div>
      <div class="cover-overlay">
        <button class="play-overlay-btn" @click.stop="playAlbum">
          <span class="material-symbols-rounded">play_arrow</span>
        </button>
      </div>
    </div>
    <div class="album-info">
      <div class="album-title">{{ album.title }}</div>
      <div class="album-artist">{{ album.artist }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useLibraryStore } from '../stores/library'

const props = defineProps({
  album: { type: Object, required: true },
})

const player = usePlayerStore()
const library = useLibraryStore()

const coverUrl = computed(() => {
  return props.album.has_cover ? `/api/albums/${props.album.id}/cover` : ''
})

async function playAlbum() {
  const data = await library.fetchAlbum(props.album.id)
  if (data.songs?.length) {
    player.playList(data.songs, 0)
  }
}
</script>

<style scoped>
.album-card {
  width: 100%;
  cursor: pointer;
  border-radius: 12px;
  transition: box-shadow 0.2s, background 0.2s;
}

.album-card:hover {
  background: var(--md-surface-container);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.album-card:hover .cover-overlay {
  opacity: 1;
}

.album-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: var(--md-surface-variant);
  overflow: hidden;
}

.cover-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-on-surface-variant);
  opacity: 0.4;
}

.cover-placeholder .material-symbols-rounded {
  font-size: 48px;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4));
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.play-overlay-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--md-primary);
  color: var(--md-on-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s, box-shadow 0.15s;
}

.play-overlay-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.play-overlay-btn .material-symbols-rounded {
  font-size: 24px;
}

.album-info {
  padding: 8px 4px;
}

.album-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--md-on-surface);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.album-artist {
  font-size: 12px;
  color: var(--md-on-surface-variant);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
