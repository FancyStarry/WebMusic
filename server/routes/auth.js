const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db')
const { signToken, verifyToken } = require('../auth')

const router = express.Router()

router.post('/setup', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  if (userCount > 0) {
    return res.status(400).json({ error: '管理员已存在，不能重复初始化' })
  }
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度不能少于6位' })
  }
  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash)
  const user = { id: result.lastInsertRowid, username }
  const token = signToken(user)
  res.json({ token, user })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }
  const token = signToken(user)
  res.json({ token, user: { id: user.id, username: user.username } })
})

router.get('/status', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  const setupRequired = userCount === 0
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.slice(7))
      return res.json({ loggedIn: true, setupRequired, user: { id: payload.id, username: payload.username } })
    } catch {}
  }
  res.json({ loggedIn: false, setupRequired, user: null })
})

module.exports = router
