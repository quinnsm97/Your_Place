const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')
const validate = require('../middleware/validate')
const {
  createEventSchema,
  updateEventSchema,
  idParamSchema,
  listQuerySchema,
} = require('../services/events.service')
const controller = require('../controllers/events.controller')

const router = express.Router()

router.get('/', validate(listQuerySchema, 'query'), controller.listEvents)
router.get('/:id', validate(idParamSchema, 'params'), controller.getEventById)

router.post(
  '/',
  requireAuth,
  requireRole('host'),
  validate(createEventSchema),
  controller.createEvent
)
router.patch(
  '/:id',
  requireAuth,
  requireRole('host'),
  validate(idParamSchema, 'params'),
  validate(updateEventSchema),
  controller.updateEvent
)
router.delete(
  '/:id',
  requireAuth,
  requireRole('host'),
  validate(idParamSchema, 'params'),
  controller.deleteEvent
)

module.exports = router
