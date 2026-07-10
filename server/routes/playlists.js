const express = require('express')
const db = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', (req, res) => {
  const playlists = db.prepare(`
    SELECT p.*, COUNT(ps.song_id) as song_count,
      (SELECT ps2.song_id FROM playlist_songs ps2
       JOIN songs s ON s.id = ps2.song_id AND s.has_cover = 1
       WHERE ps2.playlist_id = p.id
       ORDER BY ps2.sort_order LIMIT 1) as cover_song_id
    FROM playlists p
    LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
    GROUP BY p.id ORDER BY p.sort_order, p.created_at DESC
  `).all()
  res.json({ playlists })
})

router.get('/:id', (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id)
  if (!playlist) return res.status(404).json({ error: '歌单不存在' })

  const songs = db.prepare(`
    SELECT s.id, s.title, s.artist, s.album, s.duration, s.file_format,
           s.has_cover, s.track_number, ps.sort_order
    FROM playlist_songs ps
    JOIN songs s ON ps.song_id = s.id
    WHERE ps.playlist_id = ?
    ORDER BY ps.sort_order
  `).all(req.params.id)

  const coverSongId = songs.find(s => s.has_cover)?.id || null

  res.json({ playlist, songs, cover_song_id: coverSongId })
})

router.post('/', requireAuth, (req, res) => {
  const { name, description } = req.body
  if (!name) return res.status(400).json({ error: '歌单名不能为空' })

  const result = db.prepare('INSERT INTO playlists (name, description) VALUES (?, ?)').run(name, description || '')
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ playlist })
})

router.put('/:id', requireAuth, (req, res) => {
  const { name, description } = req.body
  const existing = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: '歌单不存在' })

  db.prepare('UPDATE playlists SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?')
    .run(name || null, description ?? null, req.params.id)

  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id)
  res.json({ playlist })
})

router.delete('/:id', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: '歌单不存在' })
  res.json({ success: true })
})

router.post('/:id/songs', requireAuth, (req, res) => {
  const { songIds } = req.body
  if (!Array.isArray(songIds)) return res.status(400).json({ error: 'songIds 必须是数组' })

  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id)
  if (!playlist) return res.status(404).json({ error: '歌单不存在' })

  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as max FROM playlist_songs WHERE playlist_id = ?')
    .get(req.params.id).max

  const insert = db.prepare('INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, sort_order) VALUES (?, ?, ?)')
  const tx = db.transaction(() => {
    songIds.forEach((songId, i) => {
      insert.run(req.params.id, songId, maxOrder + i + 1)
    })
  })
  tx()

  res.json({ success: true, added: songIds.length })
})

router.delete('/:playlistId/songs/:songId', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?')
    .run(req.params.playlistId, req.params.songId)
  if (result.changes === 0) return res.status(404).json({ error: '未找到该歌曲' })
  res.json({ success: true })
})

module.exports = router
