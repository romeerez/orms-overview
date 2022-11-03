import { Model } from '../model';
import { UserModel } from '../user/user.model';
import { ArticleTagModel } from './articleTag.model';
import { CommentModel } from '../comment/comment.model';
import { UserArticleFavoriteModel } from '../user/userArticleFavorite.model';
import { TagModel } from '../tag/tag.model';

export type Article = ArticleModel['columns']['type'];
export class ArticleModel extends Model {
  table = 'article';

  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    authorId: t
      .integer()
      .foreignKey(() => UserModel, 'id')
      .index(),
    slug: t.text().unique(),
    title: t.text(),
    description: t.text(),
    body: t.text(),
    favoritesCount: t.integer().default(0),
    ...t.timestamps(),
  }));

  relations = {
    author: this.belongsTo(() => UserModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'authorId',
    }),

    articleTags: this.hasMany(() => ArticleTagModel, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    tags: this.hasMany(() => TagModel, {
      through: 'articleTags',
      source: 'tag',
    }),

    comments: this.hasMany(() => CommentModel, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    userArticleFavorites: this.hasMany(() => UserArticleFavoriteModel, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),
  };
}
