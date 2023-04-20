import { request } from "https";
import {
  publicEncrypt,
  constants,
  createPublicKey
} from "crypto";
import { getFileData } from "../s3config";
import { COMMISSION } from "../common/constants";

export interface MpesaToken {
  access_token: string,
  expires: string
}

interface optionsDef {
  hostname: string,
  path: string,
  port?: number,
  method?: string,
  headers?: {
    [key: string]: string,
  }
}

/**
 * @param {object} options - request options
 * @param {any} postPayload - payload to post
 * @returns Promise
 */
export const makeApiRequest = (options: optionsDef, postPayload?: any): Promise<any | Error> => {

  return new Promise((resolve, reject) => {
    const callback = (response: any) => {
      let output = "";
      response.setEncoding('utf8');

      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(response.statusMessage || "Could not process your request"));
      }

      response.on('data', function (chunk: any) {
        output += chunk.toString();
      });

      response.on('end', function () {
        try {
          output = output && JSON.parse(output);
          resolve(output);
        } catch (error) {
          reject(error as Error);
        }
      });
    }

    const req = request(options, callback);

    req.on('error', function (err) {
      reject(err)
    });

    if (options?.method === "POST") {
      req.write(JSON.stringify(postPayload));
    }

    req.end();
  });
}

export const getMpesaAuthToken = (consumerKey?: string, consumerSecret?: string): Promise<any | Error> => {
  const encodedConsumerKeyAndSecret = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const options = {
    hostname: process.env.NODE_ENV === "development" ? "sandbox.safaricom.co.ke" : "api.safaricom.co.ke",
    path: "/oauth/v1/generate?grant_type=client_credentials",
    method: "GET",
    headers: {
      "Authorization": `Basic ${encodedConsumerKeyAndSecret}`,
    }
  }
  return makeApiRequest(options);
}

const pad = (n: number): string => (n < 10 ? '0' : '') + n;

/**
 * @description returns timestamp in the format YYYYMMDDHHMMSS
 * @returns {string} date
 */
export const getTimestamp = (): string => {
  const date = new Date();
  return date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds());
}

interface LipaNaMpesaCallbackMetadataItem {
  Name: string;
  Value: any;
}
interface CallbackMetadataItem {
  Key: string;
  Value: any;
}

/**
 * This object helps map MPESA keys to Payment table column names
 */
const KEYS: { [x: string]: string } = {
  'MpesaReceiptNumber': 'mpesa_receipt_no',
  'TransactionReceipt': 'mpesa_receipt_no',
  'Amount': 'amount',
  'TransactionAmount': 'amount',
  'PhoneNumber': 'phone_number',
  'ReceiverPartyPublicName': 'phone_number',
  'TransactionDate': 'payment_date',
  'TransactionCompletedDateTime': 'payment_date'
};

/**
 * @description maps mpesa keys to payment table column names
 * @param itemArray {CallbackMetadataItem}
 * @returns {[string]: any} 
 */
export const mapMpesaKeysToSnakeCase = (itemArray: CallbackMetadataItem[]) => {
  return itemArray.reduce((acc, curr) => {
    if (KEYS[curr.Key]) {
      return {
        ...acc,
        [KEYS[curr.Key]]: formatMpesaValues(curr.Key, curr.Value)
      }
    } 
    return acc;
  }, {});
}

export const mapLipaNaMpesaKeysToSnakeCase = (itemArray: LipaNaMpesaCallbackMetadataItem[]) => {
  return itemArray.reduce((acc, curr) => {
    if (KEYS[curr.Name]) {
      return {
        ...acc,
        [KEYS[curr.Name]]: formatMpesaValues(curr.Name, curr.Value)
      }
    }
    return acc;
  }, {});
}

const formatMpesaValues = (key: string, value: any) => {
  switch (key) {
    case 'TransactionDate':
      return new Date(value);
    case 'TransactionCompletedDateTime':
      const [date, time] = value.split(" ");
      return formatDateTime(date, time);
    case 'PhoneNumber':
      return value.toString();
    case 'ReceiverPartyPublicName':
      return value.substring(0, 12);
    default:
      return value;
  }
}

/**
 * 
 * @param invalidDateString in the format DDMMYYYY
 * @param time 
 * @returns date object
 */
const formatDateTime = (invalidDateString: string, time: string) => {
  const [day, month, year] = invalidDateString.split(".");
  const [hour, min, sec] = time.split(":")

  return new Date(
    parseInt(year, 10), 
    parseInt(month, 10),
    parseInt(day, 10), 
    parseInt(hour, 10),
    parseInt(min, 10),
    parseInt(sec, 10)
  );
}

/**
 * 
 * @param stringToConvert 
 * @returns Uint8Array - byte array
 */
const getByteArray = (stringToConvert: string): Uint8Array => {
  const enc = new TextEncoder();
  return enc.encode(stringToConvert);
}

