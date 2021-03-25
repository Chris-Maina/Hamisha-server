import { Request } from 'express';

export interface RequestWithPayload extends Request {
  [x:string]: any
}

export interface ProposalAttr {
  id?: number,
  job_id: number,
  status?: string,
  mover_id: number,
  created_at?: Date,
  payment_type: number,
  movers_grade?: number,
  payment_amount: number,
  customer_grade?: number,
  customer_comment?: string,
  movers_comment?: string,
}
