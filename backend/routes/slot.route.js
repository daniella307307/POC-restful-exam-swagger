// routes/slot.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/slot.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.post('/', [verifyToken, isAdmin], controller.createSlot);
router.get('/', controller.getAllSlots); // All users can view slots
router.get('/:id', [verifyToken, isAdmin], controller.getSlotById);
router.put('/:id', [verifyToken, isAdmin], controller.updateSlot);
router.delete('/:id', [verifyToken, isAdmin], controller.deleteSlot);

module.exports = router;