import { Router, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Contract, User } from "../models";
import { contractSchema } from "../schemas";
import { verifyToken } from "../helpers/jwt_helpers";
import { CONTRACT_STATUS } from "../common/constants";
import { RequestWithPayload } from "../common/interfaces";

const router = Router();
const contractFields: string[] = [
  'id', 'payment_amount', 'start_time', 'payment_type', 'title', 'status'
];

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
        .orderBy('created_at', 'desc')
        .withGraphFetched({
          mover: {
            account: true
          },
          contract_type: true
        });
    } else {
      response = await Contract
        .query()
        .where('mover_id', user.mover.id)
        .where('status', '!=', CONTRACT_STATUS.DRAFT) // != and <> both mean not equal
        .orderBy('created_at', 'desc');
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

    // Check if contract is unique
    const contractExists: any = await Contract.query().findOne({
      customer_id: result.customer_id,
      mover_id: result.mover_id,
    });
    if (contractExists
      && (
        contractExists.status !== CONTRACT_STATUS.CLOSED || 
        contractExists.status !== CONTRACT_STATUS.DECLINED
      )
    ) throw new createHttpError.Conflict("A contract exists between shared contacts");
    const response = await Contract
      .query()
      .insert(result)
      .returning(contractFields)
      .withGraphFetched({
        mover: {
          account: true
        },
        contract_type: true
      });
  
    res.status(200);
    res.send(response);
  } catch (error) {
    if (error.isJoi) return next(new createHttpError.BadRequest(error.details[0].message));
    next(error);
  }
});

router.patch('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const response = await Contract
      .query()
      .patch(req.body)
      .where('id', id)
      .returning(contractFields)
      .first()
      .withGraphFetched({
        mover: {
          account: true
        },
        contract_type: true
      });
    
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const response = await Contract
      .query()
      .update(req.body)
      .where('id', id)
      .returning(contractFields)
      .first()
      .withGraphFetched({
        mover: {
          account: true
        },
        contract_type: true
      });

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

export default router;