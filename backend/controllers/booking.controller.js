// controllers/booking.controller.js
const db = require('../models');
const Booking = db.Booking;
const ParkingSlot = db.ParkingSlot;
const User = db.User;
const { Op } = require('sequelize');

// Fee calculation placeholder
function calculateFee(startTime, endTime) {
    const durationHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
    return Math.max(5, durationHours * 2.5); // Example: $2.5/hour, min $5
}

// Ticket number generation placeholder
function generateTicketNumber() {
    return `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

// User: Create a new booking request
exports.createBooking = async (req, res) => {
    try {
        const { slotId, startTime, endTime } = req.body;
        const userId = req.userId;

        if (!slotId || !startTime || !endTime) {
            return res.status(400).send({ message: "Slot ID, start time, and end time are required." });
        }
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).send({ message: "End time must be after start time." });
        }
         if (new Date(startTime) < new Date()) {
            return res.status(400).send({ message: "Booking start time cannot be in the past." });
        }


        const slot = await ParkingSlot.findByPk(slotId);
        if (!slot) {
            return res.status(404).send({ message: "Parking slot not found." });
        }
        if (slot.status !== 'available') {
             // This simple check is not enough for time-based availability.
             // We need to check for overlapping bookings.
        }

        // Check for overlapping bookings for the selected slot
        const overlappingBookings = await Booking.count({
            where: {
                slotId: slotId,
                status: { [Op.in]: ['pending', 'approved'] }, // Consider only active bookings
                [Op.or]: [
                    { // New booking starts during an existing booking
                        startTime: { [Op.lt]: new Date(endTime) },
                        endTime: { [Op.gt]: new Date(startTime) }
                    }
                ]
            }
        });

        if (overlappingBookings > 0) {
            return res.status(409).send({ message: "Slot is already booked for the selected time period." });
        }


        const booking = await Booking.create({
            userId,
            slotId,
            startTime,
            endTime,
            status: 'pending', // Default status
        });
        res.status(201).send(booking);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// User: List own bookings
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { userId: req.userId },
            include: [
                { model: ParkingSlot, as: 'slot', attributes: ['slotNumber', 'description'] },
                // { model: User, as: 'user', attributes: ['firstName', 'email'] } // Not needed for 'my' bookings
            ],
            order: [['startTime', 'DESC']]
        });
        res.status(200).send(bookings);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// User: View all current/future approved bookings (Parking Lot Status)
exports.getParkingLotStatus = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: {
                status: 'approved',
                endTime: { [Op.gte]: new Date() } // End time is in the future or now
            },
            include: [
                { model: ParkingSlot, as: 'slot', attributes: ['id', 'slotNumber'] },
                // { model: User, as: 'user', attributes: ['id', 'firstName'] } // Might be privacy concern
            ],
            attributes: ['id', 'slotId', 'startTime', 'endTime', 'status']
        });
        res.status(200).send(bookings);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


// Admin: List all bookings (with filters potentially)
exports.getAllBookings = async (req, res) => {
    try {
        // Add filtering by status, user, date range etc. later
        const bookings = await Booking.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'email'] },
                { model: ParkingSlot, as: 'slot', attributes: ['id', 'slotNumber'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).send(bookings);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Admin: Approve a booking
exports.approveBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findOne({
            where: { id: bookingId },
            include: [
                { model: User, as: 'user', attributes: ['email', 'firstName'] },
                { model: ParkingSlot, as: 'slot' }
            ]
        });

        if (!booking) {
            return res.status(404).send({ message: "Booking not found." });
        }
        if (booking.status !== 'pending') {
            return res.status(400).send({ message: `Booking is already ${booking.status}.` });
        }

        booking.status = 'approved';
        booking.ticketNumber = generateTicketNumber();
        booking.totalFee = calculateFee(booking.startTime, booking.endTime);
        await booking.save();

        // TODO: Trigger notification (app & email) with ticket
        // Example: emailService.sendBookingApproval(booking.user.email, booking, ticketDetails);
        console.log(`Booking ${booking.id} approved. Ticket: ${booking.ticketNumber}. Fee: ${booking.totalFee}. Notify user: ${booking.user.email}`);


        // Optionally update slot status if you maintain an explicit 'occupied' status on the slot model
        // For time-based, this is less critical as availability is checked on new booking creation.
        // if (booking.slot) {
        //    booking.slot.status = 'occupied'; // This is too simplistic
        //    await booking.slot.save();
        // }

        res.status(200).send(booking);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Admin: Reject a booking
exports.rejectBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findOne({
            where: { id: bookingId },
            include: [{ model: User, as: 'user', attributes: ['email', 'firstName'] }]
        });

        if (!booking) {
            return res.status(404).send({ message: "Booking not found." });
        }
        if (booking.status !== 'pending') {
             return res.status(400).send({ message: `Booking cannot be rejected, status is: ${booking.status}.` });
        }

        booking.status = 'rejected';
        await booking.save();

        // TODO: Trigger notification for rejection
        console.log(`Booking ${booking.id} rejected. Notify user: ${booking.user.email}`);

        res.status(200).send(booking);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// User: Cancel own booking (if allowed by rules)
exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.userId;

        const booking = await Booking.findOne({ where: { id: bookingId, userId: userId } });

        if (!booking) {
            return res.status(404).send({ message: "Booking not found or you do not have permission to cancel it." });
        }

        // Define cancellation rules, e.g., can only cancel 'pending' or 'approved' bookings
        // and perhaps not too close to the start time.
        if (booking.status !== 'pending' && booking.status !== 'approved') {
            return res.status(400).send({ message: `Cannot cancel booking with status: ${booking.status}.` });
        }

        // Example: Cannot cancel if less than 1 hour to start time for an approved booking
        if (booking.status === 'approved' && (new Date(booking.startTime).getTime() - new Date().getTime()) < (60 * 60 * 1000)) {
            return res.status(400).send({ message: "Cannot cancel booking so close to the start time." });
        }


        booking.status = 'cancelled';
        await booking.save();

        // TODO: Notify admin or log cancellation
        console.log(`User ${userId} cancelled booking ${booking.id}`);

        res.status(200).send({ message: "Booking cancelled successfully.", booking });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Get booking by ID (User for own, Admin for any)
exports.getBookingById = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.userId;
        const userRole = req.userRole; // Make sure this is set in auth middleware

        let booking;
        const queryOptions = {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'email'] },
                { model: ParkingSlot, as: 'slot', attributes: ['id', 'slotNumber'] }
            ]
        };

        if (userRole === 'admin') {
            booking = await Booking.findByPk(bookingId, queryOptions);
        } else {
            booking = await Booking.findOne({ where: { id: bookingId, userId: userId }, ...queryOptions });
        }

        if (!booking) {
            return res.status(404).send({ message: "Booking not found or access denied." });
        }
        res.status(200).send(booking);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// TODO: Implement check-in, check-out, get ticket details endpoints