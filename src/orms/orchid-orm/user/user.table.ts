import { BaseTable } from '../baseTable';
import { ArticleTable } from '../article/article.table';
import { CommentTable } from '../comment/comment.table';
import { UserArticleFavoriteTable } from './userArticleFavorite.table';
import { UserFollowTable } from './userFollow.table';

export class UserTable extends BaseTable {
  table = 'user';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    email: t.text().unique(),
    username: t.text().unique(),
    password: t.text(),
    bio: t.text().nullable(),
    image: t.text().nullable(),
  }));

  relations = {
    article: this.hasMany(() => ArticleTable, {
      primaryKey: 'id',
      foreignKey: 'authorId',
    }),

    comment: this.hasMany(() => CommentTable, {
      primaryKey: 'id',
      foreignKey: 'authorId',
    }),

    userArticleFavorite: this.hasMany(() => UserArticleFavoriteTable, {
      primaryKey: 'id',
      foreignKey: 'userId',
    }),

    followers: this.hasMany(() => UserFollowTable, {
      primaryKey: 'id',
      foreignKey: 'followingId',
    }),

    followings: this.hasMany(() => UserFollowTable, {
      primaryKey: 'id',
      foreignKey: 'followerId',
    }),
  };
}
