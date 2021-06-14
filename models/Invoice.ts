import { Model } from 'objection';
import Contract from './Contract';
import User from './User';

class Invoice extends Model {
  id!: number
  created_at!: Date
  updated_at!: Date
  contract_id!: number
  description!: string
  user_id!: number

  static get tableName() {
    return "invoices";
  }


  static get relationMappings() {
    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        filter: (query: any) => query.select('id', 'first_name', 'last_name'),
        join: {
          from: "invoices.issued_by",
          to: "users.id"
        }
      },
      recipient: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        filter: (query: any) => query.select('id', 'first_name', 'last_name'),
        join: {
          from: "invoices.issued_to",
          to: "users.id"
        }
      },
      contract: {
        relation: Model.BelongsToOneRelation,
        modelClass: Contract,
        filter: (query: any) => query.select('id', 'payment_amount'),
        join: {
          from: "invoices.contract_id",
          to: "contracts.id"
        }
      }
    }
  }
}

export default Invoice;