/**
 * Takes in data in certificate file, gets public key and encrypts initiator pwd
 * @param fileData 
 * @returns string - security credentials
 */
const createSecurityCredentialsFromData = (fileData: Buffer): string => {
  // Get public key
  const publicKey = createPublicKey(fileData).export({ type: 'pkcs1', format: 'pem' });
  // Convert pwd to byte array
  const byteArray = getByteArray(process.env.MPESA_INITIATOR_PWD!);
  return publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_PADDING,
    },
    byteArray
  ).toString('base64');
}

export const getSecurityCredentials = async (): Promise<string> => {
  try {
    const fileKey = process.env.NODE_ENV === "development" ? "SandboxCertificate.cer" : "ProductionCertificate.cer";
    const certificate = await getFileData(fileKey);
    return certificate && certificate.Body ? createSecurityCredentialsFromData(certificate.Body as Buffer) : "";
  } catch (error) {
    throw error;
  }
}

export const urlWithParams = (url: string, params: any): string => {
  let paramsStr = '';

  let first = true;
  Object.keys(params).forEach(key => {
    paramsStr += first ? '?' : '&';
    paramsStr += key;
    paramsStr += '=';
    paramsStr += encodeURIComponent(String(params[key]));

    first = false;
  });

  return url + paramsStr;
}

export const lipaNaMpesaRequest = async (
  amount: number,
  invoiceId: number,
  senderPhoneNumber: string,
  contractId: number,
): Promise<any | Error> => {
  try {
    /**
     * Check to see if you have mpesa token. You can use Redis here
     * If yes, proceed with lipa na mpesa api request
     * if no, generate a new token
     */
    const token = await getMpesaAuthToken(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET);
    const timeStamp = getTimestamp();
    // Head office/store number
    const HEAD_OFFICE_NUMBER = parseInt(process.env.MPESA_ORG_SHORT_CODE!, 10);

    const payload = {
      "BusinessShortCode": HEAD_OFFICE_NUMBER,
      "Password": Buffer.from(`${HEAD_OFFICE_NUMBER}${process.env.PASS_KEY}${timeStamp}`).toString('base64'),
      "Timestamp": timeStamp,
      "TransactionType": "CustomerBuyGoodsOnline",
      "Amount": amount,
      "PartyA": senderPhoneNumber, // the MSISDN sending the funds
      "PartyB": parseInt(process.env.MPESA_TILL_NUMBER!, 10), // Till number
      "PhoneNumber": senderPhoneNumber, // the MSISDN sending the funds
      "CallBackURL": `${process.env.BASE_URL}/api/payments/lipanampesa?invoice_id=${invoiceId}&contract_id=${contractId}`,
      "AccountReference": "Bebataka", // Identifier of the transaction for CustomerBuyGoodsOnline transaction type
      "TransactionDesc": `Payment for invoice with id ${invoiceId}`
    }
    const options = {
      hostname: process.env.NODE_ENV === "development" ? "sandbox.safaricom.co.ke" : "api.safaricom.co.ke",
      path: "/mpesa/stkpush/v1/processrequest",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": `${process.env.BASE_URL}`,
        "Authorization": `Bearer ${token?.access_token}`
      }
    }

    return makeApiRequest(options, payload);
  } catch (error) {
    throw error;
  }
}

export const b2cMpesaRequest = async (
  amount: number,
  invoiceId: number,
  recipientPhoneNumber: string,
  contractId: number,
): Promise<void | Error> => {
  try {
    const token = await getMpesaAuthToken(process.env.CONSUMER_KEY_B2C, process.env.CONSUMER_SECRET_B2C);
    const securityCredentials = await getSecurityCredentials();
    const B2C_SHORT_CODE = parseInt(process.env.MPESA_B2C_SHORT_CODE!, 10);

    // const amountToSend: number = amount - (COMMISSION * amount);
    // Payload for MPESA request to pay recipient
    const parameters = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: securityCredentials,
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: B2C_SHORT_CODE,//  Organization shortcode
      PartyB: recipientPhoneNumber,
      Remarks: "Payment",
      QueueTimeOutURL: `${process.env.BASE_URL}/api/payments/b2c/timeout`,
      ResultURL: `${process.env.BASE_URL}/api/payments/b2c?invoice_id=${invoiceId}&contract_id=${contractId}`,
      Occassion: "pay for service"
    };

    const options = {
      hostname: process.env.NODE_ENV === "development" ? "sandbox.safaricom.co.ke" : "api.safaricom.co.ke",
      path: "/mpesa/b2c/v1/paymentrequest",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token?.access_token}`
      }
    }
    return makeApiRequest(options, parameters);
  } catch (error) {
    throw error;
  }
}

export const getPaymentAmount = (amount: number) => (amount - (amount * COMMISSION));
