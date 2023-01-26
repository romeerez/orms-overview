import { BaseTable } from '../baseTable';
import { UserTable } from '../user/user.table';
import { ArticleTagTable } from './articleTag.table';
import { CommentTable } from '../comment/comment.table';
import { UserArticleFavoriteTable } from '../user/userArticleFavorite.table';
import { TagTable } from '../tag/tag.table';

export type Article = ArticleTable['columns']['type'];
export class ArticleTable extends BaseTable {
  table = 'article';

  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    authorId: t
      .integer()
      .foreignKey(() => UserTable, 'id')
      .index(),
    slug: t.text().unique(),
    title: t.text(),
    description: t.text(),
    body: t.text(),
    favoritesCount: t.integer().default(0),
    ...t.timestamps(),
  }));

  relations = {
    author: this.belongsTo(() => UserTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'authorId',
    }),

    articleTags: this.hasMany(() => ArticleTagTable, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    tags: this.hasMany(() => TagTable, {
      through: 'articleTags',
      source: 'tag',
    }),

    comments: this.hasMany(() => CommentTable, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    userArticleFavorites: this.hasMany(() => UserArticleFavoriteTable, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),
  };
}
