import { Model, DataTypes, Optional } from 'sequelize';
import { db } from 'orms/sequelize/sequelize';
import { User } from 'orms/sequelize/user/user.model';
import { Article } from 'orms/sequelize/article/article.model';
import { Comment as CommentType } from 'app/comment/comment.types';

type CommentCreate = Optional<CommentType, 'id'>;

export class Comment
  extends Model<CommentType, CommentCreate>
  implements CommentType {
  authorId!: number;
  author?: typeof User;
  articleId!: number;
  article?: typeof Article;
  id!: number;
  body!: string;
  updatedAt!: Date;
  createdAt!: Date;
}

Comment.init(
  {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: 'comment',
    sequelize: db,
  },
);

Comment.belongsTo(User, { as: 'author' });
