const { DataTypes, Op } = require("sequelize");
const sequelize = require("../config/db.config");
const ParkingSpot = require('./Slot.model');

const Booking = sequelize.define('Booking', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  parkingSpotId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Now mandatory
    references: { model: 'ParkingSpots', key: 'id' },
    onUpdate: 'CASCADE',
  },
//   vehicleId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: { model: 'Vehicles', key: 'id' },
//     onUpdate: 'CASCADE',
//     onDelete: 'SET NULL'
//   },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expectedCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  actualCheckInTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualCheckOutTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'pending',       // user created booking
      'approved',      // admin approved booking
      'active',        // user checked in
      'completed',     // user checked out
      'cancelled',     // user/admin cancelled
      'expired',       // booking time passed without check-in
      'no_show'        // missed check-in window
    ),
    defaultValue: 'pending'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  validate: {
    startBeforeEnd() {
      if (this.startTime && this.endTime && this.startTime >= this.endTime) {
        throw new Error('Booking start time must be before end time.');
      }
    }
  },
  hooks: {
    afterCreate: async (booking, options) => {
      if (booking.status === 'approved' || booking.status === 'active') {
        await ParkingSpot.update({ status: 'reserved' }, {
          where: { id: booking.parkingSpotId },
          transaction: options.transaction
        });
      }
    },
    afterUpdate: async (booking, options) => {
      const prevStatus = booking.previous('status');

      // Booking completed or cancelled: make spot available again
      if (['completed', 'cancelled', 'expired'].includes(booking.status)) {
        if (['approved', 'active'].includes(prevStatus)) {
          await ParkingSpot.update({ status: 'available' }, {
            where: { id: booking.parkingSpotId },
            transaction: options.transaction
          });
        }
      }

      // Mark spot as occupied on active status
      if (booking.changed('status') && booking.status === 'active') {
        await ParkingSpot.update({ status: 'occupied' }, {
          where: { id: booking.parkingSpotId },
          transaction: options.transaction
        });
      }
    }
  }
});

module.exports = Booking;
