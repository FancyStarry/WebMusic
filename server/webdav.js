const { createClient } = require('webdav')
const db = require('./db')

const clients = new Map()

function loadSources() {
  try {
    const row = db.prepare("SELECT value FROM config WHERE key = 'webdav_sources'").get()
    return row ? JSON.parse(row.value) : []
  } catch {
    return []
  }
}

function saveSources(sources) {
  db.prepare("UPDATE config SET value = ? WHERE key = 'webdav_sources'").run(JSON.stringify(sources))
}

function getClient(sourceId) {
  if (clients.has(sourceId)) return clients.get(sourceId)

  const sources = loadSources()
  const source = sources.find(s => s.id === sourceId)
  if (!source) throw new Error(`WebDAV 源未找到: ${sourceId}`)

  const client = createClient(source.url, {
    username: source.username,
    password: source.password,
  })
  clients.set(sourceId, client)
  return client
}

function getSourceById(sourceId) {
  const sources = loadSources()
  return sources.find(s => s.id === sourceId)
}

function clearClientCache() {
  clients.clear()
}

function getSourcePath(sourceId) {
  const source = getSourceById(sourceId)
  return source ? source.path || '/' : '/'
}

async function listFilesRecursive(client, remotePath) {
  const files = []
  const entries = await client.getDirectoryContents(remotePath)

  for (const item of entries) {
    if (item.type === 'directory') {
      const subFiles = await listFilesRecursive(client, item.filename)
      files.push(...subFiles)
    } else {
      files.push({
        path: item.filename,
        size: item.size,
        lastmod: item.lastmod,
      })
    }
  }

  return files
}

async function stat(client, remotePath) {
  return client.stat(remotePath)
}

function createReadStream(sourceId, remotePath, range) {
  const client = getClient(sourceId)
  return client.createReadStream(remotePath, range ? { range } : undefined)
}

module.exports = {
  loadSources,
  saveSources,
  getClient,
  getSourceById,
  clearClientCache,
  getSourcePath,
  listFilesRecursive,
  stat,
  createReadStream,
}
