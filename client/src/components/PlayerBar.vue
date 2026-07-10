<template>
  <div class="player-bar">
    <PlayQueue ref="playQueueRef" />
    <audio ref="audioEl" preload="auto"
      @loadedmetadata="onLoaded"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @error="onError"></audio>

    <div class="player-info" :class="{ 'lyrics-mode': player.showLyrics }">
      <div class="cover" :style="{ backgroundImage: player.coverSrc ? `url(${player.coverSrc})` : '' }" @click="player.showLyrics = true" title="打开歌词">
        <span class="material-symbols-rounded" v-if="!player.coverSrc">music_note</span>
      </div>
      <div class="song-info">
        <div class="song-title">{{ player.currentSong?.title || '未播放' }}</div>
        <div class="song-artist">{{ player.currentSong?.artist || '' }}</div>
      </div>
    </div>

    <div class="player-controls">
      <div class="controls-top">
        <button class="ctrl-btn prev-btn" @click="player.prev()">
          <span class="material-symbols-rounded">skip_previous</span>
        </button>
        <button class="ctrl-btn play-btn" @click="player.togglePlay()">
          <span class="material-symbols-rounded">{{ player.playing ? 'pause' : 'play_arrow' }}</span>
        </button>
        <button class="ctrl-btn next-btn" @click="player.next()">
          <span class="material-symbols-rounded">skip_next</span>
        </button>
      </div>
      <div class="progress-bar">
        <span class="time">{{ formatTime(player.currentTime) }}</span>
        <div class="progress-track" ref="progressTrack" @click="seek" @mousedown="startDrag">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
        </div>
        <span class="time">{{ formatTime(player.duration) }}</span>
      </div>
    </div>

    <div class="right-actions">
      <div class="volume-area" @wheel.prevent="onVolumeWheel"
        @mouseenter="onVolumeEnter"
        @mouseleave="hideVolumePopup">
        <button class="ctrl-btn" @click="player.toggleMute()">
          <span class="material-symbols-rounded">{{ player.muted ? 'volume_off' : 'volume_up' }}</span>
        </button>
        <Transition name="vol-popup">
          <div v-if="showVolumePopup" class="volume-popup"
            @mouseenter="onVolumeEnter"
            @mouseleave="hideVolumePopup">
            <div class="vol-slider-container">
              <div class="vol-track" ref="volTrack" @mousedown="startVolDrag">
                <div class="vol-fill" :style="{ height: volPercent + '%' }"></div>
                <div class="vol-thumb" :style="{ bottom: volPercent + '%' }"></div>
              </div>
            </div>
            <div class="vol-label">{{ volPercent }}%</div>
          </div>
        </Transition>
      </div>
      <button class="ctrl-btn" @click="player.cyclePlayMode()" :title="playModeLabel">
        <span class="material-symbols-rounded" v-if="player.playMode === 'loop'">repeat</span>
        <span class="material-symbols-rounded" v-else-if="player.playMode === 'single'">repeat_one</span>
        <span class="material-symbols-rounded" v-else>shuffle</span>
      </button>
      <button class="ctrl-btn queue-btn" @click="toggleQueue" title="播放列表">
        <span class="material-symbols-rounded">queue_music</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/player'
import PlayQueue from './PlayQueue.vue'

const player = usePlayerStore()
const audioEl = ref(null)
const progressTrack = ref(null)
const isDragging = ref(false)
const playQueueRef = ref(null)

const showVolumePopup = ref(false)
const volTrack = ref(null)
const isVolDragging = ref(false)
let volumePopupTimer = null

const volPercent = computed(() => {
  return Math.round(player.volume * 100)
})

function toggleQueue() {
  playQueueRef.value?.toggle()
}

function onVolumeEnter() {
  clearTimeout(volumePopupTimer)
  showVolumePopup.value = true
}

function hideVolumePopup() {
  volumePopupTimer = setTimeout(() => {
    if (!isVolDragging.value) showVolumePopup.value = false
  }, 300)
}

function onVolumeWheel(e) {
  const step = 0.05
  const delta = e.deltaY > 0 ? -step : step
  player.setVolume(Math.round((player.volume + delta) * 100) / 100)
}

