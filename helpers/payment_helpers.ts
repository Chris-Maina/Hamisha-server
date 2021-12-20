import { request } from "https";
import { 
  publicEncrypt,
  constants,
  X509Certificate
 } from "crypto";
import { readFile } from "fs";

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

      if (response.statusCode < 200 || response.statusCode >= 300) {
        console.log("Response error", response.statusCode, response.statusMessage);
        reject(new Error(response.statusMessage || "Could not process your request"));
      }

      response.on('data', function (chunk: any) {
        output += chunk.toString();
      });

      response.on('end', function () {
        try {
          output = output && JSON.parse(output);
        } catch (error) {
          console.log("Parse error", error)
          reject(error);
        }
        resolve(output);
      });
    }

    const req = request(options, callback);

    req.on('error', function (err) {
      console.log("Err response", err)
      reject(err)
    });

    if (options?.method === "POST") {
      req.write(JSON.stringify(postPayload));
    }

    req.end();
  })
}

export const getMpesaAuthToken = async (): Promise<any> => {
  const encodedConsumerKeyAndSecret = Buffer.from(`uuGx7XIog9QUx3tGFuH6BjModO0dVhM1:CNVS5P2OI5k2VIYC`).toString("base64");

  const options = {
    host: "sandbox.safaricom.co.ke",
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

const createSecurityCredentialsFromData = (fileData: Buffer): string => {
  // Convert to X509Certificate
  const x509 = new X509Certificate(fileData);
  // Convert pwd to byte array
  const byteArray = getByteArray("Safaricom980!");
  return publicEncrypt(
    {
      key: x509.publicKey,
      padding: constants.RSA_PKCS1_PADDING,
    },
    byteArray
  ).toString('base64');
}

export const getSecurityCredentials = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Read file asynchronously
    readFile("security/SandboxCertificate.cer", null, (err, data) => {
      if (err) {
        reject(err);
      }
      const securityCredentials: string = createSecurityCredentialsFromData(data)
      resolve(securityCredentials)
    })
  })
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
