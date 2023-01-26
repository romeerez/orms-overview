import { BaseTable } from '../baseTable';
import { UserTable } from './user.table';
import { ArticleTable } from '../article/article.table';

export class UserArticleFavoriteTable extends BaseTable {
  table = 'userArticleFavorite';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    userId: t
      .integer()
      .foreignKey(() => UserTable, 'id')
      .index(),
    articleId: t
      .integer()
      .foreignKey(() => ArticleTable, 'id')
      .index(),
    ...t.unique(['userId', 'articleId']),
  }));

  relations = {
    user: this.belongsTo(() => UserTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'userId',
    }),

    article: this.belongsTo(() => ArticleTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),
  };
}
