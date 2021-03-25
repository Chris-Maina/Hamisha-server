import { Model } from "objection";

class Proposal extends Model {
  id!: number
  job_id!: number
  status!: string
  mover_id!: number
  created_at!: Date
  payment_type!: number
  payment_amount!: number

  static get tableName() {
    return "proposals";
  }

  // static get relationMappings() {}
}

export default Proposal;
