import { Article } from './article/article.model';
import { ArticleTag } from './article/articleTag.model';
import { Comment } from './comment/comment.model';
import { Tag } from './tag/tag.model';
import { User } from './user/user.model';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import config from '../../config';

interface Database {
  article: Article;
  articleTag: ArticleTag;
  comment: Comment;
  tag: Tag;
  user: User;
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: config.dbUrl,
    }),
  }),
});
