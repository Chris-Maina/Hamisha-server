import { Model } from 'objection';
import Proposal from './Proposal';
import Customer from './Customer';

class Job extends Model {
  id!: number
  location!: string
  created_at!: Date
  quantity!: number
  customer_id!: number
  collection_day!: Date
  status!: string
  start_date!: Date
  end_date!: Date

  static get tableName() {
    return "jobs"
  }

  static get relationMappings() {
    return {
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
