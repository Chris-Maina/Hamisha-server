import { Model } from 'objection';
import User from './User';

class Customer extends Model {
  id!: number
  user_id!: number
  created_at!: Date
  account!: User

  static get tableName() {
    return 'customers';
  }

  static get relationMappings() {
    return {
      account: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        filter: (query: any) => query.select('id', 'first_name', 'last_name', 'email'),
        join: {
          from: 'customers.user_id',
          to: 'users.id'
        }
      }
    }
  }
}

export default Customer;
