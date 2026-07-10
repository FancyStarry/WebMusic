<template>
  <div class="lyrics-view" @click.self="closeSettings">
    <div class="lyrics-bg" v-if="player.coverSrc" :style="{ backgroundImage: `url(${player.coverSrc})`, '--bg-opacity': (ls.bgBrightness || 35) / 100 }"></div>
    <div class="lyrics-overlay"></div>

    <button class="float-btn close-btn" @click="player.showLyrics = false" title="关闭歌词">
      <span class="material-symbols-rounded">close</span>
    </button>
    <button class="float-btn settings-trigger" @click.stop="toggleSettings" title="歌词设置">
      <span class="material-symbols-rounded">settings</span>
    </button>

    <Transition name="settings-card">
      <div v-if="showSettings" class="settings-card" @click.stop>
        <div class="card-title">歌词设置</div>

        <div class="setting-row">
          <span class="setting-label">原文字号</span>
          <div class="size-control">
            <button class="size-btn" @click="adjFontSize(-2)">-</button>
            <span class="size-val">{{ ls.fontSize }}</span>
            <button class="size-btn" @click="adjFontSize(2)">+</button>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">翻译字号</span>
          <div class="size-control">
            <button class="size-btn" @click="adjTransSize(-2)">-</button>
            <span class="size-val">{{ ls.transFontSize }}</span>
            <button class="size-btn" @click="adjTransSize(2)">+</button>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">原文加粗</span>
          <button class="toggle-btn" :class="{ active: ls.bold }" @click="player.updateLyricsSettings({ bold: !ls.bold })">
            {{ ls.bold ? '开' : '关' }}
          </button>
        </div>

        <div class="setting-row">
          <span class="setting-label">翻译加粗</span>
          <button class="toggle-btn" :class="{ active: ls.transBold }" @click="player.updateLyricsSettings({ transBold: !ls.transBold })">
            {{ ls.transBold ? '开' : '关' }}
          </button>
        </div>

        <div class="setting-row">
          <span class="setting-label">显示翻译</span>
          <button class="toggle-btn" :class="{ active: ls.showTranslation }" @click="player.updateLyricsSettings({ showTranslation: !ls.showTranslation })">
            {{ ls.showTranslation ? '开' : '关' }}
          </button>
        </div>

        <div class="setting-row">
          <span class="setting-label">凸显模式</span>
          <div class="mode-group">
            <button class="mode-btn" :class="{ active: ls.highlightMode === 'enlarge' }" @click="player.updateLyricsSettings({ highlightMode: 'enlarge' })">凸显</button>
            <button class="mode-btn" :class="{ active: ls.highlightMode === 'fade' }" @click="player.updateLyricsSettings({ highlightMode: 'fade' })">渐隐</button>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">对齐方式</span>
          <div class="align-group">
            <button class="align-btn" :class="{ active: ls.align === 'left' }" @click="player.updateLyricsSettings({ align: 'left' })" title="左对齐">
              <span class="material-symbols-rounded">format_align_left</span>
            </button>
            <button class="align-btn" :class="{ active: ls.align === 'center' }" @click="player.updateLyricsSettings({ align: 'center' })" title="居中">
              <span class="material-symbols-rounded">format_align_center</span>
            </button>
            <button class="align-btn" :class="{ active: ls.align === 'right' }" @click="player.updateLyricsSettings({ align: 'right' })" title="右对齐">
              <span class="material-symbols-rounded">format_align_right</span>
            </button>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">背景亮度</span>
          <input type="range" min="5" max="80" :value="ls.bgBrightness || 35" @input="player.updateLyricsSettings({ bgBrightness: parseInt($event.target.value) })" class="brightness-slider" />
        </div>

        <div class="setting-row">
          <span class="setting-label">歌词宽度</span>
          <div class="size-control">
            <button class="size-btn" @click="adjWidth(-40)">-</button>
            <span class="size-val">{{ ls.lyricsWidth }}</span>
            <button class="size-btn" @click="adjWidth(40)">+</button>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">歌词偏移</span>
          <div class="slider-control">
            <span class="slider-label">偏左</span>
            <input type="range" min="-100" max="100" step="5" :value="ls.lyricsOffset" @input="player.updateLyricsSettings({ lyricsOffset: parseInt($event.target.value) })" class="setting-slider" />
            <span class="slider-label">偏右</span>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">分栏比例</span>
          <div class="slider-control">
            <span class="slider-label">2:3</span>
            <input type="range" min="40" max="60" step="2" :value="ls.lyricsSplit" @input="player.updateLyricsSettings({ lyricsSplit: parseInt($event.target.value) })" class="setting-slider" />
            <span class="slider-label">3:2</span>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">封面大小</span>
          <div class="size-control">
            <button class="size-btn" @click="adjCover(-20)">-</button>
            <span class="size-val">{{ ls.coverSize }}px</span>
            <button class="size-btn" @click="adjCover(20)">+</button>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">滚动动画</span>
          <div class="easing-group">
            <button class="easing-btn" :class="{ active: ls.scrollEasing === 'ease-out' }" @click="player.updateLyricsSettings({ scrollEasing: 'ease-out' })">渐出</button>
            <button class="easing-btn" :class="{ active: ls.scrollEasing === 'ease-in-out' }" @click="player.updateLyricsSettings({ scrollEasing: 'ease-in-out' })">缓动</button>
            <button class="easing-btn" :class="{ active: ls.scrollEasing === 'linear' }" @click="player.updateLyricsSettings({ scrollEasing: 'linear' })">线性</button>
            <button class="easing-btn" :class="{ active: ls.scrollEasing === 'bounce' }" @click="player.updateLyricsSettings({ scrollEasing: 'bounce' })">弹跳</button>
            <button class="easing-btn" :class="{ active: ls.scrollEasing === 'spring' }" @click="player.updateLyricsSettings({ scrollEasing: 'spring' })">弹簧</button>
          </div>
        </div>

        <button class="reset-cache-btn" @click="resetCache">
          <span class="material-symbols-rounded">refresh</span>
          重置此歌歌词缓存
        </button>
        <span v-if="resetDone" class="reset-msg">已重置</span>
      </div>
    </Transition>

    <div class="desktop-lyrics">
      <div class="lyrics-body">
        <div class="lyrics-half left" :style="{ flex: ls.lyricsSplit }">
          <div class="big-cover" :style="{ width: ls.coverSize + 'px', height: ls.coverSize + 'px' }">
            <img v-if="player.coverSrc" :src="player.coverSrc" alt="" />
            <span v-else class="material-symbols-rounded">music_note</span>
          </div>
          <div class="song-meta">
            <div class="meta-title">{{ player.currentSong?.title || '' }}</div>
            <div class="meta-album" v-if="player.currentSong?.album">{{ player.currentSong.album }}</div>
            <div class="meta-artist">{{ player.currentSong?.artist || '' }}</div>
          </div>
        </div>

        <div class="lyrics-half right" :style="{ flex: 100 - ls.lyricsSplit }">
          <div v-if="player.lyrics.length === 0" class="no-lyrics">
            <span class="material-symbols-rounded">lyrics</span>
            <p>未找到歌词</p>
          </div>
          <div v-else class="lyrics-list" ref="listRefDesktop" :style="{ maxWidth: ls.lyricsWidth + 'px', transform: `translateX(${ls.lyricsOffset}px)` }">
            <div
              v-for="(line, i) in player.lyrics"
              :key="i"
              class="lyric-line"
              :class="{ active: i === player.lyricsLine, passed: i < player.lyricsLine }"
              @click="player.seekTo(line.time)"
            >
              <div
                class="line-text"
                :style="{
                  fontSize: ls.fontSize + 'px',
                  fontWeight: i === player.lyricsLine ? (ls.bold ? 700 : 600) : (ls.bold ? 500 : 400),
                  opacity: i === player.lyricsLine ? 1 : (ls.highlightMode === 'enlarge' ? 0.6 : 0.45),
                  transform: ls.highlightMode === 'enlarge' && i !== player.lyricsLine ? 'scale(0.9)' : 'scale(1)',
                  transformOrigin: 'center center',
                  textAlign: ls.align,
                }"
              >{{ line.text }}</div>
              <div
                v-if="line.trans && ls.showTranslation"
                class="line-trans"
                :style="{
                  fontSize: ls.transFontSize + 'px',
                  fontWeight: i === player.lyricsLine ? (ls.transBold ? 700 : 600) : (ls.transBold ? 500 : 400),
                  opacity: i === player.lyricsLine ? 1 : (ls.highlightMode === 'enlarge' ? 0.6 : 0.45),
                  transform: ls.highlightMode === 'enlarge' && i !== player.lyricsLine ? 'scale(0.9)' : 'scale(1)',
                  transformOrigin: 'center center',
                  textAlign: ls.align,
                }"
              >{{ line.trans }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-content">
      <div v-if="!showLyricsContent" class="cover-area">
        <div class="big-cover">
          <img v-if="player.coverSrc" :src="player.coverSrc" alt="" />
          <span v-else class="material-symbols-rounded">music_note</span>
        </div>
        <div class="song-meta">
          <div class="meta-title">{{ player.currentSong?.title || '' }}</div>
          <div class="meta-album" v-if="player.currentSong?.album">{{ player.currentSong.album }}</div>
          <div class="meta-artist">{{ player.currentSong?.artist || '' }}</div>
        </div>
      </div>
      <div v-else class="lyrics-area">
        <div v-if="player.lyrics.length === 0" class="no-lyrics">
          <span class="material-symbols-rounded">lyrics</span>
          <p>未找到歌词</p>
        </div>
        <div v-else class="lyrics-list" ref="listRef">
          <div
            v-for="(line, i) in player.lyrics"
            :key="i"
            class="lyric-line"
            :class="{ active: i === player.lyricsLine, passed: i < player.lyricsLine }"
            @click="player.seekTo(line.time)"
          >
            <div
              class="line-text"
              :style="{
                fontSize: ls.fontSize + 'px',
                fontWeight: i === player.lyricsLine ? (ls.bold ? 700 : 600) : (ls.bold ? 500 : 400),
                opacity: i === player.lyricsLine ? 1 : (ls.highlightMode === 'enlarge' ? 0.6 : 0.45),
                transform: ls.highlightMode === 'enlarge' && i !== player.lyricsLine ? 'scale(0.9)' : 'scale(1)',
                transformOrigin: 'center center',
                textAlign: ls.align,
              }"
            >{{ line.text }}</div>
            <div
              v-if="line.trans && ls.showTranslation"
              class="line-trans"
              :style="{
                fontSize: ls.transFontSize + 'px',
                fontWeight: i === player.lyricsLine ? (ls.transBold ? 700 : 600) : (ls.transBold ? 500 : 400),
                opacity: i === player.lyricsLine ? 1 : (ls.highlightMode === 'enlarge' ? 0.6 : 0.45),
                transform: ls.highlightMode === 'enlarge' && i !== player.lyricsLine ? 'scale(0.9)' : 'scale(1)',
                transformOrigin: 'center center',
                textAlign: ls.align,
              }"
            >{{ line.trans }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-bottom">
      <div class="progress-row">
        <span class="prog-time">{{ formatTime(player.currentTime) }}</span>
        <div class="prog-track" ref="progTrackRef"
          @click="seekMobile"
          @mousedown="startDragMobile"
          @touchstart="startTouchDragMobile"
          @touchmove="onTouchDragMobile"
          @touchend="stopTouchDragMobile">
          <div class="prog-fill" :style="{ width: mobileProgressPercent + '%' }"></div>
          <div class="prog-thumb" :style="{ left: mobileProgressPercent + '%' }"></div>
        </div>
        <span class="prog-time">{{ formatTime(player.duration) }}</span>
      </div>
      <div class="mobile-actions">
        <div class="controls-row">
          <button class="mc-btn" @click="player.prev()">
            <span class="material-symbols-rounded">skip_previous</span>
          </button>
          <button class="mc-btn play-btn" @click="player.togglePlay()">
            <span class="material-symbols-rounded">{{ player.playing ? 'pause' : 'play_arrow' }}</span>
          </button>
          <button class="mc-btn" @click="player.next()">
            <span class="material-symbols-rounded">skip_next</span>
          </button>
        </div>
        <div class="controls-row secondary">
          <button class="mc-btn mc-small" @click="toggleQueue" title="播放队列">
            <span class="material-symbols-rounded">queue_music</span>
          </button>
          <button class="mc-btn mc-small" @click="player.toggleMute()" title="音量">
            <span class="material-symbols-rounded">{{ player.muted ? 'volume_off' : 'volume_up' }}</span>
          </button>
          <button class="mc-btn mc-small" @click="showLyricsContent = !showLyricsContent" :title="showLyricsContent ? '显示封面' : '显示歌词'">
            <span class="material-symbols-rounded">{{ showLyricsContent ? 'album' : 'lyrics' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/player'

const player = usePlayerStore()
const listRef = ref(null)
const listRefDesktop = ref(null)
const showSettings = ref(false)
const resetDone = ref(false)
const showLyricsContent = ref(false)
const progTrackRef = ref(null)
const mobileProgressRef = ref(null)
const isDraggingMobile = ref(false)
const isMobile = ref(false)

const ls = computed(() => player.lyricsSettings)

const mobileProgressPercent = computed(() => {
  return player.duration ? (player.currentTime / player.duration) * 100 : 0
})

function onResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('mousemove', onDragMobile)
  document.removeEventListener('mouseup', stopDragMobile)
})

function formatTime(s) {
  if (!s || isNaN(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function getMobileProgressFromEvent(e) {
  if (!progTrackRef.value) return 0
  const rect = progTrackRef.value.getBoundingClientRect()
  const src = e.touches ? e.touches[0] : e
  const clientX = src.clientX
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
}

function seekMobile(e) {
  if (!player.currentSong) return
  const pct = getMobileProgressFromEvent(e)
  player.currentTime = pct * player.duration
  player.seekTo(pct * player.duration)
}

function startDragMobile(e) {
  if (!player.currentSong) return
  isDraggingMobile.value = true
  seekMobile(e)
  document.addEventListener('mousemove', onDragMobile)
  document.addEventListener('mouseup', stopDragMobile)
}

function onDragMobile(e) {
  if (!player.currentSong) return
  const pct = getMobileProgressFromEvent(e)
  player.currentTime = pct * player.duration
  player.seekTo(pct * player.duration)
}

function stopDragMobile() {
  isDraggingMobile.value = false
  document.removeEventListener('mousemove', onDragMobile)
  document.removeEventListener('mouseup', stopDragMobile)
}

function startTouchDragMobile(e) {
  if (!player.currentSong) return
  e.preventDefault()
  isDraggingMobile.value = true
  const pct = getMobileProgressFromEvent(e)
  player.currentTime = pct * player.duration
  player.seekTo(pct * player.duration)
}

function onTouchDragMobile(e) {
  if (!isDraggingMobile.value || !player.currentSong) return
  e.preventDefault()
  const pct = getMobileProgressFromEvent(e)
  player.currentTime = pct * player.duration
  player.seekTo(pct * player.duration)
}

function stopTouchDragMobile(e) {
  if (isDraggingMobile.value && player.currentSong) {
    const pct = getMobileProgressFromEvent(e)
    player.currentTime = pct * player.duration
    player.seekTo(pct * player.duration)
  }
  isDraggingMobile.value = false
}

function toggleSettings() {
  showSettings.value = !showSettings.value
}

function closeSettings() {
  showSettings.value = false
}

function toggleQueue() {
  player.toggleQueue()
}

function adjFontSize(delta) {
  const v = Math.max(12, Math.min(32, ls.value.fontSize + delta))
  player.updateLyricsSettings({ fontSize: v })
}

function adjTransSize(delta) {
  const v = Math.max(10, Math.min(28, ls.value.transFontSize + delta))
  player.updateLyricsSettings({ transFontSize: v })
}

function adjWidth(delta) {
  const v = Math.max(400, Math.min(1200, ls.value.lyricsWidth + delta))
  player.updateLyricsSettings({ lyricsWidth: v })
}

function adjCover(delta) {
  const v = Math.max(160, Math.min(400, ls.value.coverSize + delta))
  player.updateLyricsSettings({ coverSize: v })
}

const EASING_FNS = {
  'linear': t => t,
  'ease-out': t => 1 - Math.pow(1 - t, 3),
  'ease-in-out': t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  'bounce': t => {
    const n1 = 7.5625, d1 = 2.75
    if (t < 1/d1) return n1*t*t
    if (t < 2/d1) return n1*(t-=1.5/d1)*t+0.75
    if (t < 2.5/d1) return n1*(t-=2.25/d1)*t+0.9375
    return n1*(t-=2.625/d1)*t+0.984375
  },
  'spring': t => Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1,
}

function smoothScroll(container, targetY, easing) {
  const startY = container.scrollTop
  const diff = targetY - startY
  if (Math.abs(diff) < 2) return
  const fn = EASING_FNS[easing] || EASING_FNS['ease-out']
  const duration = Math.min(600, 250 + Math.abs(diff) * 0.3)
  let startTime = null
  function step(timestamp) {
    if (!startTime) startTime = timestamp
    const p = Math.min((timestamp - startTime) / duration, 1)
    container.scrollTop = startY + diff * fn(p)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

async function resetCache() {
  if (!player.currentSong) return
  try {
    await fetch(`/api/lyrics/cache/${player.currentSong.id}`, { method: 'DELETE' })
    resetDone.value = true
    setTimeout(() => { resetDone.value = false }, 2000)
    player.fetchLyrics()
  } catch {}
}

watch(() => player.lyricsLine, () => {
  const container = listRef.value || listRefDesktop.value
  if (!container) return
  nextTick(() => {
    const active = container.querySelector('.lyric-line.active')
    if (active) {
      const targetY = active.offsetTop - container.offsetTop - container.clientHeight / 2 + active.clientHeight / 2
      smoothScroll(container, targetY, ls.value.scrollEasing)
    }
  })
})
</script>

<style scoped>
.lyrics-view {
  position: fixed;
  inset: 0;
  z-index: 100;
  overflow: hidden;
  background: var(--md-surface);
}

.lyrics-bg {
  position: absolute;
  inset: -40px;
  background-size: cover;
  background-position: center;
  filter: blur(40px);
  opacity: var(--bg-opacity, 0.35);
  transition: background-image 0.6s;
}

.lyrics-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    var(--md-surface) 0%,
    color-mix(in srgb, var(--md-surface) 70%, transparent) 35%,
    color-mix(in srgb, var(--md-surface) 70%, transparent) 65%,
    var(--md-surface) 100%);
}

.float-btn {
  position: fixed;
  top: 20px;
  z-index: 110;
  background: color-mix(in srgb, var(--md-on-surface) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-on-surface) 15%, transparent);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-on-surface);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: background 0.2s;
}

.float-btn:hover {
  background: color-mix(in srgb, var(--md-on-surface) 20%, transparent);
}

.close-btn {
  right: 20px;
}

.settings-trigger {
  left: 20px;
}

.settings-card {
  position: fixed;
  top: 72px;
  left: 24px;
  z-index: 110;
  background: var(--md-surface-container-high);
  border: 1px solid var(--md-outline-variant);
  border-radius: 16px;
  padding: 20px;
  width: 260px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--md-on-surface);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--md-outline-variant);
}

