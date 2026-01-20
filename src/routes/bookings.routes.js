// Import Express
const express = require('express')
//Import booking Controller
const bookingController = require('../controllers/bookings.controller')
//Create an instance of an Express Router
const router = express.Router()

// Create a new booking (requires eventId or SpaceId)
router.post('/', bookingController.createBooking);

// Get all bookings (supports query filters: userId, eventId, spaceId, paymentStatus)
router.get('/', bookingController.getAllBookings);

// Get a specific booking by its ID
router.get('/:id', bookingController.getBookingById);

// Get all bookings for a user (both events and spaces)
router.get('/user/:userId', bookingController.getBookingsByUserId);

// Get all bookings for an event
router.get('/event/:eventId', bookingController.getBookingsByEventId);

// Get all bookings for a space
router.get('/space/:spaceId', bookingController.getBookingsBySpaceId);

// Update a booking
router.put('/:id', bookingController.updateBooking);

// Delete a booking
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;