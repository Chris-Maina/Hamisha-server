export const USER_TYPES = {
  CUSTOMER: 'customer',
  MOVER: 'mover',
  ADMIN: 'admin'
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

export const PAYMENT_OPTIONS = {
  1: "LIPA NA MPESA",
  2: "B2C"
}

export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  DECLINED: 'rejected', // job was rejected by mover
  ACCEPTED: 'active', // job has started
  CLOSED: 'closed', // job has been completed successfully
};

export const PAYMENT_STATUS = {
  RECEIVED: "customer payment received", // LipaNaMpesa customer payment has been received successfully
  REQUESTED: "payment requested", // mover completed job and requests for payment
  SENT: "mover payment sent", // B2C mover payment sent successfully
};

export const MESSAGE = 'events/MESSAGE';
export const JOIN_ROOM = 'events/JOIN_ROOM';
export const CREATE_ROOM = 'events/CREATE_ROOM';
export const SOCKET_ERRORS = 'events/SOCKET_ERRORS';
export const ADD_ROOM_MESSAGE = 'events/ADD_ROOM_MESSAGE';
export const FETCH_USER_ROOMS = 'events/FETCH_USER_ROOMS';
export const FETCH_USER_MESSAGES = 'events/FETCH_USER_MESSAGES';
export const LOAD_MESSAGES_IN_ROOM = 'events/LOAD_MESSAGES_IN_ROOM';
export const FETCH_MESSAGES_FROM_ROOM = 'events/FETCH_MESSAGES_FROM_ROOM';
export const FETCH_USER_ROOMS_RESPONSE = 'events/FETCH_USER_ROOMS_RESPONSE';

export const COMMISSION = 0.1;

export const MPESA_API = {
  LipaNaMpesa: "LIPA NA M-PESA ONLINE",
  B2C: "Business To Client"
}

export const FILE_DEST: string = "./public/images";

export const DAYS_OF_THE_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];
