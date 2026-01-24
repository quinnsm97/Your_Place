const express = require('express')
const { z } = require('zod')

const requireAuth = require('../middleware/requireAuth')
const validate = require('../middleware/validate')
const controller = require('../controllers/bookings.controller')
const {
  createBookingSchema,
  updateBookingSchema,
  listQuerySchema,
  idSchema,
} = require('../services/bookings.service')

const router = express.Router()
const idParamSchema = z.object({ id: idSchema })

router.use(requireAuth)

router.post('/', validate(createBookingSchema), controller.createBooking)
router.get('/', validate(listQuerySchema, 'query'), controller.listBookings)
router.get('/:id', validate(idParamSchema, 'params'), controller.getBookingById)
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateBookingSchema),
  controller.updateBooking
)
router.delete('/:id', validate(idParamSchema, 'params'), controller.deleteBooking)

module.exports = router
