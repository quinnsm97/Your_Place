// Verifies JWT tokens
// Attaches authenticated user to req object
// Blocks unauthorised access

const jwt = require('jsonwebtoken')

/**
 * Require a valid JWT for protected routes
 * Expects header: Authorization: Bearer <token>
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' })
  }

  const [, token] = authHeader.split(' ')

  if (!token) {
    return res.status(401).json({ message: 'Invalid authorization format' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = {
      id: decoded.id,
      role: decoded.role,
    }

    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

/**
 * Require a specific role for access
 * @param {string} role
 */
function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' })
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    return next()
  }
}

module.exports = {
  requireAuth,
  requireRole,
}
