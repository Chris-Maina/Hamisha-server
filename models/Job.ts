import { Model } from 'objection';
import PaymentType from './PaymentType';

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
        filter: (query: any) => query.select('name'),
        join: {
          from: 'jobs.payment_type',
          to: 'payment_types.id'
        } 
      }
    }
  }
}

export default Job;
