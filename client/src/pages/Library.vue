<template>
  <div class="library">
    <div class="library-tabs">
      <button v-for="tab in tabs" :key="tab.key"
        class="tab" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    <div class="search-bar">
      <input v-model="searchQuery" type="text" placeholder="搜索音乐、歌手、专辑..."
        class="search-input" @input="onSearch" />
      <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''; onSearch()">
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>

    <Transition name="fade" mode="out-in">
      <div v-if="activeTab === 'songs'" key="songs" class="song-list">
        <MusicTable :songs="library.songs" v-if="library.songs.length" />
        <div v-else class="empty">暂无歌曲，请先扫描</div>
      </div>

      <div v-else-if="activeTab === 'albums'" key="albums" class="album-view">
        <div class="album-grid" v-if="library.albums.length">
          <AlbumCard v-for="album in library.albums" :key="album.id" :album="album" />
        </div>
        <div v-else class="empty">暂无专辑</div>
      </div>

      <div v-else-if="activeTab === 'artists'" key="artists" class="artist-view">
        <div class="artist-grid" v-if="library.artists.length">
          <div v-for="artist in library.artists" :key="artist.id"
            class="artist-card" @click="$router.push(`/artist/${artist.id}`)">
            <div class="artist-avatar">
              <span>{{ artist.name?.[0] || '?' }}</span>
            </div>
            <div class="artist-name">{{ artist.name }}</div>
            <div class="artist-meta">{{ artist.song_count }} 首歌曲</div>
          </div>
        </div>
        <div v-else class="empty">暂无歌手</div>
      </div>

    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import MusicTable from '../components/MusicTable.vue'
import AlbumCard from '../components/AlbumCard.vue'
import { useLibraryStore } from '../stores/library'

const library = useLibraryStore()
const activeTab = ref('songs')
const searchQuery = ref('')

const tabs = [
  { key: 'songs', label: '歌曲' },
  { key: 'albums', label: '专辑' },
  { key: 'artists', label: '歌手' },
]

onMounted(() => {
  loadTab(activeTab.value)
})

watch(activeTab, (tab) => {
  loadTab(tab)
})

function loadTab(tab) {
  const q = searchQuery.value
  if (tab === 'songs') library.fetchSongs({ search: q, pageSize: 200 })
  else if (tab === 'albums') library.fetchAlbums(q)
  else if (tab === 'artists') library.fetchArtists(q)
}

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadTab(activeTab.value), 300)
}
</script>

<style scoped>
.library {
  max-width: 1200px;
}

.library-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: var(--md-surface-variant);
  border-radius: 14px;
  padding: 4px;
  width: fit-content;
}

.tab {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--md-on-surface-variant);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tab:hover {
  background: var(--md-surface-container);
  color: var(--md-on-surface);
}

.tab.active {
  background: var(--md-surface);
  color: var(--md-on-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.search-bar {
  margin-bottom: 24px;
  position: relative;
  width: fit-content;
}

.search-input {
  width: 360px;
  padding: 12px 40px 12px 16px;
  border: 1px solid var(--md-outline);
  border-radius: 24px;
  background: var(--md-surface);
  color: var(--md-on-surface);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--md-primary);
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.search-clear .material-symbols-rounded {
  font-size: 18px;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.artist-card {
  text-align: center;
  padding: 20px 16px;
  border-radius: 16px;
  background: var(--md-surface-container);
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s;
}

.artist-card:hover {
  background: var(--md-surface-variant);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  margin: 0 auto 12px;
}

.artist-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--md-on-surface);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist-meta {
  font-size: 12px;
  color: var(--md-on-surface-variant);
}

.empty {
  text-align: center;
  padding: 80px 0;
  color: var(--md-on-surface-variant);
  font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .library {
    max-width: 100%;
  }

  .library-tabs {
    width: 100%;
    border-radius: 12px;
  }

  .tab {
    flex: 1;
    text-align: center;
    font-size: 13px;
    padding: 10px 16px;
  }

  .search-bar {
    width: 100%;
  }

  .search-input {
    width: 100%;
    padding: 10px 40px 10px 14px;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .artist-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }

  .artist-avatar {
    width: 60px;
    height: 60px;
    font-size: 22px;
  }

  .empty {
    padding: 60px 0;
  }
}
</style>
