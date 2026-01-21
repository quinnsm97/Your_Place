const db = require('../db/pool')

/**
 * Create a new booking for an event/space
 * @param {number} eventId - ID of event being booked (null if booking space)
 * @param {number} spaceId - ID of space being booked (null if booking event)
 * @param {number} userId - ID of the user making the booking
 * @param {number} quantity - Number of spots/seats being booked
 * @param {number} totalPrice - Total price for the booking
 * @param {string} paymentStatus - Payment status (default is 'pending')
 * @returns {object} The created booking
 */
const createBooking = async (eventId, spaceId, userId, quantity, totalPrice, paymentStatus) => {
  // Validates that eventId OR spaceId is provided (cannot be both)
  if ((!eventId && !spaceId) || (eventId && spaceId)) {
    throw new Error('Must provide either eventId OR spaceId (not both)')
  }

  const result = await db.query(
    `INSERT INTO bookings (event_id, space_id, user_id, quantity, total_price, payment_status) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [eventId, spaceId, userId, quantity, totalPrice, paymentStatus || 'pending']
  )
  return result.rows[0]
}

/**
 * Get all bookings from database
 * @returns Array of all bookings by ID
 */
const getAllBookings = async () => {
  const result = await db.query('SELECT * FROM bookings ORDER BY id')
  return result.rows
}

/**
 * Get a single booking by its ID
 * @param {number} bookingID
 * @returns {object} the booking object, undefined if none found
 */
const getBookingById = async (id) => {
  const result = await db.query('SELECT * FROM bookings WHERE id = $1', [id])
  return result.rows[0]
}

/**
 * Get all bookings for a user with event/space details
 * @param {number} userID
 * @returns {array} Bookings with joined event/space details
 */
const getBookingsByUserId = async (userId) => {
  const result = await db.query(
    `SELECT 
        b.*, 
        e.title as event_title, 
        e.start_at as event_start, 
        e.end_at as event_end,
        s.name as space_name,
        s.address as space_address,
        s.city as space_city
        FROM bookings b 
        LEFT JOIN events e ON b.event_id = e.id 
        LEFT JOIN spaces s ON b.space_id = s.id
        WHERE b.user_id = $1 
        ORDER BY COALESCE(e.start_at, b.id) DESC`,
    [userId]
  )
  return result.rows
}

/**
 * Get all bookings for an event with user details
 * @param {number} eventID
 * @returns {array} Bookings for event with user details
 */
const getBookingsByEventId = async (eventId) => {
  const result = await db.query(
    `SELECT b.*, u.full_name, u.email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.event_id = $1
        ORDER BY b.id`,
    [eventId]
  )
  return result.rows
}

/**
 * Get all bookings for a space with user details
 * @param {number} spaceID
 * @returns {array} Bookings for space with user details
 */
const getBookingsBySpaceId = async (spaceId) => {
  const result = await db.query(
    `SELECT b.*, u.full_name, u.email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.event_id = $1
        ORDER BY b.id`,
    [spaceId]
  )
  return result.rows
}

/**
 * Update an existing booking
 * @param {number} bookingID
 * @returns {number} quantity value @returns {number} new total price @returns {string} new payment status
 * @returns {object} Updated booking, undefined if not found
 */
const updateBooking = async (id, quantity, totalPrice, paymentStatus) => {
  const result = await db.query(
    `UPDATE bookings
        SET quantity = $1, total_price = $2, payment_status = $3
        WHERE id = $4
        RETURNING *`,
    [quantity, totalPrice, paymentStatus, id]
  )
  return result.rows[0]
}

/**
 * Delete a booking from database
 * @param {number} bookingID
 * @returns {object} Deleted booking, undefined if not found
 */
const deleteBooking = async (id) => {
  const result = await db.query(
    `DELETE FROM bookings
        WHERE id = $1
        RETURNING *`,
    [id]
  )
  return result.rows[0]
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
