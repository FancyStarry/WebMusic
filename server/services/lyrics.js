const db = require('../db')

const API_SEARCH = 'https://music.163.com/api/search/get'
const API_LYRIC = 'https://music.163.com/api/song/lyric'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

function parseLRC(lrcText) {
  if (!lrcText) return null
  const lines = lrcText.split('\n')
  const result = []
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match) {
      const m = parseInt(match[1])
      const s = parseInt(match[2])
      const ms = parseInt(match[3].padEnd(3, '0'))
      const text = match[4].trim()
      if (text) {
        result.push({ time: m * 60 + s + ms / 1000, text })
      }
    }
  }
  return result.length > 0 ? result : null
}

async function searchWithQuery(query, artist) {
  const res = await fetch(API_SEARCH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://music.163.com',
      'User-Agent': UA,
    },
    body: `s=${encodeURIComponent(query)}&offset=0&limit=10&type=1`,
    signal: AbortSignal.timeout(5000),
  })
  const data = await res.json()
  if (data.code !== 200 || !data.result?.songs?.length) return null

  const songs = data.result.songs
  const artistLower = (artist || '').toLowerCase()
  if (!artistLower) return songs[0].id

  // 精确匹配
  for (const song of songs) {
    const names = song.artists?.map(a => a.name.toLowerCase()) || []
    if (names.some(n => n === artistLower)) {
      return song.id
    }
  }

  // 子串匹配（原名包含搜索词 或 搜索词包含原名）
  for (const song of songs) {
    const names = song.artists?.map(a => a.name.toLowerCase()) || []
    if (names.some(n => n.includes(artistLower) || artistLower.includes(n))) {
      return song.id
    }
  }

  return songs[0].id
}

async function searchSong(title, artist) {
  const fullQuery = [title, artist].filter(Boolean).join(' ')
  let songId = await searchWithQuery(fullQuery, artist)
  if (songId) {
    console.log(`歌词搜索命中: "${fullQuery}" → ID ${songId}`)
    return songId
  }

  // 首次搜索无结果，尝试仅用标题
  if (artist) {
    songId = await searchWithQuery(title, artist)
    if (songId) {
      console.log(`歌词搜索降级: "${title}" → ID ${songId}`)
      return songId
    }
  }

  console.log(`歌词搜索无结果: "${fullQuery}"`)
  return null
}

async function fetchNeteaseLyrics(songId) {
  const url = `${API_LYRIC}?id=${songId}&lv=-1&kv=-1&tv=-1`
  const res = await fetch(url, {
    headers: { Referer: 'https://music.163.com', 'User-Agent': UA },
    signal: AbortSignal.timeout(5000),
  })
  const data = await res.json()
  if (data.code !== 200) return null

  const lrc = parseLRC(data.lrc?.lyric)
  const tlyric = parseLRC(data.tlyric?.lyric)
  if (!lrc) return null

  if (tlyric) {
    for (const line of lrc) {
      const match = tlyric.find(t => Math.abs(t.time - line.time) < 0.05)
      if (match) line.trans = match.text
    }
  }

  return lrc
}

function getCached(songId) {
  const row = db.prepare('SELECT lyric_data FROM lyrics WHERE song_id = ?').get(songId)
  if (!row) return undefined
  return JSON.parse(row.lyric_data)
}

function setCache(songId, lyrics, source) {
  db.prepare(`
    INSERT INTO lyrics (song_id, lyric_data, source, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(song_id) DO UPDATE SET
      lyric_data = excluded.lyric_data,
      source = excluded.source,
      updated_at = datetime('now')
  `).run(songId, JSON.stringify(lyrics), source)
}

async function getLyrics(songId, title, artist) {
  const cached = getCached(songId)
  if (cached !== undefined) return cached

  try {
    const neteaseId = await searchSong(title, artist)
    if (!neteaseId) {
      console.log(`歌词缓存跳过（无搜索结果）: ${title} - ${artist}`)
      return null
    }
    const lyrics = await fetchNeteaseLyrics(neteaseId)
    if (lyrics) {
      setCache(songId, lyrics, 'netease')
    } else {
      console.log(`歌词缓存跳过（网易云无歌词）: ${title} - ${artist}`)
    }
    return lyrics || null
  } catch (e) {
    console.error('获取歌词失败:', title, '-', e.message)
    return null
  }
}

module.exports = { getLyrics, parseLRC }