function getVolFromEvent(e) {
  if (!volTrack.value) return player.volume
  const rect = volTrack.value.getBoundingClientRect()
  const y = e.clientY - rect.top
  return Math.max(0, Math.min(1, 1 - y / rect.height))
}

function startVolDrag(e) {
  isVolDragging.value = true
  showVolumePopup.value = true
  clearTimeout(volumePopupTimer)
  player.setVolume(getVolFromEvent(e))
  document.addEventListener('mousemove', onVolDrag)
  document.addEventListener('mouseup', stopVolDrag)
}

function onVolDrag(e) {
  player.setVolume(getVolFromEvent(e))
}

function stopVolDrag() {
  isVolDragging.value = false
  document.removeEventListener('mousemove', onVolDrag)
  document.removeEventListener('mouseup', stopVolDrag)
}

onMounted(() => {
  if (audioEl.value) {
    audioEl.value.volume = player.volume
    audioEl.value.muted = player.muted
  }
  setupMediaSession()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onVolDrag)
  document.removeEventListener('mouseup', stopVolDrag)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})

const progressPercent = computed(() => {
  return player.duration ? (player.currentTime / player.duration) * 100 : 0
})

const playModeLabel = computed(() => {
  const labels = { loop: '列表循环', single: '单曲循环', shuffle: '随机播放' }
  return labels[player.playMode]
})

function formatTime(s) {
  if (!s || isNaN(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function onLoaded() {
  player.duration = audioEl.value?.duration || 0
}

function onTimeUpdate() {
  if (!isDragging.value) {
    player.currentTime = audioEl.value?.currentTime || 0
  }
}

function onEnded() {
  if (player.playMode === 'single') {
    audioEl.value.currentTime = 0
    audioEl.value.play()
  } else {
    player.next()
  }
}

function onError() {
  player.playing = false
}

function getProgressFromEvent(e) {
  if (!progressTrack.value) return 0
  const rect = progressTrack.value.getBoundingClientRect()
  return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
}

function seek(e) {
  if (!audioEl.value) return
  const pct = getProgressFromEvent(e)
  audioEl.value.currentTime = pct * player.duration
}

function startDrag(e) {
  isDragging.value = true
  seek(e)
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e) {
  if (!audioEl.value) return
  const pct = getProgressFromEvent(e)
  player.currentTime = pct * player.duration
  audioEl.value.currentTime = pct * player.duration
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function setupMediaSession() {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.setActionHandler('play', () => player.togglePlay())
  navigator.mediaSession.setActionHandler('pause', () => player.togglePlay())
  navigator.mediaSession.setActionHandler('previoustrack', () => player.prev())
  navigator.mediaSession.setActionHandler('nexttrack', () => player.next())
  navigator.mediaSession.setActionHandler('seekto', (details) => {
    if (details.seekTime != null) player.seekTo(details.seekTime)
  })
  navigator.mediaSession.setActionHandler('seekforward', () => {
    player.seekTo(Math.min(player.duration, player.currentTime + 10))
  })
  navigator.mediaSession.setActionHandler('seekbackward', () => {
    player.seekTo(Math.max(0, player.currentTime - 10))
  })
}

function updateMediaSession() {
  if (!('mediaSession' in navigator)) return
  const song = player.currentSong
  if (!song) {
    navigator.mediaSession.metadata = null
    return
  }
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title || '',
    artist: song.artist || '',
    album: song.album || '',
    artwork: song.has_cover
      ? [{ src: `/api/music/${song.id}/cover`, sizes: '512x512', type: 'image/jpeg' }]
      : [],
  })
}

watch(() => player.playing, (val) => {
  if (!audioEl.value) return
  if (val) {
    audioEl.value.play().catch(() => { player.playing = false })
  } else {
    audioEl.value.pause()
  }
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = val ? 'playing' : 'paused'
  }
})

watch(() => player.volume, (v) => {
  if (audioEl.value) audioEl.value.volume = v
})

watch(() => player.muted, (m) => {
  if (audioEl.value) audioEl.value.muted = m
})

watch(() => player.currentSong, (song, old) => {
  if (song === old) return
  updateMediaSession()
  if (song) {
    audioEl.value.src = player.audioSrc
    audioEl.value.load()
    if (player.playing) {
      audioEl.value.play().catch(() => { player.playing = false })
    }
  }
})

watch(() => player.seekTime, (t) => {
  if (t >= 0 && audioEl.value) {
    audioEl.value.currentTime = t
    player.currentTime = t
    setTimeout(() => { player.seekTime = -1 }, 0)
  }
})
</script>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--md-surface-container-high);
  border-top: 1px solid var(--md-outline-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(20px);
}

