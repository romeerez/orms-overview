import { OrmInterface } from 'orms/types';
import { articleRepo } from 'orms/objection/article/article.repo';
import { commentRepo } from 'orms/objection/comment/comment.repo';
import { tagRepo } from 'orms/objection/tag/tag.repo';
import { profileRepo } from 'orms/objection/profile/profile.repo';
import { userRepo } from 'orms/objection/user/user.repo';
import { db } from './model';

export const objection: OrmInterface = {
  close() {
    return db.destroy();
  },
  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
