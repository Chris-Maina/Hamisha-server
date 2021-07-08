import { Model } from 'objection';
import Proposal from './Proposal';
import PaymentType from './PaymentType';
import Customer from './Customer';

class Job extends Model {
  id!: number
  title!: string
  created_at!: Date
  payment_type!: number | { name: string }
  expected_duration!: string
  payment_amount!: number
  customer_id!: number
  description!: string

  static get tableName() {
    return "jobs"
  }

  static get relationMappings() {
    return {
      job_type: {
        relation: Model.BelongsToOneRelation,
        modelClass: PaymentType,
        filter: (query: any) => query.select('id', 'name'),
        join: {
          from: 'jobs.payment_type',
          to: 'payment_types.id'
        } 
      },
      customer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Customer,
        filter: (query: any) => query.select('user_id'),
        join: {
          from: 'jobs.customer_id',
          to: 'customers.id'
        }
      },
      proposals: {
        relation: Model.HasManyRelation,
        modelClass: Proposal,
        filter: (query: any) => query.select(
          'id', 'status', 'payment_amount', 'created_at', 'mover_id', 'job_id'
        ),
        join: {
          from: 'jobs.id',
          to: 'proposals.job_id',
        }
      }
    }
  }
}

export default Job;
