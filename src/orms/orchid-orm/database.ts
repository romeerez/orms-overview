import { orchidORM } from 'orchid-orm';
import config from '../../config';
import { ArticleModel } from './article/article.model';
import { ArticleTagModel } from './article/articleTag.model';
import { CommentModel } from './comment/comment.model';
import { TagModel } from './tag/tag.model';
import { UserModel } from './user/user.model';
import { UserArticleFavoriteModel } from './user/userArticleFavorite.model';
import { UserFollowModel } from './user/userFollow.model';

export type Db = typeof db;
export const db = orchidORM(
  {
    databaseURL: config.dbUrl,
    log: false,
  },
  {
    article: ArticleModel,
    articleTag: ArticleTagModel,
    comment: CommentModel,
    tag: TagModel,
    user: UserModel,
    userArticleFavorite: UserArticleFavoriteModel,
    userFollow: UserFollowModel,
  },
);
