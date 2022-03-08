import { Model } from "objection";
import Invoice from "./Invoice";
import Customer from "./Customer";
import Mover from "./Mover";
import Proposal from "./Proposal";

class Contract extends Model {
  status!: string;
  title!: string;
  proposal_id!: number;
  customer_id!: number;
  mover_id!: number;

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
      proposal: {
        relation: Model.BelongsToOneRelation,
        modelClass: Proposal,
        filter: (query: any) => query.select('id', 'customer_comment', 'movers_comment', 'payment_amount', 'job_id'),
        join: {
          from: "contracts.proposal_id",
          to: "proposals.id"
        },
      },
      invoices: {
        relation: Model.HasManyRelation,
        modelClass: Invoice,
        filter: (query: any) => query.select('id'),
        join: {
          from: "contracts.id",
          to: "invoices.contract_id"
        }
      }
    };
  };
};

export default Contract;
