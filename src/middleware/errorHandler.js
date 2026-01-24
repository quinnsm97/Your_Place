const ApiError = require('../utils/ApiError')

function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const isApiError = err instanceof ApiError

  const status = isApiError ? err.status : 500
  const code = isApiError ? err.code : 'SERVER_ERROR'
  const message = isApiError ? err.message : 'Something went wrong'

  // Basic mapping for common Postgres constraint errors (optional but handy)
  // unique_violation: 23505, foreign_key_violation: 23503, check_violation: 23514
  if (!isApiError && err?.code === '23505') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Duplicate value violates a unique constraint' },
    })
  }

  return res.status(status).json({
    error: {
      code,
      message,
      details: isApiError ? err.details : [],
    },
  })
}

module.exports = errorHandler
