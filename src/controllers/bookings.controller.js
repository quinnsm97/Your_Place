const bookingService = require('../services/bookings.service')
/**
 * Create a new booking
 */
const createBooking = async (req, res, next) => {
  try {
    // Validate request body with Zod
    const payload = bookingService.createBookingSchema.parse(req.body)
    
    // Create booking with service layer
    const booking = await bookingService.createBooking(payload)

    return res.status(201).json(booking)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all bookings
 */
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.listBookings()
    return res.status(200).json(bookings)
  } catch (error) {
    next(error)
  }
}

/**
 * Get a particular booking by ID
 */
const getBookingById = async (req, res, next) => {
  try {
    // Validate ID
    const { id } = bookingService.idParamSchema.parse(req.params)

    const booking = await bookingService.getBookingById(id)
    return res.status(200).json(booking)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all bookings for a specific user
 */
const getBookingsByUserId = async (req, res, next) => {
  try {
    // Validate user ID
    const { userId } = bookingService.userIdParamSchema.parse(req.params)

    const bookings = await bookingService.getBookingsByUserId(userId)
    return res.status(200).json(bookings)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all bookings for a specific event
 */
const getBookingsByEventId = async (req, res, next) => {
  try {
    // Validate event ID
    const { eventId } = bookingService.eventIdParamSchema.parse(req.params)

    const bookings = await bookingService.getBookingsByEventId(eventId)
    return res.status(200).json(bookings)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all bookings for a specific space
 */
const getBookingsBySpaceId = async (req, res, next) => {
  try {
    // Validate space ID
    const { spaceId } = bookingService.spaceIdParamSchema.parse(req.params)

    const bookings = await bookingService.getBookingsBySpaceId(spaceId)
    return res.status(200).json(bookings)
  } catch (error) {
    next(error)
  }
}

/**
 * Update an existing booking
 * Only the owner of the booking (user who booked) can update their booking
 */
const updateBooking = async (req, res, next) => {
  try {
    // Validate ID
    const { id } = bookingService.idParamSchema.parse(req.params)
    
    // Validate update payload
    const payload = bookingService.updateBookingSchema.parse(req.body)
    
    // Get user ID from authenticated user
    const userId = req.body.userId || req.user?.id
    
    const booking = await bookingService.updateBooking(userId, id, payload)
    return res.status(200).json(booking)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a booking
 * Only the owner of the booking (user who booked) can delete their booking
 */
const deleteBooking = async (req, res, next) => {
  try {
    // Validate ID
    const { id } = bookingService.idParamSchema.parse(req.params)
    
    // Get user ID from authenticated user
    const userId = req.body.userId || req.user?.id
    
    await bookingService.deleteBooking(userId, id)
    return res.status(200).json({ message: 'Booking successfully deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  getBookingsByEventId,
  getBookingsBySpaceId,
  updateBooking,
  deleteBooking,
}
