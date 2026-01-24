/**
 * TEMP STUB:
 * Replaced by real JWT middleware later.
 * This is only to unblock feature development.
 */
function requireAuth(req, res, next) {
  req.user = { id: 1, role: 'host' }
  next()
}

module.exports = requireAuth
