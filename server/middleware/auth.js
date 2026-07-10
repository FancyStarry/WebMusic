const { verifyToken } = require('../auth')

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录', code: 'UNAUTHORIZED' })
  }
  try {
    req.user = verifyToken(authHeader.slice(7))
    next()
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录', code: 'TOKEN_EXPIRED' })
  }
}

module.exports = { requireAuth }
