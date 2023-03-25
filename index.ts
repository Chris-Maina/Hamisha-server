import dotenv from 'dotenv';
// load env variables
dotenv.config();
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';
import { createServer } from "http";
import schedule from "node-schedule";
import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';

import knex from './knex';
import routes from './controlers';
import initializeSocketIO from './socket';
import { sendMailDaemon } from './daemons/mail.daemon';

// Bind all Models to a knex instance.
Model.knex(knex);

const app = express();
const httpServer = createServer(app);
initializeSocketIO(httpServer);

/* Middlewares */
app.use(cors({ credentials: true, origin: true }));
app.use(morgan('dev'));
// Parse request body
app.use(express.json());
// Parse form data
app.use(express.urlencoded({ extended: false }));
// Serve static files such as images
app.use(express.static(__dirname + '/public'));

if (process.env.NODE_ENV === 'production') {
  // Schedule sending mails every 26th of the month
  const rule = new schedule.RecurrenceRule();
  rule.date = 26;
  rule.hour = 12;
  rule.minute = 0;
  sendMailDaemon(rule);
}

/* Endpoints */
app.use('/api', routes);

/** Handle route not found error */
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new createError.NotFound());
});

/* Error handling Middleware */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500);
  if (err.status === 401) {
    res.send({ name: err.name, message: err.message });
  } else {
    res.send({ message: err.message || 'Internal Server Error'})
  }
});

const PORT = process.env.PORT || 3100;

httpServer.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

process.on('SIGINT', function () {
  schedule.gracefulShutdown()
    .then(() => httpServer.close(() => process.exit(0)))
});
