const express = require('express');
const router = express.Router();
const controller = require('../controllers/slot.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Slots
 *   description: Parking slot management (Admin & Public)
 */

/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Create a new parking slot
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spotNumber
 *             properties:
 *               spotNumber:
 *                 type: string
 *                 example: A1
 *               spotType:
 *                 type: string
 *                 enum: [compact, regular, large, ev_charging, handicap]
 *                 example: regular
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, maintenance]
 *                 example: available
 *     responses:
 *       201:
 *         description: Slot created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

router.post('/', [verifyToken, isAdmin], controller.createSlot);

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Get all parking slots
 *     tags: [Slots]
 *     responses:
 *       200:
 *         description: List of slots
 */
router.get('/', controller.getAllSlots);

/**
 * @swagger
 * /api/slots/{id}:
 *   get:
 *     summary: Get a slot by ID
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Slot found
 *       404:
 *         description: Slot not found
 */
router.get('/:id', [verifyToken, isAdmin], controller.getSlotById);

/**
 * @swagger
 * /api/slots/{id}:
 *   put:
 *     summary: Update a slot by ID
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slotNumber:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved]
 *     responses:
 *       200:
 *         description: Slot updated
 *       400:
 *         description: Slot number conflict
 *       404:
 *         description: Slot not found
 */
router.put('/:id', [verifyToken, isAdmin], controller.updateSlot);

/**
 * @swagger
 * /api/slots/{id}:
 *   delete:
 *     summary: Delete a parking slot
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Slot deleted
 *       400:
 *         description: Cannot delete with active bookings
 *       404:
 *         description: Slot not found
 */
router.delete('/:id', [verifyToken, isAdmin], controller.deleteSlot);

module.exports = router;
