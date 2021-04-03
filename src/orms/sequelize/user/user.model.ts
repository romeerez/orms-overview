import { Model, DataTypes, Optional } from 'sequelize';
import { db } from 'orms/sequelize/sequelize';
import { UserWithPassword } from 'app/user/user.types';
import { UserFollow } from 'orms/sequelize/user/userFollow.model';

type UserCreate = Optional<UserWithPassword, 'id'>;

export class User
  extends Model<UserWithPassword, UserCreate>
  implements UserWithPassword {
  id!: number;
  email!: string;
  username!: string;
  password!: string;
  bio!: string;
  image!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'user',
    sequelize: db,
  },
);

User.hasMany(UserFollow, {
  as: 'followedBy',
  foreignKey: 'followingId',
});
