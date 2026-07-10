const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const db = require('./db')

function getSecret() {
  let row = db.prepare("SELECT value FROM config WHERE key = 'jwt_secret'").get()
  if (!row) {
    const secret = crypto.randomBytes(32).toString('hex')
    db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('jwt_secret', ?)").run(secret)
    return secret
  }
  return row.value
}

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, getSecret(), { expiresIn: '7d' })
}

function verifyToken(token) {
  return jwt.verify(token, getSecret())
}

module.exports = { signToken, verifyToken }
