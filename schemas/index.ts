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

export const proposalSchema = Joi.object({
  payment_amount: Joi.number().required(),
  payment_type: Joi.number().required(),
  job_id: Joi.number().required(),
  mover_id: Joi.number().required(),
});

export const jobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  payment_amount: Joi.number().required(),
  expected_duration: Joi.string().required(),
  payment_type: Joi.number().required(),
  customer_id: Joi.number().required(),
});

export const contractSchema = Joi.object({
  proposal_id: Joi.number().required(),
  start_time: Joi.date().required(),
  title: Joi.string().required(),
});
