<template>
  <div class="settings-page">
    <h1 class="page-title">设置</h1>

    <section class="settings-section">
      <h2 class="section-title">扫描音乐</h2>
      <p class="section-desc">扫描已配置的音乐文件夹，同步最新曲目</p>
      <button class="scan-btn" @click="startScan" :disabled="scanning">
        <span class="material-symbols-rounded">{{ scanning ? 'sync' : 'refresh' }}</span>
        {{ scanning ? '扫描中...' : '开始扫描' }}
      </button>
      <div v-if="statusText" class="scan-status" :class="{ error: isError }">{{ statusText }}</div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">主题颜色</h2>

      <div class="theme-mode">
        <span class="label">显示模式</span>
        <div class="mode-toggle">
          <button class="mode-btn" :class="{ active: settings.themeMode === 'dark' }" @click="settings.setThemeMode('dark')">
            <span class="material-symbols-rounded">dark_mode</span>
            暗色
          </button>
          <button class="mode-btn" :class="{ active: settings.themeMode === 'light' }" @click="settings.setThemeMode('light')">
            <span class="material-symbols-rounded">light_mode</span>
            亮色
          </button>
        </div>
      </div>

      <div class="theme-colors">
        <span class="label">主题色</span>
        <div class="color-grid">
          <button v-for="(theme, key) in PRESET_THEMES" :key="key"
            class="color-swatch"
            :class="{ active: settings.themeColor === key }"
            :style="{ '--swatch-color': theme.dark.primary }"
            @click="settings.setThemeColor(key)"
            :title="theme.name">
            <span class="swatch-inner"></span>
            <span v-if="settings.themeColor === key" class="material-symbols-rounded check-icon">check</span>
          </button>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">音乐文件夹</h2>
      <p class="section-desc">添加或移除音乐文件所在的文件夹路径</p>

      <div class="dir-list">
        <div v-for="(dir, i) in settings.musicDirs" :key="i" class="dir-item">
          <span class="material-symbols-rounded dir-icon">folder</span>
          <span class="dir-path">{{ dir }}</span>
          <button class="dir-remove" @click="settings.removeDir(i)" title="移除">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>
        <div v-if="settings.musicDirs.length === 0" class="dir-empty">
          尚未添加音乐文件夹
        </div>
      </div>

      <div class="add-dir">
        <button class="add-dir-btn" @click="showAddInput = !showAddInput">
          <span class="material-symbols-rounded">add</span>
          添加文件夹
        </button>
        <div v-if="showAddInput" class="add-dir-form">
          <div class="add-dir-row">
            <input type="file" ref="folderInput" class="folder-picker" webkitdirectory @change="onFolderPick" />
            <button class="pick-btn" @click="triggerFolderPicker">
              <span class="material-symbols-rounded">folder_open</span>
              浏览
            </button>
          </div>
          <div class="add-dir-row">
            <input v-model="manualDir" type="text" class="dir-input" placeholder="或手动输入文件夹路径" @keyup.enter="addManual" />
            <button class="confirm-btn" @click="addManual">添加</button>
          </div>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">WebDAV 源</h2>
      <p class="section-desc">添加 WebDAV 服务器以同步远程音乐文件</p>

      <div class="dir-list">
        <div v-for="(source, i) in settings.webdavSources" :key="source.id" class="dir-item">
          <span class="material-symbols-rounded dir-icon">cloud</span>
          <span class="dir-path">
            <strong>{{ source.name }}</strong>
            <span class="webdav-url">{{ source.url }}</span>
          </span>
          <span class="webdav-badge" :class="{ enabled: source.enabled !== false }">
            {{ source.enabled !== false ? '启用' : '禁用' }}
          </span>
          <button class="dir-remove" @click="editWebdav(i)" title="编辑">
            <span class="material-symbols-rounded">edit</span>
          </button>
          <button class="dir-remove" @click="settings.removeWebdavSource(i)" title="删除">
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
        <div v-if="settings.webdavSources.length === 0" class="dir-empty">
          尚未配置 WebDAV 源
        </div>
      </div>

      <div class="add-dir">
        <button class="add-dir-btn" @click="showWebdavForm = !showWebdavForm; editingWebdavIndex = -1; resetWebdavForm()">
          <span class="material-symbols-rounded">{{ showWebdavForm ? 'close' : 'add' }}</span>
          {{ showWebdavForm ? '取消' : '添加 WebDAV 源' }}
        </button>
        <div v-if="showWebdavForm" class="webdav-form">
          <div class="webdav-field">
            <label>名称</label>
            <input v-model="webdavForm.name" type="text" class="dir-input" placeholder="例如：我的 NAS" />
          </div>
          <div class="webdav-field">
            <label>服务器 URL</label>
            <input v-model="webdavForm.url" type="text" class="dir-input" placeholder="https://example.com/dav" />
          </div>
          <div class="webdav-row">
            <div class="webdav-field flex-1">
              <label>用户名</label>
              <input v-model="webdavForm.username" type="text" class="dir-input" placeholder="用户名" />
            </div>
            <div class="webdav-field flex-1">
              <label>密码</label>
              <input v-model="webdavForm.password" type="password" class="dir-input" placeholder="密码" />
            </div>
          </div>
          <div class="webdav-field">
            <label>根路径</label>
            <input v-model="webdavForm.path" type="text" class="dir-input" placeholder="/（默认根目录）" />
          </div>
          <div class="webdav-field">
            <label class="checkbox-label">
              <input v-model="webdavForm.enabled" type="checkbox" class="checkbox" />
              启用此源
            </label>
          </div>
          <div v-if="webdavTestMsg" class="scan-status" :class="{ error: webdavTestError }">{{ webdavTestMsg }}</div>
          <div class="webdav-actions">
            <button class="pick-btn" @click="testWebdav" :disabled="webdavTesting">
              <span class="material-symbols-rounded">{{ webdavTesting ? 'sync' : 'link' }}</span>
              {{ webdavTesting ? '测试中...' : '测试连接' }}
            </button>
            <button class="confirm-btn" @click="saveWebdavForm">
              {{ editingWebdavIndex >= 0 ? '更新' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">歌词缓存</h2>
      <p class="section-desc">清除所有已缓存的歌词数据，下次播放时重新从网易云获取</p>
      <button class="scan-btn" @click="clearLyricsCache" :disabled="clearingCache">
        <span class="material-symbols-rounded">{{ clearingCache ? 'sync' : 'delete_sweep' }}</span>
        {{ clearingCache ? '清除中...' : '清空歌词缓存' }}
      </button>
      <div v-if="cacheMsg" class="scan-status">{{ cacheMsg }}</div>
    </section>

    <section class="settings-section danger-zone">
      <h2 class="section-title">危险操作</h2>
      <p class="section-desc">删除数据库中所有歌曲、专辑、歌手和封面缓存，且不可恢复</p>
      <button class="danger-btn" @click="confirmClearAll">
        <span class="material-symbols-rounded">delete_forever</span>
        删除全部音乐数据
      </button>
      <div v-if="clearMsg" class="scan-status" :class="{ error: clearIsError }">{{ clearMsg }}</div>
    </section>

    <Teleport to="body">
      <div class="modal-overlay" v-if="showClearConfirm" @click.self="showClearConfirm = false">
        <div class="modal-dialog">
          <h3 class="modal-title">确认删除全部数据？</h3>
          <p class="modal-desc">此操作将删除所有歌曲、专辑、歌手和封面缓存，<strong>且不可恢复</strong>。</p>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showClearConfirm = false">取消</button>
            <button class="modal-btn delete-confirm" @click="doClearAll">确认删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useSettingsStore, PRESET_THEMES } from '../stores/settings'
import { useLibraryStore } from '../stores/library'

const settings = useSettingsStore()
const library = useLibraryStore()

onMounted(() => {
  settings.fetchMusicDirs()
  settings.fetchWebdavSources()
})

const showAddInput = ref(false)
const manualDir = ref('')
const folderInput = ref(null)
const statusText = ref('')
const isError = ref(false)
const clearingCache = ref(false)
const cacheMsg = ref('')
const showClearConfirm = ref(false)
const clearingAll = ref(false)
const clearMsg = ref('')
const clearIsError = ref(false)

const showWebdavForm = ref(false)
const editingWebdavIndex = ref(-1)
const webdavTesting = ref(false)
const webdavTestMsg = ref('')
const webdavTestError = ref(false)
const webdavForm = reactive({
  id: '',
  name: '',
  url: '',
  username: '',
  password: '',
  path: '/',
  enabled: true,
})

function resetWebdavForm() {
  webdavForm.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  webdavForm.name = ''
  webdavForm.url = ''
  webdavForm.username = ''
  webdavForm.password = ''
  webdavForm.path = '/'
  webdavForm.enabled = true
  webdavTestMsg.value = ''
  webdavTestError.value = false
}

function editWebdav(index) {
  const source = settings.webdavSources[index]
  webdavForm.id = source.id
  webdavForm.name = source.name
  webdavForm.url = source.url
  webdavForm.username = source.username || ''
  webdavForm.password = source.password || ''
  webdavForm.path = source.path || '/'
  webdavForm.enabled = source.enabled !== false
  editingWebdavIndex.value = index
  showWebdavForm.value = true
  webdavTestMsg.value = ''
  webdavTestError.value = false
}

function saveWebdavForm() {
  if (!webdavForm.name || !webdavForm.url) {
    webdavTestMsg.value = '名称和 URL 为必填项'
    webdavTestError.value = true
    return
  }
  const source = { ...webdavForm }
  if (editingWebdavIndex.value >= 0) {
    settings.updateWebdavSource(editingWebdavIndex.value, source)
  } else {
    settings.addWebdavSource(source)
  }
  showWebdavForm.value = false
  webdavTestMsg.value = editingWebdavIndex.value >= 0 ? '已更新' : '已添加'
  webdavTestError.value = false
}

async function testWebdav() {
  if (!webdavForm.url) {
    webdavTestMsg.value = '请先填写服务器 URL'
    webdavTestError.value = true
    return
  }
  webdavTesting.value = true
  webdavTestMsg.value = ''
  webdavTestError.value = false
  try {
    const res = await fetch('/api/config/webdav/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webdavForm.url,
        username: webdavForm.username,
        password: webdavForm.password,
        path: webdavForm.path || '/',
      }),
    })
    const data = await res.json()
    if (data.success) {
      webdavTestMsg.value = '连接成功'
    } else {
      webdavTestMsg.value = data.error || '连接失败'
      webdavTestError.value = true
    }
  } catch {
    webdavTestMsg.value = '连接失败：无法访问服务器'
    webdavTestError.value = true
  }
  webdavTesting.value = false
}
const scanning = computed(() => {
  return settings.scanStatus.scanning || library.scanStatus?.scanning
})

