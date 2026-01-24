const ApiError = require('../utils/ApiError')

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError

  if (!isApiError && err?.code === '23505') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Duplicate value violates a unique constraint' },
    })
  }

  if (!isApiError && err && err.code === '23503') {
    return res.status(409).json({
      error: { code: 'FK_CONFLICT', message: 'Operation violates a foreign key constraint' },
    })
  }

  const status = isApiError ? err.status : 500
  const code = isApiError ? err.code : 'SERVER_ERROR'
  const message = isApiError ? err.message : 'Something went wrong'

  const payload = {
    error: {
      code,
      message,
      details: isApiError ? err.details : [],
    },
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.error.debug = {
      name: err && err.name,
      pgCode: err && err.code,
    }
  }

  return res.status(status).json(payload)
}

module.exports = errorHandler
