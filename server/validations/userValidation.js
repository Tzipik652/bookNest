import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .required()
    .messages({ "string.min": "Name must be at least 2 characters" }),

  email: Joi.string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
    .required()
    .messages({ "string.email": "Invalid email" }),

  password: Joi.string()
    .min(6)
    .pattern(/[A-Z]/, "uppercase letter")
    .pattern(/[0-9]/, "number")
    .pattern(/[^A-Za-z0-9]/, "special character")
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.pattern.name": "Password must contain at least one {#name}",
    }),
});