function triggerFolderPicker() {
  folderInput.value?.click()
}

function onFolderPick(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const relPath = file.webkitRelativePath.replace(/\//g, '\\')
  const absPath = file.path
  if (absPath && relPath && absPath.endsWith(relPath)) {
    settings.addDir(absPath.slice(0, -relPath.length))
  } else if (relPath) {
    settings.addDir(relPath.split('\\')[0])
  }
  e.target.value = ''
}

function addManual() {
  if (manualDir.value.trim()) {
    settings.addDir(manualDir.value.trim())
    manualDir.value = ''
  }
}

async function startScan() {
  statusText.value = ''
  isError.value = false
  settings.scanStatus = { scanning: true, status: 'scanning' }
  const result = await settings.triggerScan()
  if (result?.error) {
    statusText.value = result.error
    isError.value = true
  }
  if (result && !result.error) {
    library.fetchSongs()
    library.fetchAlbums()
    library.fetchArtists()
  }
  setTimeout(() => {
    if (settings.scanStatus.status && settings.scanStatus.status !== 'scanning') {
      statusText.value = settings.scanStatus.status
    }
  }, 500)
}

async function clearLyricsCache() {
  clearingCache.value = true
  cacheMsg.value = ''
  try {
    await fetch('/api/lyrics/cache', { method: 'DELETE' })
    cacheMsg.value = '歌词缓存已清空'
  } catch {
    cacheMsg.value = '清除失败'
  }
  clearingCache.value = false
}

function confirmClearAll() {
  showClearConfirm.value = true
}

async function doClearAll() {
  showClearConfirm.value = false
  clearingAll.value = true
  clearMsg.value = ''
  clearIsError.value = false
  try {
    const res = await fetch('/api/music/all', { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    clearMsg.value = '全部音乐数据已删除'
    library.songs = []
    library.totalSongs = 0
    library.albums = []
    library.artists = []
  } catch (e) {
    clearMsg.value = '删除失败: ' + e.message
    clearIsError.value = true
  }
  clearingAll.value = false
}
</script>

<style scoped>
.settings-page {
  max-width: 720px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 32px;
  color: var(--md-on-surface);
}

.settings-section {
  background: var(--md-surface-container);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid var(--md-outline-variant);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--md-on-surface);
}

.section-desc {
  font-size: 13px;
  color: var(--md-on-surface-variant);
  margin-bottom: 16px;
}

.scan-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: 24px;
  background: var(--md-primary);
  color: var(--md-on-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.scan-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.scan-btn:not(:disabled):hover {
  opacity: 0.9;
}

.scan-status {
  margin-top: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  font-size: 13px;
}

.scan-status.error {
  background: var(--md-error-container);
  color: var(--md-on-error-container);
}

.label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--md-on-surface-variant);
  margin-bottom: 10px;
}

.theme-mode {
  margin-bottom: 24px;
}

.mode-toggle {
  display: flex;
  gap: 8px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 2px solid var(--md-outline-variant);
  border-radius: 12px;
  background: transparent;
  color: var(--md-on-surface-variant);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.mode-btn.active {
  border-color: var(--md-primary);
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-swatch {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid transparent;
  background: var(--swatch-color);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, border-color 0.15s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.active {
  border-color: var(--md-on-surface);
}

.swatch-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--swatch-color);
}

.check-icon {
  position: absolute;
  font-size: 18px;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.dir-list {
  margin-bottom: 16px;
}

.dir-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--md-surface-variant);
  margin-bottom: 6px;
  font-size: 13px;
}

.dir-icon {
  font-size: 20px;
  color: var(--md-primary);
  flex-shrink: 0;
}

.dir-path {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--md-on-surface);
}

