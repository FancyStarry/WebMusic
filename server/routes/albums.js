const express = require('express')
const db = require('../db')

const router = express.Router()

router.get('/', (req, res) => {
  const search = req.query.search || ''
  let where = ''
  let params = {}
  if (search) {
    where = 'WHERE title LIKE @search OR artist LIKE @search'
    params.search = `%${search}%`
  }

  const albums = db.prepare(`
    SELECT id, title, artist, year, song_count, has_cover
    FROM albums ${where}
    ORDER BY year DESC, title
  `).all(params)

  res.json({ albums })
})

router.get('/by-title/:title', (req, res) => {
  const album = db.prepare('SELECT id, title, artist FROM albums WHERE title = ?').get(req.params.title)
  if (!album) return res.status(404).json({ error: '专辑不存在' })
  res.json({ album })
})

router.get('/:id', (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id)
  if (!album) return res.status(404).json({ error: '专辑不存在' })

  const songs = db.prepare(`
    SELECT id, title, artist, duration, track_number, disc_number,
           file_format, has_cover, year
    FROM songs WHERE album = ?
    ORDER BY disc_number, track_number
  `).all(album.title)

  res.json({ album, songs })
})

router.get('/:id/cover', (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id)
  if (!album || !album.has_cover) return res.status(404).json({ error: '无封面' })

  const song = db.prepare('SELECT id FROM songs WHERE album = ? AND has_cover = 1 LIMIT 1').get(album.title)
  if (!song) return res.status(404).json({ error: '无封面' })

  res.redirect(`/api/music/${song.id}/cover`)
})

module.exports = router
