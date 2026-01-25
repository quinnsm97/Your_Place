const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')

/**
 * Require JWT auth header (Authorization: Bearer <token>).
 * Sets req.user = { id, role } from decoded token.
 */
function requireAuth(req, res, next) {
  const auth = req.headers.authorization

  if (!auth || !auth.startsWith('Bearer ')) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header'))
  }

  const token = auth.slice(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: decoded.id, role: decoded.role }
    return next()
  } catch (err) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token'))
  }
}

module.exports = requireAuth
