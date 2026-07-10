import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentSong: null,
    queue: [],
    queueIndex: -1,
    playing: false,
    volume: parseFloat(localStorage.getItem('player_volume') || '0.7'),
    muted: localStorage.getItem('player_muted') === 'true',
    currentTime: 0,
    duration: 0,
    playMode: 'loop',
    lyrics: [],
    showLyrics: false,
    showQueue: false,
    seekTime: -1,
    lyricsSettings: (() => {
      const defaults = { fontSize: 20, transFontSize: 15, align: 'center', bold: false, transBold: false, showTranslation: true, bgBrightness: 35, lyricsWidth: 720, scrollEasing: 'ease-out', lyricsSplit: 50, coverSize: 280, lyricsOffset: 0, highlightMode: 'enlarge' }
      try {
        const saved = JSON.parse(localStorage.getItem('lyrics_settings'))
        return { ...defaults, ...saved }
      } catch { return { ...defaults } }
    })(),
  }),

  getters: {
    audioSrc() {
      if (!this.currentSong) return ''
      return `/api/music/${this.currentSong.id}/stream`
    },
    coverSrc() {
      if (!this.currentSong || !this.currentSong.has_cover) return ''
      return `/api/music/${this.currentSong.id}/cover`
    },
    lyricsLine() {
      if (!this.lyrics?.length) return -1
      const t = this.currentTime
      for (let i = 0; i < this.lyrics.length; i++) {
        if (this.lyrics[i].time > t) return i - 1
      }
      return this.lyrics.length - 1
    },
  },

  actions: {
    play(song) {
      this.currentSong = song
      const idx = this.queue.findIndex(s => s.id === song.id)
      if (idx === -1) {
        this.queue.push(song)
        this.queueIndex = this.queue.length - 1
      } else {
        this.queueIndex = idx
      }
      this.playing = true
      this.fetchLyrics()
    },

    playList(songs, index = 0) {
      this.queue = [...songs]
      this.queueIndex = index
      this.currentSong = songs[index]
      this.playing = true
      this.fetchLyrics()
    },

    togglePlay() {
      if (this.currentSong) {
        this.playing = !this.playing
      }
    },

    next() {
      if (this.queue.length === 0) return
      if (this.playMode === 'shuffle') {
        this.queueIndex = Math.floor(Math.random() * this.queue.length)
      } else if (this.playMode === 'single') {
      } else {
        this.queueIndex = (this.queueIndex + 1) % this.queue.length
      }
      this.currentSong = this.queue[this.queueIndex]
      this.playing = true
      this.fetchLyrics()
    },

    prev() {
      if (this.queue.length === 0) return
      this.queueIndex = (this.queueIndex - 1 + this.queue.length) % this.queue.length
      this.currentSong = this.queue[this.queueIndex]
      this.playing = true
      this.fetchLyrics()
    },

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val))
      localStorage.setItem('player_volume', String(this.volume))
    },

    toggleMute() {
      this.muted = !this.muted
      localStorage.setItem('player_muted', String(this.muted))
    },

    cyclePlayMode() {
      const modes = ['loop', 'single', 'shuffle']
      const idx = modes.indexOf(this.playMode)
      this.playMode = modes[(idx + 1) % modes.length]
    },

    playNext(song) {
      const idx = this.queue.findIndex(s => s.id === song.id)
      if (idx === this.queueIndex + 1) return
      if (idx !== -1) {
        this.queue.splice(idx, 1)
        if (idx <= this.queueIndex) this.queueIndex--
      }
      this.queue.splice(this.queueIndex + 1, 0, song)
    },

    addToQueue(song) {
      const exists = this.queue.find(s => s.id === song.id)
      if (!exists) {
        this.queue.push(song)
      }
    },

    removeFromQueue(index) {
      if (this.queue.length <= 1) {
        this.queue = []
        this.queueIndex = -1
        this.currentSong = null
        this.playing = false
        return
      }

      const wasCurrent = index === this.queueIndex
      this.queue.splice(index, 1)

      if (wasCurrent) {
        if (this.queueIndex >= this.queue.length) {
          this.queueIndex = this.queue.length - 1
        }
        this.currentSong = this.queue[this.queueIndex]
        this.playing = true
      } else if (index < this.queueIndex) {
        this.queueIndex--
      }
    },

    playFromQueue(index) {
      if (index < 0 || index >= this.queue.length) return
      this.queueIndex = index
      this.currentSong = this.queue[index]
      this.playing = true
    },

    setQueue(songs, index = 0) {
      this.queue = [...songs]
      this.queueIndex = index
      this.currentSong = songs[index] || null
      this.playing = !!songs[index]
    },

    async fetchLyrics() {
      if (!this.currentSong) return
      this.lyrics = []
      try {
        const res = await fetch(`/api/lyrics?song_id=${this.currentSong.id}`)
        const data = await res.json()
        this.lyrics = data.lyrics || []
      } catch {
        this.lyrics = []
      }
    },

    seekTo(time) {
      this.seekTime = time
    },

    updateLyricsSettings(patch) {
      this.lyricsSettings = { ...this.lyricsSettings, ...patch }
      localStorage.setItem('lyrics_settings', JSON.stringify(this.lyricsSettings))
    },

    async clearLyricsCache() {
      try {
        await fetch('/api/lyrics/cache', { method: 'DELETE' })
      } catch {}
    },

    toggleQueue() {
      this.showQueue = !this.showQueue
    },
  },
})
