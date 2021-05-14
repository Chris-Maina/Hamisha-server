import { Socket, Server } from "socket.io";

import {
  MESSAGE,
  JOIN_ROOM,
  CREATE_ROOM,
  SOCKET_ERRORS,
  FETCH_USER_ROOMS,
  ADD_ROOM_MESSAGE,
  LOAD_MESSAGES_IN_ROOM,
  FETCH_MESSAGES_FROM_ROOM,
  FETCH_USER_ROOMS_RESPONSE,
} from './common/constants';
import { Message, Participants, Room, User } from './models';

const initializeSocketIO = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log('Connected to web socket successfully');

    // Handle creating a room with participants
    socket.on(CREATE_ROOM, async ({ name, participants }) => {
      try {
        const response = await Room.query().insert({ name });
        // add participants
        const addedParticipants = await addParticipants({ room_id: response.id, participants });

        const room = { ...response, participants: addedParticipants, messages: [] };
        socket.join(room.id.toString());
        socket.emit(CREATE_ROOM, room);
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

    // Handle fetching user rooms.
    socket.on(FETCH_USER_ROOMS, async ({ user_id }) => {
      try {
        const response = await User
          .query()
          .select('id', 'email')
          .findById(user_id)
          .withGraphFetched({
            rooms: {
              messages: true,
              participants: {
                user: true
              },
            }
          });

        socket.emit(FETCH_USER_ROOMS_RESPONSE, response.rooms);
      } catch (error) {
        // add error handler that conforms to the error midleware
        socket.emit(SOCKET_ERRORS, error);
      }
    });

    // Handle fetching a room
    // Handle leave room/switch rooms

    // Handle joining room
    socket.on(JOIN_ROOM, async ({ room_id }) => {
      const response = await Message
        .query()
        .where('room_id', room_id);

      socket.join(room_id.toString());
      socket.emit(LOAD_MESSAGES_IN_ROOM, response);
    });
  });
}

interface AddParticipantsProps {
  room_id: number;
  participants: number[];
}

const addParticipants = async ({ room_id, participants }: AddParticipantsProps) => {
  const joinRequests = participants.map(async (user_id: number) => {
    const hasJoined = await Participants
      .query()
      .findOne({ room_id, user_id })
      .withGraphFetched({
        user: true
      });
    if (hasJoined) return hasJoined;
    const participant = await Participants
      .query()
      .insert({ user_id, room_id })
      .withGraphFetched({
        user: true
      });
    return participant;
  });
  return Promise.all(joinRequests);;
}

export default initializeSocketIO;
