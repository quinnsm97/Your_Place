const { z } = require('zod')
const ApiError = require('../utils/ApiError')
const model = require('../models/bookings.model')

const idSchema = z
  .string()
  .regex(/^\d+$/)
  .transform((v) => Number(v))

const createBookingSchema = z
  .object({
    eventId: z.number().int().positive().optional(),
    spaceId: z.number().int().positive().optional(),
    quantity: z.number().int().positive(),
    totalPrice: z.number().nonnegative(),
    paymentStatus: z.string().min(1).max(50).optional(),
  })
  .refine((v) => (v.eventId && !v.spaceId) || (!v.eventId && v.spaceId), {
    message: 'Must provide either eventId OR spaceId (cannot be both)',
    path: ['eventId'],
  })

const updateBookingSchema = z.object({
  quantity: z.number().int().positive().optional(),
  totalPrice: z.number().nonnegative().optional(),
  paymentStatus: z.string().min(1).max(50).optional(),
})

const listQuerySchema = z.object({
  scope: z.enum(['mine', 'host']).optional(),
})

async function createBooking(userId, payload) {
  const booking = await model.createBooking(
    payload.eventId ?? null,
    payload.spaceId ?? null,
    userId,
    payload.quantity,
    payload.totalPrice,
    payload.paymentStatus ?? 'pending'
  )
  return booking
}

async function listBookings(user, query) {
  const scope = query.scope ?? 'mine'

  if (scope === 'mine') {
    return model.getBookingsForUser(user.id)
  }

  if (user.role !== 'host') {
    throw new ApiError(403, 'FORBIDDEN', 'Only hosts can view host bookings')
  }

  return model.getBookingsForHost(user.id)
}

async function getBookingById(user, bookingId) {
  const booking = await model.getBookingById(bookingId)
  if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found')

  if (booking.user_id === user.id) return booking

  if (user.role === 'host') {
    const owns = await model.hostOwnsBooking(user.id, bookingId)
    if (owns) return booking
  }

  throw new ApiError(403, 'FORBIDDEN', 'You do not have access to this booking')
}

async function updateBooking(user, bookingId, payload) {
  const existing = await getBookingById(user, bookingId)

  if (user.role === 'host' && existing.user_id !== user.id) {
    const allowed = {}
    if (payload.paymentStatus) allowed.paymentStatus = payload.paymentStatus
    if (Object.keys(allowed).length === 0) {
      throw new ApiError(403, 'FORBIDDEN', 'Hosts can only update paymentStatus')
    }
    payload = allowed
  }

  const quantity = payload.quantity ?? existing.quantity
  const totalPrice = payload.totalPrice ?? Number(existing.total_price)
  const paymentStatus = payload.paymentStatus ?? existing.payment_status

  const updated = await model.updateBooking(bookingId, quantity, totalPrice, paymentStatus)
  return updated
}

async function deleteBooking(user, bookingId) {
  await getBookingById(user, bookingId)
  await model.deleteBooking(bookingId)
}

module.exports = {
  idSchema,
  createBookingSchema,
  updateBookingSchema,
  listQuerySchema,
  createBooking,
  listBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
}
