const joi = require("joi");

/**
 * Register schema
 */

const registerSchema = joi
  .object({
    username: joi.string().alphanum().min(3).max(30).required().messages({
      "string.alphanum": "Username must only contain alphanumeric characters",
      "string.empty": "Username is required",
      "string.min": "Username must be at least {#limit} characters long",
      "string.max": "Username cannot exceed {#limit} characters",
    }),
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "string.empty": "Email is required",
      }),
    password: joi
      .string()
      .min(8)
      .max(30)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least {#limit} characters long",
        "string.max": "Password cannot exceed {#limit} characters",
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*)",
      }),
    birthday: joi.date().max("now").required().messages({
      "date.base": "Please enter a valid date",
      "date.max": "Birthday cannot be in the future",
      "any.required": "Birthday is required",
    }),
    role: joi.string().valid("user", "admin").default("user").messages({
      "any.only": "Role must be either user or admin",
    }),
  })
  .options({ abortEarly: false });

  const loginSchema = joi.object({
    identifier:joi.string().required(),
    password:joi.string().required()
  }).options({abortEarly:false})

module.exports = {
  registerSchema,
  loginSchema
};
