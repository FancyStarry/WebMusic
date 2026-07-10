import { defineStore } from 'pinia'

const API_BASE = '/api'

async function fetchJSON(url, opts = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const useLibraryStore = defineStore('library', {
  state: () => ({
    songs: [],
    totalSongs: 0,
    albums: [],
    artists: [],
    playlists: [],
    loading: false,
    scanStatus: { scanning: false, status: 'idle' },
  }),

  actions: {
    async fetchSongs(params = {}) {
      this.loading = true
      try {
        const q = new URLSearchParams(params).toString()
        const data = await fetchJSON(`/music?${q}`)
        this.songs = data.songs
        this.totalSongs = data.total
        return data
      } finally {
        this.loading = false
      }
    },

    async fetchSong(id) {
      return fetchJSON(`/music/${id}`)
    },

    async fetchAlbums(search = '') {
      const q = search ? `?search=${encodeURIComponent(search)}` : ''
      const data = await fetchJSON(`/albums${q}`)
      this.albums = data.albums
      return data
    },

    async fetchAlbum(id) {
      return fetchJSON(`/albums/${id}`)
    },

    async fetchArtists(search = '') {
      const q = search ? `?search=${encodeURIComponent(search)}` : ''
      const data = await fetchJSON(`/artists${q}`)
      this.artists = data.artists
      return data
    },

    async fetchArtist(id) {
      return fetchJSON(`/artists/${id}`)
    },

    async fetchPlaylists() {
      const data = await fetchJSON('/playlists')
      this.playlists = data.playlists
      return data
    },

    async fetchPlaylist(id) {
      return fetchJSON(`/playlists/${id}`)
    },

    async createPlaylist(name, description = '') {
      const data = await fetchJSON('/playlists', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      })
      await this.fetchPlaylists()
      return data
    },

    async updatePlaylist(id, name, description) {
      const data = await fetchJSON(`/playlists/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description }),
      })
      return data
    },

    async deletePlaylist(id) {
      await fetchJSON(`/playlists/${id}`, { method: 'DELETE' })
      await this.fetchPlaylists()
    },

    async addToPlaylist(playlistId, songIds) {
      const data = await fetchJSON(`/playlists/${playlistId}/songs`, {
        method: 'POST',
        body: JSON.stringify({ songIds }),
      })
      await this.fetchPlaylists()
      return data
    },

    async fetchAlbumByTitle(title) {
      return fetchJSON(`/albums/by-title/${encodeURIComponent(title)}`)
    },

    async fetchArtistByName(name) {
      return fetchJSON(`/artists/by-name/${encodeURIComponent(name)}`)
    },

    async removeFromPlaylist(playlistId, songId) {
      const data = await fetchJSON(`/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' })
      await this.fetchPlaylists()
      return data
    },

    async triggerScan(dirs) {
      const data = await fetchJSON('/scan', {
        method: 'POST',
        body: JSON.stringify({ dirs }),
      })
      return data
    },

    async fetchScanStatus() {
      const data = await fetchJSON('/scan/status')
      this.scanStatus = data
      return data
    },
  },
})
