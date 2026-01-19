const express = require('express');
const bookingController = require('../controllers/bookings.controller');
const router = express.Router();

// Create a new booking
router.post('/', bookingController.createBooking);

// Get all bookings
router.get('/', bookingController.getAllBookings);

// Get a specific booking with ID
router.get('/:id', bookingController.GetBookingById);

// Get all bookings for a user
router.get('/user/:userId', bookingController.getBookingsByUserId);

// Get all bookings for an event
router.get('/event/:eventId', bookingController.getBookingsByEventId);

// Update a booking
router.get('/:id', bookingController.updateBooking)

// Delete a booking
router.get('/:id', bookingController.deleteBooking);

module.exports = router;