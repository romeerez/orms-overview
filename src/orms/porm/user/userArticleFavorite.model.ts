import { Model } from '../model';
import { UserModel } from './user.model';
import { ArticleModel } from '../article/article.model';

export class UserArticleFavoriteModel extends Model {
  table = 'userArticleFavorite';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    userId: t
      .integer()
      .foreignKey(() => UserModel, 'id')
      .index(),
    articleId: t
      .integer()
      .foreignKey(() => ArticleModel, 'id')
      .index(),
    ...t.unique(['userId', 'articleId']),
  }));

  relations = {
    user: this.belongsTo(() => UserModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'userId',
    }),

    article: this.belongsTo(() => ArticleModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),
  };
}
