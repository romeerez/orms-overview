import {
  Model,
  DataTypes,
  Optional,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import { db } from 'orms/sequelize/sequelize';
import { Article as ArticleType } from 'app/article/article.types';
import { User } from 'orms/sequelize/user/user.model';
import { ArticleTag } from 'orms/sequelize/article/articleTag.model';
import { UserArticleFavorite } from 'orms/sequelize/article/userArticleFavorite.model';
import { Comment } from 'orms/sequelize/comment/comment.model';

type ArticleCreate = Optional<ArticleType, 'id' | 'favoritesCount'>;

export class Article
  extends Model<ArticleType, ArticleCreate>
  implements ArticleType
{
  id!: number;
  authorId!: number;
  slug!: string;
  title!: string;
  description!: string;
  body!: string;
  favoritesCount!: number;
  author?: typeof User;
  updatedAt!: Date;
  createdAt!: Date;

  getComments!: HasManyGetAssociationsMixin<Comment>;
  createComment!: HasManyCreateAssociationMixin<Comment>;
}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    body: {
      type: DataTypes.STRING,
    },
    favoritesCount: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'article',
    sequelize: db,
  },
);

Article.belongsTo(User, { as: 'author' });
Article.hasMany(UserArticleFavorite, {
  as: 'userFavoriteConnection',
  foreignKey: 'articleId',
});

Article.hasMany(UserArticleFavorite, {
  as: 'userFavoriteConnection2',
  foreignKey: 'articleId',
});

Article.hasMany(ArticleTag, {
  as: 'articleTags',
  foreignKey: 'articleId',
});

Article.hasMany(Comment, {
  as: 'comments',
  foreignKey: 'articleId',
});
