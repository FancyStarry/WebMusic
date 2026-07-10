<template>
  <div class="app-layout" :class="{ 'player-active': !!player.currentSong, 'is-mobile': isMobile }">
    <Sidebar />
    <main class="main-content">
      <div class="page-header">
        <div class="page-header-spacer"></div>
      </div>
      <router-view :key="$route.fullPath" />
      <Transition name="lyrics">
        <LyricsView v-if="player.showLyrics" />
      </Transition>
    </main>
    <PlayerBar v-show="!!player.currentSong" />
    <MobileBottomNav />
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import PlayerBar from './components/PlayerBar.vue'
import LyricsView from './components/LyricsView.vue'
import MobileBottomNav from './components/MobileBottomNav.vue'
import { usePlayerStore } from './stores/player'
import { useSettingsStore } from './stores/settings'

const player = usePlayerStore()
const settings = useSettingsStore()
const isMobile = ref(window.innerWidth <= 768)

function onResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  settings.init()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--md-surface);
  color: var(--md-on-surface);
  transition: padding-bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-layout.player-active {
  padding-bottom: 72px;
}

.app-layout.is-mobile.player-active {
  padding-bottom: calc(var(--mobile-player-height) + var(--mobile-bottom-nav-height) + var(--mobile-safe-bottom));
}

.main-content {
  flex: 1;
  margin-left: 240px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding: 24px 32px;
  position: relative;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--md-surface);
  padding: 8px 0;
}

.lyrics-enter-active {
  transition: opacity 0.3s ease;
}

.lyrics-enter-from {
  opacity: 0;
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .app-layout.is-mobile {
    padding-bottom: calc(var(--mobile-bottom-nav-height) + var(--mobile-safe-bottom));
  }

  .main-content {
    margin-left: 0;
    padding: 12px 16px;
    padding-bottom: calc(var(--mobile-player-height) + var(--mobile-bottom-nav-height) + var(--mobile-safe-bottom) + 16px);
    scrollbar-gutter: auto;
  }

  .page-header {
    margin-bottom: 16px;
    padding: 4px 0;
  }
}
</style>
