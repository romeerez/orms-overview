import { OrmInterface } from 'orms/types';
import { articleRepo } from 'orms/knex/article/article.repo';
import { commentRepo } from 'orms/knex/comment/comment.repo';
import { tagRepo } from 'orms/knex/tag/tag.repo';
import { profileRepo } from 'orms/knex/profile/profile.repo';
import { userRepo } from 'orms/knex/user/user.repo';

export const knex: OrmInterface = {
  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
