import { BaseTable } from '../baseTable';
import { UserTable } from './user.table';

export class UserFollowTable extends BaseTable {
  table = 'userFollow';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    followerId: t
      .integer()
      .foreignKey(() => UserTable, 'id')
      .index(),
    followingId: t
      .integer()
      .foreignKey(() => UserTable, 'id')
      .index(),
    ...t.unique(['followerId', 'followingId']),
  }));

  relations = {
    follower: this.belongsTo(() => UserTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'followerId',
    }),

    followee: this.belongsTo(() => UserTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'followingId',
    }),
  };
}
