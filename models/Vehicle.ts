import { Model } from "objection";

class Vehicle extends Model {
  reg_number!: string
  mover_id!: number
  vehicle_type!: string
  vehicle_pic!: string

  static get tableName() {
    return "vehicles";
  }

  static get idColumn() {
    return "reg_number";
  }
}

export default Vehicle;
