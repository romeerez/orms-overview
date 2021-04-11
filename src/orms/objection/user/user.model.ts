import { BaseModel } from 'orms/objection/model';

export class User extends BaseModel {
  static tableName = 'user';

  id!: number;
  email!: string;
  username!: string;
  password!: string;
  image?: string;
  bio?: string;
}
