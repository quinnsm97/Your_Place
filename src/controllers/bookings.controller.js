const bookingModel = require('../models/Booking')

const createBooking = async (req, res) => {
  try {
    const { eventId, spaceId, userId, quantity, totalPrice, paymentStatus } = req.body

    // Validation that either eventId or spaceId provided (cannot be both)
    if ((!eventId && !spaceId) || (eventId && spaceId)) {
      return res.status(400).json({
        error: 'Must provide either eventId OR spaceId (cannot be both)',
      })
    }

    if (!userId || !quantity || !totalPrice) {
      return res.status(400).json({
        error: 'Required fields missing',
      })
    }

    const booking = await bookingModel.createBooking(
      eventId || null,
      spaceId || null,
      userId,
      quantity,
      totalPrice,
      paymentStatus || 'pending'
    )
    return res.status(201).json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    return res.status(500).json({ error: 'Booking creation failed' })
  }
}

const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.getAllBookings()
    return res.status(200).json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return res.status(500).json({ error: 'Fetch bookings failed' })
  }
}

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params
    const booking = await bookingModel.getBookingById(id)

    //
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    return res.status(200).json(booking)
  } catch (error) {
    console.error('Error fetching bookings', error)
    return res.status(500).json({ error: 'Fetch bookings failed' })
  }
}

const getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params
    const bookings = await bookingModel.getBookingsByUserId(userId)
    return res.status(200).json(bookings)
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return res.status(500).json({ error: 'Failed to fetch user bookings' })
  }
}

const getBookingsByEventId = async (req, res) => {
  try {
    const { eventId } = req.params
    const bookings = await bookingModel.getBookingsByEventId(eventId)
    return res.status(200).json(bookings)
  } catch (error) {
    console.error('Error fetching event bookings:', error)
    return res.status(500).json({ error: 'Failed to fetch event bookings' })
  }
}

const getBookingsBySpaceId = async (req, res) => {
  try {
    const { spaceId } = req.params
    const bookings = await bookingModel.getBookingsBySpaceId(spaceId)
    return res.status(200).json(bookings)
  } catch (error) {
    console.error('Error fetching space bookings:', error)
    return res.status(500).json({ error: 'Failed to fetch space bookings' })
  }
}

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params
    const { quantity, totalPrice, paymentStatus } = req.body
    const booking = await bookingModel.updateBooking(id, quantity, totalPrice, paymentStatus)

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    return res.status(200).json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return res.status(500).json({ error: 'Update booking failed' })
  }
}

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params
    const booking = await bookingModel.deleteBooking(id)

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    return res.status(200).json({ message: 'Booking successfully deleted', booking })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return res.status(500).json({ error: 'Delete booking failed' })
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
