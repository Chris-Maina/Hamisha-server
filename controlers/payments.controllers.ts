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
  makeApiRequest,
  getMpesaAuthToken,
  mapMpesaKeysToSnakeCase,
  getSecurityCredentials,
} from "../helpers/payment_helpers";
import { Invoice, Payment, User } from "../models";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { amount, invoice_id, issued_by, issued_to, contract_id } = req.body;
  try {
    /**
     * Check to see if you have mpesa token. You can use Redis here
     * If yes, proceed with lipa na mpesa api request
     * if no, generate a new token
     */
    const token = await getMpesaAuthToken();

    const sender = await User
      .query()
      .findById(issued_to);

    const timeStamp = getTimestamp();
    const BUSINESS_SHORT_CODE = parseInt(process.env.BUSINESS_SHORT_CODE!, 10);
    const payload = {
      "BusinessShortCode": BUSINESS_SHORT_CODE,
      "Password": Buffer.from(`${BUSINESS_SHORT_CODE}${process.env.PASS_KEY}${timeStamp}`).toString('base64'),
      "Timestamp": timeStamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": amount,
      "PartyA": sender.phone_number, // the MSISDN sending the funds
      "PartyB": BUSINESS_SHORT_CODE, // the org shortcode receiving the funcs
      "PhoneNumber": sender.phone_number, // the MSISDN sending the funds
      "CallBackURL": `https://hamisha-api.herokuapp.com/api/payments/lipanampesa?invoice_id=${invoice_id}&issued_by=${issued_by}&contract_id=${contract_id}`,
      "AccountReference": "Hamisha", // Identifier of the transaction for CustomerPayBillOnline transaction type
      "TransactionDesc": `Payment for invoice with id ${invoice_id}`
    }
    const options = {
      host: "sandbox.safaricom.co.ke",
      path: "/mpesa/stkpush/v1/processrequest",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://hamisha-api.herokuapp.com",
        "Authorization": `Bearer ${token?.access_token}`
      }
    }
    console.log(" >>>>> Start >>>>>")
    const response = await makeApiRequest(options, payload);
  
    res.status(201);
    res.send(response);
  } catch (error: any) {
    next(new createHttpError.BadRequest(error.message));
  }
});

// Webhook to listen to lipa na mpesa stkpush response
router.post('/lipanampesa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id, issued_by, contract_id } = req.query;

    // Check for status of submission. ResultCode of 0 is a success
    if (req.body.Body.stkCallback.ResultCode !== 0) throw new createHttpError.InternalServerError();
    console.log(">>>>>>> lipa na mpesa success")
    // Create a payment record
    const payload: {[x: string]: any} = mapMpesaKeysToSnakeCase(req.body.Body.stkCallback?.CallbackMetadata.Item || []);
    payload['invoice_id'] = parseInt(invoice_id as string, 10);
    await Payment.query().insert(payload);

    const receipientUserId = parseInt(issued_by as string, 10);
    const users = await User
      .query()
      .where('role', USER_TYPES.ADMIN)
      .orWhere('id', receipientUserId);
    const { adminUser, recipientUser } = users.reduce((acc: any, user: User) => {
      if (user.role === USER_TYPES.ADMIN) {
        acc['adminUser'] = user;
      } else if (user.id === receipientUserId) {
        acc['recipientUser'] = user;
      }
      return acc;
    }, { adminUser: undefined, recipientUser: undefined })

    // Deduct commission and send the rest
    // const amountToSend: number = payload.amount - (COMMISSION * payload.amount);
    const amountToSend: number = 1;

    const contractId = parseInt(contract_id as string, 10);
    // TODO: Also create an invoice from issued_to (sender/customer) to admin, amount being commission amount

    const newInvoice = await Invoice
      .query()
      .insert({
        issued_by: adminUser.id,
        issued_to: recipientUser.id,
        contract_id: contractId,
        total: amountToSend,
        description: `Pay ${recipientUser.first_name} ksh ${amountToSend}`
      });

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

    const token = await getMpesaAuthToken();
    const securityCredentials = await getSecurityCredentials();
    const BUSINESS_SHORT_CODE = parseInt(process.env.B2C_SHORT_CODE!, 10);

    // Create payload to pay recipient
    const parameters = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: securityCredentials,
      CommandID: "BusinessPayment",
      Amount: amountToSend,
      PartyA: BUSINESS_SHORT_CODE,//  B2C organization shortcode
      PartyB: `${recipientUser.phone_number}`,
      Remarks: "Test remarks",
      QueueTimeOutURL: "https://hamisha-api.herokuapp.com/api/payments/b2c/timeout",
      ResultURL: `https://hamisha-api.herokuapp.com/api/payments/b2c?invoice_id=${newInvoice.id}&sender=${adminUser.phone_number}`,
      Occassion: "pay for service"
    };

    const options = {
      host: "sandbox.safaricom.co.ke",
      path: "/mpesa/b2c/v1/paymentrequest",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token?.access_token}`
      }
    }
    console.log(">>>>>>> sending request to pay ", parameters)
    // make request to send to recipitent
    await makeApiRequest(options, parameters);
    
    // respond to safaricom servers with a success message
    res.json({
      "ResponseCode": "00000000",
      "ResponseDesc": "success"
    });
  } catch (error) {
    console.log("lipa na mpesa error", error)
    next(error);
  }
});

router.post("/sendtorecipient", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id, amount, sender_phone_number, recipient_phone_number } = req.body;
    const token = await getMpesaAuthToken();
    const BUSINESS_SHORT_CODE = parseInt(process.env.B2C_SHORT_CODE!, 10);

    // Send MPESA request to pay recipient
    const parameters = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: await getSecurityCredentials(),
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: BUSINESS_SHORT_CODE,//  B2C organization shortcode
      PartyB: "254728762287" || recipient_phone_number,
      Remarks: "n/a",
      QueueTimeOutURL:	"https://hamisha-api.herokuapp.com/api/payments/b2c/timeout",
      ResultURL: `https://hamisha-api.herokuapp.com/api/payments/b2c?invoice_id=${invoice_id}&sender=${sender_phone_number}`,
      Occassion: "pay for service"
    };

    const options = {
      host: "sandbox.safaricom.co.ke",
      path: "/mpesa/b2c/v1/paymentrequest",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token?.access_token}`
      }
    }

    await makeApiRequest(options, parameters);
  } catch (error) {
    console.log("Error >>>>>>>>>", error)
    next(error);
  }
});

// Webhook to listen to B2C response
router.post('/b2c', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice_id, sender } = req.query;
    console.log("invoice_id", invoice_id);
    console.log("owner of short code or sender", sender)
    console.log("b2c success", req.body);

    if (req.body.Body.stkCallback.ResultCode === 0) {
      // Create a payment record
      const payload: { [x: string]: any } = mapMpesaKeysToSnakeCase(req.body.Body.stkCallback?.CallbackMetadata.Item || []);
      payload['invoice_id'] = parseInt(invoice_id as string, 10);
      await Payment.query().insert(payload);
    }
    // respond to safaricom servers with a success message
    res.json({
      "ResponseCode": "00000000",
      "ResponseDesc": "success"
    });
  } catch (error) {
    console.log("B2C Error >>>>>>>>>", error)
    next(error);
  }
});

router.post('/b2c/timeout', async (req: Request, res: Response, next: NextFunction) => {

})

export default router;