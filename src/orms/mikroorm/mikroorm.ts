import { OrmInterface } from 'orms/types';
import { dbPromise } from 'orms/mikroorm/db';
import { articleRepo } from './article/article.repo';
import { userRepo } from './user/user.repo';
import { commentRepo } from './comment/comment.repo';
import { profileRepo } from './profile/proflie.repo';
import { tagRepo } from './tag/tag.repo';

export const mikroorm: OrmInterface = {
  async initialize() {
    await dbPromise;
  },

  async close() {
    const db = await dbPromise;
    await db.close(true);
  },

  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
