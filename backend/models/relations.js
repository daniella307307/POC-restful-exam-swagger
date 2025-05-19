const User = require('./User.model');
const Booking = require('./Book.model');
const ParkingSpot = require('./Slot.model');

// Associations
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

ParkingSpot.hasMany(Booking, { foreignKey: 'parkingSpotId' });
Booking.belongsTo(ParkingSpot, { foreignKey: 'parkingSpotId' });

module.exports = {
    User,
    Booking,
    ParkingSpot
  };