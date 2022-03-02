import { 
  Router,
  Request,
  Response,
  NextFunction
} from "express";
import createHttpError from "http-errors";
import { COMMISSION, CONTRACT_STATUS, PAYMENT_STATUS, USER_TYPES } from "../common/constants";
import { verifyToken } from "../helpers/jwt_helpers";
import {
  getTimestamp,
  makeApiRequest,
  getMpesaAuthToken,
  mapMpesaKeysToSnakeCase,
  getSecurityCredentials,
} from "../helpers/payment_helpers";
import { Invoice, Payment, User, Contract } from "../models";
import { paymentSchema } from "../schemas";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { mover_id, issued_to, contract_id } = req.body;
  try {
    const result = await paymentSchema.validateAsync(req.body);

    /**
     * Create an invoice to customer to pay for collection request
     * issued_to rep customer,
     * issued_by admin
     */
    const adminUser = await User.query().findOne({ role: USER_TYPES.ADMIN });
    const invoice = await Invoice.query().insert({ ...result, issued_by: adminUser.id });
    const sender = await User
      .query()
      .findById(issued_to);

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
      "Amount": result.total,
      "PartyA": sender.phone_number, // the MSISDN sending the funds
      "PartyB": BUSINESS_SHORT_CODE, // the org shortcode receiving the funcs
      "PhoneNumber": sender.phone_number, // the MSISDN sending the funds
      "CallBackURL": `https://hamisha-api.herokuapp.com/api/payments/lipanampesa?invoice_id=${invoice.id}&mover_id=${mover_id}&contract_id=${contract_id}`,
      "AccountReference": "Takataka", // Identifier of the transaction for CustomerPayBillOnline transaction type
      "TransactionDesc": `Payment for invoice with id ${invoice.id}`
    }
    const options = {
      hostname: "sandbox.safaricom.co.ke",
      path: "/mpesa/stkpush/v1/processrequest",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://hamisha-api.herokuapp.com",
        "Authorization": `Bearer ${token?.access_token}`
      }
    }

    const response = await makeApiRequest(options, payload);
    console.log(">>>>> Start >>>>>");
    res.status(201);
    res.send(response);
  } catch (error: any) {
    next(new createHttpError.BadRequest(error.message));
  }
});

// Webhook to listen to lipa na mpesa stkpush response
router.post('/lipanampesa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id, contract_id } = req.query;

    // Check for status of submission. ResultCode of 0 is a success
    if (req.body.Body.stkCallback.ResultCode !== 0) throw new createHttpError.InternalServerError();

    // Create a payment record
    const payload: {[x: string]: any} = mapMpesaKeysToSnakeCase(req.body.Body.stkCallback?.CallbackMetadata.Item || []);
    payload['invoice_id'] = parseInt(invoice_id as string, 10);
    payload['status'] = PAYMENT_STATUS.RECEIVED;
    await Payment.query().insert(payload);

    // Modify contract status to Accepted
    const contractId = parseInt(contract_id as string, 10);
    await Contract
    .query()
    .patch({
      status: CONTRACT_STATUS.ACCEPTED 
    })
    .findById(contractId);
    console.log(">>>>>>> Done >>>>>>")

    // const adminUser = await User.query().findOne({ role: USER_TYPES.ADMIN });
    // const moverId = parseInt(mover_id as string, 10);

    // const amountToSend: number = payload.amount - (COMMISSION * payload.amount);
    // const amountToSend: number = 1;
    // Create an invoice to pay mover with amount exclusive of commission
    // await Invoice
    //   .query()
    //   .insert({
    //     issued_by: moverId,
    //     issued_to: adminUser.id,
    //     contract_id: contractId,
    //     total: amountToSend
    //   });

    /* <----------- Cut here ----------> */
    // const users = await User
    //   .query()
    //   .where('role', USER_TYPES.ADMIN)
    //   .orWhere('id', receipientUserId);
    // const { adminUser, recipientUser } = users.reduce((acc: any, user: User) => {
    //   if (user.role === USER_TYPES.ADMIN) {
    //     acc['adminUser'] = user;
    //   } else if (user.id === receipientUserId) {
    //     acc['recipientUser'] = user;
    //   }
    //   return acc;
    // }, { adminUser: undefined, recipientUser: undefined })


    // const postPayload = {
    //   invoice_id: newInvoice.id,
    //   amount: amountToSend,
    //   sender_phone_number: adminUser.phone_number,
    //   recipient_phone_number: recipientUser.phone_number
    // }
    // // make request to send to recipitent
    // const options = {
    //   host: "hamisha-api.herokuapp.com",
    //   path: "/api/payments/sendtorecipient",
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   }
    // }
    // await makeApiRequest(options, postPayload);

    
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
  // TODO: Handle request to pay recipient
  try {
    const { invoice_id, amount, sender_phone_number, recipient_phone_number } = req.body;
    const token = await getMpesaAuthToken();
    const securityCredentials = await getSecurityCredentials();
    const BUSINESS_SHORT_CODE = parseInt(process.env.B2C_SHORT_CODE!, 10);

    // Payload for MPESA request to pay recipient
    const parameters = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: securityCredentials,
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: BUSINESS_SHORT_CODE,//  B2C organization shortcode
      PartyB: recipient_phone_number,
      Remarks: "Payment",
      QueueTimeOutURL:	"https://hamisha-api.herokuapp.com/api/payments/b2c/timeout",
      ResultURL: `https://hamisha-api.herokuapp.com/api/payments/b2c?invoice_id=${invoice_id}&sender=${sender_phone_number}`,
      Occassion: "pay for service"
    };

    const options = {
      hostname: "sandbox.safaricom.co.ke",
      path: "/mpesa/b2c/v1/paymentrequest",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token?.access_token}`
      }
    }
    console.log(">>>>>>> sending request to pay", parameters)
    await makeApiRequest(options, parameters);
    res.status(200);
  } catch (error) {
    next(error);
  }
});

// Webhook to listen to B2C response
router.post('/b2c', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id, contract_id } = req.query;

    console.log("b2c success", req.body);

    if (req.body.Result.ResultCode !== 0) throw new createHttpError.BadRequest(req.body.Result.ResultDesc);
    
    // Create a payment record
    const payload: { [x: string]: any } = mapMpesaKeysToSnakeCase(req.body.Result.ResultParameters.ResultParameter || []);
    payload['invoice_id'] = parseInt(invoice_id as string, 10);
    const contractId = parseInt(contract_id as string, 10);
    // payload['phone_number'] = sender;
    await Payment.query().insert(payload);
    await Contract
      .query()
      .patch({
        status: CONTRACT_STATUS.ACCEPTED
      })
      .findById(contractId);

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
    const response = await Payment
      .query()
      .patch(req.body)
      .findById(id);

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error)
  }
});

export default router;