import dotenv from 'dotenv';
// load env variables
dotenv.config();
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';

import routes from './controlers';
import knex from './knex';
import {
  MESSAGE,
  CREATE_ROOM,
  SOCKET_ERRORS,
  PRIVATE_MESSAGE,
  ADD_ROOM_MESSAGE,
  LOAD_MESSAGES_IN_ROOM
} from './common/constants';
import { Message, Room } from './models';

// Bind all Models to a knex instance.
Model.knex(knex);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

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

io.on("connection", (socket: Socket) => {
  console.log('Connected to web socket successfully');
  // Handle room creation
  socket.on(CREATE_ROOM, async ({ name }) => {
    // API request to create a room
    try {
      let response = await Room.query().findOne({ name });

      if (!response) {
        response = await Room.query().insert({ name });
      } else {
        // emit load messages
        const messages = await Message.query().where('room_id', response.id);
        socket.emit(LOAD_MESSAGES_IN_ROOM, messages);
      }
      socket.join(response.id.toString());
      socket.emit(CREATE_ROOM, response);
    } catch (error) {
      socket.emit(SOCKET_ERRORS, error);
    }
  });

  // Handle fetching a room
  // Handle leave room/switch rooms

  // Handle private messages
  socket.on(PRIVATE_MESSAGE, async (anotherSocketId, msg) => {
    socket.to(anotherSocketId).emit(PRIVATE_MESSAGE, socket.id, msg);
  });

  // Handle room messages
  socket.on(ADD_ROOM_MESSAGE, async ({ roomId, msg, user }) => {
    try {
      const response = await Message.query().insert({
        text: msg,
        room_id: roomId,
        user_id: user.id
      });

      io.to(roomId.toString()).emit(MESSAGE, response);
    } catch (error) {
      socket.emit(SOCKET_ERRORS, error);
    }
  });
});

httpServer.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`))
