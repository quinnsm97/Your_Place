const { z } = require('zod')
const ApiError = require('../utils/ApiError')
const model = require('../models/bookings.model')
const { getEventById } = require('../models/events.model')
const { getSpaceById }= require('../models/spaces.model')

// Schema for validating booking ID parameter
const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

// Schema for validating user/event/space ID parameters
const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
})

const eventIdParamSchema = z.object({
  eventId: z.coerce.number().int().positive(),
})

const spaceIdParamSchema = z.object({
  spaceId: z.coerce.number().int().positive(),
})

// Booking schema with all fields
const baseBookingSchema = z
  .object({
    event_id: z.coerce.number().int().positive().optional(),
    space_id: z.coerce.number().int().positive().optional(),
    user_id: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().min(1),
    total_price: z.coerce.number().min(0),
    payment_status: z.string().min(1).max(50).optional().default('pending'),
  })
  .refine((data) => (data.event_id && !data.space_id) || (!data.event_id && data.space_id), {
    message: 'Must provide either event_id or space_id (not both)',
    path: ['event_id'],
  })

// Schema for creating a new booking
const createBookingSchema = baseBookingSchema

// Schema for updating an existing booking
const updateBookingSchema = z
  .object({
    quantity: z.coerce.number().int().min(1).optional(),
    total_price: z.coerce.number().min(1).max(50).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided to update the booking',
  })

/**
 * Get all bookings (option to filter)
 */
async function listBookings() {
  return model.getAllBookings()
}

/**
 * Get a specific booking by its ID
 */
async function getBookingById(bookingId) {
  const booking = await model.getBookingById(bookingId)
  if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found')
  return booking
}

/**
 * Get all bookings for specific user
 */
async function getBookingsByUserId(userId) {
  return model.getBookingsByUserId(userId)
}

/**
 * Get all bookings for specific event
 */
async function getBookingsByEventId(eventId) {
  return model.getBookingsByEventId(eventId)
}

/**
 * Get all bookings for specific space
 */
async function getBookingsBySpaceId(spaceId) {
  return model.getBookingsBySpaceId(spaceId)
}

/**
 * Create a new booking
 * Validates the event/space exists and has a capacity
 */
async function createBooking(payload) {
  if (payload.event_id) {
    console.log('🔍 Looking for event ID:', payload.event_id)
    const event = await getEventById(payload.event_id)
    console.log('🔍 Event found:', event)
    if (!event) throw new ApiError(404, 'NOT_FOUND', 'Event not found')
    
    if (event.capacity < payload.quantity) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Not enough capacity available')
    }
  }

  if (payload.space_id) {
    const space = await getSpaceById(payload.space_id)
    if (!space) throw new ApiError(404, 'NOT_FOUND', 'Space not found')

    if (space.capacity < payload.quantity) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Not enough capacity available')
    }
  }

  return model.createBooking(
    payload.event_id || null,
    payload.space_id || null,
    payload.user_id,
    payload.quantity,
    payload.total_price,
    payload.payment_status || 'pending'
  )
}

/**
 * Update an existing booking
 * Only the owner of the booking (user who booked) can update their booking
 */
async function updateBooking(userId, bookingId, payload) {
  const booking = await model.getBookingById(bookingId)
  if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found')

  if (booking.user_id !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'Not your booking')
  }

  return model.updateBooking(
    bookingId,
    payload.quantity,
    payload.total_price,
    payload.payment_status
  )
}

/**
 * Delete a booking
 * Only the owner of the booking (user who booked) can delete their booking
 */
async function deleteBooking(userId, bookingId) {
  const booking = await model.getBookingById(bookingId)
  if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found')

  if (booking.user_id !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'Not your booking')
  }

  await model.deleteBooking(bookingId)
}

module.exports = {
  idParamSchema,
  userIdParamSchema,
  eventIdParamSchema,
  spaceIdParamSchema,
  createBookingSchema,
  updateBookingSchema,
  listBookings,
  getBookingById,
  getBookingsByUserId,
  getBookingsByEventId,
  getBookingsBySpaceId,
  createBooking,
  updateBooking,
  deleteBooking,
}
