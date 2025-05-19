const { Booking, ParkingSpot } = require('../models');
const { Op } = require('sequelize');

/**
 * Validate booking request
 * @param {Object} data - Booking data
 * @param {Number} data.parkingSpotId
 * @param {Date} data.startTime
 * @param {Date} data.endTime
 * @returns {Promise<{ valid: boolean, message?: string }>}
 */
async function validateBooking(data) {
  const { parkingSpotId, startTime, endTime } = data;

  // 1. Check spot existence and availability
  const spot = await ParkingSpot.findByPk(parkingSpotId);
  if (!spot) return { valid: false, message: "Parking spot does not exist." };
  if (spot.status !== 'available') {
    return { valid: false, message: `Spot ${spot.spotNumber} is not available.` };
  }

  // 2. Check that startTime is before endTime
  if (!startTime || !endTime || new Date(startTime) >= new Date(endTime)) {
    return { valid: false, message: "Start time must be before end time." };
  }

  // 3. Check for overlapping bookings
  const overlapping = await Booking.findOne({
    where: {
      parkingSpotId,
      status: {
        [Op.in]: ['pending', 'approved', 'active']
      },
      [Op.or]: [
        {
          startTime: { [Op.lt]: endTime },
          endTime: { [Op.gt]: startTime }
        }
      ]
    }
  });

  if (overlapping) {
    return { valid: false, message: "Spot already has a conflicting booking." };
  }

  return { valid: true };
}
