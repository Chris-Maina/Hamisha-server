import { Model } from "objection";
import Mover from "./Mover";

class Vehicle extends Model {
  reg_number!: string
  mover_id!: number
  vehicle_type!: string
  vehicle_pic!: string
  mover!: Mover

  static get tableName() {
    return "vehicles";
  }

  static get idColumn() {
    return "reg_number";
  }

  static get relationMappings() {
    return {
      mover: {
        relation: Model.BelongsToOneRelation,
        modelClass: Mover,
        join: {
          from: "vehicles.mover_id",
          to: "movers.id"
        }
      }
    }
  }
}

export default Vehicle;
