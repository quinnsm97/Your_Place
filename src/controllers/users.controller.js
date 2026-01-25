const { findUserById, updateUserById, deleteUserById, updateUserRoleById } = require('../models/users.model')
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
    return next(err)
  }
}

/**
 * Update the authenticated user's profile.
 * Body is validated by zod middleware before this runs.
 */
async function updateMe(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) throw new ApiError(401, 'UNAUTHORIZED', 'Not authenticated')

    const updated = await updateUserById(userId, {
      fullName: req.body.fullName,
      locale: req.body.locale,
    })

    // If updateUserById returns null, either user doesn't exist OR nothing to update.
    // Validation should prevent empty updates, so treat as user not found.
    if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found')

    return res.json({ data: updated })
  } catch (err) {
    return next(err)
  }
}

/**
 * Delete the authenticated user's account.
 */
async function deleteMe(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) throw new ApiError(401, 'UNAUTHORIZED', 'Not authenticated')

    const deleted = await deleteUserById(userId)
    if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'User not found')

    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
}

/**
 * Admin-only: update any user's role.
 * PATCH /users/:id/role
 */
async function updateUserRole(req, res, next) {
  try {
    const userId = Number(req.params.id)

    const updated = await updateUserRoleById(userId, req.body.role)
    if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found')

    return res.json({ data: updated })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  getMe,
  updateMe,
  deleteMe,
  updateUserRole,
}
