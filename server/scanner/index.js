const { glob } = require('glob')
const path = require('path')
const fs = require('fs')
const mm = require('music-metadata')
const db = require('../db')
const webdav = require('../webdav')

const supportedFormats = ['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.wma', '.aac', '.opus']

function isSupported(file) {
  return supportedFormats.includes(path.extname(file).toLowerCase())
}

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

async function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`[扫描] 目录不存在，跳过: ${dirPath}`)
    return { total: 0, added: 0, updated: 0, files: [] }
  }

  const files = await glob(`${dirPath.replace(/\\/g, '/')}/**/*`, { nodir: true, follow: false })
  const musicFiles = files.filter(isSupported).map(f => path.resolve(f))
  let added = 0, updated = 0

  for (const filePath of musicFiles) {
    try {
      const normalizedPath = path.resolve(filePath)
      const existing = db.prepare('SELECT id FROM songs WHERE file_path = ?').get(normalizedPath)
      const stat = fs.statSync(normalizedPath)
      const metadata = await mm.parseFile(normalizedPath, { duration: true, skipCovers: false })

      const common = metadata.common
      const format = metadata.format

      const song = {
        title: common.title || path.basename(normalizedPath, path.extname(normalizedPath)),
        artist: common.artist || '未知艺术家',
        album: common.album || '未知专辑',
        album_artist: common.albumartist || '',
        track_number: common.track?.no || 0,
        disc_number: common.disc?.no || 1,
        year: common.year || 0,
        genre: (common.genre && common.genre[0]) || '',
        duration: format.duration || 0,
        bitrate: format.bitrate || 0,
        sample_rate: format.sampleRate || 0,
        file_path: normalizedPath,
        file_size: stat.size,
        file_format: path.extname(normalizedPath).slice(1),
        has_cover: common.picture ? 1 : 0,
        source: 'local',
      }

      if (existing) {
        const stmt = db.prepare(`
          UPDATE songs SET
            title=@title, artist=@artist, album=@album,
            album_artist=@album_artist, track_number=@track_number,
            disc_number=@disc_number, year=@year, genre=@genre,
            duration=@duration, bitrate=@bitrate, sample_rate=@sample_rate,
            file_size=@file_size, has_cover=@has_cover
          WHERE id=@id
        `)
        stmt.run({ ...song, id: existing.id })
        updated++
      } else {
        const stmt = db.prepare(`
          INSERT INTO songs (title, artist, album, album_artist, track_number,
            disc_number, year, genre, duration, bitrate, sample_rate,
            file_path, file_size, file_format, has_cover, source)
          VALUES (@title, @artist, @album, @album_artist, @track_number,
            @disc_number, @year, @genre, @duration, @bitrate, @sample_rate,
            @file_path, @file_size, @file_format, @has_cover, @source)
        `)
        stmt.run(song)
        added++
      }

      if (common.picture && common.picture[0]) {
        saveCover(normalizedPath, common.picture[0])
      }
    } catch (err) {
      console.error(`[扫描] 解析失败: ${filePath}`, err.message)
    }
  }

  return { total: musicFiles.length, added, updated, files: musicFiles }
}

async function scanWebDAVSource(source) {
  const client = webdav.getClient(source.id)
  const rootPath = source.path || '/'
  let added = 0, updated = 0
  const allFiles = []

  console.log(`[扫描] 开始扫描 WebDAV: ${source.name} (${source.url})`)

  try {
    const entries = await webdav.listFilesRecursive(client, rootPath)
    const musicFiles = entries.filter(e => isSupported(e.path))
    allFiles.push(...musicFiles.map(f => `webdav://${source.id}${f.path}`))

    for (const file of musicFiles) {
      try {
        const filePath = `webdav://${source.id}${file.path}`
        const existing = db.prepare('SELECT id FROM songs WHERE file_path = ?').get(filePath)
        const ext = path.extname(file.path).slice(1)
        const mime = mimeMap[ext] || 'audio/mpeg'

        const stream = webdav.createReadStream(source.id, file.path)
        const metadata = await mm.parseStream(stream, mime, { duration: true, skipCovers: false })

        const common = metadata.common
        const format = metadata.format

        const song = {
          title: common.title || path.basename(file.path, path.extname(file.path)),
          artist: common.artist || '未知艺术家',
          album: common.album || '未知专辑',
          album_artist: common.albumartist || '',
          track_number: common.track?.no || 0,
          disc_number: common.disc?.no || 1,
          year: common.year || 0,
          genre: (common.genre && common.genre[0]) || '',
          duration: format.duration || 0,
          bitrate: format.bitrate || 0,
          sample_rate: format.sampleRate || 0,
          file_path: filePath,
          file_size: file.size || 0,
          file_format: ext,
          has_cover: common.picture ? 1 : 0,
          source: 'webdav',
        }

        if (existing) {
          const stmt = db.prepare(`
            UPDATE songs SET
              title=@title, artist=@artist, album=@album,
              album_artist=@album_artist, track_number=@track_number,
              disc_number=@disc_number, year=@year, genre=@genre,
              duration=@duration, bitrate=@bitrate, sample_rate=@sample_rate,
              file_size=@file_size, has_cover=@has_cover
            WHERE id=@id
          `)
          stmt.run({ ...song, id: existing.id })
          updated++
        } else {
          const stmt = db.prepare(`
            INSERT INTO songs (title, artist, album, album_artist, track_number,
              disc_number, year, genre, duration, bitrate, sample_rate,
              file_path, file_size, file_format, has_cover, source)
            VALUES (@title, @artist, @album, @album_artist, @track_number,
              @disc_number, @year, @genre, @duration, @bitrate, @sample_rate,
              @file_path, @file_size, @file_format, @has_cover, @source)
          `)
          stmt.run(song)
          added++
        }

        if (common.picture && common.picture[0]) {
          saveCover(filePath, common.picture[0])
        }
      } catch (err) {
        console.error(`[扫描] WebDAV 解析失败: ${file.path}`, err.message)
      }
    }
  } catch (err) {
    console.error(`[扫描] WebDAV 连接失败: ${source.name}`, err.message)
  }

  return { total: allFiles.length, added, updated, files: allFiles }
}

