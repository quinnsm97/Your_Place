const { findUserById } = require('../models/users.model')
const ApiError = require('../utils/ApiError')

async function getMe(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Not authenticated')
    }

    const user = await findUserById(userId)
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'User not found')
    }

    return res.json({ data: user })
  } catch (err) {
    next(err)
  }
}



module.exports = {
  getMe,
}