import { Model } from 'objection';

export class User extends Model {
  static tableName = 'user';

  id!: number;
  email!: string;
  username!: string;
  password!: string;
  image?: string;
  bio?: string;
}
