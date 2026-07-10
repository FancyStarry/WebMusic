<template>
  <div class="music-table">
    <div class="table-header">
      <span class="col-cover"></span>
      <span class="col-title">标题</span>
      <span class="col-artist">歌手</span>
      <span class="col-album">专辑</span>
      <span class="col-duration">时长</span>
    </div>
    <div class="table-body" ref="tableBodyRef" @scroll="onTableScroll">
      <button v-if="showScrollBtn" class="scroll-to-current" @click="scrollToCurrent" title="定位到当前播放">
        <span class="material-symbols-rounded">my_location</span>
      </button>
      <div v-for="(song, i) in songs" :key="song.id"
        class="table-row"
        :class="{ active: player.currentSong?.id === song.id }"
        @dblclick="playSong(song, i)"
        @click="onRowClick(song, i)"
        @contextmenu.prevent="openContextMenu($event, song)">
        <span class="col-cover">
          <div class="song-cover" :style="{ backgroundImage: getCoverUrl(song) ? `url(${getCoverUrl(song)})` : '' }">
            <span class="material-symbols-rounded cover-placeholder-icon" v-if="!getCoverUrl(song)">music_note</span>
            <span class="material-symbols-rounded row-play-icon">play_arrow</span>
          </div>
        </span>
        <span class="col-title">
          <span class="title-text">{{ song.title }}</span>
          <span class="title-format" v-if="song.file_format">.{{ song.file_format }}</span>
        </span>
        <span class="col-artist clickable" @click.stop="goToArtist(song)">
          {{ song.artist }}
        </span>
        <span class="col-album clickable" @click.stop="goToAlbum(song)">
          {{ song.album }}
        </span>
        <span class="col-duration">{{ formatDuration(song.duration) }}</span>
      </div>
    </div>

    <ContextMenu
      v-if="contextSong"
      :x="contextX"
      :y="contextY"
      :song="contextSong"
      :playlists="library.playlists"
      :loading="playlistLoading"
      :playlist-id="playlistId"
      @action="handleContextAction"
      @close="closeContextMenu" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { useLibraryStore } from '../stores/library'
import ContextMenu from './ContextMenu.vue'

const emit = defineEmits(['removeSong'])
const props = defineProps({
  songs: { type: Array, required: true },
  playlistId: { type: Number, default: null },
})

const router = useRouter()
const player = usePlayerStore()
const library = useLibraryStore()

const contextSong = ref(null)
const contextX = ref(0)
const contextY = ref(0)
const playlistLoading = ref(false)

const tableBodyRef = ref(null)
const showScrollBtn = ref(false)

const isMobile = ref(window.innerWidth <= 768)

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })
}

function onRowClick(song, index) {
  if (!isMobile.value) return
  playSong(song, index)
}

const hasCurrentSong = computed(() => {
  return player.currentSong && props.songs.some(s => s.id === player.currentSong.id)
})

function onTableScroll() {
  if (!hasCurrentSong.value) {
    showScrollBtn.value = false
    return
  }
  const body = tableBodyRef.value
  if (!body) return
  const active = body.querySelector('.table-row.active')
  if (!active) {
    showScrollBtn.value = false
    return
  }
  const rect = active.getBoundingClientRect()
  const container = body.getBoundingClientRect()
  showScrollBtn.value = rect.bottom > container.bottom || rect.top < container.top
}

