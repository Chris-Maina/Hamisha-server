import { Model } from "objection";
import Customer from "./Customer";
import Mover from "./Mover";
import PaymentType from "./PaymentType";
import Proposal from "./Proposal";

class Contract extends Model {
  static get tableName() {
    return "contracts";
  }

  static get relationMappings() {
    return {
      customer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Customer,
        filter: (query: any) => query.select('id', 'user_id'),
        join: {
          from: "contracts.customer_id",
          to: "customers.id"
        }
      },
      mover: {
        relation: Model.BelongsToOneRelation,
        modelClass: Mover,
        filter: (query: any) => query.select('id', 'user_id'),
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
      proposal: {
        relation: Model.BelongsToOneRelation,
        modelClass: Proposal,
        filter: (query: any) => query.select('id', 'customer_comment', 'mover_comment'),
        join: {
          from: "contracts.proposal_id",
          to: "proposals.id"
        },
      }
    };
  };
};

export default Contract;
