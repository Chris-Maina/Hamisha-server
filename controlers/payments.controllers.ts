import {
  Router,
  Request,
  Response,
  NextFunction
} from "express";
import createHttpError from "http-errors";
import { paymentSchema } from "../schemas";
import { JOB_STATUS } from "../common/interfaces";
import { Payment, Contract, Job } from "../models";
import { verifyToken } from "../helpers/jwt_helpers";
import { CONTRACT_STATUS, PAYMENT_OPTIONS, PAYMENT_STATUS } from "../common/constants";
import { b2cMpesaRequest, lipaNaMpesaRequest, mapMpesaKeysToSnakeCase, mapLipaNaMpesaKeysToSnakeCase } from "../helpers/payment_helpers";

const router = Router();

// Webhook to listen to lipa na mpesa stkpush response
router.post('/lipanampesa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for status of submission. ResultCode of 0 is a success
    if (req.body.Body.stkCallback.ResultCode !== 0) {
      throw new createHttpError.InternalServerError();
    }

    // Create a payment record
    const payload: { [x: string]: any } = mapLipaNaMpesaKeysToSnakeCase(req.body.Body.stkCallback?.CallbackMetadata.Item || []);
    const { invoice_id, contract_id } = req.query;
    payload['invoice_id'] = parseInt(invoice_id as string, 10);
    payload['status'] = PAYMENT_STATUS.RECEIVED;

    await Promise.all([
      Payment.query().insert(payload),
      Contract
        .query()
        .findById(parseInt(contract_id as string, 10))
        .patch({
          status: CONTRACT_STATUS.ACCEPTED
        })
    ]);

    // respond to safaricom servers with a success message
    res.json({
      "ResponseCode": "00000000",
      "ResponseDesc": "success"
    });
  } catch (error) {
    // reversal request
    next(error);
  }
});

// Webhook to listen to B2C response
router.post('/b2c', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for status of submission. ResultCode of 0 is a success
    if (req.body.Result.ResultCode !== 0) {
      throw new createHttpError.BadRequest(req.body.Result.ResultDesc);
    }

    // Create a payment record
    const payload: { [x: string]: any } = mapMpesaKeysToSnakeCase(req.body.Result.ResultParameters.ResultParameter || []);
    const { invoice_id, contract_id } = req.query;
    if (invoice_id && contract_id) {
      payload['invoice_id'] = parseInt(invoice_id as string, 10);
      payload['status'] = PAYMENT_STATUS.SENT;

      const [_payment, contract] = await Promise.all([
        Payment.query().insert(payload),
        Contract
          .query()
          .patch({
            end_time: new Date(),
            status: CONTRACT_STATUS.CLOSED
          })
          .where("id", parseInt(contract_id as string, 10))
          .returning(['id', 'proposal_id'])
          .first()
          .withGraphFetched({
            proposal: true,
          })
      ]);

      if (contract) {
        await Job.query().patch({ status: JOB_STATUS.COMPLETED }).where("id", contract.proposal.job_id)
      }
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

// modify the route to /timeout
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
      .where('mpesa_receipt_no', id)
      .returning("*");

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error)
  }
});

router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await paymentSchema.validateAsync(req.body);
    const { total, invoice_id, contract_id, phone_number, option } = result;
    if (option === PAYMENT_OPTIONS[1]) {
      await lipaNaMpesaRequest(total, invoice_id, phone_number, contract_id);
    } else {
      await b2cMpesaRequest(total, invoice_id, phone_number, contract_id);
    }
    res.status(201);
    res.send({
      message: "Successfully sent payment and contract updated.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;