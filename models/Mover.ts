import { Model } from 'objection';
import Contract from './Contract';
import Proposal from './Proposal';
import User from './User';
import Vehicle from './Vehicle';

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
      },
      vehicles: {
        relation: Model.HasManyRelation,
        modelClass: Vehicle,
        filter: (query: any) => query.select('reg_number', 'vehicle_type', 'vehicle_pic'),
        join: {
          from: "movers.id",
          to: "vehicles.mover_id"
        }
      },
      contracts: {
        relation: Model.HasManyRelation,
        modelClass: Contract,
        join: {
          from: "movers.id",
          to: "contracts.mover_id"
        }
      },
      proposals: {
        relation: Model.HasManyRelation,
        modelClass: Proposal,
        join: {
          from: "movers.id",
          to: "proposals.mover_id"
        }
      }
    }
  }
}

export default Mover;
