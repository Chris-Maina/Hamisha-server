import { Model } from "objection";
import Customer from "./Customer";
import Mover from "./Mover";

class Contract extends Model {
  static get tableName() {
    return "contracts";
  }

  static get relationMappings() {
    return {
      customer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: "contracts.customer_id",
          to: "customers.id"
        }
      },
      mover: {
        relation: Model.BelongsToOneRelation,
        modelClass: Mover,
        join: {
          from: "contracts.mover_id",
          to: "movers.id"
        }
      }
    }
  }
}

export default Contract;
