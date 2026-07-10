const express = require('express')
const path = require('path')
const fs = require('fs')
const db = require('../db')
const config = require('../config')
const webdav = require('../webdav')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = Math.min(parseInt(req.query.pageSize) || 50, 200)
  const search = req.query.search || ''
  const sort = req.query.sort || 'created_at'
  const order = req.query.order || 'DESC'
  const offset = (page - 1) * pageSize

  let where = ''
  let params = {}
  if (search) {
    where = 'WHERE title LIKE @search OR artist LIKE @search OR album LIKE @search'
    params.search = `%${search}%`
  }

  const allowedSort = ['title', 'artist', 'album', 'duration', 'year', 'created_at']
  const sortCol = allowedSort.includes(sort) ? sort : 'created_at'
  const sortOrder = order === 'ASC' ? 'ASC' : 'DESC'

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM songs ${where}`)
  const { total } = countStmt.get(params)

  const dataStmt = db.prepare(`
    SELECT id, title, artist, album, duration, file_format, has_cover,
           track_number, year, file_size
    FROM songs ${where}
    ORDER BY ${sortCol} ${sortOrder}
    LIMIT @limit OFFSET @offset
  `)
  const songs = dataStmt.all({ ...params, limit: pageSize, offset })

  res.json({ songs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
})

router.get('/:id', (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id)
  if (!song) return res.status(404).json({ error: '歌曲不存在' })

  const albumSongs = db.prepare(`
    SELECT id, title, artist, duration, track_number, file_format
    FROM songs WHERE album = ? ORDER BY disc_number, track_number
  `).all(song.album)

  res.json({ song, albumSongs })
})

router.get('/:id/stream', (req, res) => {
  const song = db.prepare('SELECT file_path, file_format FROM songs WHERE id = ?').get(req.params.id)
  if (!song) return res.status(404).json({ error: '歌曲不存在' })

  const range = req.headers.range

  const mimeMap = {
    mp3: 'audio/mpeg',
    flac: 'audio/flac',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    wma: 'audio/x-ms-wma',
    aac: 'audio/aac',
    opus: 'audio/ogg',
  }
  const contentType = mimeMap[song.file_format] || 'audio/mpeg'

  if (song.file_path.startsWith('webdav://')) {
    const parts = song.file_path.replace('webdav://', '').split('/')
    const sourceId = parts[0]
    const remotePath = '/' + parts.slice(1).join('/')

    const source = webdav.getSourceById(sourceId)
    if (!source) return res.status(404).json({ error: 'WebDAV 源未找到' })

    if (range) {
      const rangeParts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(rangeParts[0], 10)
      const end = rangeParts[1] ? parseInt(rangeParts[1], 10) : undefined

      const stream = webdav.createReadStream(sourceId, remotePath, { start, end })
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end || ''}/*`,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
      })
      stream.pipe(res)
      stream.on('error', () => res.status(500).end())
    } else {
      const stream = webdav.createReadStream(sourceId, remotePath)
      res.writeHead(200, {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      })
      stream.pipe(res)
      stream.on('error', () => res.status(500).end())
    }
    return
  }

  const filePath = song.file_path
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' })
  }

  const stat = fs.statSync(filePath)
  const fileSize = stat.size

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunkSize = end - start + 1

    const stream = fs.createReadStream(filePath, { start, end })
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    })
    stream.pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    })
    fs.createReadStream(filePath).pipe(res)
  }
})

router.get('/:id/cover', (req, res) => {
  const song = db.prepare('SELECT has_cover FROM songs WHERE id = ?').get(req.params.id)
  if (!song || !song.has_cover) return res.status(404).json({ error: '无封面' })

  const coverPath = path.join(config.coverCacheDir, `${req.params.id}.jpg`)
  if (fs.existsSync(coverPath)) {
    res.sendFile(coverPath)
  } else {
    res.status(404).json({ error: '封面文件不存在' })
  }
})

router.delete('/all', requireAuth, (req, res) => {
  const coverDir = config.coverCacheDir
  if (fs.existsSync(coverDir)) {
    const files = fs.readdirSync(coverDir).filter(f => f.endsWith('.jpg'))
    for (const file of files) {
      fs.unlinkSync(path.join(coverDir, file))
    }
  }
  db.exec('DELETE FROM songs')
  db.exec('DELETE FROM albums')
  db.exec('DELETE FROM artists')
  console.log('已清空全部音乐数据')
  res.json({ success: true })
})

module.exports = router
