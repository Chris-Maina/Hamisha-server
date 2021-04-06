import dotenv from 'dotenv';
// load env variables
dotenv.config();
import cors from 'cors';
import morgan from 'morgan';
import EventEmitter from "events";
import { Model } from 'objection';
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';

import routes from './controlers';
import knex from './knex';
import {
  MESSAGE,
  JOIN_ROOM,
  CREATE_ROOM,
  SOCKET_ERRORS,
  FETCH_USER_ROOMS,
  ADD_ROOM_MESSAGE,
  LOAD_MESSAGES_IN_ROOM,
  PARTICIPANTS_JOIN_ROOM,
  FETCH_MESSAGES_FROM_ROOM,
} from './common/constants';
import { Message, Participants, Room } from './models';

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
  const socketIOEE = new EventEmitter();
  console.log('Connected to web socket successfully');

  // Handle creating a room with participants
  socket.on(CREATE_ROOM, async ({ name, participants }) => {
    try {
      const response = await Room.query().insert({ name });
      // add participants
      socketIOEE.emit(PARTICIPANTS_JOIN_ROOM, { room_id: response.id, participants });
  
      socket.join(response.id.toString());
      socket.emit(CREATE_ROOM, response);
    } catch (error) {
      socket.emit(SOCKET_ERRORS, error);
    }
  });

  // Handle adding message(s) to a room
  socket.on(ADD_ROOM_MESSAGE, async ({ roomId, msg, sender }) => {
    try {
      const response = await Message.query().insert({
        text: msg,
        room_id: roomId,   // sent message to
        user_id: sender.id // sent message from
      });


      io.to(roomId.toString()).emit(MESSAGE, response);
    } catch (error) {
      socket.emit(SOCKET_ERRORS, error);
    }
  });

  // Handle fetching messages from a room
  socket.on(FETCH_MESSAGES_FROM_ROOM, async ({ room_id }) => {
    try {
      const response = await Message
        .query()
        .where('room_id', room_id)

      socket.emit(LOAD_MESSAGES_IN_ROOM, response);
    } catch (error) {
      // add error handler that conforms to the error midleware
      socket.emit(SOCKET_ERRORS, error);
    }
  });

  // Handle rooms request on connect
  socket.on(FETCH_USER_ROOMS, async ({ user_id }) => {
    try {
      const response = await Room.query().where("user_id", user_id);
    } catch (error) {
      // add error handler that conforms to the error midleware
      socket.emit(SOCKET_ERRORS, error);
    }
  });

  // Listen to PARTICIPANTS_JOIN_ROOM events and handle participants joining a room
  socketIOEE.on(PARTICIPANTS_JOIN_ROOM, async ({ room_id, participants }) => {
    const joinRequests = participants.map(async (user_id: number) => {
      const hasJoined = await Participants.query().findOne({ room_id, user_id });
      if (hasJoined) return hasJoined;
      const participant = await Participants.query().insert({ user_id, room_id });
      return participant;
    });
    await Promise.all(joinRequests);
  });

  // Handle fetching a room
  // Handle leave room/switch rooms

  // Handle joining room
  socket.on(JOIN_ROOM, ({ room_id }) => {
    socket.join(room_id.toString());
  });
});

httpServer.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`))
