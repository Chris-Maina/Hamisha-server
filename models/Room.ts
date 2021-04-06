import { Model } from "objection";
import Message from "./Message";
import Participants from './Participants';

class Room extends Model {
  id!: number
  name!: string

  static get tableName() {
    return "rooms";
  }

  static get relationMappings() {
    return {
      participants: {
        relation: Model.HasManyRelation,
        modelClass: Participants,
        join: {
          from: "rooms.id",
          to: "participants.room_id"
        },
      },
      messages: {
        relation: Model.HasManyRelation,
        modelClass: Message,
        join: {
          from: "rooms.id",
          to: "messages.room_id"
        }
      }
    };
  };
}

export default Room;