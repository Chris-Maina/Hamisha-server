import { Model } from "objection";

class Payment extends Model {
  mpesa_receipt_no!: string
  payment_date!: Date
  invoice_id!: number
  phone_number!: number
  amount!: number

  static get tableName() {
    return "payments"
  }
}

export default Payment;