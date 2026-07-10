import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = '/api'

const PRESET_THEMES = {
  purple: {
    name: '典雅紫',
    dark: {
      primary: '#6750A4', onPrimary: '#FFFFFF', primaryContainer: '#EADDFF', onPrimaryContainer: '#21005D',
      secondary: '#625B71', onSecondary: '#FFFFFF', secondaryContainer: '#E8DEF8', onSecondaryContainer: '#1D192B',
      tertiary: '#7D5260', onTertiary: '#FFFFFF', tertiaryContainer: '#FFD8E4', onTertiaryContainer: '#31111D',
      surface: '#1C1B1F', onSurface: '#E6E1E5', surfaceVariant: '#49454F', onSurfaceVariant: '#CAC4D0',
      surfaceContainer: '#211F26', surfaceContainerHigh: '#2B2930',
      outlineVariant: '#49454F',
    },
    light: {
      primary: '#6750A4', onPrimary: '#FFFFFF', primaryContainer: '#EADDFF', onPrimaryContainer: '#21005D',
      secondary: '#625B71', onSecondary: '#FFFFFF', secondaryContainer: '#E8DEF8', onSecondaryContainer: '#1D192B',
      tertiary: '#7D5260', onTertiary: '#FFFFFF', tertiaryContainer: '#FFD8E4', onTertiaryContainer: '#31111D',
      surface: '#FFFBFE', onSurface: '#1C1B1F', surfaceVariant: '#E7E0EC', onSurfaceVariant: '#49454F',
      surfaceContainer: '#F3EDF7', surfaceContainerHigh: '#ECE6F0',
      outlineVariant: '#CAC4D0',
    },
  },
  blue: {
    name: '深海蓝',
    dark: {
      primary: '#6B9AC4', onPrimary: '#FFFFFF', primaryContainer: '#CEE5FF', onPrimaryContainer: '#001D36',
      secondary: '#B7C8DC', onSecondary: '#213141', secondaryContainer: '#37475A', onSecondaryContainer: '#D1E4F9',
      tertiary: '#A3C8E8', onTertiary: '#00344C',
      surface: '#1A1C1E', onSurface: '#E2E2E6', surfaceVariant: '#43474E', onSurfaceVariant: '#C3C6CF',
      surfaceContainer: '#1F2125', surfaceContainerHigh: '#2A2C30',
      outlineVariant: '#43474E',
    },
    light: {
      primary: '#3A6B9C', onPrimary: '#FFFFFF', primaryContainer: '#CEE5FF', onPrimaryContainer: '#001D36',
      secondary: '#566478', onSecondary: '#FFFFFF', secondaryContainer: '#D1E4F9', onSecondaryContainer: '#0E1D2E',
      tertiary: '#2B6B8A', onTertiary: '#FFFFFF',
      surface: '#F9F9FF', onSurface: '#191C20', surfaceVariant: '#DFE2EB', onSurfaceVariant: '#43474E',
      surfaceContainer: '#EDEDF4', surfaceContainerHigh: '#E7E8EF',
      outlineVariant: '#C3C6CF',
    },
  },
  green: {
    name: '森林绿',
    dark: {
      primary: '#79C48A', onPrimary: '#003919', primaryContainer: '#00532A', onPrimaryContainer: '#A2F0B1',
      secondary: '#B8CCBB', onSecondary: '#24362A', secondaryContainer: '#3A4D40', onSecondaryContainer: '#D4E8D7',
      tertiary: '#A1D0B0',
      surface: '#1A1C1A', onSurface: '#E2E3DF', surfaceVariant: '#414941', onSurfaceVariant: '#C1C9BF',
      surfaceContainer: '#1F211F', surfaceContainerHigh: '#292C2A',
      outlineVariant: '#414941',
    },
    light: {
      primary: '#3B8550', onPrimary: '#FFFFFF', primaryContainer: '#A2F0B1', onPrimaryContainer: '#00210E',
      secondary: '#516352', onSecondary: '#FFFFFF', secondaryContainer: '#D4E8D7', onSecondaryContainer: '#0E1F13',
      tertiary: '#3F6B4D',
      surface: '#F9FAF5', onSurface: '#1A1C1A', surfaceVariant: '#DDE5DB', onSurfaceVariant: '#414941',
      surfaceContainer: '#EDEEE9', surfaceContainerHigh: '#E7E8E3',
      outlineVariant: '#C1C9BF',
    },
  },
  red: {
    name: '烈焰红',
    dark: {
      primary: '#E8A0A0', onPrimary: '#5A2020', primaryContainer: '#7C3838', onPrimaryContainer: '#FFD9D9',
      secondary: '#E2BDBD', onSecondary: '#482A2A', secondaryContainer: '#614040', onSecondaryContainer: '#FFDADA',
      tertiary: '#E8B8A0',
      surface: '#1C1B1B', onSurface: '#E6E1E1', surfaceVariant: '#504848', onSurfaceVariant: '#D0C4C4',
      surfaceContainer: '#222020', surfaceContainerHigh: '#2D2A2A',
      outlineVariant: '#504848',
    },
    light: {
      primary: '#B34141', onPrimary: '#FFFFFF', primaryContainer: '#FFD9D9', onPrimaryContainer: '#410B0B',
      secondary: '#7A5656', onSecondary: '#FFFFFF', secondaryContainer: '#FFDADA', onSecondaryContainer: '#2C1515',
      tertiary: '#A35841',
      surface: '#FCF8F8', onSurface: '#1C1B1B', surfaceVariant: '#F0E4E4', onSurfaceVariant: '#504848',
      surfaceContainer: '#F0ECEC', surfaceContainerHigh: '#EAE6E6',
      outlineVariant: '#D0C4C4',
    },
  },
  orange: {
    name: '暖阳橙',
    dark: {
      primary: '#E8B880', onPrimary: '#4A2E0A', primaryContainer: '#6B451A', onPrimaryContainer: '#FFDEC2',
      secondary: '#E2C6A8', onSecondary: '#3E2E1A', secondaryContainer: '#56442C', onSecondaryContainer: '#F5DFC4',
      tertiary: '#E8A080',
      surface: '#1C1A18', onSurface: '#E6E1DB', surfaceVariant: '#504840', onSurfaceVariant: '#D0C4BA',
      surfaceContainer: '#22201D', surfaceContainerHigh: '#2D2A27',
      outlineVariant: '#504840',
    },
    light: {
      primary: '#A86521', onPrimary: '#FFFFFF', primaryContainer: '#FFDEC2', onPrimaryContainer: '#361B00',
      secondary: '#705840', onSecondary: '#FFFFFF', secondaryContainer: '#F5DFC4', onSecondaryContainer: '#261A0A',
      tertiary: '#9C5638',
      surface: '#FCF8F3', onSurface: '#1C1A18', surfaceVariant: '#F0E8DE', onSurfaceVariant: '#504840',
      surfaceContainer: '#F0ECE7', surfaceContainerHigh: '#EAE6E1',
      outlineVariant: '#D0C4BA',
    },
  },
  cyan: {
    name: '冰晶青',
    dark: {
      primary: '#7CC8D0', onPrimary: '#00363E', primaryContainer: '#004F5A', onPrimaryContainer: '#A7F0F8',
      secondary: '#B6CDD0', onSecondary: '#213739', secondaryContainer: '#384D50', onSecondaryContainer: '#D2E9EC',
      tertiary: '#A1D0C8',
      surface: '#191C1D', onSurface: '#E1E3E3', surfaceVariant: '#3F484A', onSurfaceVariant: '#BFC8CA',
      surfaceContainer: '#1E2122', surfaceContainerHigh: '#282C2D',
      outlineVariant: '#3F484A',
    },
    light: {
      primary: '#269FA8', onPrimary: '#FFFFFF', primaryContainer: '#A7F0F8', onPrimaryContainer: '#002025',
      secondary: '#4E6365', onSecondary: '#FFFFFF', secondaryContainer: '#D2E9EC', onSecondaryContainer: '#0B1F21',
      tertiary: '#3D6B63',
      surface: '#F5FAFB', onSurface: '#191C1D', surfaceVariant: '#DBE4E5', onSurfaceVariant: '#3F484A',
      surfaceContainer: '#E9EEEF', surfaceContainerHigh: '#E3E8E9',
      outlineVariant: '#BFC8CA',
    },
  },
  pink: {
    name: '樱花粉',
    dark: {
      primary: '#E8A0C0', onPrimary: '#552040', primaryContainer: '#783860', onPrimaryContainer: '#FFD8EC',
      secondary: '#DEBCC8', onSecondary: '#402832', secondaryContainer: '#583E4A', onSecondaryContainer: '#FAD8E6',
      tertiary: '#E8A8B0',
      surface: '#1C1A1B', onSurface: '#E6E1E2', surfaceVariant: '#504849', onSurfaceVariant: '#D0C4C6',
      surfaceContainer: '#222021', surfaceContainerHigh: '#2D2A2B',
      outlineVariant: '#504849',
    },
    light: {
      primary: '#A84B7A', onPrimary: '#FFFFFF', primaryContainer: '#FFD8EC', onPrimaryContainer: '#3B0024',
      secondary: '#735460', onSecondary: '#FFFFFF', secondaryContainer: '#FAD8E6', onSecondaryContainer: '#29121E',
      tertiary: '#A44A5A',
      surface: '#FCF8F8', onSurface: '#1C1A1B', surfaceVariant: '#F0E4E7', onSurfaceVariant: '#504849',
      surfaceContainer: '#F0ECEC', surfaceContainerHigh: '#EAE6E7',
      outlineVariant: '#D0C4C6',
    },
  },
  gray: {
    name: '高级灰',
    dark: {
      primary: '#B8B8B8', onPrimary: '#2A2A2A', primaryContainer: '#404040', onPrimaryContainer: '#D4D4D4',
      secondary: '#A8A8A8', onSecondary: '#2E2E2E', secondaryContainer: '#444444', onSecondaryContainer: '#D0D0D0',
      tertiary: '#B0B0B0',
      surface: '#1A1A1A', onSurface: '#E4E4E4', surfaceVariant: '#444444', onSurfaceVariant: '#C8C8C8',
      surfaceContainer: '#1F1F1F', surfaceContainerHigh: '#2A2A2A',
      outlineVariant: '#444444',
    },
    light: {
      primary: '#5E5E5E', onPrimary: '#FFFFFF', primaryContainer: '#D4D4D4', onPrimaryContainer: '#1B1B1B',
      secondary: '#6E6E6E', onSecondary: '#FFFFFF', secondaryContainer: '#D0D0D0', onSecondaryContainer: '#222222',
      tertiary: '#666666',
      surface: '#F8F8F8', onSurface: '#1A1A1A', surfaceVariant: '#E4E4E4', onSurfaceVariant: '#444444',
      surfaceContainer: '#ECECEC', surfaceContainerHigh: '#E6E6E6',
      outlineVariant: '#C8C8C8',
    },
  },
}

