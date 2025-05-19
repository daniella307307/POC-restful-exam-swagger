const db = require('../models/relations');
const ParkingSpot = require('../models/Slot.model');

// Admin: Create a new parking slot
const { createSlotSchema } = require("../schemas/slot.schema");

exports.createSlot = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createSlotSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((e) => e.message),
      });
    }

    const { spotNumber, status, spotType } = value;

    // Check for uniqueness
    const existing = await ParkingSpot.findOne({ where: { spotNumber } });
    if (existing) {
      return res.status(400).json({ message: "Spot number already exists." });
    }

    const newSpot = await ParkingSpot.create({ spotNumber, status, spotType });

    return res.status(201).json(newSpot);
  } catch (err) {
    console.error("Error creating slot:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// All Users: List all parking slots
exports.getAllSlots = async (req, res) => {
    try {
        // Could add query params for filtering by status, etc.
        const slots = await ParkingSpot.findAll();
        res.status(200).send(slots);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Admin: Get slot details by ID
exports.getSlotById = async (req, res) => {
    try {
        const slot = await ParkingSpot.findByPk(req.params.id);
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
        const slot = await ParkingSpot.findByPk(req.params.id);
        if (!slot) {
            return res.status(404).send({ message: "Parking slot not found." });
        }

        // Check for slotNumber uniqueness if it's being changed
        if (slotNumber && slotNumber !== slot.slotNumber) {
            const existingSlot = await ParkingSpot.findOne({ where: { slotNumber } });
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

        const slot = await ParkingSpot.findByPk(slotId);
        if (!slot) {
            return res.status(404).send({ message: "Parking slot not found." });
        }

        await slot.destroy(); // Hard delete. Consider soft delete.
        res.status(200).send({ message: "Parking slot deleted successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};