.dir-remove {
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
  transition: background 0.15s, color 0.15s;
}

.dir-remove:hover {
  background: var(--md-error-container);
  color: var(--md-error);
}

.dir-empty {
  padding: 16px;
  text-align: center;
  color: var(--md-on-surface-variant);
  font-size: 13px;
  border: 1px dashed var(--md-outline-variant);
  border-radius: 10px;
}

.add-dir-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px dashed var(--md-outline);
  border-radius: 10px;
  background: transparent;
  color: var(--md-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.add-dir-btn:hover {
  background: var(--md-primary-container);
}

.add-dir-form {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-dir-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.folder-picker {
  display: none;
}

.pick-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border: 1px solid var(--md-outline);
  border-radius: 8px;
  background: var(--md-surface);
  color: var(--md-on-surface-variant);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.pick-btn:hover {
  background: var(--md-surface-variant);
}

.dir-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--md-outline);
  border-radius: 8px;
  background: var(--md-surface);
  color: var(--md-on-surface);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.dir-input:focus {
  border-color: var(--md-primary);
}

.confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--md-primary);
  color: var(--md-on-primary);
  font-size: 13px;
  cursor: pointer;
}

.confirm-btn:hover {
  opacity: 0.9;
}

.webdav-url {
  display: block;
  font-size: 11px;
  color: var(--md-on-surface-variant);
  margin-top: 2px;
  opacity: 0.7;
}

