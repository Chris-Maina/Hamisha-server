import { Model } from "objection";
import Customer from "./Customer";
import Mover from "./Mover";
import PaymentType from "./PaymentType";

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
      },
      contract_type: {
        relation: Model.BelongsToOneRelation,
        modelClass: PaymentType,
        filter: (query: any) => query.select('id', 'name'),
        join: {
          from: "contracts.payment_type",
          to: "payment_types.id"
        },
      },
    };
  };
};

export default Contract;
