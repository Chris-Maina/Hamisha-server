import { 
  Router,
  Request,
  Response,
  NextFunction
} from "express";
import createHttpError from "http-errors";
import {
  getTimestamp,
  makeApiRequest,
  getMpesaAuthToken,
  mapMpesaKeysToSnakeCase
} from "../helpers/payment_helpers";
import { Payment } from "../models";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { amount, invoice_id, phoneNumber } = req.body;
  try {
    /**
     * Check to see if you have mpesa token
     * If yes, proceed with lipa na mpesa api request
     * if no, generate a new token
     */
    const token = await getMpesaAuthToken();

    const timeStamp = getTimestamp();
    const BUSINESS_SHORT_CODE = parseInt(process.env.BUSINESS_SHORT_CODE!, 10);
    const payload = {
      "BusinessShortCode": BUSINESS_SHORT_CODE,
      "Password": Buffer.from(`${BUSINESS_SHORT_CODE}${process.env.PASS_KEY}${timeStamp}`).toString('base64'),
      "Timestamp": timeStamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": amount,
      "PartyA": phoneNumber, // the MSISDN sending the funds
      "PartyB": BUSINESS_SHORT_CODE, // the org shortcode receiving the funcs
      "PhoneNumber": phoneNumber, // the MSISDN sending the funds
      "CallBackURL": `https://hamisha-api.herokuapp.com/api/payments/mpesa?invoice_id=${invoice_id}`,
      "AccountReference": "Hamisha", // Identifier of the transaction for CustomerPayBillOnline transaction type
      "TransactionDesc": `Payment for invoice with id ${invoice_id}`
    }
    const options = {
      host: "sandbox.safaricom.co.ke",
      path: "/mpesa/stkpush/v1/processrequest",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token?.access_token}`
      }
    }
    const response = await makeApiRequest(options, payload);
    res.status(201);
    res.send(response);
  } catch (error) {
    next(new createHttpError.BadRequest(error.message));
  }
});

// Webhook to listen to lipa na mpesa stkpush response
router.post('/mpesa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id } = req.query;
    // ResultCode of 0 is a success
    if (req.body.Body.stkCallback.ResultCode === 0) {
      // Create a payment record
      const payload: {[x: string]: any} = mapMpesaKeysToSnakeCase(req.body.Body.stkCallback?.CallbackMetadata.Item || []);
      payload['invoice_id'] = parseInt(invoice_id as string, 10);
      await Payment.query().insert(payload);
    }
    // respond to safaricom servers with a success message
    res.json({
      "ResponseCode": "00000000",
      "ResponseDesc": "success"
    });
  } catch (error) {
    next(error);
  }
})


export default router;