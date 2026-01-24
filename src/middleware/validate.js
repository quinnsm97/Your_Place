const ApiError = require('../utils/ApiError')

function validate(schema, location = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[location])
    if (!result.success) {
      return next(
        new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed', result.error.issues)
      )
    }
    req[location] = result.data
    return next()
  }
}

module.exports = validate
