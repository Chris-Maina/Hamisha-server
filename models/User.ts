import bcrypt from 'bcrypt';
import { Model } from 'objection';

import Mover from './Mover';
import Customer from './Customer';

class User extends Model {
  id!: number
  email!: string
  first_name!: string
  last_name!: string
  password!: string
  location!: string
  customer!: Customer
  mover!: Mover

  static get tableName() {
    return 'users'
  }

  static validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword)
  }

  static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  static get relationMappings() {
    return {
      customer: {
        relation: Model.HasOneRelation,
        modelClass: Customer,
        filter: (query: any) => query.select('id', 'created_at'),
        join: {
          from: 'users.id',
          to: 'customers.user_id'
        }
      },
      mover: {
        relation: Model.HasOneRelation,
        modelClass: Mover,
        filter: (query: any) => query.select('id', 'created_at', 'description'),
        join: {
          from: 'users.id',
          to: 'movers.user_id'
        }
      },
    }
  }
}

export default User;
