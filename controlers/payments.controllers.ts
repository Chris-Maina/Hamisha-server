import { 
  Router,
  Request,
  Response,
  NextFunction
} from "express";
import { getMpesaAuthToken, makeApiRequest } from "../helpers/payment_helpers";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { amount, jobId, phoneNumber } = req.body;
  try {
    /**
     * Check to see if you have mpesa token
     * If yes, proceed with lipa na mpesa api request
     * if no, generate a new token
     */
    const token = await getMpesaAuthToken();
    console.log(">>>>> mpesa token", token);

    const timeStamp = Date.now();
    const payload = {
      "BusinessShortCode": process.env.BUSINESS_SHORT_CODE,
      "Password": Buffer.from(`${process.env.BUSINESS_SHORT_CODE}${process.env.PASS_KEY}${timeStamp}`).toString('base64'),
      "Timestamp": timeStamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": amount,
      "PartyA": phoneNumber, // the MSISDN sending the funds
      "PartyB": process.env.BUSINESS_SHORT_CODE, // the org shortcode receiving the funcs
      "PhoneNumber": phoneNumber, // the MSISDN sending the funds
      "CallBackURL": "https://hamisha-api.herokuapp.com/api/payments/mpesa",
      "AccountReference": " ",
      "TransactionDesc": `Payment for job with id ${jobId}`
    }
    const options = {
      host: "sandbox.safaricom.co.ke",
      path: "/mpesa/stkpush/v1/processrequest",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token?.access_token}`
      }
    }
    const response = await makeApiRequest(options, payload);

    res.status(201);
    res.send(response)

  } catch (error) {
    next(error);
  }
});

// Webhook to listen to lipa na mpesa stkpush response
router.post('/mpesa', (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("response from mpesa", req.body);

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