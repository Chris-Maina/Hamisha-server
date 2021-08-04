import { 
  Router,
  Request,
  Response,
  NextFunction
} from "express";
import createHttpError from "http-errors";
import { COMMISSION, USER_TYPES } from "../common/constants";
import {
  getTimestamp,
  urlWithParams,
  makeApiRequest,
  getMpesaAuthToken,
  mapMpesaKeysToSnakeCase,
  getSecurityCredentials,
} from "../helpers/payment_helpers";
import { Invoice, Payment, User } from "../models";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { amount, invoice_id, phoneNumber } = req.body;
  try {
    /**
     * Check to see if you have mpesa token. You can use Redis here
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
      "CallBackURL": `https://hamisha-api.herokuapp.com/api/payments/lipanampesa?invoice_id=${invoice_id}`,
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
router.post('/lipanampesa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id } = req.query;
    // ResultCode of 0 is a success
    if (req.body.Body.stkCallback.ResultCode !== 0) throw new createHttpError.InternalServerError();

    // Create a payment record
    const payload: {[x: string]: any} = mapMpesaKeysToSnakeCase(req.body.Body.stkCallback?.CallbackMetadata.Item || []);
    payload['invoice_id'] = parseInt(invoice_id as string, 10);
    await Payment.query().insert(payload);

    // make request to send to recipitent
    const options = {
      host: "hamisha-api.herokuapp.com",
      path: "/api/payments/sendtorecipient",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }
    const invoice = await Invoice.query().findById(payload.invoice_id);
    const user = await User
      .query()
      .where('role', USER_TYPES.ADMIN)
      .first();
    const amountToSend: number = payload.amount - (COMMISSION * payload.amount);

    const newInvoice = await Invoice
      .query()
      .insert({
        issued_by: user.id,
        issued_to: invoice.issued_to,
        contract_id: invoice.contract_id,
        total: amountToSend,
        description: "Payment from hamisha"
      });

    const postPayload = {
      invoice_id: newInvoice.id,
      amount: amountToSend,
      recipient_phone_number: user.phone_number
    }
    makeApiRequest(options, postPayload)
    
    // respond to safaricom servers with a success message
    res.json({
      "ResponseCode": "00000000",
      "ResponseDesc": "success"
    });
  } catch (error) {
    next(error);
  }
});

router.post("/sendtorecipient", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id, amount, recipient_phone_number } = req.body;
    const token = await getMpesaAuthToken();

    // Send MPESA request to pay recipient
    const parameters = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: getSecurityCredentials(),
      CommandID: 'SalaryPayment',
      Amount: amount,
      PartyA: 600980,//  B2C organization shortcode
      PartyB: recipient_phone_number,
      ResultURL: `https://hamisha-api.herokuapp.com/api/payments/b2c?invoice_id=${invoice_id}`,
    };
    const path = urlWithParams('/mpesa/b2c/v1/paymentrequest', parameters)
    const options = {
      host: "sandbox.safaricom.co.ke",
      path,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token?.access_token}`
      }
    }

    const response = await makeApiRequest(options);
    console.log("sendtorecipient response >>>>", response);
  } catch (error) {
    next(error);
  }
});

// Webhook to listen to B2C response
router.post('/b2c', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id } = req.query;
    console.log("invoice_id", invoice_id);
    console.log("b2c success", req.body);
    /**
     * THOUGHTS
     * Create a business user who will be making payments
     * Create an invoice from this user to recipient user linked to the contract
     * Add this payment to the Payment table
     */
    // if (req.body.Body.stkCallback.ResultCode === 0) {
      // Create a payment record
      // const payload: { [x: string]: any } = mapMpesaKeysToSnakeCase(req.body.Body.stkCallback?.CallbackMetadata.Item || []);
      // payload['invoice_id'] = parseInt(invoice_id as string, 10);
      // await Payment.query().insert(payload);
    // }
    // respond to safaricom servers with a success message
    // res.json({
    //   "ResponseCode": "00000000",
    //   "ResponseDesc": "success"
    // });
  } catch (error) {
    next(error);
  }
});

export default router;