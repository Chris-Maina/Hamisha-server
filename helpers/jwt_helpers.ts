import JWT from 'jsonwebtoken';
import createHttpError, { HttpError } from 'http-errors';
import { Response, NextFunction } from 'express';

import { RequestWithPayload } from '../common/interfaces';

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET KEY';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'REFRESH SECRET KEY';

/**
 * A promise that resolves to a token or an error
 * @param {Number} userId
 * @returns {Promise}
 */
export const generateToken = (userId: Number): Promise<string | undefined | HttpError> => {
  const payload = { id: userId };
  const options = {
    expiresIn: '23h' //TODO: Update to 1d or 23h
  }
  return new Promise((resolve, reject) => {
    JWT.sign(payload, JWT_SECRET, options, (err, token) => {
      if (err) reject(new createHttpError.InternalServerError());
      resolve(token);
    });
  });
}

/**
 * Middleware to verify token
 * @param {RequestWithPayload} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const verifyToken = (req: RequestWithPayload, _res: Response, next: NextFunction) => {
  if (!req.headers.authorization) return new createHttpError.Unauthorized();
  const authHeader = req.headers.authorization.split(' ');
  const token = authHeader[1];
  JWT.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return next(createHttpError(401, {
        name: err.name,
        message: "Unauthorized. Login to get valid token!!."
      }));
    }

    req.payload = payload;
    next()
  });
}

/**
 * A promise that resolves to a refresh token or an error
 * @param {number} userId 
 * @param {Response} response
 * @returns {Promise}
 */
export const generateRefreshToken = (userId: Number, response: Response): Promise<string | undefined | HttpError> => {
  const payload = { id: userId };
  const options = {
    expiresIn: '3d'
  };

  return new Promise((resolve, reject) => {
    JWT.sign(payload, JWT_REFRESH_SECRET, options, (err, token) => {
      if (err) return reject(new createHttpError.InternalServerError());
      // Save refresh token in cookie to use across the app
      response.cookie('refreshToken', token,  {
        maxAge: 259200000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      });
      resolve(token);
    })
  })
}

/**
 * A promise that resolves with the decoded payload
 * @param {string} token 
 */
export const verifyRefreshToken = (token: string): Promise<any | HttpError> => {
  return new Promise ((resolve, reject) => {
    JWT.verify(token, JWT_REFRESH_SECRET, (err, payload: any) => {
      if (err) reject(
        createHttpError(401, {
          name: err.name,
          message: "Unauthorized. Login to get valid token."
        })
      );
      resolve(payload);
    });
  });
}
