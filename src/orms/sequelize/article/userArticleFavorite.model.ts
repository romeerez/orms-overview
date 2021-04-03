import { Model, DataTypes } from 'sequelize';
import { db } from 'orms/sequelize/sequelize';
import { UserArticleFavorite as UserArticleFavoriteType } from 'app/article/article.types';

export class UserArticleFavorite
  extends Model<UserArticleFavoriteType, UserArticleFavoriteType>
  implements UserArticleFavoriteType {
  userId!: number;
  articleId!: number;
}

UserArticleFavorite.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'userArticleFavorite',
    sequelize: db,
  },
);

UserArticleFavorite.removeAttribute('id');
