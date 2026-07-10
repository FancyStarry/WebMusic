<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="visible" class="queue-overlay" @click.self="close">
        <div class="queue-drawer" @click.stop>
          <div class="queue-header">
            <h3 class="queue-title">播放列表</h3>
            <span class="queue-count">待播放 {{ player.queue.length }} 首</span>
            <button class="close-btn" @click="close">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
          <div class="queue-body" ref="queueBodyRef" @scroll="onQueueScroll">
            <button v-if="showScrollBtn" class="scroll-to-current" @click="scrollToCurrent" title="定位到当前播放">
              <span class="material-symbols-rounded">my_location</span>
            </button>
            <div v-if="player.queue.length === 0" class="queue-empty">
              播放列表为空
            </div>
            <div v-for="(song, i) in player.queue" :key="song.id"
              class="queue-item"
              :class="{ current: i === player.queueIndex }"
              @click="playFrom(i)">
              <div class="q-cover" :style="{ backgroundImage: getCover(song) ? `url(${getCover(song)})` : '' }">
                <span class="material-symbols-rounded q-cover-placeholder" v-if="!getCover(song)">music_note</span>
                <span class="material-symbols-rounded q-play-icon" v-if="i === player.queueIndex">volume_up</span>
              </div>
              <div class="q-info">
                <div class="q-title" :class="{ now: i === player.queueIndex }">{{ song.title }}</div>
                <div class="q-artist">{{ song.artist }}</div>
              </div>
              <button class="q-remove" @click.stop="removeFrom(i)" title="移除">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>
          </div>
          <div class="queue-footer" v-if="player.queue.length > 0">
            <button class="clear-btn" @click="clearQueue">
              <span class="material-symbols-rounded">delete_sweep</span>
              清空列表
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { usePlayerStore } from '../stores/player'

const player = usePlayerStore()
const queueBodyRef = ref(null)
const showScrollBtn = ref(false)

const visible = ref(false)

watch(() => player.showQueue, (val) => {
  visible.value = val
  if (val) nextTick(checkScrollBtn)
})

function open() {
  player.showQueue = true
}

function close() {
  player.showQueue = false
}

function toggle() {
  player.showQueue = !player.showQueue
}

function playFrom(index) {
  player.playFromQueue(index)
  nextTick(checkScrollBtn)
}

function removeFrom(index) {
  player.removeFromQueue(index)
  nextTick(checkScrollBtn)
}

function clearQueue() {
  player.setQueue([], -1)
  player.currentSong = null
  player.playing = false
  close()
}

function getCover(song) {
  return song?.has_cover ? `/api/music/${song.id}/cover` : ''
}

function onQueueScroll() {
  checkScrollBtn()
}

function checkScrollBtn() {
  const body = queueBodyRef.value
  if (!body || player.queueIndex < 0) {
    showScrollBtn.value = false
    return
  }
  const current = body.querySelector('.queue-item.current')
  if (!current) {
    showScrollBtn.value = false
    return
  }
  const rect = current.getBoundingClientRect()
  const container = body.getBoundingClientRect()
  showScrollBtn.value = rect.bottom > container.bottom || rect.top < container.top
}

function scrollToCurrent() {
  const body = queueBodyRef.value
  if (!body) return
  const current = body.querySelector('.queue-item.current')
  if (current) {
    current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

watch(visible, (val) => {
  if (val) {
    nextTick(checkScrollBtn)
  }
})

watch(() => player.queueIndex, () => {
  if (visible.value) nextTick(checkScrollBtn)
})

defineExpose({ open, close, toggle })
</script>

<style scoped>
.queue-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
  backdrop-filter: blur(2px);
  overscroll-behavior: contain;
}

.queue-drawer {
  width: 360px;
  max-width: 90vw;
  height: 100%;
  background: var(--md-surface-container-high);
  border-left: 1px solid var(--md-outline-variant);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
}

.queue-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 20px 12px;
  border-bottom: 1px solid var(--md-outline-variant);
}

.queue-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--md-on-surface);
}

.queue-count {
  font-size: 12px;
  color: var(--md-on-surface-variant);
  margin-right: auto;
}

.close-btn {
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
  transition: background 0.15s;
}

.close-btn:hover {
  background: var(--md-surface-variant);
}

.queue-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
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

.queue-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--md-on-surface-variant);
  font-size: 14px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.queue-item:hover {
  background: var(--md-surface-variant);
}

.queue-item.current {
  background: var(--md-secondary-container);
}

.q-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  background-color: var(--md-surface-variant);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.q-cover-placeholder {
  font-size: 18px;
  color: var(--md-on-surface-variant);
  opacity: 0.5;
}

.q-play-icon {
  position: absolute;
  font-size: 18px;
  color: var(--md-primary);
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
  padding: 2px;
}

.q-info {
  flex: 1;
  min-width: 0;
}

.q-title {
  font-size: 13px;
  color: var(--md-on-surface);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.q-title.now {
  color: var(--md-primary);
  font-weight: 500;
}

.q-artist {
  font-size: 11px;
  color: var(--md-on-surface-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.q-remove {
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
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
}

.queue-item:hover .q-remove {
  opacity: 1;
}

.q-remove:hover {
  background: var(--md-error-container);
  color: var(--md-error);
}

.queue-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--md-outline-variant);
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--md-outline);
  border-radius: 8px;
  background: transparent;
  color: var(--md-on-surface-variant);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  width: 100%;
  justify-content: center;
}

.clear-btn:hover {
  background: var(--md-error-container);
  color: var(--md-error);
  border-color: var(--md-error);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-active .queue-drawer,
.drawer-leave-active .queue-drawer {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .queue-drawer,
.drawer-leave-to .queue-drawer {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .queue-drawer {
    width: 100%;
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    height: 70vh;
    margin-top: auto;
    border-left: none;
  }

  .queue-overlay {
    align-items: flex-end;
  }

  .drawer-enter-active .queue-drawer,
  .drawer-leave-active .queue-drawer {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .drawer-enter-from .queue-drawer,
  .drawer-leave-to .queue-drawer {
    transform: translateY(100%);
  }
}
</style>