.setting-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-label {
  font-size: 13px;
  color: var(--md-on-surface-variant);
}

.size-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.size-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--md-outline);
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  transition: background 0.15s;
}

.size-btn:hover {
  background: var(--md-surface-variant);
}

.size-val {
  font-size: 14px;
  font-weight: 600;
  color: var(--md-on-surface);
  min-width: 24px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.align-group {
  display: flex;
  gap: 4px;
}

.align-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--md-outline);
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.align-btn.active {
  border-color: var(--md-primary);
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

.align-btn .material-symbols-rounded {
  font-size: 18px;
}

.easing-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.easing-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--md-outline);
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
  white-space: nowrap;
}

.easing-btn.active {
  border-color: var(--md-primary);
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

.mode-group {
  display: flex;
  gap: 4px;
}

.mode-btn {
  height: 30px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid var(--md-outline);
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.mode-btn.active {
  border-color: var(--md-primary);
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

.toggle-btn {
  padding: 4px 16px;
  border-radius: 16px;
  border: 1px solid var(--md-outline);
  background: transparent;
  color: var(--md-on-surface-variant);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 40px;
  text-align: center;
}

.toggle-btn.active {
  border-color: var(--md-primary);
  background: var(--md-primary);
  color: var(--md-on-primary);
}

.brightness-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--md-surface-variant);
  outline: none;
  cursor: pointer;
}

.brightness-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--md-primary);
  border: none;
  cursor: pointer;
}

