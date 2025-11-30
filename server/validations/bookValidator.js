import Joi from "joi";

export const createBookSchema = Joi.object({
  user_id: Joi.string().uuid(),
  title: Joi.string().min(2).max(255).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 2 characters",
  }),
  author: Joi.string().min(2).max(255).required().messages({
    "string.empty": "Author is required",
  }),
  description: Joi.string().min(10).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters",
  }),
  category: Joi.string().min(2).required().messages({
    "string.empty": "Category is required",
  }),
  img_url: Joi.string().uri().optional().allow(""),
  price: Joi.number().positive().precision(2).optional(),
});

export const updateBookSchema = Joi.object({
  user_id: Joi.string().uuid(),
  title: Joi.string().min(2).max(255).optional().messages({
    "string.min": "Title must be at least 2 characters",
  }),
  author: Joi.string().min(2).max(255).optional(),
  description: Joi.string().min(10).optional().messages({
    "string.min": "Description must be at least 10 characters",
  }),
  category: Joi.string().min(2).optional(),
  img_url: Joi.string().uri().optional().allow(""),
  price: Joi.number().positive().precision(2).optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required for update",
  });
