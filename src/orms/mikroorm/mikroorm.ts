import { OrmInterface } from 'orms/types';
import { getDb } from 'orms/mikroorm/db';
import { articleRepo } from './article/article.repo';
import { userRepo } from './user/user.repo';
import { commentRepo } from './comment/comment.repo';
import { profileRepo } from './profile/proflie.repo';
import { tagRepo } from './tag/tag.repo';

export const mikroorm: OrmInterface = {
  async initialize() {
    await getDb();
  },

  async close() {
    const db = await getDb();
    await db.close(true);
  },

  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
