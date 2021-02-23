import { Request } from 'express';

export interface RequestWithPayload extends Request {
  [x:string]: any
}
