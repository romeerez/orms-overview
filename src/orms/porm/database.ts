import { porm } from 'porm';
import config from '../../config';
import { ArticleModel } from './article/article.model';
import { ArticleTagModel } from './article/articleTag.model';
import { CommentModel } from './comment/comment.model';
import { TagModel } from './tag/tag.model';
import { UserModel } from './user/user.model';
import { UserArticleFavoriteModel } from './user/userArticleFavorite.model';
import { UserFollowModel } from './user/userFollow.model';

export type Db = typeof db;
export const db = porm(
  {
    connectionString: config.dbUrl,
    log: true,
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
