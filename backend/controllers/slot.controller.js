const db = require('../models');
const ParkingSpot = require('../models/Slot.model');

// Admin: Create a new parking slot
exports.createSlot = async (req, res) => {
    try {
        const { slotNumber, description, status } = req.body;
        if (!slotNumber) {
            return res.status(400).send({ message: "Slot number is required." });
        }
        const existingSlot = await ParkingSlot.findOne({ where: { slotNumber } });
        if (existingSlot) {
            return res.status(400).send({ message: "Slot number already exists." });
        }
        const slot = await ParkingSlot.create({
            slotNumber,
            description,
            status: status || 'available'
        });
        res.status(201).send(slot);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
// All Users: List all parking slots
exports.getAllSlots = async (req, res) => {
    try {
        // Could add query params for filtering by status, etc.
        const slots = await ParkingSlot.findAll();
        res.status(200).send(slots);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Admin: Get slot details by ID
exports.getSlotById = async (req, res) => {
    try {
        const slot = await ParkingSlot.findByPk(req.params.id);
        if (!slot) {
            return res.status(404).send({ message: "Parking slot not found." });
        }
        res.status(200).send(slot);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Admin: Update slot details
exports.updateSlot = async (req, res) => {
    try {
        const { slotNumber, description, status } = req.body;
        const slot = await ParkingSlot.findByPk(req.params.id);
        if (!slot) {
            return res.status(404).send({ message: "Parking slot not found." });
        }

        // Check for slotNumber uniqueness if it's being changed
        if (slotNumber && slotNumber !== slot.slotNumber) {
            const existingSlot = await ParkingSlot.findOne({ where: { slotNumber } });
            if (existingSlot) {
                return res.status(400).send({ message: "New slot number already exists." });
            }
            slot.slotNumber = slotNumber;
        }

        slot.description = description || slot.description;
        slot.status = status || slot.status;

        await slot.save();
        res.status(200).send(slot);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Admin: Delete a slot (soft delete or check for active bookings first)
exports.deleteSlot = async (req, res) => {
    try {
        const slotId = req.params.id;
        // Add check for active bookings associated with this slot before deleting
        const activeBookings = await db.Booking.count({
            where: { slotId: slotId, status: { [db.Sequelize.Op.in]: ['pending', 'approved'] } }
        });

        if (activeBookings > 0) {
            return res.status(400).send({ message: "Cannot delete slot with active or pending bookings." });
        }

        const slot = await ParkingSlot.findByPk(slotId);
        if (!slot) {
            return res.status(404).send({ message: "Parking slot not found." });
        }

        await slot.destroy(); // Hard delete. Consider soft delete.
        res.status(200).send({ message: "Parking slot deleted successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};