import { BaseTable } from '../baseTable';
import { UserTable } from '../user/user.table';
import { ArticleTable } from '../article/article.table';

export class CommentTable extends BaseTable {
  table = 'comment';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    authorId: t.integer().foreignKey(() => UserTable, 'id'),
    articleId: t.integer().foreignKey(() => ArticleTable, 'id'),
    body: t.text(),
    ...t.timestamps(),
  }));

  relations = {
    article: this.belongsTo(() => ArticleTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    author: this.belongsTo(() => UserTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'authorId',
    }),
  };
}
