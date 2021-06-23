import { Router, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { RequestWithPayload } from "../common/interfaces";
import { verifyToken } from "../helpers/jwt_helpers";
import { Invoice } from "../models";
import { invoiceSchema } from "../schemas";

const router = Router();

router.get('/', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;
    const { contract_id } = req.query;

    // Current implementation requires contract_id. 
    // May change later to fetch all invoices of a user
    if (!contract_id) throw new createHttpError.BadRequest("contract_id not available");

    const response = await Invoice
      .query()
      .where("issued_by", id)
      .where("contract_id", contract_id.toString())
      .withGraphFetched({
        contract: true,
        creator: true,
        recipient: true,
      });

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
