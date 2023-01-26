import { Model } from '../model';
import { ArticleModel } from '../article/article.model';
import { CommentModel } from '../comment/comment.model';
import { UserArticleFavoriteModel } from './userArticleFavorite.model';
import { UserFollowModel } from './userFollow.model';

export class UserModel extends Model {
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
    article: this.hasMany(() => ArticleModel, {
      primaryKey: 'id',
      foreignKey: 'authorId',
    }),

    comment: this.hasMany(() => CommentModel, {
      primaryKey: 'id',
      foreignKey: 'authorId',
    }),

    userArticleFavorite: this.hasMany(() => UserArticleFavoriteModel, {
      primaryKey: 'id',
      foreignKey: 'userId',
    }),

    followers: this.hasMany(() => UserFollowModel, {
      primaryKey: 'id',
      foreignKey: 'followingId',
    }),

    followings: this.hasMany(() => UserFollowModel, {
      primaryKey: 'id',
      foreignKey: 'followerId',
    }),
  };
}
