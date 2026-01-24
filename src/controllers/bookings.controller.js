const service = require('../services/bookings.service')

async function createBooking(req, res, next) {
  try {
    const created = await service.createBooking(req.user.id, req.body)
    res.status(201).json({ data: created })
  } catch (e) {
    next(e)
  }
}

async function listBookings(req, res, next) {
  try {
    const bookings = await service.listBookings(req.user, req.query)
    res.json({ data: bookings })
  } catch (e) {
    next(e)
  }
}

async function getBookingById(req, res, next) {
  try {
    const booking = await service.getBookingById(req.user, req.params.id)
    res.json({ data: booking })
  } catch (e) {
    next(e)
  }
}

async function updateBooking(req, res, next) {
  try {
    const updated = await service.updateBooking(req.user, req.params.id, req.body)
    res.json({ data: updated })
  } catch (e) {
    next(e)
  }
}

async function deleteBooking(req, res, next) {
  try {
    await service.deleteBooking(req.user, req.params.id)
    res.status(204).send()
  } catch (e) {
    next(e)
  }
}

module.exports = {
  createBooking,
  listBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
}