.brightness-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--md-primary);
  border: none;
  cursor: pointer;
}

.slider-control {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.slider-label {
  font-size: 11px;
  color: var(--md-on-surface-variant);
  white-space: nowrap;
  flex-shrink: 0;
}

.setting-slider {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--md-surface-variant);
  outline: none;
  cursor: pointer;
  min-width: 0;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--md-primary);
  border: none;
  cursor: pointer;
}

.setting-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--md-primary);
  border: none;
  cursor: pointer;
}

.reset-cache-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: none;
  border-radius: 10px;
  background: var(--md-surface-variant);
  color: var(--md-on-surface-variant);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}

.reset-cache-btn:hover {
  background: var(--md-error-container);
  color: var(--md-error);
}

.reset-cache-btn .material-symbols-rounded {
  font-size: 16px;
}

.reset-msg {
  text-align: center;
  font-size: 12px;
  color: var(--md-primary);
}

.settings-card-enter-active,
.settings-card-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.settings-card-enter-from,
.settings-card-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.desktop-lyrics {
  height: 100%;
}

.lyrics-body {
  position: relative;
  display: flex;
  height: 100%;
}

.lyrics-half {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 72px;
}

.big-cover {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
  background: var(--md-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.big-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.big-cover .material-symbols-rounded {
  font-size: 80px;
  color: var(--md-on-surface-variant);
}

.song-meta {
  text-align: center;
  margin-top: 32px;
}

.meta-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--md-on-surface);
}

