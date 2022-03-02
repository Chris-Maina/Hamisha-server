import { Model } from 'objection';
import Contract from './Contract';
import Payment from './Payment';
import User from './User';

/**
 * An invoice is a payment demand issued by a seller to the buyer of goods or services after the sale
 */
class Invoice extends Model {
  id!: number
  created_at!: Date
  updated_at!: Date
  contract_id!: number
  description!: string
  issued_by!: number
  issued_to!: number
  total!: number
  recipient: User | undefined;
  creator: User | undefined;

  static get tableName() {
    return "invoices";
  }


  static get relationMappings() {
    return {
      // represents the seller of service
       creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        filter: (query: any) => query.select('id', 'first_name', 'last_name'),
        join: {
          from: "invoices.issued_by",
          to: "users.id"
        }
      },
      // represent the person receiving the invoice i.e buyer/recipient of service
      recipient: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        filter: (query: any) => query.select('id', 'first_name', 'last_name', 'phone_number'),
        join: {
          from: "invoices.issued_to",
          to: "users.id"
        }
      },
      contract: {
        relation: Model.BelongsToOneRelation,
        modelClass: Contract,
        filter: (query: any) => query.select('id', 'title'),
        join: {
          from: "invoices.contract_id",
          to: "contracts.id"
        }
      },
      payment: {
        relation: Model.HasOneRelation,
        modelClass: Payment,
        filter: (query: any) => query.select('mpesa_receipt_no', 'status'),
        join: {
          from: "invoices.id",
          to: "payments.invoice_id"
        }
      }
    }
  }
}

export default Invoice;
