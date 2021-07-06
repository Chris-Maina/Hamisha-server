import { Model } from 'objection';
import User from './User';

class Mover extends Model {
  id!: number
  user_id!: number
  description!: string
  account!: User
  created_at!: Date

  static get tableName() {
    return 'movers'
  }

  static get relationMappings() {
    return {
      account: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        filter: (query: any) => query.select('id', 'first_name', 'last_name', 'email'),
        join: {
          from: 'movers.user_id',
          to: 'users.id'
        }
      }
    }
  }
}

export default Mover;