function scrollToCurrent() {
  const body = tableBodyRef.value
  if (!body) return
  const active = body.querySelector('.table-row.active')
  if (active) {
    active.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function checkScrollBtn() {
  if (!tableBodyRef.value) return
  onTableScroll()
}

function getCoverUrl(song) {
  return song.has_cover ? `/api/music/${song.id}/cover` : ''
}

async function goToArtist(song, name) {
  if (!song.artist) return
  name = name || song.artist.split('/')[0].trim()
  if (!name) return
  try {
    const data = await library.fetchArtistByName(name)
    router.push(`/artist/${data.artist.id}`)
  } catch {
    // artist not found
  }
}

async function goToAlbum(song) {
  if (!song.album) return
  try {
    const data = await library.fetchAlbumByTitle(song.album)
    router.push(`/album/${data.album.id}`)
  } catch {
    // album not found
  }
}

function playSong(song, index) {
  player.playList(props.songs, index)
}

async function openContextMenu(e, song) {
  contextSong.value = song
  contextX.value = e.clientX || e.changedTouches?.[0]?.clientX || 0
  contextY.value = e.clientY || e.changedTouches?.[0]?.clientY || 0
  playlistLoading.value = true
  try {
    await library.fetchPlaylists()
  } finally {
    playlistLoading.value = false
  }
}

function closeContextMenu() {
  contextSong.value = null
}

async function handleContextAction({ action, song, payload }) {
  switch (action) {
    case 'play':
      player.play(song)
      break
    case 'playNext':
      player.playNext(song)
      break
    case 'artist':
      goToArtist(song, payload)
      break
    case 'album':
      goToAlbum(song)
      break
    case 'addToPlaylist':
      if (payload) {
        await library.addToPlaylist(payload.id, [song.id])
      }
      break
    case 'removeFromPlaylist':
      if (props.playlistId) {
        await library.removeFromPlaylist(props.playlistId, song.id)
        emit('removeSong', song.id)
      }
      break
  }
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

watch(() => player.currentSong?.id, () => {
  checkScrollBtn()
})
</script>

<style scoped>
.music-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: flex;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--md-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--md-outline-variant);
}

.table-body {
  display: flex;
  flex-direction: column;
  position: relative;
}

.scroll-to-current {
  position: sticky;
  top: 8px;
  float: right;
  margin-right: 12px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--md-outline);
  background: var(--md-surface-container);
  color: var(--md-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--md-elevation-2);
  transition: background 0.15s, transform 0.15s;
}

.scroll-to-current:hover {
  background: var(--md-primary-container);
  transform: scale(1.1);
}

.table-row {
  display: flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 8px;
  transition: background 0.15s;
  cursor: pointer;
  font-size: 13px;
  gap: 8px;
  user-select: none;
}

.table-row:hover {
  background: var(--md-surface-variant);
}

.table-row.active {
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

.col-cover {
  width: 40px;
  flex-shrink: 0;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  background-color: var(--md-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cover-placeholder-icon {
  font-size: 18px;
  color: var(--md-on-surface-variant);
  opacity: 0.5;
}

.row-play-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.15s;
}

.table-row:hover .row-play-icon {
  opacity: 1;
}

.col-title {
  flex: 3;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-format {
  font-size: 10px;
  opacity: 0.4;
  text-transform: uppercase;
}

.col-artist {
  flex: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.col-album {
  flex: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.clickable {
  cursor: pointer;
  color: var(--md-primary);
  transition: text-decoration 0.15s;
}

.clickable:hover {
  text-decoration: underline;
}

.col-duration {
  width: 60px;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  color: var(--md-on-surface-variant);
}

@media (max-width: 768px) {
  .music-table {
    border-radius: 0;
  }

  .table-header {
    display: none;
  }

  .table-row {
    padding: 10px 12px;
    border-radius: 10px;
    gap: 12px;
    font-size: 13px;
    margin-bottom: 2px;
    -webkit-tap-highlight-color: transparent;
  }

  .table-row:active {
    background: var(--md-surface-variant);
  }

  .col-cover {
    width: 46px;
  }

  .song-cover {
    width: 46px;
    height: 46px;
    border-radius: 8px;
  }

  .row-play-icon {
    opacity: 0.6;
    font-size: 20px;
  }

  .col-album {
    display: none;
  }

  .col-duration {
    display: none;
  }

  .col-artist {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .scroll-to-current {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
}
</style>