.webdav-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--md-error-container);
  color: var(--md-on-error-container);
  flex-shrink: 0;
}

.webdav-badge.enabled {
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

.webdav-form {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.webdav-field label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--md-on-surface-variant);
  margin-bottom: 4px;
}

.webdav-row {
  display: flex;
  gap: 10px;
}

.flex-1 {
  flex: 1;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px !important;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--md-primary);
  cursor: pointer;
}

.webdav-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

@media (max-width: 768px) {
  .settings-page {
    max-width: 100%;
  }

  .page-title {
    font-size: 22px;
  }

  .scan-btn {
    width: 100%;
    justify-content: center;
  }

  .color-grid {
    grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
    gap: 8px;
  }

  .color-swatch {
    width: 44px;
    height: 44px;
  }

  .dir-item {
    flex-wrap: wrap;
  }

  .dir-path {
    font-size: 12px;
    word-break: break-all;
  }

  .webdav-row {
    flex-direction: column;
  }

  .webdav-actions {
    flex-wrap: wrap;
  }
}

.danger-zone {
  border-color: var(--md-error-container);
}

.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: 1px solid var(--md-error);
  border-radius: 24px;
  background: transparent;
  color: var(--md-error);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.danger-btn:hover {
  background: var(--md-error-container);
}

.danger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-dialog {
  background: var(--md-surface-container-high);
  border-radius: 16px;
  padding: 24px;
  width: 360px;
  box-shadow: var(--md-elevation-3);
}

.modal-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--md-on-surface);
}

.modal-desc {
  font-size: 14px;
  color: var(--md-on-surface-variant);
  margin: 0 0 20px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.modal-btn.cancel {
  background: transparent;
  color: var(--md-on-surface-variant);
}

.modal-btn.cancel:hover {
  background: var(--md-surface-variant);
}

.modal-btn.delete-confirm {
  background: var(--md-error);
  color: var(--md-on-error);
}

.modal-btn.delete-confirm:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .modal-dialog {
    width: calc(100vw - 32px);
    border-radius: 20px;
  }
}
</style>
