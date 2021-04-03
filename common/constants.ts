export const USER_TYPES = {
  CUSTOMER: 'customer',
  MOVER: 'mover'
}

export const PROPOSAL_STATUS = {
  SENT: 'proposal sent',
  WITHDRAW: 'proposal withdrawn',
  REJECTED: 'proposal rejected',
  ACCEPTED: 'proposal accepted',
  NEGOTIATION: 'negotiation phase',
  JOB_START: 'job started',
  JOB_SUCCESS: 'job finished(successfully)',
  JOB_UNSUCCESS: 'job finished(unsuccessfully)'
};
export const PRIVATE_MESSAGE = 'events/PRIVATE_MESSAGE';
export const CREATE_ROOM = 'events/CREATE_ROOM';
export const ADD_ROOM_MESSAGE = 'events/ADD_ROOM_MESSAGE';
export const MESSAGE = 'events/MESSAGE';
export const SOCKET_ERRORS = 'events/SOCKET_ERRORS';
export const LOAD_MESSAGES_IN_ROOM = 'events/LOAD_MESSAGES_IN_ROOM';
export const FETCH_USER_ROOMS = 'events/FETCH_USER_ROOMS';
export const FETCH_USER_ROOMS_RESPONSE = 'events/FETCH_USER_ROOMS_RESPONSE';