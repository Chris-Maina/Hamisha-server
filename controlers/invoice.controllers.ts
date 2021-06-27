import { Router, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Invoice, User } from "../models";
import { invoiceSchema } from "../schemas";
import { verifyToken } from "../helpers/jwt_helpers";
import { RequestWithPayload } from "../common/interfaces";

const router = Router();

router.get('/', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;
    let response;
    const user = await User
      .query()
      .findById(id)
      .withGraphFetched({
        mover: true,
        customer: true,
      });

    if (user.customer) {
      // Get bills issued to customer
      response = await Invoice
        .query()
        .where("issued_to", id)
        .withGraphFetched({
          contract: true,
          payment: true
        });
    } else {
      // Get invoices issued by mover
      response = await Invoice
        .query()
        .where("issued_by", id)
        .withGraphFetched({
          contract: true,
          creator: true,
          recipient: true,
        });
    }


    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceSchema.validateAsync(req.body);

    const response = await Invoice
      .query()
      .insert(result)
      .returning(['id', 'created_at', 'description'])
      .withGraphFetched({
        contract: true,
        creator: true,
        recipient: true,
      });
    res.status(201);
    res.send(response);
  } catch (error) {
    if (error.isJoi) return next(new createHttpError.BadRequest(error.details[0].message));
    next(error);
  }
});

export default router;
