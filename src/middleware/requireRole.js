const ApiError = require('../utils/ApiError')

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'UNAUTHORIZED', 'Missing authentication'))
    if (req.user.role !== role) {
      return next(
        new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action')
      )
    }
    return next()
  }
}

module.exports = requireRole
