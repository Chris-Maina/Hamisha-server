import { Model } from "objection";

class Room extends Model {
  id!: number
  name!: string

  static get tableName() {
    return "rooms";
  }
}

export default Room;