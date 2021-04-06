import { Model } from "objection";
import User from "./User";

class Participants extends Model {
  id!: number
  user_id!: number
  room_id!: number

  static get tableName() {
    return "participants";
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "participants.user_id",
          to: "users.id"
        }
      }
    }
  }
}

export default Participants;
