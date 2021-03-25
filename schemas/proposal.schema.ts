import Joi from "joi";

export const proposalSchema = Joi.object({
  payment_amount: Joi.number().required(),
  payment_type: Joi.number().required(),
  job_id: Joi.number().required(),
  mover_id: Joi.number().required(),
});
