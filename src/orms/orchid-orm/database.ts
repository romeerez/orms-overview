import { orchidORM } from 'orchid-orm';
import config from '../../config';
import { ArticleTable } from './article/article.table';
import { ArticleTagTable } from './article/articleTag.table';
import { CommentTable } from './comment/comment.table';
import { TagTable } from './tag/tag.table';
import { UserTable } from './user/user.table';
import { UserArticleFavoriteTable } from './user/userArticleFavorite.table';
import { UserFollowTable } from './user/userFollow.table';

export type Db = typeof db;
export const db = orchidORM(
  {
    databaseURL: config.dbUrl,
    log: false,
  },
  {
    article: ArticleTable,
    articleTag: ArticleTagTable,
    comment: CommentTable,
    tag: TagTable,
    user: UserTable,
    userArticleFavorite: UserArticleFavoriteTable,
    userFollow: UserFollowTable,
  },
);
