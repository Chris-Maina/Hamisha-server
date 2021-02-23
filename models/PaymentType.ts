import { Model } from 'objection';

class PaymentType extends Model {
  id!: number
  name!: string
  
  static get tableName() {
    return 'payment_types';
  }
}

export default PaymentType