// controllers/booking.controller.js
const db = require('../models/relations');
const Booking = db.Booking;
const parkingSpot = db.ParkingSpot;
const user = db.User;
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
        const { parkingSpotId, startTime, endTime } = req.body;
        const userId = req.userId;

        if (!parkingSpotId || !startTime || !endTime) {
            return res.status(400).send({ message: "Parking slot ID, start time, and end time are required." });
        }

        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).send({ message: "End time must be after start time." });
        }

        if (new Date(startTime) < new Date()) {
            return res.status(400).send({ message: "Booking start time cannot be in the past." });
        }

        const slot = await parkingSpot.findByPk(parkingSpotId);
        if (!slot) {
            return res.status(404).send({ message: "Parking slot not found." });
        }

        // Check for overlapping bookings for the selected slot
        const overlappingBookings = await Booking.count({
            where: {
                parkingSpotId,
                status: { [Op.in]: ['pending', 'approved'] },
                [Op.or]: [
                    {
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
            parkingSpotId,
            startTime,
            endTime,
            status: 'pending',
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
                { model: parkingSpot, attributes: ['spotNumber', 'spotType', 'status'] }
            ],
            order: [['startTime', 'DESC']]
        });
        res.status(200).send(bookings);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


// User: View all current/future approved bookings (Parking Lot Status)
exports.getParkingspotStatus = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: {
                status: 'approved',
                endTime: { [Op.gte]: new Date() } // End time is in the future or now
            },
            include: [
                { model: parkingSpot, attributes: ['id', 'spotNumber'] },
                // { model: User, as: 'user', attributes: ['id', 'firstName'] } // Might be privacy concern
            ],
            attributes: ['id', 'parkingspotId', 'startTime', 'endTime', 'status']
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
                { model: user, attributes: ['id', 'username', 'email'] },
                { model: parkingSpot, attributes: ['id', 'spotNumber'] }
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
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: User }, { model: ParkingSpot }]
        });

        if (!booking) {
            return res.status(404).send({ message: "Booking not found." });
        }

        if (booking.status !== 'pending') {
            return res.status(400).send({ message: "Only pending bookings can be approved." });
        }

        booking.status = 'approved';
        booking.ticketNumber = `TICKET-${Date.now()}-${booking.id}`;
        booking.totalFee = calculateFee(booking.startTime, booking.endTime);

        await booking.save();

        // Send email notification
        const subject = "🎟️ Your Parking Ticket is Approved!";
        const html = `
            <h2>Hi ${booking.user.name},</h2>
            <p>Your parking booking has been <strong>approved</strong>.</p>

            <h3>📄 Ticket Details</h3>
            <ul>
              <li><strong>Ticket Number:</strong> ${booking.ticketNumber}</li>
              <li><strong>Slot:</strong> ${booking.ParkingSpot.slotNumber} (${booking.ParkingSpot.slotType})</li>
              <li><strong>Start Time:</strong> ${new Date(booking.startTime).toLocaleString()}</li>
              <li><strong>End Time:</strong> ${new Date(booking.endTime).toLocaleString()}</li>
              <li><strong>Total Fee:</strong> $${booking.totalFee}</li>
            </ul>

            <p>✅ Please present this ticket upon arrival at the parking lot.</p>

            <p>Thanks,<br>🚗 Parking Management Team</p>
        `;

        await sendEmail(booking.user.email, subject, html);

        console.log(`Booking ${booking.id} approved. Email sent to ${booking.user.email}`);

        res.status(200).send(booking);
    } catch (error) {
        console.error("Approval error:", error);
        res.status(500).send({ message: error.message });
    }
};

function calculateFee(startTime, endTime) {
    const ratePerHour = 500; // Example rate
    const durationMs = new Date(endTime) - new Date(startTime);
    const hours = Math.ceil(durationMs / (1000 * 60 * 60));
    return hours * ratePerHour;
}


// Admin: Reject a booking
exports.rejectBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findOne({
            where: { id: bookingId },
            include: [{ model: user, attributes: ['email', 'username'] }]
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
                { model: parkingSpot, as: 'slot', attributes: ['id', 'slotNumber'] }
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