import { Model } from "objection";
import Job from "./Job";
import Mover from "./Mover";
import Contract from "./Contract";
import PaymentType from "./PaymentType";

class Proposal extends Model {
  id!: number
  job_id!: number
  status!: string
  mover_id!: number
  created_at!: Date
  payment_type!: number
  payment_amount!: number
  mover!: Mover
  job_type!: PaymentType

  static get tableName() {
    return "proposals";
  }

  static get relationMappings() {
    return {
      mover: {
        relation: Model.BelongsToOneRelation,
        modelClass: Mover,
        filter: (query: any) => query.select('id', 'user_id'),
        join: {
          from: "proposals.mover_id",
          to: "movers.id"
        }
      },
      job_type: {
        relation: Model.BelongsToOneRelation,
        modelClass: PaymentType,
        filter: (query: any) => query.select('id', 'name'),
        join: {
          from: 'proposals.payment_type',
          to: 'payment_types.id'
        }
      },
      job: {
        relation: Model.BelongsToOneRelation,
        modelClass: Job,
        filter: (query: any) => query.select('id', 'title'),
        join: {
          from: "proposals.job_id",
          to: "jobs.id"
        }
      },
      contract: {
        relation: Model.HasOneRelation,
        modelClass: Contract,
        filter: (query: any) => query.select('id'),
        join: {
          from: "proposals.id",
          to: "contracts.proposal_id"
        }
      }
    }
  }
}

export default Proposal;