function saveCover(filePath, picture) {
  const song = db.prepare('SELECT id FROM songs WHERE file_path = ?').get(filePath)
  if (!song) return

  const coverDir = require('../config').coverCacheDir
  if (!fs.existsSync(coverDir)) {
    fs.mkdirSync(coverDir, { recursive: true })
  }

  const coverPath = path.join(coverDir, `${song.id}.jpg`)
  const data = picture.data
  if (Buffer.isBuffer(data)) {
    fs.writeFileSync(coverPath, data)
  } else {
    fs.writeFileSync(coverPath, Buffer.from(data))
  }
}

function rebuildAggregates() {
  db.exec(`
    DELETE FROM albums;
    INSERT INTO albums (title, artist, year, song_count, has_cover)
    SELECT album, COALESCE(album_artist, artist) as artist,
           MAX(year) as year, COUNT(*) as song_count,
           MAX(has_cover) as has_cover
    FROM songs GROUP BY album;
  `)

  const rows = db.prepare("SELECT artist, album FROM songs").all()
  const artistMap = new Map()
  for (const row of rows) {
    const names = row.artist.split('/').map(s => s.trim()).filter(Boolean)
    for (const name of names) {
      if (!artistMap.has(name)) {
        artistMap.set(name, { songCount: 0, albums: new Set() })
      }
      const entry = artistMap.get(name)
      entry.songCount++
      entry.albums.add(row.album)
    }
  }

  db.prepare("DELETE FROM artists").run()
  const insert = db.prepare("INSERT INTO artists (name, song_count, album_count) VALUES (?, ?, ?)")
  for (const [name, data] of artistMap) {
    insert.run(name, data.songCount, data.albums.size)
  }
}

function removeStaleEntries(localFiles, webdavFiles) {
  const localSet = new Set(localFiles.map(f => path.resolve(f)))
  const webdavSet = new Set(webdavFiles)
  const allSongs = db.prepare('SELECT id, file_path, source FROM songs').all()
  for (const song of allSongs) {
    if (song.source === 'webdav') {
      if (!webdavSet.has(song.file_path)) {
        db.prepare('DELETE FROM songs WHERE id = ?').run(song.id)
      }
    } else {
      if (!localSet.has(path.resolve(song.file_path))) {
        db.prepare('DELETE FROM songs WHERE id = ?').run(song.id)
      }
    }
  }
}

let scanning = false
let scanProgress = { total: 0, current: 0, status: 'idle' }

async function startScan(dirs) {
  if (scanning) return { error: '扫描中，请稍候' }
  scanning = true
  scanProgress = { total: 0, current: 0, status: 'scanning' }

  const targetDirs = dirs || require('../config').musicDirs
  let totalAdded = 0, totalUpdated = 0, totalFiles = 0
  const allLocalFiles = []
  const allWebDAVFiles = []

  for (const dir of targetDirs) {
    const result = await scanDirectory(dir)
    totalAdded += result.added
    totalUpdated += result.updated
    totalFiles += result.total
    allLocalFiles.push(...result.files)
  }

  const sources = webdav.loadSources()
  for (const source of sources) {
    if (source.enabled === false) continue
    const result = await scanWebDAVSource(source)
    totalAdded += result.added
    totalUpdated += result.updated
    totalFiles += result.total
    allWebDAVFiles.push(...result.files)
  }

  rebuildAggregates()
  removeStaleEntries(allLocalFiles, allWebDAVFiles)

  scanning = false
  scanProgress = { total: totalFiles, current: totalFiles, status: 'done' }
  return { total: totalFiles, added: totalAdded, updated: totalUpdated }
}

function getScanStatus() {
  return { scanning, ...scanProgress }
}

module.exports = { startScan, getScanStatus }
