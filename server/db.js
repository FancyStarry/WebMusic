const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')
const config = require('./config')

const dbDir = path.dirname(config.dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(config.dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT DEFAULT '',
      album TEXT DEFAULT '',
      album_artist TEXT DEFAULT '',
      track_number INTEGER DEFAULT 0,
      disc_number INTEGER DEFAULT 1,
      year INTEGER DEFAULT 0,
      genre TEXT DEFAULT '',
      duration REAL DEFAULT 0,
      bitrate INTEGER DEFAULT 0,
      sample_rate INTEGER DEFAULT 0,
      file_path TEXT UNIQUE NOT NULL,
      file_size INTEGER DEFAULT 0,
      file_format TEXT DEFAULT '',
      has_cover INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT DEFAULT '',
      year INTEGER DEFAULT 0,
      song_count INTEGER DEFAULT 0,
      has_cover INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      song_count INTEGER DEFAULT 0,
      album_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlist_songs (
      playlist_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      PRIMARY KEY (playlist_id, song_id),
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lyrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_id INTEGER NOT NULL UNIQUE,
      lyric_data TEXT,
      source TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    INSERT OR IGNORE INTO config (key, value) VALUES ('music_dirs', '[]');
    INSERT OR IGNORE INTO config (key, value) VALUES ('webdav_sources', '[]');

    CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
    CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album);
    CREATE INDEX IF NOT EXISTS idx_songs_file_path ON songs(file_path);
  `)

  // 兼容旧数据库：添加缺失的列和索引
  try { db.exec("ALTER TABLE songs ADD COLUMN source TEXT DEFAULT 'local'") } catch {}
  try { db.exec("CREATE INDEX IF NOT EXISTS idx_songs_source ON songs(source)") } catch {}
  try { db.exec("ALTER TABLE lyrics ADD COLUMN source TEXT DEFAULT ''") } catch {}
  // 清除之前失败的歌词缓存
  try { db.exec("DELETE FROM lyrics WHERE lyric_data = 'null'") } catch {}


module.exports = db
