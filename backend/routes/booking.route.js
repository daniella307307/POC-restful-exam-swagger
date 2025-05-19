const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking.controller');
const { verifyToken, isAdmin, isUser } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: API for managing parking bookings
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - parkingSpotId
 *               - startTime
 *               - endTime
 *             properties:
 *               parkingSpotId:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Slot is already booked
 *       500:
 *         description: Internal server error
 */
router.post('/', [verifyToken, isUser], controller.createBooking);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get all bookings made by the current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *       500:
 *         description: Internal server error
 */
router.get('/my-bookings', [verifyToken, isUser], controller.getMyBookings);

/**
 * @swagger
 * /api/bookings/parking-spot-status:
 *   get:
 *     summary: Get status of parking lot (approved bookings)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approved bookings retrieved
 *       500:
 *         description: Internal server error
 */
router.get('/parking-spot-status', [verifyToken, isUser], controller.getParkingspotStatus);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Booking ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 *       400:
 *         description: Cannot cancel this booking
 *       500:
 *         description: Internal server error
 */
router.put('/:id/cancel', [verifyToken, isUser], controller.cancelBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Admin - Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All bookings retrieved
 *       500:
 *         description: Internal server error
 */
router.get('/', [verifyToken, isAdmin], controller.getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}/approve:
 *   put:
 *     summary: Approve a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Booking ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking approved
 *       404:
 *         description: Booking not found
 *       400:
 *         description: Invalid booking status
 *       500:
 *         description: Internal server error
 */
router.put('/:id/approve', [verifyToken, isAdmin], controller.approveBooking);

/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   put:
 *     summary: Reject a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Booking ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking rejected
 *       404:
 *         description: Booking not found
 *       400:
 *         description: Invalid booking status
 *       500:
 *         description: Internal server error
 */
router.put('/:id/reject', [verifyToken, isAdmin], controller.rejectBooking);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a specific booking (Admin for any, User for own)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Booking ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found or unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', [verifyToken, isUser], controller.getBookingById);

module.exports = router;