.meta-album {
  font-size: 15px;
  color: var(--md-on-surface-variant);
  margin-top: 8px;
}

.meta-artist {
  font-size: 16px;
  color: var(--md-on-surface-variant);
  margin-top: 4px;
}

.right {
  padding-left: 24px;
  padding-right: 64px;
  overflow: hidden;
}

.lyrics-list {
  margin: auto;
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 32px 0 45vh;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.lyrics-list::-webkit-scrollbar {
  display: none;
}

.lyric-line {
  padding: 8px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.35s ease;
  user-select: none;
}

.lyric-line:hover {
  background: var(--md-surface-variant);
}

.line-text {
  line-height: 1.6;
  color: var(--md-on-surface-variant);
  transition: opacity 0.35s ease, transform 0.35s ease, color 0.35s ease;
  overflow-wrap: break-word;
}

.line-trans {
  line-height: 1.5;
  color: var(--md-on-surface-variant);
  margin-top: 2px;
  transition: opacity 0.35s ease, transform 0.35s ease, color 0.35s ease;
  overflow-wrap: break-word;
}

.lyric-line.passed .line-text {
  color: var(--md-on-surface);
}

.lyric-line.passed .line-trans {
  color: var(--md-on-surface);
}

.no-lyrics {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--md-on-surface-variant);
  opacity: 0.6;
}

