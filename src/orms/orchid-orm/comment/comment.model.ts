import { Model } from '../model';
import { UserModel } from '../user/user.model';
import { ArticleModel } from '../article/article.model';

export class CommentModel extends Model {
  table = 'comment';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    authorId: t.integer().foreignKey(() => UserModel, 'id'),
    articleId: t.integer().foreignKey(() => ArticleModel, 'id'),
    body: t.text(),
    ...t.timestamps(),
  }));

  relations = {
    article: this.belongsTo(() => ArticleModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    author: this.belongsTo(() => UserModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'authorId',
    }),
  };
}
