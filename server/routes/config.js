const express = require('express')
const db = require('../db')
const webdav = require('../webdav')

const router = express.Router()

router.get('/music-dirs', (req, res) => {
  const row = db.prepare("SELECT value FROM config WHERE key = 'music_dirs'").get()
  const dirs = row ? JSON.parse(row.value) : []
  res.json({ dirs })
})

router.put('/music-dirs', (req, res) => {
  const { dirs } = req.body
  if (!Array.isArray(dirs)) {
    return res.status(400).json({ error: 'dirs 必须是数组' })
  }
  db.prepare("UPDATE config SET value = ? WHERE key = 'music_dirs'").run(JSON.stringify(dirs))
  res.json({ dirs })
})

router.get('/webdav', (req, res) => {
  const sources = webdav.loadSources()
  res.json({ sources })
})

router.post('/webdav/test', async (req, res) => {
  const { url, username, password, path } = req.body
  if (!url) return res.status(400).json({ success: false, error: 'URL 不能为空' })
  try {
    const { createClient } = require('webdav')
    const client = createClient(url, { username, password })
    await client.getDirectoryContents(path || '/')
    res.json({ success: true })
  } catch (e) {
    res.json({ success: false, error: e.message || '连接失败' })
  }
})

router.put('/webdav', (req, res) => {
  const { sources } = req.body
  if (!Array.isArray(sources)) {
    return res.status(400).json({ error: 'sources 必须是数组' })
  }
  for (const s of sources) {
    if (!s.id || !s.name || !s.url) {
      return res.status(400).json({ error: '每个源必须有 id、name 和 url' })
    }
  }
  webdav.clearClientCache()
  webdav.saveSources(sources)
  res.json({ sources })
})

module.exports = router
