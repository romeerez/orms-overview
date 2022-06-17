import { OrmInterface } from 'orms/types';
import { articleRepo } from 'orms/typeorm/article/article.repo';
import { commentRepo } from 'orms/typeorm/comment/comment.repo';
import { tagRepo } from 'orms/typeorm/tag/tag.repo';
import { profileRepo } from 'orms/typeorm/profile/profile.repo';
import { userRepo } from 'orms/typeorm/user/user.repo';
import { dataSource } from './dataSource';

export const typeorm: OrmInterface = {
  async initialize() {
    await dataSource.initialize();
  },
  async close() {
    await dataSource.destroy();
  },

  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
