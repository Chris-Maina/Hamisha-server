import { 
  Router,
  Request,
  Response,
  NextFunction
} from "express";
import createHttpError from "http-errors";
import { Payment, Contract, Invoice } from "../models";
import { verifyToken } from "../helpers/jwt_helpers";
import { CONTRACT_STATUS, PAYMENT_STATUS } from "../common/constants";
import { mapMpesaKeysToSnakeCase } from "../helpers/payment_helpers";

const router = Router();

// Webhook to listen to lipa na mpesa stkpush response
router.post('/lipanampesa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id, contract_id } = req.query;
    const invoiceId = parseInt(invoice_id as string, 10);

    // Check for status of submission. ResultCode of 0 is a success
    if (req.body.Body.stkCallback.ResultCode !== 0) {
      // Delete the invoice created while making request
      await Invoice.query().deleteById(invoiceId);
      throw new createHttpError.InternalServerError();
    }

    // Create a payment record
    const payload: {[x: string]: any} = mapMpesaKeysToSnakeCase(req.body.Body.stkCallback?.CallbackMetadata.Item || []);
    payload['invoice_id'] = invoiceId;
    payload['status'] = PAYMENT_STATUS.RECEIVED;
    await Payment.query().insert(payload);

    // Modify contract status to Accepted
    const contractId = parseInt(contract_id as string, 10);
    await Contract
    .query()
    .findById(contractId)
    .patch({
      status: CONTRACT_STATUS.ACCEPTED 
    });

    // respond to safaricom servers with a success message
    res.json({
      "ResponseCode": "00000000",
      "ResponseDesc": "success"
    });
  } catch (error) {
    next(error);
  }
});

// Webhook to listen to B2C response
router.post('/b2c', async (req: Request, res: Response, next: NextFunction) => {
  const { invoice_id, contract_id } = req.query;
  const invoiceId = parseInt(invoice_id as string, 10);
  console.log("b2c:Response >>>>>>>>>>>>>", req.body);
  try {
    if (req.body.Result.ResultCode !== 0) {
      // Delete the invoice created while making request
      await Invoice.query().deleteById(invoiceId);
      throw new createHttpError.BadRequest(req.body.Result.ResultDesc);
    }
    // Create a payment record
    const payload: { [x: string]: any } = mapMpesaKeysToSnakeCase(req.body.Result.ResultParameters.ResultParameter || []);
    if (invoice_id && req.query.contract_id) {
      payload['invoice_id'] = invoiceId;
      payload['status'] = PAYMENT_STATUS.SENT;
      const contractId = parseInt(contract_id as string, 10);
  
      await Payment.query().insert(payload);
      await Contract
        .query()
        .patch({
          status: CONTRACT_STATUS.CLOSED
        })
        .findById(contractId);
    }

    // respond to safaricom servers with a success message
    res.json({
      "ResponseCode": "00000000",
      "ResponseDesc": "success"
    });
  } catch (error) {
    next(error);
  }
});

router.post('/b2c/timeout', async (req: Request, res: Response, next: NextFunction) => {

});

router.patch('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const payment = Payment.query().findById(id);
    if (!payment) throw new createHttpError.NotFound("Payment does not exist");

    const response = await Payment
      .query()
      .patch(req.body)
      .returning("*");

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error)
  }
});

export default router;