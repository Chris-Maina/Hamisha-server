import Joi from 'joi';
import { CONTRACT_STATUS, DAYS_OF_THE_WEEK } from '../common/constants';

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).required(),
});

export const registerSchema = loginSchema.keys({
  first_name: Joi.string().optional().allow(''),
  last_name: Joi.string().optional().allow(''),
  type: Joi.string().required(),
  phone_number: Joi.string().optional(),
}).unknown();


export const moverRegisterSchema = registerSchema.keys({
  description: Joi.string().optional().allow(''), // empty strings are not allowed by default and must be enabled with allow('')
  reg_number: Joi.string().uppercase().optional(),
  vehicle_pic: Joi.string().optional().allow(''),
  vehicle_type: Joi.string().optional().allow(''),
});

export const proposalSchema = Joi.object({
  payment_amount: Joi.number().required(),
  job_id: Joi.number().required(),
  mover_id: Joi.number().required(),
});

export const jobSchema = Joi.object({
  quantity: Joi.number().required(),
  location: Joi.string().required(),
  collection_day: Joi.string().required().valid(...DAYS_OF_THE_WEEK),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
});

export const contractSchema = Joi.object({
  title: Joi.string().required(),
  mover_id: Joi.number().required(),
  start_time: Joi.date().required(),
  customer_id: Joi.number().required(),
  proposal_id: Joi.number().optional(),
  status: Joi.string().optional().valid(
    CONTRACT_STATUS.DRAFT,
    CONTRACT_STATUS.DECLINED,
    CONTRACT_STATUS.ACCEPTED,
    CONTRACT_STATUS.CLOSED,
  )
});

export const invoiceSchema = Joi.object({
  issued_by: Joi.number().optional(),
  issued_to: Joi.number().optional(),
  contract_id: Joi.number().required(),
  due_date: Joi.date().optional(),
  total: Joi.number().required(),
});

export const paymentSchema = Joi.object({
  invoice_id: Joi.number().required(),
  contract_id: Joi.number().required(),
  phone_number: Joi.string().required(),
  total: Joi.number().required(),
  option: Joi.string().required().valid("LIPA NA MPESA", "B2C")
});
