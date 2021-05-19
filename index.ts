import dotenv from 'dotenv';
// load env variables
dotenv.config();
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';
import { createServer } from "http";
import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';

import knex from './knex';
import routes from './controlers';
import initializeSocketIO from './socket';

// Bind all Models to a knex instance.
Model.knex(knex);

const app = express();
const httpServer = createServer(app);
// initializeSocketIO(httpServer);

/* Middlewares */
app.use(cors({ credentials: true, origin: true }));
app.use(morgan('dev'));
// Parse request body
app.use(express.json());
// Parse form data
app.use(express.urlencoded({ extended: false }));

/* Endpoints */
app.use('/api', routes);

/** Handle route not found error */
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new createError.NotFound());
});

/* Error handling Middleware */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500)
  res.send({ message: err.message || 'Internal Server Error'})
});

const PORT = process.env.PORT || 3100;

httpServer.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`))
