import { request } from "https"

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