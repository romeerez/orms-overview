import { OrmInterface } from '../types';
import { db } from './database';
import articleRepo from './article/article.repo';
import userRepo from './user/user.repo';
import commentRepo from './comment/comment.repo';
import profileRepo from './profile/profile.repo';
import tagRepo from './tag/tag.repo';

export const orchidOrm: OrmInterface = {
  close: () => db.$close(),
  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
