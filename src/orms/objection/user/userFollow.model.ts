import { BaseModel } from 'orms/objection/model';

export class UserFollow extends BaseModel {
  static tableName = 'userFollow';

  followingId!: number;
  followerId!: number;
}