.no-lyrics span {
  font-size: 64px;
}

.no-lyrics p {
  font-size: 18px;
  margin: 0;
}

.mobile-content,
.mobile-bottom {
  display: none;
}

@media (max-width: 768px) {
  .lyrics-view {
    z-index: 300;
  }

  .float-btn {
    top: 12px;
    width: 36px;
    height: 36px;
  }

  .close-btn {
    right: 12px;
  }

  .settings-trigger {
    left: 12px;
  }

  .settings-card {
    top: 52px;
    left: 12px;
    right: 12px;
    width: auto;
    max-height: 55vh;
    border-radius: 20px;
  }

  .desktop-lyrics {
    display: none;
  }

  .lyrics-overlay {
    background: linear-gradient(180deg,
      transparent 0%,
      color-mix(in srgb, var(--md-surface) 5%, transparent) 50%,
      color-mix(in srgb, var(--md-surface) 25%, transparent) 75%,
      var(--md-surface) 100%);
  }

  .settings-trigger {
    display: none;
  }

  .mobile-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 56px 0 200px;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .cover-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    gap: 32px;
    padding: 0 24px;
    padding-top: 20px;
    justify-content: flex-start;
  }

  .cover-area .big-cover {
    width: min(85vw, 420px);
    height: min(85vw, 420px);
    border-radius: 20px;
    box-shadow: 0 12px 60px rgba(0, 0, 0, 0.5);
  }

  .cover-area .big-cover .material-symbols-rounded {
    font-size: 80px;
  }

  .cover-area .song-meta {
    margin-top: 0;
    padding: 0 16px;
  }

  .cover-area .meta-title {
    font-size: 24px;
  }

  .cover-area .meta-album {
    font-size: 15px;
    margin-top: 6px;
  }

  .cover-area .meta-artist {
    font-size: 16px;
    margin-top: 4px;
  }

  .lyrics-area {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .lyrics-area .lyrics-list {
    padding: 20px 0 60px;
  }

  .lyrics-area .lyric-line {
    padding: 6px 24px;
  }

  .lyrics-area .no-lyrics span {
    font-size: 48px;
  }

  .mobile-bottom {
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 310;
    padding: 6px 16px;
    padding-bottom: calc(6px + var(--mobile-safe-bottom));
    gap: 4px;
    background: transparent;
    pointer-events: none;
  }

  .mobile-bottom > * {
    pointer-events: auto;
  }

  .progress-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 4px;
  }

  .prog-time {
    font-size: 11px;
    color: var(--md-on-surface);
    min-width: 34px;
    text-align: center;
    font-variant-numeric: tabular-nums;
    opacity: 0.7;
  }

  .prog-track {
    flex: 1;
    height: 4px;
    background: color-mix(in srgb, var(--md-on-surface) 20%, transparent);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
  }

  .prog-fill {
    height: 100%;
    background: var(--md-on-surface);
    border-radius: 2px;
    position: relative;
  }

  .prog-thumb {
    position: absolute;
    top: 50%;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--md-on-surface);
    transform: translate(-50%, -50%);
    opacity: 0;
  }

  .prog-track:active .prog-thumb,
  .prog-track:hover .prog-thumb {
    opacity: 1;
  }

  .mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 0;
  }

  .controls-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }

  .controls-row.secondary {
    gap: 16px;
  }

  .mc-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    color: var(--md-on-surface);
    transition: opacity 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
    opacity: 0.85;
  }

  .mc-btn:active {
    opacity: 1;
  }

  .mc-btn .material-symbols-rounded {
    font-size: 28px;
  }

  .mc-btn.mc-small .material-symbols-rounded {
    font-size: 22px;
  }

  .mc-btn.play-btn {
    width: 52px;
    height: 52px;
    background: var(--md-on-surface);
    color: var(--md-surface);
    border-radius: 50%;
    opacity: 1;
  }

  .mc-btn.play-btn:active {
    opacity: 0.85;
  }

  .mc-btn.play-btn .material-symbols-rounded {
    font-size: 34px;
  }
}
</style>
