const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')
const validate = require('../middleware/validate')
const { getMe, updateMe, deleteMe, updateUserRole } = require('../controllers/users.controller')
const { updateMeSchema, idParamSchema, updateUserRoleSchema } = require('../services/users.service')

const router = express.Router()

router.get('/me', requireAuth, getMe)

// Update own profile fields
router.patch('/me', requireAuth, validate(updateMeSchema), updateMe)

// Delete own account
router.delete('/me', requireAuth, deleteMe)

// Admin-only: promote/demote user roles (e.g., enable a host)
router.patch(
  '/:id/role',
  requireAuth,
  requireRole('admin'),
  validate(idParamSchema, 'params'),
  validate(updateUserRoleSchema),
  updateUserRole
)

module.exports = router
