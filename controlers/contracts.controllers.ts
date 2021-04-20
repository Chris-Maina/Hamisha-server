import { Router, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Contract, User } from "../models";
import { contractSchema } from "../schemas";
import { verifyToken } from "../helpers/jwt_helpers";
import { RequestWithPayload } from "../common/interfaces";

const router = Router();

router.get('/', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;
    const user = await User
      .query()
      .findById(id)
      .withGraphFetched({
        mover: true,
        customer: true,
      });
    let response = null;
    if (user.customer) {
      response = await Contract
        .query()
        .where('customer_id', user.customer.id)
        .orderBy('start_time', 'desc');
    } else {
      response = await Contract
        .query()
        .where('mover_id', user.mover.id)
        .orderBy('start_time', 'desc');
    }

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contractSchema.validateAsync(req.body);

    const response = await Contract
      .query()
      .insert(result)
      .returning(
        ['id', 'payment_amount', 'start_time', 'payment_type', 'title']
      )
      .withGraphFetched({
        customer: true,
        mover: true
      });
  
    res.status(200);
    res.send(response);
  } catch (error) {
    if (error.isJoi) return next(new createHttpError.BadRequest(error.details[0].message));
    next(error);
  }
});

export default router;