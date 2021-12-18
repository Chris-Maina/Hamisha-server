import { request } from "https";
import { 
  publicEncrypt,
  constants,
  X509Certificate
 } from "crypto";
import { readFileSync } from "fs";

export interface MpesaToken {
  access_token: string,
  expires: string
}

interface optionsDef {
  host: string,
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
export const makeApiRequest = (options: optionsDef, postPayload?: any) => {

  return new Promise((resolve, reject) => {
    const callback = function (response: any) {
      let output = "";
      response.setEncoding('utf8');

      if (response.statusCode !== 200) {
        console.log("error response", response)
        reject(new Error("Could not process your payment"))
      }

      response.on('data', function (chunk: any) {
        output += chunk;
      });

      response.on('end', function () {
        resolve(JSON.parse(output));
      });
    }

    const req = request(options, callback);

    req.on('error', function (err) {
      console.log("error ??????", err)
      reject(err)
    });

    if (options.method === "POST") {
      req.write(JSON.stringify(postPayload));
    }

    req.end();
  })
}

export const getMpesaAuthToken = async (): Promise<any> => {

  const options = {
    host: "sandbox.safaricom.co.ke",
    path: "/oauth/v1/generate?grant_type=client_credentials",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${Buffer.from(process.env.CONSUMER_KEY + ":" + process.env.CONSUMER_SECRET).toString("base64")}`,
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

interface CallbackMetadataItem {
  Name: string;
  Value: any;
}

const KEYS: { [x: string]: string } = {
  'MpesaReceiptNumber': 'mpesa_receipt_no',
  'Amount': 'amount',
  'PhoneNumber': 'phone_number',
  'TransactionDate': 'payment_date'
};

/**
 * @description maps mpesa keys to snake case
 * @param itemArray {CallbackMetadataItem}
 * @returns {[string]: any} 
 */
export const mapMpesaKeysToSnakeCase = (itemArray: CallbackMetadataItem[]) => {
  return itemArray.reduce((acc, curr) => {
    if (KEYS[curr.Name]) {
      return { 
        ...acc,
        [KEYS[curr.Name]]: formatMpesaValues(KEYS[curr.Name], curr.Value)
      }
    }
    return acc;
  }, {});
}

const formatMpesaValues = (key: string, value: any) => {
  switch (key) {
    case KEYS['TransactionDate']:
      return new Date(value);
    case KEYS['PhoneNumber']:
      return value.toString();
    default:
      return value;
  }
}

const getByteArray = (stringToConvert: string): Uint8Array => {
  const enc = new TextEncoder();
  return enc.encode(stringToConvert);
}

export const getSecurityCredentials = (): string => {
  try {
    // Read file. Specify file location from root folder
    const x509 = new X509Certificate(readFileSync("security/SandboxCertificate.cer"));
    // Convert pwd to byte array
    const byteArray = getByteArray("Safaricom980!");

    return publicEncrypt(
      {
        key: x509.publicKey,
        padding: constants.RSA_PKCS1_PADDING,
      },
      byteArray
    ).toString('base64');
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
