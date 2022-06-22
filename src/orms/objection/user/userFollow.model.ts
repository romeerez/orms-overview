import { Model } from 'objection';

export class UserFollow extends Model {
  static tableName = 'userFollow';

  followingId!: number;
  followerId!: number;
}
