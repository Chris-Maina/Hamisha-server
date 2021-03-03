import { Response, Router, Request, NextFunction } from "express";
import { PaymentType } from '../models';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await PaymentType.query().orderBy('id', 'asc');

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

export default router;
