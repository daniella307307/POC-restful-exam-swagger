const Joi = require("joi");

const createSlotSchema = Joi.object({
  spotNumber: Joi.string().trim().required().messages({
    "any.required": "Spot number is required",
    "string.empty": "Spot number cannot be empty",
  }),
  status: Joi.string()
    .valid("available", "occupied", "reserved", "maintenance")
    .default("available"),
  spotType: Joi.string()
    .valid("compact", "regular", "large", "ev_charging", "handicap")
    .default("regular"),
});

module.exports = {
  createSlotSchema,
};
