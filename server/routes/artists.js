const express = require('express')
const db = require('../db')

const router = express.Router()

router.get('/', (req, res) => {
  const search = req.query.search || ''
  let where = ''
  let params = {}
  if (search) {
    where = 'WHERE name LIKE @search'
    params.search = `%${search}%`
  }

  const artists = db.prepare(`
    SELECT id, name, song_count, album_count
    FROM artists ${where}
    ORDER BY song_count DESC
  `).all(params)

  res.json({ artists })
})

router.get('/by-name/:name', (req, res) => {
  const artist = db.prepare('SELECT id, name FROM artists WHERE name = ?').get(req.params.name)
  if (!artist) return res.status(404).json({ error: '歌手不存在' })
  res.json({ artist })
})

router.get('/:id', (req, res) => {
  const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id)
  if (!artist) return res.status(404).json({ error: '歌手不存在' })

  const albums = db.prepare(`
    SELECT DISTINCT al.id, al.title, al.artist, al.year, al.song_count, al.has_cover
    FROM albums al
    JOIN songs s ON s.album = al.title
    WHERE s.artist LIKE ? OR s.album_artist LIKE ?
    ORDER BY al.year DESC
  `).all(`%${artist.name}%`, `%${artist.name}%`)

  const songs = db.prepare(`
    SELECT id, title, artist, album, duration, file_format, has_cover
    FROM songs WHERE artist LIKE ? OR album_artist LIKE ?
    ORDER BY year DESC, album, track_number
  `).all(`%${artist.name}%`, `%${artist.name}%`)

  res.json({ artist, albums, songs })
})

module.exports = router
