const db = require('../db/pool.js')

const createBooking = async (eventId, spaceId, userId, quantity, totalPrice, paymentStatus) => {
  // Validates that eventId OR spaceId is provided (cannot be both)
  if ((!eventId && !spaceId) || (eventId && spaceId)) {
    throw new Error('Must provide either eventId OR spaceId (not both)')
  }

  const result = await db.query(
    `INSERT INTO bookings (event_id, space_id, user_id, quantity, total_price, payment_status) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [eventId, spaceId, userId, quantity, totalPrice, paymentStatus || 'pending'],
  )
  return result.rows[0]
}

const getAllBookings = async () => {
    const result = await db.uery('SELECT * FROM bookings ORDER BY id')
    return result.rows
}

const getBookingById = async (id) => {
    const result = await db.query('SELECT * FROM bookings WHERE id = $1', [id])
    return result.rows[0]
}

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
        [userId],
  )
  return result.rows
}

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