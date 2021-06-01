import { request } from "http";

export interface MpesaToken {
  access_token: string,
  expires: string
}

interface optionsDef {
  host: string,
  path: string,
  port?: string,
  method?: string,
  headers?: {
    [key: string]: string
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
      response.on('data', function (chunk: any) {
        output += chunk;
      });

      response.on('end', function () {
        resolve(JSON.parse(output));
      });
    }
    const req = request(options, callback);

    if (options.method === "POST") {
      req.write(postPayload);
    }

    req.on('error', function (err) {
      // Handle error
      reject(err)
    });
    req.end();
  })
}

export const getMpesaAuthToken = (): Promise<any> => {

  const auth = "Basic " +  Buffer.from(process.env.CONSUMER_KEY + ":" + process.env.CONSUMER_SECRET).toString("base64");
  const options = {
    host: "sandbox.safaricom.co.ke",
    path: "/oauth/v1/generate?grant_type=client_credentials",
    headers: {
      "Authorization": auth,
    }
  }

  return makeApiRequest(options);
}
