import { Model } from "objection";
import User from "./User";
import Invoice from "./Invoice";

class Billing extends Model {
  id!: number
  invoice_id!: number
  user_id!: number
  status!: string

  static get tableName() {
    return "billings"
  }

  static get relationMappings() {
    return {
      billed_to: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        filter: (query: any) => query.select('id', 'first_name', 'last_name'),
        join: {
          from: 'billings.user_id',
          to: 'users.id'
        }
      },
      invoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: Invoice,
        filter: (query: any) => query.select('id', 'total', 'issued_by'),
        join: {
          from: 'billings.invoice_id',
          to: 'invoice.id'
        } 
      }
    }
  }
}

export default Billing;
