import { OrmInterface } from 'orms/types';
import { articleRepo } from 'orms/knex/article/article.repo';
import { commentRepo } from 'orms/knex/comment/comment.repo';
import { tagRepo } from 'orms/knex/tag/tag.repo';
import { profileRepo } from 'orms/knex/profile/profile.repo';
import { userRepo } from 'orms/knex/user/user.repo';
import { db } from './db';

export const knex: OrmInterface = {
  close() {
    return db.destroy();
  },
  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
