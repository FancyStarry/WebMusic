const path = require('path')
const fs = require('fs')

const rootDir = path.resolve(__dirname, '..')
const configPath = path.join(rootDir, 'config.json')

const defaults = {
  host: '0.0.0.0',
  port: 3000,
  musicDirs: [],
  ssl: { enabled: false, cert: './ssl/cert.pem', key: './ssl/key.pem' },
}

let userConfig = {}
if (fs.existsSync(configPath)) {
  try {
    userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch (e) {
    console.error('[配置] config.json 解析失败:', e.message)
  }
}

const dataDir = path.join(rootDir, 'server', 'data')

const config = { ...defaults, ...userConfig }
config.dbPath = path.join(dataDir, 'music.db')
config.coverCacheDir = dataDir
config.ssl = { ...defaults.ssl, ...(userConfig.ssl || {}) }
config.rootDir = rootDir

module.exports = config
