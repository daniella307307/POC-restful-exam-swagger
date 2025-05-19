// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking.controller');
const { verifyToken, isAdmin, isUser } = require('../middleware/auth.middleware');

// User routes
router.post('/', [verifyToken, isUser], controller.createBooking);
router.get('/my-bookings', [verifyToken, isUser], controller.getMyBookings);
router.get('/parking-lot-status', [verifyToken, isUser], controller.getParkingLotStatus); // User views all approved bookings
router.put('/:id/cancel', [verifyToken, isUser], controller.cancelBooking); // User cancels own booking

// Admin routes
router.get('/', [verifyToken, isAdmin], controller.getAllBookings); // Admin lists all
router.put('/:id/approve', [verifyToken, isAdmin], controller.approveBooking);
router.put('/:id/reject', [verifyToken, isAdmin], controller.rejectBooking);

// Common route (User for own, Admin for any - logic handled in controller)
router.get('/:id', [verifyToken, isUser], controller.getBookingById);


module.exports = router;