.player-info {
  position: absolute;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  transition: opacity 0.3s, visibility 0.3s;
}

.player-info.lyrics-mode {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--md-surface-variant);
  color: var(--md-on-surface-variant);
  cursor: pointer;
}

.song-info {
  min-width: 0;
}

.song-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--md-on-surface);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 12px;
  color: var(--md-on-surface-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-controls {
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.controls-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ctrl-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  color: var(--md-on-surface-variant);
  transition: color 0.15s, background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.ctrl-btn:hover {
  color: var(--md-on-surface);
  background: var(--md-surface-variant);
}

.play-btn {
  width: 40px;
  height: 40px;
  background: var(--md-primary);
  color: var(--md-on-primary);
}

.play-btn:hover {
  background: var(--md-primary);
  opacity: 0.9;
}

.ctrl-btn.active {
  color: var(--md-primary);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 600px;
}

.time {
  font-size: 11px;
  color: var(--md-on-surface-variant);
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: var(--md-surface-variant);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--md-primary);
  border-radius: 2px;
  transition: width 0.1s linear;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  right: -2px;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--md-primary);
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.15s;
}

.progress-track:hover .progress-fill::after {
  opacity: 1;
}

.right-actions {
  position: absolute;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.volume-area {
  position: relative;
  display: flex;
  align-items: center;
}

.volume-popup {
  position: absolute;
  bottom: 52px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--md-surface-container-high);
  border: 1px solid var(--md-outline-variant);
  border-radius: 12px;
  padding: 12px 8px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 56px;
  box-shadow: var(--md-elevation-3);
  backdrop-filter: blur(20px);
}

.vol-slider-container {
  height: 100px;
  display: flex;
  align-items: center;
}

.vol-track {
  width: 4px;
  height: 100%;
  background: var(--md-surface-variant);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.vol-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: var(--md-primary);
  border-radius: 2px;
  transition: height 0.05s linear;
}

.vol-thumb {
  position: absolute;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--md-primary);
  transform: translate(-50%, 50%);
  pointer-events: none;
}

.vol-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--md-on-surface-variant);
  font-variant-numeric: tabular-nums;
}

.vol-popup-enter-active,
.vol-popup-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.vol-popup-enter-from,
.vol-popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
}

@media (max-width: 768px) {
  .player-bar {
    height: var(--mobile-player-height);
    bottom: calc(var(--mobile-bottom-nav-height) + var(--mobile-safe-bottom));
    justify-content: flex-start;
    padding: 0 12px;
    gap: 12px;
  }

  .player-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: 12px;
    right: 12px;
    height: 2px;
    border-radius: 1px;
    background: var(--md-surface-variant);
    z-index: 1;
  }

  .player-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 12px;
    height: 2px;
    border-radius: 1px;
    background: var(--md-primary);
    width: v-bind(progressPercent + '%');
    max-width: calc(100% - 24px);
    z-index: 2;
    transition: width 0.1s linear;
  }

  .player-info {
    position: static;
    flex: 1;
    min-width: 0;
    gap: 10px;
  }

  .player-info.lyrics-mode {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }

  .cover {
    width: 42px;
    height: 42px;
    border-radius: 6px;
  }

  .song-title {
    font-size: 13px;
  }

  .song-artist {
    font-size: 11px;
  }

  .player-controls {
    max-width: none;
    width: auto;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .progress-bar {
    display: none;
  }

  .controls-top {
    gap: 4px;
  }

  .ctrl-btn.prev-btn {
    display: none;
  }

  .play-btn {
    width: 38px;
    height: 38px;
  }

  .ctrl-btn.next-btn {
    display: inline-flex;
  }

  .right-actions {
    display: none;
  }
}
</style>
