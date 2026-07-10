<template>
  <Teleport to="body">
    <div class="menu-backdrop" @click="close" @contextmenu.prevent="close"></div>
    <div class="context-menu" :style="menuStyle" @contextmenu.prevent>
      <div class="menu-item" @click="exec('play')">
        <span class="material-symbols-rounded">play_arrow</span>
        <span>播放</span>
      </div>
      <div class="menu-item" @click="exec('playNext')">
        <span class="material-symbols-rounded">skip_next</span>
        <span>下一曲播放</span>
      </div>

      <div class="menu-divider"></div>

      <template v-if="song.artist">
        <template v-for="name in song.artist.split('/').map(s => s.trim()).filter(Boolean)" :key="name">
          <div class="menu-item" @click="exec('artist', name)">
            <span class="material-symbols-rounded">person</span>
            <span>查看歌手：{{ name }}</span>
          </div>
        </template>
      </template>
      <div class="menu-item disabled" v-else>
        <span class="material-symbols-rounded">person</span>
        <span>查看歌手</span>
      </div>
      <div class="menu-item" :class="{ disabled: !song.album }" @click="exec('album')">
        <span class="material-symbols-rounded">album</span>
        <span>查看专辑</span>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="exec('removeFromPlaylist')" v-if="playlistId">
        <span class="material-symbols-rounded">playlist_remove</span>
        <span>从歌单移除</span>
      </div>

      <div class="menu-divider" v-if="playlistId"></div>

      <div class="menu-item" @click="showPlaylists = true" v-if="!showPlaylists && loading !== true">
        <span class="material-symbols-rounded">playlist_add</span>
        <span>添加到歌单</span>
        <span class="material-symbols-rounded arrow">chevron_right</span>
      </div>
      <div class="menu-item" v-if="loading === true">
        <span class="material-symbols-rounded">hourglass_top</span>
        <span>加载中...</span>
      </div>
      <template v-if="showPlaylists">
        <div class="menu-item sub-header" @click="showPlaylists = false">
          <span class="material-symbols-rounded">arrow_back</span>
          <span>返回</span>
        </div>
        <div class="menu-item" v-for="pl in playlists" :key="pl.id" @click="exec('addToPlaylist', pl)">
          <span class="material-symbols-rounded">playlist_play</span>
          <span class="pl-name">{{ pl.name }}</span>
          <span class="pl-count">{{ pl.song_count }}</span>
        </div>
        <div class="menu-item disabled" v-if="!playlists.length">
          <span>暂无歌单</span>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  x: Number,
  y: Number,
  song: { type: Object, required: true },
  playlists: { type: Array, default: () => [] },
  loading: Boolean,
  playlistId: { type: Number, default: null },
})

const emit = defineEmits(['close', 'action'])

const showPlaylists = ref(false)

const menuStyle = computed(() => {
  return {
    left: `${props.x}px`,
    top: `${props.y}px`,
  }
})

function exec(action, payload) {
  emit('action', { action, song: props.song, payload })
  emit('close')
}

function close() {
  emit('close')
}
</script>

<style scoped>
.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 180px;
  background: var(--md-surface-container-high);
  border: 1px solid var(--md-outline-variant);
  border-radius: 12px;
  padding: 6px;
  box-shadow: var(--md-elevation-3);
  backdrop-filter: blur(20px);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--md-on-surface);
  transition: background 0.1s;
  user-select: none;
  white-space: nowrap;
}

.menu-item:hover {
  background: var(--md-surface-variant);
}

.menu-item.disabled {
  opacity: 0.4;
  cursor: default;
}

.menu-item.disabled:hover {
  background: transparent;
}

.menu-item .material-symbols-rounded {
  font-size: 18px;
  color: var(--md-on-surface-variant);
}

.menu-item .arrow {
  margin-left: auto;
  font-size: 16px;
}

.sub-header {
  font-size: 12px;
  color: var(--md-on-surface-variant);
  border-bottom: 1px solid var(--md-outline-variant);
  border-radius: 0;
  margin-bottom: 4px;
  padding-bottom: 8px;
}

.pl-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-count {
  font-size: 11px;
  color: var(--md-on-surface-variant);
  opacity: 0.6;
}

.menu-divider {
  height: 1px;
  background: var(--md-outline-variant);
  margin: 4px 8px;
}

@media (max-width: 768px) {
  .menu-backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  .context-menu {
    top: auto !important;
    bottom: 0;
    left: 0 !important;
    right: 0;
    min-width: 0;
    width: 100%;
    border-radius: 20px 20px 0 0;
    padding: 12px 8px;
    padding-bottom: calc(12px + var(--mobile-safe-bottom));
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.25s ease;
  }

  .menu-item {
    padding: 12px 16px;
    font-size: 14px;
    border-radius: 12px;
    gap: 12px;
  }

  .menu-item .material-symbols-rounded {
    font-size: 20px;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
}
</style>
