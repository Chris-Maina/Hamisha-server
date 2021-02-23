import bcrypt from 'bcrypt';
import { Model } from 'objection';

class User extends Model {
  id!: number
  email!: string
  first_name!: string
  last_name!: string
  password!: string
  location!: string

  static get tableName() {
    return 'users'
  }

  static validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword)
  }

  static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }
}

export default User;
