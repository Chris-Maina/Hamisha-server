import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).required(),
});

export const registerSchema = loginSchema.keys({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  type: Joi.string().optional(),
  description: Joi.string().optional(),
  location: Joi.string().optional()
});
