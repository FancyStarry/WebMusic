const express = require('express')
const router = express.Router()
const db = require('../db')
const { getLyrics } = require('../services/lyrics')
const { requireAuth } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const songId = parseInt(req.query.song_id)
  if (isNaN(songId)) return res.status(400).json({ lyrics: null, error: '缺少 song_id' })

  const song = db.prepare('SELECT id, title, artist FROM songs WHERE id = ?').get(songId)
  if (!song) return res.status(404).json({ lyrics: null, error: '歌曲不存在' })

  try {
    const lyrics = await getLyrics(song.id, song.title, song.artist)
    res.json({ lyrics })
  } catch (e) {
    res.json({ lyrics: null, error: e.message })
  }
})

router.delete('/cache', requireAuth, (req, res) => {
  db.prepare('DELETE FROM lyrics').run()
  console.log('已清空全部歌词缓存')
  res.json({ success: true })
})

router.delete('/cache/:songId', requireAuth, (req, res) => {
  const songId = parseInt(req.params.songId)
  if (isNaN(songId)) return res.status(400).json({ error: '缺少 song_id' })
  db.prepare('DELETE FROM lyrics WHERE song_id = ?').run(songId)
  res.json({ success: true })
})

module.exports = router
