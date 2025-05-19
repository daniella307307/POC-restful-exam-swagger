const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Spot = sequelize.define(
  "ParkingSpot",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    spotNumber: {
      // e.g., "A1", "101", "EV05"
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.ENUM("available", "occupied", "reserved", "maintenance"),
      defaultValue: "available",
    },
    spotType: {
      // e.g., compact, regular, large, ev_charging, handicap
      type: DataTypes.ENUM(
        "compact",
        "regular",
        "large",
        "ev_charging",
        "handicap"
      ),
      defaultValue: "regular",
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["spotNumber"],
      },
    ],
  }
);

module.exports = Spot;
