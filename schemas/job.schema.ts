import Joi from 'joi';

export const jobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  payment_amount: Joi.number().required(),
  expected_duration: Joi.string().required(),
  payment_type: Joi.number().required(),
  customer_id: Joi.number().required(),
})