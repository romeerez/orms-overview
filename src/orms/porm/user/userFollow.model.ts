import { Model } from '../model';
import { UserModel } from './user.model';

export class UserFollowModel extends Model {
  table = 'userFollow';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    followerId: t
      .integer()
      .foreignKey(() => UserModel, 'id')
      .index(),
    followingId: t
      .integer()
      .foreignKey(() => UserModel, 'id')
      .index(),
    ...t.unique(['followerId', 'followingId']),
  }));

  relations = {
    follower: this.belongsTo(() => UserModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'followerId',
    }),

    followee: this.belongsTo(() => UserModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'followingId',
    }),
  };
}