function applyTheme(themeMode, themeColor) {
  const theme = PRESET_THEMES[themeColor] || PRESET_THEMES.purple
  const colors = theme[themeMode]
  const root = document.documentElement
  if (themeMode === 'light') {
    root.dataset.theme = 'light'
  } else {
    root.removeAttribute('data-theme')
  }
  Object.entries(colors).forEach(([key, val]) => {
    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    root.style.setProperty(`--md-${cssVar}`, val)
  })
}

export { PRESET_THEMES, applyTheme }

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    themeMode: localStorage.getItem('themeMode') || 'dark',
    themeColor: localStorage.getItem('themeColor') || 'purple',
    musicDirs: [],
    webdavSources: [],
    scanStatus: { scanning: false, status: 'idle' },
  }),

  actions: {
    init() {
      applyTheme(this.themeMode, this.themeColor)
      this.fetchMusicDirs()
      this.fetchWebdavSources()
    },

    setThemeMode(mode) {
      this.themeMode = mode
      localStorage.setItem('themeMode', mode)
      applyTheme(mode, this.themeColor)
    },

    setThemeColor(color) {
      this.themeColor = color
      localStorage.setItem('themeColor', color)
      applyTheme(this.themeMode, color)
    },

    async fetchMusicDirs() {
      try {
        const res = await fetch('/api/config/music-dirs')
        const data = await res.json()
        this.musicDirs = data.dirs || []
      } catch {
        this.musicDirs = []
      }
    },

    async saveMusicDirs(dirs) {
      this.musicDirs = dirs
      try {
        await fetch('/api/config/music-dirs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dirs }),
        })
      } catch (e) {
        console.error('保存目录失败', e)
      }
    },

    addDir(dir) {
      const trimmed = dir.trim()
      if (!trimmed || this.musicDirs.includes(trimmed)) return
      this.saveMusicDirs([...this.musicDirs, trimmed])
    },

    removeDir(index) {
      const dirs = this.musicDirs.filter((_, i) => i !== index)
      this.saveMusicDirs(dirs)
    },

    async fetchWebdavSources() {
      try {
        const res = await fetch('/api/config/webdav')
        const data = await res.json()
        this.webdavSources = data.sources || []
      } catch {
        this.webdavSources = []
      }
    },

    async saveWebdavSources(sources) {
      this.webdavSources = sources
      try {
        await fetch('/api/config/webdav', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sources }),
        })
      } catch (e) {
        console.error('保存 WebDAV 源失败', e)
      }
    },

    addWebdavSource(source) {
      this.saveWebdavSources([...this.webdavSources, source])
    },

    updateWebdavSource(index, source) {
      const sources = this.webdavSources.map((s, i) => i === index ? source : s)
      this.saveWebdavSources(sources)
    },

    removeWebdavSource(index) {
      const sources = this.webdavSources.filter((_, i) => i !== index)
      this.saveWebdavSources(sources)
    },

    async triggerScan() {
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dirs: this.musicDirs }),
        })
        const data = await res.json()
        if (data.error) {
          this.scanStatus = { scanning: false, status: data.error }
          return data
        }
        this.scanStatus = { scanning: false, status: `扫描完成: 共 ${data.total || 0} 个文件, 新增 ${data.added || 0}, 更新 ${data.updated || 0}` }
        return data
      } catch (e) {
        this.scanStatus = { scanning: false, status: '扫描失败: ' + e.message }
      }
    },

    async checkScanStatus() {
      try {
        const res = await fetch('/api/scan/status')
        const data = await res.json()
        this.scanStatus = data
        return data
      } catch {}
    },
  },
})
