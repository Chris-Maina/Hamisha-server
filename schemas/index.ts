import Joi from 'joi';
import { CONTRACT_STATUS } from '../common/constants';

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).required(),
});

export const registerSchema = loginSchema.keys({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  type: Joi.string().required(),
  description: Joi.string().optional().allow(''), // empty strings are not allowed by default and must be enabled with allow('')
  location: Joi.string().optional().allow(''),
  phone_number: Joi.string().optional()
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
  title: Joi.string().required(),
  mover_id: Joi.number().required(),
  start_time: Joi.date().required(),
  customer_id: Joi.number().required(),
  payment_type: Joi.number().required(),
  payment_amount: Joi.number().required(),
  proposal_id: Joi.number().optional(),
  status: Joi.string().optional().valid(
    CONTRACT_STATUS.DRAFT,
    CONTRACT_STATUS.DECLINED,
    CONTRACT_STATUS.ACCEPTED,
    CONTRACT_STATUS.CLOSED,
  )
});

export const invoiceSchema = Joi.object({
  description: Joi.string().required(),
  issued_by: Joi.number().required(),
  issued_to: Joi.number().required(),
  contract_id: Joi.number().required(),
  due_date: Joi.date().optional(),
  total: Joi.number().required(),
});
