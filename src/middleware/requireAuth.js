const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Missing or invalid token'))
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.id, role: payload.role }
    next()
  } catch (err) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token'))
  }
}

module.exports = requireAuth