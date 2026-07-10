const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const config = require('./config')
const musicRouter = require('./routes/music')
const albumsRouter = require('./routes/albums')
const artistsRouter = require('./routes/artists')
const playlistsRouter = require('./routes/playlists')
const scanRouter = require('./routes/scan')
const configRouter = require('./routes/config')
const lyricsRouter = require('./routes/lyrics')
const authRouter = require('./routes/auth')
const { requireAuth } = require('./middleware/auth')

const app = express()

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
}
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/music', musicRouter)
app.use('/api/albums', albumsRouter)
app.use('/api/artists', artistsRouter)
app.use('/api/playlists', playlistsRouter)
app.use('/api/config', requireAuth, configRouter)
app.use('/api/scan', requireAuth, scanRouter)
app.use('/api/lyrics', lyricsRouter)

const clientDist = path.join(__dirname, '..', 'client', 'dist')
app.use(express.static(clientDist))
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'))
  }
})

function startServer(server, protocol) {
  server.listen(config.port, config.host, () => {
    console.log(`🎵 WebMusic 服务已启动: ${protocol}://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`)
  })
}

if (config.ssl.enabled) {
  const certPath = path.resolve(config.rootDir, config.ssl.cert)
  const keyPath = path.resolve(config.rootDir, config.ssl.key)

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const httpsOptions = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    }
    startServer(https.createServer(httpsOptions, app), 'https')
  } else {
    console.warn('[SSL] 证书文件不存在，回退到 HTTP')
    console.warn(`  cert: ${certPath}`)
    console.warn(`  key:  ${keyPath}`)
    startServer(http.createServer(app), 'http')
  }
} else {
  startServer(http.createServer(app), 'http')
}
