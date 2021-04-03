import { Model } from "objection";

class Message extends Model {
  text!: string
  id!: number
  created_at!: Date
  updated_at!: Date
  user_id!: number
  room_id!: number

  static get tableName() {
    return "messages";
  }
}

export default Message;
