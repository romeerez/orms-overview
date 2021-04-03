import { Model, DataTypes } from 'sequelize';
import { db } from 'orms/sequelize/sequelize';
import { UserFollow as UserFollowType } from 'app/user/user.types';

export class UserFollow
  extends Model<UserFollowType, UserFollowType>
  implements UserFollowType {
  followerId!: number;
  followingId!: number;
}

UserFollow.init(
  {
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'userFollow',
    sequelize: db,
  },
);

UserFollow.removeAttribute('id');
