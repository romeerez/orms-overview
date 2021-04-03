import { Model, DataTypes } from 'sequelize';
import { db } from 'orms/sequelize/sequelize';
import { ArticleTag as ArticleTagType } from 'app/article/article.types';

export class ArticleTag
  extends Model<ArticleTagType, ArticleTagType>
  implements ArticleTagType {
  articleId!: number;
  tagId!: number;
}

ArticleTag.init(
  {
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'articleTag',
    sequelize: db,
  },
);

ArticleTag.removeAttribute('id');
